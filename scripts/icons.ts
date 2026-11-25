import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";
const src = "assets-src/figma"; mkdirSync("src/icons", { recursive: true });
for (const f of readdirSync(src).filter(f => f.startsWith("icon_"))) {
  const s = readFileSync(`${src}/${f}`, "utf8");
  const paths = (s.match(/<path [^>]*\/>/g) || []).map(p => p.replace(/ id="[^"]*"/g, "")
    .replace(/stroke="#3B1F33"/g, 'stroke="currentColor"').replace(/fill="#3B1F33"/g, 'fill="currentColor"')
    .replace(/ stroke-width="1\.5"/g, ""));  // hrúbku čiary určuje CSS podľa veľkosti ikony (1,5 px v dizajne)
  writeFileSync(`src/icons/${f.replace("icon_", "")}`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">${paths.join("")}</svg>`);
  console.log(f, paths.length);
}

// zbal všetky SVG zo src/icons do jedného TS modulu (použiteľné pri prerenderi aj v prehliadači)
const all = readdirSync("src/icons").filter(f => f.endsWith(".svg"));
const lines = all.map(f => `  "${f.replace(".svg", "")}": ${JSON.stringify(readFileSync(`src/icons/${f}`, "utf8"))},`);
writeFileSync("src/icons.ts", `// vygenerované: bun scripts/icons.ts (zdroj: Figma export)\nexport const icons = {\n${lines.join("\n")}\n} as const;\nexport type IconName = keyof typeof icons;\n`);
