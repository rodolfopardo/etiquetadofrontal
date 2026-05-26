import type { TipoOctogono, TipoLeyenda } from "@/lib/octogonos";

/**
 * Octógono visual según el diseño establecido por la Ley 27.642:
 *   - Forma octogonal regular
 *   - Fondo NEGRO con borde BLANCO interno
 *   - Texto BLANCO en mayúsculas, tipografía sin serifa, negrita
 *   - Texto en dos líneas: "EXCESO EN" + "<NUTRIENTE>"
 */

type Props = {
  tipo: TipoOctogono;
  size?: number;
};

const TEXTO_OCTOGONO: Record<TipoOctogono, string[]> = {
  exceso_calorias: ["EXCESO EN", "CALORÍAS"],
  exceso_grasas_saturadas: ["EXCESO EN", "GRASAS", "SATURADAS"],
  exceso_grasas_totales: ["EXCESO EN", "GRASAS", "TOTALES"],
  exceso_azucares: ["EXCESO EN", "AZÚCARES"],
  exceso_sodio: ["EXCESO EN", "SODIO"],
};

export function Octogono({ tipo, size = 140 }: Props) {
  const lineas = TEXTO_OCTOGONO[tipo];
  // Octágono regular centrado en (100, 100), radio 95
  const r = 95;
  const points = Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI / 8) + (i * 2 * Math.PI) / 8;
    const x = 100 + r * Math.cos(angle);
    const y = 100 + r * Math.sin(angle);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  // Octágono interior para el borde blanco
  const rInner = 82;
  const pointsInner = Array.from({ length: 8 }, (_, i) => {
    const angle = (Math.PI / 8) + (i * 2 * Math.PI) / 8;
    const x = 100 + rInner * Math.cos(angle);
    const y = 100 + rInner * Math.sin(angle);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={lineas.join(" ")}
    >
      <polygon points={points} fill="#000" />
      <polygon
        points={pointsInner}
        fill="none"
        stroke="#fff"
        strokeWidth={3}
      />
      {lineas.map((linea, i) => {
        const total = lineas.length;
        const lineHeight = total === 3 ? 26 : 30;
        const startY = 100 - ((total - 1) * lineHeight) / 2 + 7;
        const y = startY + i * lineHeight;
        const isEnfasis = i === total - 1;
        const fontSize = total === 3
          ? (isEnfasis && linea.length > 7 ? 20 : 22)
          : (isEnfasis ? (linea.length > 8 ? 22 : 26) : 18);
        return (
          <text
            key={i}
            x="100"
            y={y}
            textAnchor="middle"
            fill="#fff"
            fontFamily="Helvetica, Arial, sans-serif"
            fontWeight="900"
            fontSize={fontSize}
            letterSpacing="0.5"
          >
            {linea}
          </text>
        );
      })}
    </svg>
  );
}

const TEXTO_LEYENDA: Record<TipoLeyenda, { l1: string; l2: string; l3: string }> = {
  contiene_edulcorantes: {
    l1: "CONTIENE",
    l2: "EDULCORANTES",
    l3: "NO RECOM. EN NIÑOS/AS",
  },
  contiene_cafeina: {
    l1: "CONTIENE",
    l2: "CAFEÍNA",
    l3: "EVITAR EN NIÑOS/AS",
  },
};

export function Leyenda({ tipo, size = 200 }: { tipo: TipoLeyenda; size?: number }) {
  const t = TEXTO_LEYENDA[tipo];
  return (
    <svg
      viewBox="0 0 280 100"
      width={size}
      height={(size * 100) / 280}
      role="img"
      aria-label={`${t.l1} ${t.l2}`}
    >
      <rect x="0" y="0" width="280" height="100" fill="#000" />
      <rect
        x="6"
        y="6"
        width="268"
        height="88"
        fill="none"
        stroke="#fff"
        strokeWidth={2}
      />
      <text
        x="140"
        y="32"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="900"
        fontSize="14"
      >
        {t.l1}
      </text>
      <text
        x="140"
        y="58"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="900"
        fontSize="22"
      >
        {t.l2}
      </text>
      <text
        x="140"
        y="80"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize="11"
      >
        {t.l3}
      </text>
    </svg>
  );
}
