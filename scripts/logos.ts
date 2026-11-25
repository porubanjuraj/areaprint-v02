import { readFileSync, writeFileSync } from "fs";
const d = "assets-src/figma";
// footer logo: keep only paths after <g id="Logo v16">
const f = readFileSync(`${d}/footer_logo.svg`, "utf8");
const part = f.slice(f.indexOf('id="Logo v16"'));
const paths = (part.match(/<path [^>]*\/>/g) || []).map(p => p.replace(/ id="[^"]*"/g, "").replace(/fill="#F7F3EA"/g, 'fill="currentColor"'));
writeFileSync("src/icons/logo-footer.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 172 34" fill="none" aria-hidden="true" focusable="false">${paths.join("")}</svg>`);
console.log("footer logo paths", paths.length, readFileSync(`${d}/footer_logo.svg`,"utf8").match(/<clipPath[\s\S]*?<\/clipPath>/)?.[0]);
// header logo
const h = readFileSync(`${d}/logo.svg`, "utf8");
const hp = (h.match(/<path [^>]*\/>/g) || []).map(p => p.replace(/ id="[^"]*"/g, "").replace(/fill="#3B1F33"/g, 'fill="currentColor"'));
writeFileSync("src/icons/logo.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 164 32" fill="none" aria-hidden="true" focusable="false">${hp.join("")}</svg>`);
// symbol
const s = readFileSync(`${d}/footer_symbol.svg`, "utf8");
const sp = (s.match(/<path [^>]*\/>/g) || []).map(p => p.replace(/ id="[^"]*"/g, ""));
writeFileSync("src/icons/symbol.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 454.13 454.13" fill="none" aria-hidden="true" focusable="false">${sp.join("")}</svg>`);
// cursor
const c = readFileSync(`${d}/cursor.svg`, "utf8");
console.log(c);
