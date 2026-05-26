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

const NutricionSchema = z.object({
  encontrada: z
    .boolean()
    .describe(
      "true si lográs identificar una tabla nutricional legible en la imagen, false si no",
    ),
  estado: z
    .enum(["solido", "liquido"])
    .describe(
      "'liquido' para bebidas, lácteos líquidos, sopas, aceites, salsas líquidas; 'solido' para todo lo demás",
    ),
  porPorcionUnicamente: z
    .boolean()
    .describe(
      "true si la tabla SOLO trae datos por porción y no por 100g/100ml — caso a evitar",
    ),
  energiaKcal: z
    .number()
    .describe("kilocalorías (kcal) por 100g o 100ml"),
  grasasTotalesG: z
    .number()
    .describe("gramos de grasas totales por 100g/100ml"),
  grasasSaturadasG: z
    .number()
    .describe("gramos de grasas saturadas por 100g/100ml"),
  azucaresG: z
    .number()
    .describe(
      "gramos de azúcares totales (o azúcares libres si se diferencia) por 100g/100ml",
    ),
  sodioMg: z.number().describe("miligramos de sodio por 100g/100ml"),
  ingredientesTexto: z
    .string()
    .optional()
    .describe(
      "Si en la foto se ve la lista de ingredientes, transcribila acá. Si no, dejar vacío.",
    ),
  notas: z
    .string()
    .optional()
    .describe(
      "Cualquier advertencia sobre la calidad de la lectura: valores ambiguos, foto borrosa, columna asumida, etc.",
    ),
});

const PROMPT = `Sos un asistente especializado en leer tablas nutricionales argentinas.

Tu tarea: analizar la imagen y extraer los valores nutricionales del producto.

REGLAS CRÍTICAS:
1. SIEMPRE devolvé los valores expresados por 100 g (sólidos) o 100 ml (líquidos).
   Las tablas argentinas suelen tener dos columnas: "por porción" y "por 100 g/100 ml".
   USÁ SIEMPRE LA COLUMNA POR 100 g O 100 ml. Si solo hay datos por porción,
   marcá porPorcionUnicamente=true y devolvé los valores que veas.
2. Si la tabla está en otra unidad o por porción solamente, hacé la mejor estimación
   posible pero indicalo en 'notas'.
3. Para 'estado', clasificá según la categoría del producto:
   - liquido: bebidas, leche líquida, sopas líquidas, aceites, salsas líquidas
   - solido: galletitas, snacks, lácteos sólidos, conservas, etc.
4. Si no hay tabla nutricional visible o legible, devolvé encontrada=false.
5. Si ves la lista de ingredientes en la foto, transcribila completa en
   'ingredientesTexto' — necesitamos detectar edulcorantes y cafeína.
6. Para sodio: si la tabla informa "Sal (g)", convertí a sodio mg: sodio_mg = sal_g * 400.
7. Para grasas saturadas: si no figura explícitamente, asumí 0 y dejá nota.

Devolvé los datos en el formato estructurado solicitado.`;

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json(
      { error: "Falta configurar AI_GATEWAY_API_KEY en el servidor." },
      { status: 500 },
    );
  }

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
