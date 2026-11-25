import sharp from "sharp";
// vypíše súvislé úseky stĺpcov s "atramentom" v danom pásme (na hľadanie pozícií slov)
const [img, x, y, w, h, mode = "light"] = process.argv.slice(2);
const { data, info } = await sharp(img).extract({ left: +x, top: +y, width: +w, height: +h }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const ink: boolean[] = [];
for (let i = 0; i < info.width; i++) { let on = false; for (let j = 0; j < info.height; j++) { const k = (j * info.width + i) * 3, l = (data[k] + data[k+1] + data[k+2]) / 3; if (mode === "light" ? l > 200 : l < 110) on = true; } ink.push(on); }
const runs: string[] = []; let s = -1;
ink.forEach((v, i) => { if (v && s < 0) s = i; if (!v && s >= 0) { runs.push(`${+x + s}-${+x + i - 1}`); s = -1; } });
if (s >= 0) runs.push(`${+x + s}-${+x + info.width - 1}`);
console.log(img.split("/").pop(), runs.join(" "));
