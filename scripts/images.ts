import sharp from "sharp";
import { readdirSync, mkdirSync } from "fs";
const src = "assets-src/figma", out = "public/img"; mkdirSync(out, { recursive: true });
const photos = readdirSync(src).filter(f => /^(sol|real|mag)_.*\.png$/.test(f));
for (const f of photos) {
  const img = sharp(`${src}/${f}`); const m = await img.metadata();
  const base = f.replace(".png", "");
  const widths = [480, 800, 1200, 1600].filter(w => w <= (m.width ?? 0));
  // vždy všetky 4 šírky (srcset ich očakáva); menší originál sa nezväčšuje
  for (const w of [480, 800, 1200, 1600]) await sharp(`${src}/${f}`).resize({ width: w, withoutEnlargement: true }).webp({ quality: 72 }).toFile(`${out}/${base}-${w}.webp`);
  console.log(base, m.width, m.height, widths.join(","));
}
for (const f of readdirSync(src).filter(f => f.startsWith("clientlogo_"))) {
  const m = await sharp(`${src}/${f}`).metadata();
  const base = f.replace(".png", "");
  for (const w of [192, 288]) await sharp(`${src}/${f}`).resize({ width: w, height: w / 2, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 85 }).toFile(`${out}/${base}-${w}.webp`);
  console.log(base, m.width, m.height);
}
