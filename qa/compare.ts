/**
 * Vizuálna kontrola: web vs Figma (Playwright + sharp).
 *   bun qa/compare.ts [url]
 * Urobí full-page screenshot pri 1280 a 390 (prefers-reduced-motion = statický raster v pozícii z dizajnu,
 * bez animácií), oreže sekcie podľa súradníc z Figmy a uloží dvojice Figma | web | diff do qa/.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "fs";

const SITE = process.argv[2] || "http://localhost:5180/";
const OUT = import.meta.dir + "/";

type Box = [name: string, y: number, h: number, sel?: string];
const DESKTOP: Box[] = [
  ["01-hero", 0, 832, ".hero"], ["02-riesenia", 832, 941, "#riesenia"], ["03-proces", 1773, 965, "#proces"],
  ["04-realizacie", 2738, 1204, "#realizacie"], ["05-technologie", 3942, 960, "#technologie"], ["06-magazin", 4902, 671, "#magazin"],
  ["07-footer", 5573, 816, ".footer"],
];
const MOBILE: Box[] = [
  ["01-hero", 0, 660, ".hero"], ["02-riesenia", 660, 868, "#riesenia"], ["03-proces", 1528, 996, "#proces"],
  ["04-realizacie", 2524, 948, "#realizacie"], ["05-technologie", 3472, 870, "#technologie"], ["06-magazin", 4342, 614, "#magazin"],
  ["07-footer", 4956, 1196, ".footer"],
];

async function shoot(width: number, file: string, boxes: Box[]) {
  const browser = await chromium.launch({ args: ["--hide-scrollbars", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await page.goto(SITE, { waitUntil: "networkidle" });
  await page.evaluate(async () => { await document.fonts.ready; });
  // lazy obrázky: načítať všetky
  await page.evaluate(async () => {
    document.querySelectorAll("img[loading=lazy]").forEach(i => i.setAttribute("loading", "eager"));
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0), null, { timeout: 20000 }).catch(() => console.log("niektoré obrázky sa nenačítali"));
  await page.waitForTimeout(600);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const ys = await page.evaluate((sels) => sels.map(q => { const e = q && document.querySelector(q); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null; }), boxes.map(b => b[3] ?? ""));
  await page.screenshot({ path: file, fullPage: true });
  await browser.close();
  return { height, ys };
}

async function compare(label: string, figmaPath: string, webPath: string, boxes: Box[], width: number, ys: (number | null)[]) {
  const dir = `${OUT}${label}`; mkdirSync(dir, { recursive: true });
  const fMeta = await sharp(figmaPath).metadata(), wMeta = await sharp(webPath).metadata();
  console.log(`\n== ${label}: Figma ${fMeta.width}x${fMeta.height}, web ${wMeta.width}x${wMeta.height}`);
  for (const [bi, [name, y, h, sel]] of boxes.entries()) {
    // Figma box vs rovnaký box na webe zarovnaný podľa polohy elementu (sel); prvý element v boxe je pri tom istom offsete
    const off = ys[bi] != null ? ys[bi]! - y : 0;
    const region = { left: 0, top: y, width, height: Math.min(h + 24, (wMeta.height ?? 0) - y - off, (fMeta.height ?? 0) - y) };
    const wregion = { ...region, top: y + off };
    if (region.height <= 0) { console.log(name, "mimo stránky"); continue; }
    const f = await sharp(figmaPath).extract(region).removeAlpha().raw().toBuffer();
    const w = await sharp(webPath).extract(wregion).removeAlpha().raw().toBuffer();
    const diff = Buffer.alloc(f.length);
    let bad = 0;
    for (let i = 0; i < f.length; i += 3) {
      const d = Math.max(Math.abs(f[i] - w[i]), Math.abs(f[i + 1] - w[i + 1]), Math.abs(f[i + 2] - w[i + 2]));
      if (d > 40) { bad++; diff[i] = 255; diff[i + 1] = 0; diff[i + 2] = 80; }
      else { const g = Math.round(f[i] * 0.25 + 190); diff[i] = diff[i + 1] = diff[i + 2] = g; }
    }
    const pct = (bad / (f.length / 3)) * 100;
    const raw = { raw: { width, height: region.height, channels: 3 as const } };
    const gap = 16;
    await sharp({ create: { width: width * 3 + gap * 2, height: region.height, channels: 3, background: "#ffffff" } })
      .composite([
        { input: await sharp(f, raw).png().toBuffer(), left: 0, top: 0 },
        { input: await sharp(w, raw).png().toBuffer(), left: width + gap, top: 0 },
        { input: await sharp(diff, raw).png().toBuffer(), left: (width + gap) * 2, top: 0 },
      ]).png().toFile(`${dir}/${name}.png`);
    console.log(`${name.padEnd(24)} posun ${String(off).padStart(4)} px   rozdielnych pixelov ${pct.toFixed(2)} %`);
  }
}

const which = process.argv[3] || "all";
if (which !== "mobile") {
  const { height: h, ys } = await shoot(1280, `${OUT}web-desktop-1280.png`, DESKTOP);
  console.log("web výška desktop", h, "(Figma 6389)");
  await compare("desktop-1280", `${OUT}figma/desktop-1280.png`, `${OUT}web-desktop-1280.png`, DESKTOP, 1280, ys);
}
if (which !== "desktop") {
  const { height: h, ys } = await shoot(390, `${OUT}web-mobile-390.png`, MOBILE);
  console.log("web výška mobil", h, "(Figma 6152)");
  await compare("mobile-390", `${OUT}figma/mobile-390.png`, `${OUT}web-mobile-390.png`, MOBILE, 390, ys);
}
