import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import {
  calcularOctogonos,
  leyendasDesdeIngredientes,
  type DatosNutricionales,
} from "@/lib/octogonos";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.AI_MODEL ?? "google/gemini-2.5-flash";

const CATEGORIAS = [
  "leche_liquida",
  "yogur_natural",
  "queso",
  "aceite_vegetal",
  "fruta_verdura_fresca",
  "carne_huevo_fresco",
  "sal",
  "fruta_seca",
  "especia_hierba_infusion",
  "formula_infantil",
  "alimento_uso_medico",
  "alimento_procesado",
] as const;

const AnalisisSchema = z.object({
  // ─── DESDE LA FOTO DEL FRENTE ─────────────────────────────────────
  marca: z
    .string()
    .optional()
    .describe(
      "Marca del producto leída del frente del envase (ej: 'Yogurísimo', 'Bagley', 'Coca-Cola'). Vacío si no se lee.",
    ),
  nombreProducto: z
    .string()
    .optional()
    .describe(
      "Nombre del producto y variante leídos del frente (ej: 'Firme Natural', 'Original', 'Light Limón'). Vacío si no se lee.",
    ),
  reclamosFrente: z
    .array(z.string())
    .optional()
    .describe(
      "Reclamos o claims que figuren en el frente del envase (ej: '0% azúcar añadido', 'natural', 'con vitaminas'). Útil para clasificar exenciones. Lista vacía si no hay.",
    ),

  // ─── DESDE LA FOTO DE LA TABLA NUTRICIONAL ─────────────────────────
  tablaEncontrada: z
    .boolean()
    .describe(
      "true si lográs leer la tabla nutricional en la segunda foto, false si no.",
    ),
  categoria: z
    .enum(CATEGORIAS)
    .describe(
      "Categoría del producto, combinando información del frente y la tabla. " +
        "Las primeras 11 son EXENTAS del etiquetado por Decreto 151/2022 si no tienen " +
        "azúcares/nutrientes añadidos. Usar 'alimento_procesado' para galletitas, snacks, " +
        "yogures saborizados, bebidas azucaradas, fiambres, conservas, ultraprocesados.",
    ),
  tieneAnadidosCriticos: z
    .boolean()
    .describe(
      "true si los ingredientes incluyen azúcares añadidos (azúcar, jarabe, fructosa, " +
        "miel, dextrosa, maltodextrina), sodio/sal añadida o grasas añadidas. " +
        "Para yogur/leche natural: false. Para yogur con azúcar o saborizado: true. " +
        "En caso de duda: true (conservador).",
    ),
  estado: z
    .enum(["solido", "liquido"])
    .describe(
      "'liquido' para bebidas, leches líquidas, sopas, aceites; 'solido' para yogures " +
        "firmes, galletitas, snacks, quesos, conservas, etc.",
    ),
  porPorcionUnicamente: z
    .boolean()
    .describe(
      "true si la tabla SOLO trae datos por porción y no por 100g/100ml",
    ),
  energiaKcal: z
    .number()
    .describe(
      "kcal por 100g/100ml. Si la tabla es solo por porción, DIVIDÍ: " +
        "valor / gramos_porción * 100.",
    ),
  grasasTotalesG: z.number().describe("g de grasas totales por 100g/100ml"),
  grasasSaturadasG: z
    .number()
    .describe("g de grasas saturadas por 100g/100ml"),
  azucaresG: z
    .number()
    .describe(
      "g de AZÚCARES LIBRES (agregados) por 100g/100ml. Si la tabla discrimina " +
        "'azúcares agregados/añadidos', usá ese valor. Si solo hay 'totales', usá ese " +
        "pero notalo (en lácteos los totales incluyen lactosa intrínseca).",
    ),
  sodioMg: z.number().describe("mg de sodio por 100g/100ml"),
  ingredientesTexto: z
    .string()
    .optional()
    .describe(
      "Lista de ingredientes transcripta de la tabla si está visible.",
    ),
  notas: z
    .string()
    .optional()
    .describe(
      "Advertencias sobre la lectura (azúcares totales en vez de libres, " +
        "foto borrosa, etc).",
    ),
});

const PROMPT = `Sos un asistente especializado en analizar envases de alimentos
argentinos para aplicar la Ley 27.642 de Etiquetado Frontal.

Vas a recibir DOS imágenes:
  IMAGEN 1: el FRENTE del envase (marca, nombre, variante, reclamos)
  IMAGEN 2: la TABLA NUTRICIONAL (lista de ingredientes y valores)

Tu tarea: extraer datos de AMBAS y devolverlos en formato estructurado.

DEL FRENTE (Imagen 1):
- marca: la marca principal (ej "Yogurísimo", "Bagley", "Coca-Cola")
- nombreProducto: nombre y variante (ej "Firme Natural", "Original", "Light")
- reclamosFrente: claims visibles ("0% azúcar añadido", "natural", "con vitaminas")
  Si la imagen del frente no es legible, dejá los campos del frente vacíos.

DE LA TABLA (Imagen 2):

1. UNIDADES: SIEMPRE por 100 g (sólidos) o 100 ml (líquidos). Si la tabla solo
   trae "por porción", convertí: valor/gramos_porción × 100. Marcá
   porPorcionUnicamente=true.

2. AZÚCARES LIBRES vs totales: la ley evalúa AZÚCARES LIBRES (agregados).
   Si la tabla discrimina "azúcares agregados/añadidos", usá ESE valor.
   Si solo dice "azúcares totales", usá ese pero notalo (lácteos contienen
   lactosa intrínseca que NO es azúcar libre).

3. CATEGORÍA: combiná frente + tabla + ingredientes para clasificar.
   Categorías EXENTAS (Decreto 151/2022 art. 6, si no hay añadidos críticos):
   - leche_liquida: leches sin azúcar añadido ni saborizantes
   - yogur_natural: yogures sin azúcares añadidos ni saborizantes
     (incluye firme, descremado, entero — TODOS sin saborizar/sin azúcar)
   - queso: quesos sin nutrientes añadidos
   - aceite_vegetal: aceites vegetales puros
   - fruta_verdura_fresca, carne_huevo_fresco, sal, fruta_seca,
     especia_hierba_infusion, formula_infantil, alimento_uso_medico
   Para TODO lo demás: alimento_procesado.

4. tieneAnadidosCriticos: true si los ingredientes muestran azúcar añadido
   (azúcar, jarabe, fructosa, miel, dextrosa, maltodextrina, jarabe de maíz),
   sal añadida, o grasas añadidas. En caso de duda: true.

5. SODIO: si la tabla solo informa "sal", convertí: sodio_mg = sal_g × 400.

6. INGREDIENTES: transcribí la lista completa si está visible.

7. Si la tabla nutricional NO se ve / no se puede leer: tablaEncontrada=false.

Devolvé los datos en el formato estructurado solicitado.`;

type ImagenEntrante = { mime: string; b64: string };

function parseDataUrl(dataUrl: string): ImagenEntrante | null {
  const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1]!, b64: match[2]! };
}

export async function POST(req: Request) {
  // Kill-switch global: poné SCAN_PAUSED=true en Vercel para pausar el escáner
  // al instante (sin redeploy) y dejar de gastar IA. Borrala para reactivar.
  if (process.env.SCAN_PAUSED === "true") {
    return NextResponse.json(
      {
        error:
          "El escáner está en pausa por mantenimiento. Volvé en un ratito 🙏",
        paused: true,
      },
      { status: 503 },
    );
  }

  const ip = getClientIp(req);
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "Llegaste al límite diario de fotos. Volvé mañana.",
        resetAt: rl.resetAt,
      },
      { status: 429 },
    );
  }

  let frente: ImagenEntrante | null = null;
  let tabla: ImagenEntrante;
  try {
    const body = (await req.json()) as {
      frente?: string;
      tabla?: string;
      image?: string; // compat con clientes viejos
    };

    const tablaUrl = body.tabla ?? body.image;
    if (!tablaUrl) {
      return NextResponse.json(
        { error: "Falta la foto de la tabla nutricional." },
        { status: 400 },
      );
    }
    const t = parseDataUrl(tablaUrl);
    if (!t) {
      return NextResponse.json(
        { error: "Formato de imagen (tabla) inválido." },
        { status: 400 },
      );
    }
    tabla = t;

    if (body.frente) {
      frente = parseDataUrl(body.frente);
      if (!frente) {
        return NextResponse.json(
          { error: "Formato de imagen (frente) inválido." },
          { status: 400 },
        );
      }
    }
  } catch {
    return NextResponse.json(
      { error: "No pude leer el body del request." },
      { status: 400 },
    );
  }

  try {
    const content: Array<
      { type: "text"; text: string } | { type: "image"; image: string }
    > = [{ type: "text", text: PROMPT }];

    if (frente) {
      content.push({ type: "text", text: "IMAGEN 1 (frente del envase):" });
      content.push({
        type: "image",
        image: `data:${frente.mime};base64,${frente.b64}`,
      });
    } else {
      content.push({
        type: "text",
        text: "(No hay imagen del frente; trabajá solo con la tabla)",
      });
    }
    content.push({ type: "text", text: "IMAGEN 2 (tabla nutricional):" });
    content.push({
      type: "image",
      image: `data:${tabla.mime};base64,${tabla.b64}`,
    });

    const { object } = await generateObject({
      model: MODEL,
      schema: AnalisisSchema,
      messages: [{ role: "user", content }],
    });

    if (!object.tablaEncontrada) {
      return NextResponse.json(
        {
          error:
            "No pude leer la tabla nutricional. Probá de nuevo con mejor luz, enfoque y la tabla bien plana.",
        },
        { status: 422 },
      );
    }

    const datos: DatosNutricionales = {
      energiaKcal: object.energiaKcal,
      grasasTotalesG: object.grasasTotalesG,
      grasasSaturadasG: object.grasasSaturadasG,
      azucaresG: object.azucaresG,
      sodioMg: object.sodioMg,
      estado: object.estado,
      categoria: object.categoria,
      tieneAzucaresOGrasasAnadidos: object.tieneAnadidosCriticos,
    };

    const resultado = calcularOctogonos(datos);
    const leyendas = leyendasDesdeIngredientes(object.ingredientesTexto);

    return NextResponse.json({
      producto: {
        marca: object.marca,
        nombre: object.nombreProducto,
        reclamos: object.reclamosFrente,
      },
      datos,
      resultado: { ...resultado, leyendas },
      notas: object.notas,
      porPorcionUnicamente: object.porPorcionUnicamente,
      ingredientesDetectados: object.ingredientesTexto,
      rateLimit: { remaining: rl.remaining, resetAt: rl.resetAt },
    });
  } catch (err) {
    console.error("[analyze] error", err);
    return NextResponse.json(
      {
        error:
          "Hubo un problema procesando las fotos. Probá de nuevo en unos segundos.",
      },
      { status: 500 },
    );
  }
}
