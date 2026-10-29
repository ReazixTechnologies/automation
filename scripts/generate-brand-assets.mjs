/**
 * Derives web assets from the provided logo without altering the artwork:
 * only crops away empty black padding and resizes.
 *   node scripts/generate-brand-assets.mjs
 */
import sharp from "sharp";

const SRC = "public/brand/reazix-logo.png"; // 1086×724, opaque black background, used as provided

// Full lockup (R mark + wordmark + tagline) with the empty padding trimmed off.
// Content spans x 151–935, y 164–535; keep a small margin so the glow isn't clipped.
await sharp(SRC).extract({ left: 131, top: 144, width: 825, height: 412 }).png().toFile("public/brand/reazix-logo-lockup.png");

// Same lockup with its black background turned into transparency, for dark surfaces.
// alpha = brightest channel, colour un-premultiplied: composited over black it is
// pixel-identical to the original, so the artwork is unchanged; it just no longer
// needs a black box (or blend modes) behind it.
{
  const { data, info } = await sharp("public/brand/reazix-logo-lockup.png").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const a = Math.max(data[i], data[i + 1], data[i + 2]);
    if (a === 0) {
      data[i + 3] = 0;
      continue;
    }
    data[i] = Math.round((data[i] * 255) / a);
    data[i + 1] = Math.round((data[i + 1] * 255) / a);
    data[i + 2] = Math.round((data[i + 2] * 255) / a);
    data[i + 3] = a;
  }
  await sharp(data, { raw: info }).png().toFile("public/brand/reazix-logo-lockup-dark.png");
}

// "R" mark only. The R's tail runs under the wordmark, so a square crop also catches
// the edge of the "E" and "DIGITAL" (x ≥ 415 above y 460); that corner is filled with the
// logo's own black background. The R artwork itself is untouched.
const mark = { left: 95, top: 145, width: 400, height: 400 };
const cover = await sharp({ create: { width: 80, height: 315, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } }).png().toBuffer();
const markPng = await sharp(SRC)
  .extract(mark)
  .composite([{ input: cover, left: 415 - mark.left, top: 0 }])
  .png()
  .toBuffer();
for (const [size, name] of [
  [16, "favicon-16.png"],
  [32, "favicon-32.png"],
  [180, "apple-touch-icon.png"],
  [512, "icon-512.png"],
]) {
  await sharp(markPng).resize(size, size, { kernel: "lanczos3" }).png().toFile(`public/brand/${name}`);
}
console.log("brand assets written to public/brand/");
