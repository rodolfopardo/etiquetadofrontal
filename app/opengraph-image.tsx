import { ImageResponse } from "next/og";

export const alt = "Etiquetado Frontal — escaneá los octógonos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const OCTAGONO =
  "polygon(29.3% 0, 70.7% 0, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0 70.7%, 0 29.3%)";

// Satori soporta TTF/OTF/WOFF pero NO WOFF2. Por eso bajamos WOFF
// desde @fontsource (CDN jsdelivr) en vez de Google Fonts (sirve WOFF2).
async function loadFont(slug: string, weight: number) {
  const url = `https://cdn.jsdelivr.net/npm/@fontsource/${slug}/files/${slug}-latin-${weight}-normal.woff`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No pude bajar ${slug} ${weight}: ${res.status}`);
  return await res.arrayBuffer();
}

const SELLOS: { l1: string; l2: string }[] = [
  { l1: "EXCESO EN", l2: "CALORÍAS" },
  { l1: "EXCESO EN", l2: "GRASAS SAT." },
  { l1: "EXCESO EN", l2: "GRASAS TOT." },
  { l1: "EXCESO EN", l2: "AZÚCARES" },
  { l1: "EXCESO EN", l2: "SODIO" },
];

export default async function OG() {
  const [serif, interBold, interReg] = await Promise.all([
    loadFont("instrument-serif", 400),
    loadFont("inter", 700),
    loadFont("inter", 400),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#f7f5f1",
          backgroundImage:
            "radial-gradient(circle at 50% -10%, rgba(255, 210, 120, 0.55), transparent 55%), radial-gradient(circle at 100% 0%, rgba(180, 220, 255, 0.4), transparent 55%)",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid #e8e4dc",
            borderRadius: 999,
            fontSize: 18,
            color: "#6b675f",
            letterSpacing: 4,
            alignSelf: "flex-start",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#10b981",
              display: "flex",
            }}
          />
          Ley 27.642 · Argentina
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 24,
          }}
        >
          <div
            style={{
              fontFamily: "Instrument Serif",
              fontSize: 104,
              lineHeight: 1.02,
              color: "#0a0a0a",
              letterSpacing: -1.5,
              maxWidth: 1050,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Sacale una foto y averiguá qué te estás comiendo.
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "#6b675f",
              maxWidth: 900,
              lineHeight: 1.35,
              display: "flex",
            }}
          >
            Etiquetado Frontal — los octógonos que corresponden a cualquier
            envase, según el perfil OPS.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            {SELLOS.map(({ l1, l2 }) => (
              <div
                key={l2}
                style={{
                  width: 110,
                  height: 110,
                  background: "#0a0a0a",
                  clipPath: OCTAGONO,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 96,
                    height: 96,
                    border: "1.5px solid #fff",
                    clipPath: OCTAGONO,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 10, opacity: 0.9 }}>{l1}</div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>{l2}</div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              fontSize: 16,
              color: "#6b675f",
            }}
          >
            <div style={{ fontWeight: 700, color: "#0a0a0a" }}>
              etiquetadofrontal
            </div>
            <div>Hecho por Rodolfo Pardo</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Instrument Serif",
          data: serif,
          style: "normal",
          weight: 400,
        },
        { name: "Inter", data: interReg, style: "normal", weight: 400 },
        { name: "Inter", data: interBold, style: "normal", weight: 700 },
      ],
    },
  );
}
