// Statické PNG rastra (placeholder pred načítaním WebGL a fallback bez WebGL2), vyrenderované tým istým shaderom.
import { chromium } from "playwright";
import sharp from "sharp";
const url = process.argv[2] || "http://localhost:5180/";
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const [w, suffix] of [[1280, ""], [390, "-m"]] as const) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: ".raster-tile > :not(canvas){visibility:hidden!important} .raster-tile{border-radius:0!important;background:none!important} .raster-tile__canvas{opacity:1!important;transition:none!important}" });
  await p.waitForTimeout(3000);
  for (const [sel, name] of [[".hero", "hero"], [".tech", "tech"]]) {
    const buf = await p.locator(sel).screenshot();
    await sharp(buf).png({ palette: true, quality: 90 }).toFile(`public/img/raster-${name}${suffix}.png`);
  }
  await p.close();
}
await b.close();
console.log("ok");
