// One-off generator for app icons. Run: node scripts/generate-icons.mjs
// Uses `sharp`, which ships with Next.js. Outputs are committed.
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const rings = (scale = 1, cx = 256, cy = 256) => {
  const r = 108 * scale, off = 46 * scale, w = 22 * scale;
  return `<circle cx="${cx - off}" cy="${cy}" r="${r}" fill="none" stroke="#262625" stroke-width="${w}"/>
          <circle cx="${cx + off}" cy="${cy}" r="${r}" fill="none" stroke="#753F4C" stroke-width="${w}"/>`;
};
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#F6F1E9"/>${rings()}</svg>`;
const square = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#F6F1E9"/>${rings()}</svg>`;
// Maskable icons need the motif inside the central 80% safe zone.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#F6F1E9"/>${rings(0.72)}</svg>`;

writeFileSync("src/app/icon.svg", rounded);
const out = async (svg, size, file) => sharp(Buffer.from(svg)).resize(size, size).png().toFile(file);
await out(square, 192, "public/icon-192.png");
await out(square, 512, "public/icon-512.png");
await out(maskable, 512, "public/icon-maskable-512.png");
await out(square, 180, "src/app/apple-icon.png");

// favicon.ico containing PNG payloads (16, 32, 48)
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(Buffer.from(rounded)).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e); header.writeUInt8(s, e + 1); header.writeUInt8(0, e + 2); header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8); header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...pngs]));
console.log("icons written");
