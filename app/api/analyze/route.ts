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

const NutricionSchema = z.object({
  encontrada: z
    .boolean()
    .describe(
      "true si lográs identificar una tabla nutricional legible en la imagen, false si no",
    ),
  categoria: z
    .enum(CATEGORIAS)
    .describe(
      "Categoría del producto. CRÍTICO: usar exactamente uno de los valores listados. " +
        "Las primeras 11 categorías son alimentos potencialmente EXENTOS del etiquetado " +
        "frontal por Decreto 151/2022. Si el producto cae en una de ellas Y no tiene " +
        "azúcares ni nutrientes añadidos críticos (ver tieneAnadidosCriticos), está exento. " +
        "Usar 'alimento_procesado' como default para todo lo demás (galletitas, snacks, " +
        "bebidas azucaradas, fiambres, conservas, ultraprocesados, etc.).",
    ),
  tieneAnadidosCriticos: z
    .boolean()
    .describe(
      "true si en los ingredientes hay azúcares añadidos (azúcar, jarabe, fructosa, " +
        "miel, dextrosa, maltodextrina, etc.) o sodio/sal añadida o grasas añadidas. " +
        "Para esto fijate en la lista de ingredientes Y en si la tabla informa " +
        "'azúcares agregados/añadidos > 0'. Si no podés determinarlo con certeza, " +
        "devolvé true (conservador).",
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
      "kilocalorías (kcal) por 100g o 100ml. Si la tabla es solo por porción, " +
        "DIVIDÍ los valores: por 100g = (valor / gramos_porción) * 100.",
    ),
  grasasTotalesG: z
    .number()
    .describe("gramos de grasas totales por 100g/100ml"),
  grasasSaturadasG: z
    .number()
    .describe("gramos de grasas saturadas por 100g/100ml"),
  azucaresG: z
    .number()
    .describe(
      "Gramos de AZÚCARES LIBRES (agregados/añadidos) por 100g/100ml. " +
        "Si la tabla discrimina 'azúcares agregados' o 'azúcares añadidos', usá ESE valor. " +
        "Si solo hay 'azúcares totales', usá ese pero indicalo en 'notas' " +
        "(en productos lácteos los azúcares totales incluyen lactosa intrínseca).",
    ),
  sodioMg: z.number().describe("miligramos de sodio por 100g/100ml"),
  ingredientesTexto: z
    .string()
    .optional()
    .describe(
      "Si en la foto se ve la lista de ingredientes, transcribila completa acá.",
    ),
  notas: z
    .string()
    .optional()
    .describe(
      "Advertencias sobre la lectura: si usaste azúcares totales por falta de " +
        "discriminación, si la foto está borrosa, etc.",
    ),
});

const PROMPT = `Sos un asistente especializado en leer envases de alimentos argentinos
para aplicar la Ley 27.642 de Etiquetado Frontal.

Tu tarea: analizar la imagen y devolver los datos en formato estructurado.

REGLAS CRÍTICAS:

1. UNIDADES: Siempre devolvé valores por 100 g (sólidos) o 100 ml (líquidos).
   Las tablas argentinas suelen tener dos columnas ("por porción" y "por 100 g").
   USÁ LA COLUMNA POR 100 g/ml. Si solo hay datos por porción, convertí dividiendo
   por los gramos de porción y multiplicando por 100. Marcá porPorcionUnicamente=true.

2. AZÚCARES — IMPORTANTE: La ley evalúa AZÚCARES LIBRES (agregados/añadidos),
   no los intrínsecos. Si la tabla discrimina "azúcares agregados" o "azúcares
   añadidos", usá ESE valor en azucaresG. Si solo dice "azúcares totales",
   usá ese pero notalo en 'notas'. Para lácteos (yogur, leche) la diferencia es
   crítica: la lactosa NO cuenta como azúcar libre.

3. CATEGORÍA — IMPORTANTE: clasificá el producto para detectar exenciones legales.
   Categorías EXENTAS del etiquetado por Decreto 151/2022 art. 6:
   - leche_liquida: leches líquidas SIN azúcar añadido ni saborizantes
   - yogur_natural: yogures SIN azúcares añadidos ni saborizantes
     (incluye yogur natural, firme, descremado, entero)
   - queso: quesos sin nutrientes añadidos
   - aceite_vegetal: aceites vegetales puros sin agregados
   - fruta_verdura_fresca: frutas/verduras/hortalizas frescas sin procesar
   - carne_huevo_fresco: carnes y huevos frescos sin procesar
   - sal: sal de mesa
   - fruta_seca: frutas secas sin nutrientes añadidos
   - especia_hierba_infusion: especias, hierbas, té, mate, café
   - formula_infantil: fórmulas para lactantes
   - alimento_uso_medico: alimentos para usos médicos específicos
   Para TODO lo demás (galletitas, snacks, yogures saborizados, bebidas
   azucaradas, fiambres, conservas, ultraprocesados): alimento_procesado.

4. tieneAnadidosCriticos: true si los ingredientes incluyen azúcar añadido
   (azúcar, jarabe, fructosa, miel, dextrosa, maltodextrina, jarabe de maíz,
   etc.), sal añadida, o grasas añadidas. Para yogur/leche natural: false.
   Para yogur con azúcar o saborizado: true. En caso de duda: true (conservador).

5. SODIO: si la tabla solo informa "sal", convertí a sodio: sodio_mg = sal_g * 400.

6. INGREDIENTES: transcribí la lista completa en ingredientesTexto si la ves
   en la foto (necesario para detectar edulcorantes y cafeína).

7. Si no hay tabla nutricional visible/legible: encontrada=false.

Devolvé todo en el formato estructurado solicitado.`;

export async function POST(req: Request) {
  // En Vercel, las funciones obtienen un OIDC token automáticamente para
  // autenticar contra AI Gateway, así que la API key solo es necesaria en local.
  const ip = getClientIp(req);
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: `Llegaste al límite diario de fotos. Volvé mañana.`,
        resetAt: rl.resetAt,
      },
      { status: 429 },
    );
  }

  let imageBase64: string;
  let mimeType: string;
  try {
    const body = (await req.json()) as { image: string };
    const match = body.image.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: "Formato de imagen inválido. Esperaba data URL base64." },
        { status: 400 },
      );
    }
    mimeType = match[1]!;
    imageBase64 = match[2]!;
  } catch {
    return NextResponse.json(
      { error: "No pude leer el body del request." },
      { status: 400 },
    );
  }

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: NutricionSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            {
              type: "image",
              image: `data:${mimeType};base64,${imageBase64}`,
            },
          ],
        },
      ],
    });

    if (!object.encontrada) {
      return NextResponse.json(
        {
          error:
            "No pude leer una tabla nutricional en la foto. Probá con mejor luz, enfoque y la tabla bien plana.",
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
          "Hubo un problema procesando la foto. Probá de nuevo en unos segundos.",
      },
      { status: 500 },
    );
  }
}
