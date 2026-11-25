// DM Sans pre web: podmnožina z plného variabilného fontu (google/fonts), opsz pevne 14 (ako v dizajne),
// wght 400–500, zachované všetky OpenType features vrátane SS01–SS05 (Google Fonts API ich vypúšťa).
import subsetFont from "subset-font";
import { readFileSync, writeFileSync, rmSync } from "fs";
const src = readFileSync("assets-src/font/DMSans[opsz,wght].ttf");
let text = "";
for (let c = 0x20; c <= 0x7e; c++) text += String.fromCharCode(c);
for (let c = 0xa0; c <= 0x17f; c++) text += String.fromCharCode(c); // Latin-1 + Latin Extended-A (sk, cz, de, hu, pl)
text += "–—‘’‚“”„…•€™←↑→↓↗↘×✓";
const out = await subsetFont(src, text, { targetFormat: "woff2", variationAxes: { opsz: 14, wght: { min: 400, max: 500 } } });
writeFileSync("public/fonts/dmsans.woff2", out);
for (const f of ["dmsans-latin.woff2", "dmsans-latin-ext.woff2", "dmsans-arrows.woff2"]) rmSync(`public/fonts/${f}`, { force: true });
console.log("public/fonts/dmsans.woff2", out.length, "B");
