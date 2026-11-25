import sharp from "sharp";
// bun qa/crop.ts <figma> <web> x y w h out [scale]
const [f, w, x, y, wd, h, out, s = "2"] = process.argv.slice(2);
const r = { left: +x, top: +y, width: +wd, height: +h }, k = +s;
const a = await sharp(f).extract(r).resize({ width: r.width * k, kernel: "nearest" }).png().toBuffer();
const b = await sharp(w).extract(r).resize({ width: r.width * k, kernel: "nearest" }).png().toBuffer();
await sharp({ create: { width: r.width * k, height: r.height * k * 2 + 8, channels: 3, background: "#ff00ff" } })
  .composite([{ input: a, top: 0, left: 0 }, { input: b, top: r.height * k + 8, left: 0 }]).png().toFile(out);
