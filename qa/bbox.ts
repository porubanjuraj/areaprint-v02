import sharp from "sharp";
// bun qa/bbox.ts img x y w h mode(light|dark) -> bbox of pixels
const [img, x, y, w, h, mode = "light"] = process.argv.slice(2);
const { data, info } = await sharp(img).extract({ left: +x, top: +y, width: +w, height: +h }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
for (let j = 0; j < info.height; j++) for (let i = 0; i < info.width; i++) {
  const k = (j * info.width + i) * 3, l = (data[k] + data[k + 1] + data[k + 2]) / 3;
  if (mode === "light" ? l > 200 : l < 110) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, j); y1 = Math.max(y1, j); }
}
console.log(img.split("/").pop(), "x", +x + x0, "-", +x + x1, "y", +y + y0, "-", +y + y1, "w", x1 - x0 + 1, "h", y1 - y0 + 1);
