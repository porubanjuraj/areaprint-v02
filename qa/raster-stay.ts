// Test: raster po odchode kurzora ostane tam, kde bol kurzor (dev server, window.__rasters). bun qa/raster-stay.ts
import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
for (const [name, url, sel] of [["v01", "http://localhost:5173/", ".hero-tile"], ["v02", "http://localhost:5180/", ".hero"]]) {
  const p = await b.newPage({ viewport: { width: 1280, height: 832 } });
  await p.goto(url, { waitUntil: "networkidle" }); await p.waitForTimeout(3000);
  const box = (await p.locator(sel).boundingBox())!;
  const pos = () => p.evaluate(s => { const t = (window as any).__rasters.find((r: any) => r.el.matches(s)); return `${t.pos[0].toFixed(0)} % / ${t.pos[1].toFixed(0)} %`; }, sel);
  const before = await pos();
  await p.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3, { steps: 8 }); await p.waitForTimeout(1500);
  const on = await pos();
  await p.mouse.move(box.x + box.width * 0.2, box.y + box.height + 80); // kurzor odskočí mimo dlaždicu
  await p.waitForTimeout(1500); const after1 = await pos();
  await p.waitForTimeout(4000); const after2 = await pos();
  console.log(`${name}: bez kurzora ${before} | kurzor na 20 % / 30 %: ${on} | 1,5 s po odchode: ${after1} | 5,5 s po odchode: ${after2}`);
  await p.close();
}
await b.close();
