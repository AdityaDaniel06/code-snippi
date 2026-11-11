import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the Snippi bracket mark, full-bleed (iOS rounds the corners itself). */
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
          background: "#ff5a1f",
        }}
      >
        <svg width="160" height="160" viewBox="0 0 32 32">
          <path
            d="M13.3 9H10.6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2.7M18.7 9h2.7a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2.7"
            fill="none"
            stroke="#0b0b0c"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size
  );
}
