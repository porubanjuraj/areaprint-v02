// Simulácia naklonenia telefónu: raster v hero musí zmeniť polohu stredu. bun qa/tilt.ts <url>
import { chromium, devices } from "playwright";
import sharp from "sharp";
const url = process.argv[2] || "https://localhost:5443/";
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ ...devices["iPhone 13"], ignoreHTTPSErrors: true });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(3000); // raster sa inicializuje po načítaní
await p.tap(".hero-tile__title"); // iOS: povolenie sa vyžiada pri dotyku
const tilt = (beta: number, gamma: number) => p.evaluate(([b, g]) => { for (let i = 0; i < 30; i++) dispatchEvent(new DeviceOrientationEvent("deviceorientation", { beta: b, gamma: g, alpha: 0 })); }, [beta, gamma]);
const shots: Buffer[] = [];
for (const [name, beta, gamma] of [["neutral", 50, 0], ["vlavo", 50, -25], ["vpravo", 50, 25], ["hore", 25, 0]] as const) {
  await tilt(beta, gamma);
  await p.waitForTimeout(1500);
  const buf = await p.locator(".hero-tile").screenshot({ path: `${import.meta.dir}/widths/tilt-${name}.png` });
  shots.push(buf);
}
// ťažisko svetlých bodiek rastra (fg) ako odhad stredu
for (const [i, name] of ["neutral", "vlavo", "vpravo", "hore"].entries()) {
  const { data, info } = await sharp(shots[i]).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let sx = 0, sy = 0, n = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const k = (y * info.width + x) * 3; const r = data[k], g = data[k + 1], bb = data[k + 2];
    if (Math.abs(r - 92) < 14 && Math.abs(g - 51) < 14 && Math.abs(bb - 80) < 14) { sx += x; sy += y; n++; }
  }
  console.log(name.padEnd(8), "stred rastra ≈", Math.round((sx / n / info.width) * 100) + " %", Math.round((sy / n / info.height) * 100) + " %");
}
await b.close();
