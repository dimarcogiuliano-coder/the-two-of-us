import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getQuestion } from "@/lib/metadata";

export const alt = "The Two of Us — a conversation game for two. A little closer, one question at a time.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Real questions from the library, so the preview never drifts from the content.
const CARDS = [
  { color: "#BC7762", rotate: -9, x: 0, text: getQuestion("discover-001").text },
  { color: "#C6A26B", rotate: 0, x: 120, text: getQuestion("together-051").text },
  { color: "#753F4C", rotate: 9, x: 240, text: getQuestion("together-082").text },
];

async function loadFonts() {
  "use cache";
  const [regular, italic] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/Fraunces-Regular.woff")),
    readFile(join(process.cwd(), "src/assets/Fraunces-Italic.woff")),
  ]);
  return { regular: new Uint8Array(regular), italic: new Uint8Array(italic) };
}

export default async function Image() {
  const { regular, italic } = await loadFonts();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F6F1E9", padding: "72px 80px", fontFamily: "Fraunces", color: "#262625" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 600 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#753F4C" }}>
            A conversation game for two
          </div>
          <div style={{ fontSize: 104, lineHeight: 1, marginTop: 24, display: "flex" }}>
            The Two&nbsp;<span style={{ fontStyle: "italic" }}>of</span>&nbsp;Us
          </div>
          <div style={{ fontSize: 34, fontStyle: "italic", color: "#57534d", marginTop: 26 }}>
            A little closer, one question at a time.
          </div>
          <div style={{ fontSize: 26, marginTop: 40, color: "#262625" }}>
            Five questions at a time. No wrong answers.
          </div>
        </div>
        <div style={{ display: "flex", position: "relative", flex: 1 }}>
          {CARDS.map((c) => (
            <div
              key={c.color}
              style={{
                position: "absolute",
                left: c.x,
                top: 70,
                width: 230,
                height: 310,
                background: "#FFFCF7",
                borderRadius: 26,
                borderTop: `8px solid ${c.color}`,
                boxShadow: "0 24px 48px rgba(38,38,37,0.18)",
                transform: `rotate(${c.rotate}deg)`,
                padding: 26,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: 7, background: c.color }} />
              <div style={{ fontSize: 26, lineHeight: 1.2 }}>{c.text}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: regular.buffer as ArrayBuffer, style: "normal", weight: 400 },
        { name: "Fraunces", data: italic.buffer as ArrayBuffer, style: "italic", weight: 400 },
      ],
    },
  );
}
