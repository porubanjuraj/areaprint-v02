import { chromium } from "playwright";
const [url, width, js] = [process.argv[2], +process.argv[3], process.argv[4]];
const b = await chromium.launch({ args: ["--hide-scrollbars"] });
const p = await b.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
await p.goto(url, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready);
console.log(JSON.stringify(await p.evaluate(js), null, 1));
await b.close();
