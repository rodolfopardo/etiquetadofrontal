import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const OCTAGONO =
  "polygon(29.3% 0, 70.7% 0, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0 70.7%, 0 29.3%)";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f5f1",
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            background: "#0a0a0a",
            clipPath: OCTAGONO,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 138,
              height: 138,
              background: "#f7f5f1",
              clipPath: OCTAGONO,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 128,
                height: 128,
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
