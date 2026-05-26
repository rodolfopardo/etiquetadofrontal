/**
 * Lógica de cálculo de octógonos según Ley 27.642 de Argentina
 * y Decreto 151/2022 — perfil nutricional OPS, Fase 2 (vigente desde 2024-08).
 *
 * Fuente:
 *   - Ley 27.642 (Promoción de la Alimentación Saludable)
 *   - Decreto Reglamentario 151/2022
 *   - Perfil de nutrientes OPS / OMS
 *
 * IMPORTANTE: estos umbrales deben revisarse contra el texto oficial vigente
 * antes de cualquier presentación pública. La normativa puede actualizarse.
 */

export type Estado = "solido" | "liquido";

/**
 * Categorías de productos según relevancia para el etiquetado frontal.
 * Algunas están EXENTAS por el Decreto 151/2022.
 */
export type Categoria =
  | "leche_liquida"
  | "yogur_natural"
  | "queso"
  | "aceite_vegetal"
  | "fruta_verdura_fresca"
  | "carne_huevo_fresco"
  | "sal"
  | "fruta_seca"
  | "especia_hierba_infusion"
  | "formula_infantil"
  | "alimento_uso_medico"
  | "alimento_procesado"; // default: aplican todos los umbrales

export type DatosNutricionales = {
  /** kcal por 100g (sólido) o 100ml (líquido) */
  energiaKcal: number;
  /** gramos de grasas totales por 100g/100ml */
  grasasTotalesG: number;
  /** gramos de grasas saturadas por 100g/100ml */
  grasasSaturadasG: number;
  /**
   * Azúcares por 100g/100ml.
   * Si la tabla discrimina, preferimos AZÚCARES AGREGADOS/LIBRES.
   * La ley evalúa azúcares libres, no intrínsecos (lactosa, fructosa
   * de fruta entera, etc.).
   */
  azucaresG: number;
  /** miligramos de sodio por 100g/100ml */
  sodioMg: number;
  /** estado físico del producto (afecta los umbrales) */
  estado: Estado;
  /** ¿contiene azúcares o grasas añadidos? (necesario para el sello de calorías) */
  tieneAzucaresOGrasasAnadidos?: boolean;
  /** Categoría del producto (para detectar exenciones legales) */
  categoria?: Categoria;
};

export type Exencion = {
  exento: true;
  categoria: Categoria;
  motivo: string;
  articulo: string;
};

export type TipoOctogono =
  | "exceso_calorias"
  | "exceso_grasas_saturadas"
  | "exceso_grasas_totales"
  | "exceso_azucares"
  | "exceso_sodio";

export type TipoLeyenda = "contiene_edulcorantes" | "contiene_cafeina";

export type Octogono = {
  tipo: TipoOctogono;
  titulo: string;
  detalle: string;
};

export type Leyenda = {
  tipo: TipoLeyenda;
  titulo: string;
};

export type ResultadoCalculo = {
  octogonos: Octogono[];
  leyendas: Leyenda[];
  /** Si el producto está exento del etiquetado por la ley */
  exencion?: Exencion;
  /** Valores intermedios útiles para mostrar al usuario el "por qué" */
  desglose: {
    porcVETGrasasTotales: number;
    porcVETGrasasSaturadas: number;
    porcVETAzucares: number;
    ratioSodioKcal: number;
  };
};

/**
 * Productos excluidos del régimen de etiquetado frontal según
 * Decreto Reglamentario 151/2022, artículo 6.
 *
 * Estas categorías están exentas SIEMPRE QUE no tengan azúcares,
 * sodio u otros nutrientes añadidos a los presentes en su forma
 * natural / sin procesar.
 */
const EXENCIONES: Record<Categoria, { motivo: string } | null> = {
  leche_liquida: {
    motivo:
      "Las leches líquidas sin azúcares ni nutrientes añadidos están excluidas del etiquetado frontal.",
  },
  yogur_natural: {
    motivo:
      "Los yogures sin azúcares ni nutrientes añadidos están excluidos del etiquetado frontal.",
  },
  queso: {
    motivo:
      "Los quesos sin nutrientes añadidos están excluidos del etiquetado frontal.",
  },
  aceite_vegetal: {
    motivo:
      "Los aceites vegetales sin agregados están excluidos del etiquetado frontal.",
  },
  fruta_verdura_fresca: {
    motivo:
      "Las frutas, verduras y hortalizas frescas están excluidas del etiquetado frontal.",
  },
  carne_huevo_fresco: {
    motivo:
      "Las carnes y huevos frescos sin procesar están excluidos del etiquetado frontal.",
  },
  sal: {
    motivo:
      "La sal de mesa está excluida del etiquetado frontal por ser materia prima.",
  },
  fruta_seca: {
    motivo:
      "Las frutas secas sin nutrientes añadidos están excluidas del etiquetado frontal.",
  },
  especia_hierba_infusion: {
    motivo:
      "Especias, hierbas e infusiones están excluidas del etiquetado frontal.",
  },
  formula_infantil: {
    motivo:
      "Las fórmulas infantiles tienen un régimen normativo propio.",
  },
  alimento_uso_medico: {
    motivo:
      "Los alimentos para usos médicos específicos están excluidos del etiquetado frontal.",
  },
  alimento_procesado: null,
};

const ARTICULO_EXENCION =
  "Decreto Reglamentario 151/2022, artículo 6, y Resolución Conjunta 35/2022";

function calcularDesglose(datos: DatosNutricionales) {
  const energiaSegura = datos.energiaKcal > 0 ? datos.energiaKcal : 1;
  return {
    porcVETGrasasTotales:
      ((datos.grasasTotalesG * KCAL_POR_GRAMO.grasa) / energiaSegura) * 100,
    porcVETGrasasSaturadas:
      ((datos.grasasSaturadasG * KCAL_POR_GRAMO.grasa) / energiaSegura) * 100,
    porcVETAzucares:
      ((datos.azucaresG * KCAL_POR_GRAMO.carbohidrato) / energiaSegura) * 100,
    ratioSodioKcal: datos.sodioMg / energiaSegura,
  };
}

/**
 * Umbrales Fase 2 — perfil OPS.
 *
 * Reglas (por 100 g de sólido o 100 ml de líquido):
 *   - Exceso de SODIO:           sodio_mg / energia_kcal >= 1
 *   - Exceso de AZÚCARES:        (azucares_g * 4 / energia_kcal) * 100 >= 10%   (libres)
 *   - Exceso de GRASAS SATURADAS: (grasas_sat_g * 9 / energia_kcal) * 100 >= 10%
 *   - Exceso de GRASAS TOTALES:   (grasas_tot_g * 9 / energia_kcal) * 100 >= 30%
 *   - Exceso de CALORÍAS (sólido):  energia_kcal >= 275  Y contiene azúc./grasas añadidos
 *   - Exceso de CALORÍAS (líquido): energia_kcal >= 70   Y contiene azúc./grasas añadidos
 *
 * Notas:
 *   - Para productos cuyo aporte energético sea muy bajo, los umbrales relativos
 *     pueden no aplicar; este MVP usa la regla relativa estándar.
 *   - El sello de calorías requiere que haya azúcares o grasas AÑADIDOS (no
 *     intrínsecos del alimento). Si el usuario no lo informa, asumimos `true`
 *     en presencia de azúcares > 0 como aproximación conservadora.
 */
const UMBRAL_CALORIAS = {
  solido: 275,
  liquido: 70,
} as const;

const UMBRAL_GRASAS_TOTALES_PCT_VET = 30;
const UMBRAL_GRASAS_SATURADAS_PCT_VET = 10;
const UMBRAL_AZUCARES_PCT_VET = 10;
const UMBRAL_SODIO_RATIO = 1; // mg de sodio por kcal

const KCAL_POR_GRAMO = {
  grasa: 9,
  carbohidrato: 4, // azúcares cuentan acá
} as const;

const TITULOS: Record<TipoOctogono, string> = {
  exceso_calorias: "EXCESO EN CALORÍAS",
  exceso_grasas_saturadas: "EXCESO EN GRASAS SATURADAS",
  exceso_grasas_totales: "EXCESO EN GRASAS TOTALES",
  exceso_azucares: "EXCESO EN AZÚCARES",
  exceso_sodio: "EXCESO EN SODIO",
};

const TITULOS_LEYENDA: Record<TipoLeyenda, string> = {
  contiene_edulcorantes: "CONTIENE EDULCORANTES, NO RECOMENDABLE EN NIÑOS/AS",
  contiene_cafeina: "CONTIENE CAFEÍNA, EVITAR EN NIÑOS/AS",
};

export function calcularOctogonos(
  datos: DatosNutricionales,
): ResultadoCalculo {
  const {
    energiaKcal,
    grasasTotalesG,
    grasasSaturadasG,
    azucaresG,
    sodioMg,
    estado,
    tieneAzucaresOGrasasAnadidos,
    categoria,
  } = datos;

  // Chequeo de exención legal ANTES de calcular umbrales.
  // Si el producto cae en una categoría exenta y no tiene añadidos críticos,
  // la ley lo excluye del etiquetado frontal independientemente de los valores.
  const tieneAnadidosCriticos = tieneAzucaresOGrasasAnadidos ?? false;
  if (categoria && categoria !== "alimento_procesado") {
    const exencionDef = EXENCIONES[categoria];
    if (exencionDef && !tieneAnadidosCriticos) {
      return {
        octogonos: [],
        leyendas: [],
        exencion: {
          exento: true,
          categoria,
          motivo: exencionDef.motivo,
          articulo: ARTICULO_EXENCION,
        },
        desglose: calcularDesglose(datos),
      };
    }
  }

  // Evitar división por cero — si no hay energía declarada,
  // los porcentajes relativos no aplican.
  const energiaSegura = energiaKcal > 0 ? energiaKcal : 1;

  const porcVETGrasasTotales =
    ((grasasTotalesG * KCAL_POR_GRAMO.grasa) / energiaSegura) * 100;

  const porcVETGrasasSaturadas =
    ((grasasSaturadasG * KCAL_POR_GRAMO.grasa) / energiaSegura) * 100;

  const porcVETAzucares =
    ((azucaresG * KCAL_POR_GRAMO.carbohidrato) / energiaSegura) * 100;

  const ratioSodioKcal = sodioMg / energiaSegura;

  const octogonos: Octogono[] = [];

  // Para el sello de calorías la ley requiere "azúcares libres o grasas
  // añadidos". Si no se informa explícitamente, asumimos true cuando hay
  // azúcares presentes (aproximación conservadora).
  const tieneAnadidos =
    tieneAzucaresOGrasasAnadidos ?? (azucaresG > 0 || grasasTotalesG > 0);

  const umbralCalorias = UMBRAL_CALORIAS[estado];
  if (energiaKcal >= umbralCalorias && tieneAnadidos) {
    octogonos.push({
      tipo: "exceso_calorias",
      titulo: TITULOS.exceso_calorias,
      detalle: `${energiaKcal.toFixed(0)} kcal por 100${
        estado === "solido" ? "g" : "ml"
      } (umbral ≥ ${umbralCalorias})`,
    });
  }

  if (porcVETGrasasSaturadas >= UMBRAL_GRASAS_SATURADAS_PCT_VET) {
    octogonos.push({
      tipo: "exceso_grasas_saturadas",
      titulo: TITULOS.exceso_grasas_saturadas,
      detalle: `${porcVETGrasasSaturadas.toFixed(
        1,
      )}% del valor energético (umbral ≥ ${UMBRAL_GRASAS_SATURADAS_PCT_VET}%)`,
    });
  }

  if (porcVETGrasasTotales >= UMBRAL_GRASAS_TOTALES_PCT_VET) {
    octogonos.push({
      tipo: "exceso_grasas_totales",
      titulo: TITULOS.exceso_grasas_totales,
      detalle: `${porcVETGrasasTotales.toFixed(
        1,
      )}% del valor energético (umbral ≥ ${UMBRAL_GRASAS_TOTALES_PCT_VET}%)`,
    });
  }

  if (porcVETAzucares >= UMBRAL_AZUCARES_PCT_VET) {
    octogonos.push({
      tipo: "exceso_azucares",
      titulo: TITULOS.exceso_azucares,
      detalle: `${porcVETAzucares.toFixed(
        1,
      )}% del valor energético (umbral ≥ ${UMBRAL_AZUCARES_PCT_VET}%)`,
    });
  }

  if (ratioSodioKcal >= UMBRAL_SODIO_RATIO) {
    octogonos.push({
      tipo: "exceso_sodio",
      titulo: TITULOS.exceso_sodio,
      detalle: `${ratioSodioKcal.toFixed(
        2,
      )} mg de sodio por kcal (umbral ≥ ${UMBRAL_SODIO_RATIO})`,
    });
  }

  return {
    octogonos,
    leyendas: [],
    desglose: {
      porcVETGrasasTotales,
      porcVETGrasasSaturadas,
      porcVETAzucares,
      ratioSodioKcal,
    },
  };
}

export function leyendasDesdeIngredientes(
  ingredientes: string | undefined,
): Leyenda[] {
  if (!ingredientes) return [];
  const texto = ingredientes.toLowerCase();
  const leyendas: Leyenda[] = [];

  const patronesEdulcorantes = [
    "edulcorante",
    "aspartam",
    "sucralosa",
    "acesulfame",
    "stevia",
    "sacarina",
    "ciclamato",
  ];
  if (patronesEdulcorantes.some((p) => texto.includes(p))) {
    leyendas.push({
      tipo: "contiene_edulcorantes",
      titulo: TITULOS_LEYENDA.contiene_edulcorantes,
    });
  }

  const patronesCafeina = ["cafeína", "cafeina", "caffeine"];
  if (patronesCafeina.some((p) => texto.includes(p))) {
    leyendas.push({
      tipo: "contiene_cafeina",
      titulo: TITULOS_LEYENDA.contiene_cafeina,
    });
  }

  return leyendas;
}
