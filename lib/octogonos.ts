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

export type DatosNutricionales = {
  /** kcal por 100g (sólido) o 100ml (líquido) */
  energiaKcal: number;
  /** gramos de grasas totales por 100g/100ml */
  grasasTotalesG: number;
  /** gramos de grasas saturadas por 100g/100ml */
  grasasSaturadasG: number;
  /** gramos de azúcares (totales o libres) por 100g/100ml */
  azucaresG: number;
  /** miligramos de sodio por 100g/100ml */
  sodioMg: number;
  /** estado físico del producto (afecta los umbrales) */
  estado: Estado;
  /** ¿contiene azúcares o grasas añadidos? (necesario para el sello de calorías) */
  tieneAzucaresOGrasasAnadidos?: boolean;
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
  /** Valores intermedios útiles para mostrar al usuario el "por qué" */
  desglose: {
    porcVETGrasasTotales: number;
    porcVETGrasasSaturadas: number;
    porcVETAzucares: number;
    ratioSodioKcal: number;
  };
};

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
  } = datos;

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

  // Aproximación conservadora: si no se informa, asumimos que tiene añadidos
  // cuando hay azúcares o grasas presentes. El usuario puede corregir.
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
