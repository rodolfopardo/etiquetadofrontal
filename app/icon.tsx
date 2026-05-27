import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const OCTAGONO =
  "polygon(29.3% 0, 70.7% 0, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0 70.7%, 0 29.3%)";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "#0a0a0a",
            clipPath: OCTAGONO,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              background: "#fafaf9",
              clipPath: OCTAGONO,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 23,
                height: 23,
                background: "#0a0a0a",
                clipPath: OCTAGONO,
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
