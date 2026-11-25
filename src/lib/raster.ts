/**
 * Raster Diamant: port shadera z Figmy (handoff/raster/raster_diamant.wgsl) do GLSL ES 3.0, matematika 1:1.
 * Interakcia podľa handoff/raster/README.md: kurzor (lerp 0.075/frame), gyroskop, voľný pohyb,
 * prefers-reduced-motion = statický, mimo viewportu sa nekreslí, DPR max 2.
 */

const VERT = `#version 300 es
in vec2 aPos; in vec2 aUv; out vec2 vUv;
void main() { vUv = aUv; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 u_res; uniform float u_density; uniform float u_strength;
uniform float u_bias; uniform float u_mscale; uniform float u_mrot; uniform float u_mask;
uniform vec2 u_center; uniform vec4 u_bg; uniform vec4 u_fg; uniform vec4 u_extra; // x gradLen, y maspect, z contrast
in vec2 vUv; out vec4 outColor;

mat2 rot(float a) { float c = cos(a); float s = sin(a); return mat2(c, s, -s, c); }
float fmod_(float x, float y) { return x - y * floor(x / y); }
float on_(float cv) { return smoothstep(0.0, 0.05, cv); }
float sdBox(vec2 p, vec2 b) { vec2 q = abs(p) - b; return length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0); }
float sdTri(vec2 p0, float r) {
  vec2 p = p0;
  p.x = abs(p.x) - r;
  p.y = p.y + r / 1.7320508;
  if (p.x + 1.7320508 * p.y > 0.0) { p = vec2(p.x - 1.7320508 * p.y, -1.7320508 * p.x - p.y) / 2.0; }
  p.x = p.x - clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}
float sdHex(vec2 p0, float r) {
  vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
  vec2 p = abs(p0);
  p = p - 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  p = p - vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}
float sdStar(vec2 p0, float r, float n, float m) {
  float an = 3.141593 / n;
  float en = 3.141593 / m;
  vec2 acs = vec2(cos(an), sin(an));
  vec2 ecs = vec2(cos(en), sin(en));
  float bn = fmod_(atan(p0.x, p0.y), 2.0 * an) - an;
  vec2 p = length(p0) * vec2(cos(bn), abs(sin(bn)));
  p = p - r * acs;
  p = p + ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);
  return length(p) * sign(p.x);
}
float maskSd(vec2 P) {
  vec2 p = (rot(-u_mrot * 0.01745329) * (P - u_center)) / (u_mscale * vec2(u_extra.y, 1.0));
  float R = 0.33;
  float d = 0.0;
  int k = int(round(u_mask));
  if (k == 0) { d = length(p) - R; }
  else if (k == 1) { d = sdBox(p, vec2(R)); }
  else if (k == 2) { d = sdBox(rot(0.7853982) * p, vec2(R * 0.85)); }
  else if (k == 3) { d = sdTri(vec2(p.x, -p.y), R * 0.95); }
  else if (k == 4) { d = sdHex(p, R * 0.95); }
  else if (k == 5) { d = sdStar(p, R * 1.15, 5.0, 2.6); }
  else if (k == 6) { d = abs(length(p) - R * 0.85) - R * 0.3; }
  else if (k == 7) { d = abs(p.y) - R * 0.5; }
  else if (k == 8) { d = abs(p.x) - R * 0.5; }
  else if (k == 9) { d = length(p * vec2(0.62, 1.0)) - R * 0.95; }
  else if (k == 10) { float rr = 0.14; d = sdBox(p, vec2(R * 1.45 - rr, R * 0.85 - rr)) - rr; }
  else if (k == 11) { d = min(sdBox(p, vec2(R, R * 0.34)), sdBox(p, vec2(R * 0.34, R))); }
  else { d = max(length(p + vec2(0.0, R * 0.45)) - R * 1.05, p.y); }
  return d * u_mscale;
}
float cov(vec2 P) {
  float sd = maskSd(P);
  float f = 0.5 - 1.5 * sd / max(u_extra.x, 0.05);
  return clamp((f - 0.5) * u_strength + u_bias, 0.0, 1.0);
}
vec3 pattern(vec2 P, float aa) {
  mat2 R = rot(0.7853982);
  vec2 g = (R * P) * u_density;
  vec2 id = floor(g);
  vec2 l = fract(g) - 0.5;
  float cv = cov(rot(-0.7853982) * ((id + 0.5) / u_density));
  float n = mix(2.0, 8.0, smoothstep(0.35, 1.0, cv));
  vec2 q = abs(l) + vec2(0.00001);
  float d = pow(pow(q.x, n) + pow(q.y, n), 1.0 / n);
  float s = 0.5 * sqrt(cv);
  float m = (1.0 - smoothstep(s - aa, s + aa, d)) * on_(cv) * u_extra.z;
  return mix(u_bg.rgb, u_fg.rgb, m);
}
void main() {
  float asp = u_res.x / u_res.y;
  vec2 P = vec2((vUv.x - 0.5) * asp, -(vUv.y - 0.5));
  float aa = u_density / u_res.y;
  outColor = vec4(pattern(P, aa), 1.0);
}`;

type Params = {
  density: number; strength: number; gradLen: number; bias: number; mscale: number;
  center: [number, number]; bg: string; fg: string; mask?: number; mrot?: number; maspect?: number; contrast?: number;
};

/** Hodnoty z fillov typu SHADER vo Figme (58:4487, 58:4566, mobil 82:874, 82:885). */
export const RASTERS: Record<string, { desktop: Params; mobile?: Params }> = {
  // v02 hero (97:3261 / mobil 113:1196): svetlý raster, polkruh zdola
  hero: {
    desktop: { density: 24, strength: 0.96, gradLen: 0.53, bias: 0.34, mscale: 1.91, center: [50, 100], bg: "#F7F3EA", fg: "#F1EADA" },
    mobile: { density: 24, strength: 0.96, gradLen: 0.53, bias: 0.34, mscale: 1.07, center: [50, 87.785], bg: "#F7F3EA", fg: "#F1EADA" },
  },
  // v02 Technológie (104:3683): tmavý raster v pravom hornom rohu
  tech: { desktop: { density: 22, strength: 0.96, gradLen: 1, bias: 0.34, mscale: 1.3, center: [100, 0], bg: "#3B1F33", fg: "#4A2740" } },
};
const MOBILE = typeof matchMedia !== "undefined" ? matchMedia("(max-width: 1023.98px)") : null;

const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

// --- naklonenie telefónu (gyroskop) ---
// Výsledok je posun stredu v % plochy voči pozícii z dizajnu.
// Neutrálna poloha = ako používateľ telefón práve drží (pomaly sa prispôsobuje), nie pevných 45°,
// takže raster reaguje rovnako v sede aj v stoji. ±25° náklonu = ±40 % plochy.
let tilt: { dx: number; dy: number } | null = null;
let base: { g: number; b: number } | null = null;
let orientationBound = false;
// diagnostika na telefóne: pridaj ?debug do adresy
const dbg = { secure: typeof isSecureContext !== "undefined" ? isSecureContext : false, api: typeof DeviceOrientationEvent !== "undefined", permission: "–", events: 0, beta: 0, gamma: 0 };
let dbgEl: HTMLElement | null = null;
function renderDbg() {
  if (!dbgEl) return;
  dbgEl.textContent = `HTTPS (secure): ${dbg.secure} · API: ${dbg.api} · povolenie: ${dbg.permission} · udalosti: ${dbg.events} · beta ${dbg.beta.toFixed(0)}° gamma ${dbg.gamma.toFixed(0)}°`;
}
if (typeof location !== "undefined" && new URLSearchParams(location.search).has("debug")) {
  dbgEl = document.createElement("div");
  dbgEl.style.cssText = "position:fixed;left:8px;right:8px;bottom:8px;z-index:99;padding:8px 12px;border-radius:12px;background:#000c;color:#fff;font:12px/1.4 system-ui";
  document.body.append(dbgEl); renderDbg();
}
const TILT_RANGE = 20, TILT_SHIFT = 45;
function onOrientation(e: DeviceOrientationEvent) {
  if (e.gamma == null || e.beta == null) { dbg.permission += " (null hodnoty)"; renderDbg(); return; }
  dbg.events++; dbg.beta = e.beta; dbg.gamma = e.gamma; if (dbg.events % 10 === 1) renderDbg();
  // pri otočení na šírku sa osi vymenia
  const angle = (screen.orientation?.angle ?? (window as unknown as { orientation?: number }).orientation ?? 0) as number;
  let g = e.gamma, b = e.beta;
  if (angle === 90) [g, b] = [b, -g];
  else if (angle === -90 || angle === 270) [g, b] = [-b, g];
  if (!base) base = { g, b };
  base.g += (g - base.g) * 0.004; // neutrál sa pomaly prispôsobuje držaniu
  base.b += (b - base.b) * 0.004;
  const n = (v: number) => Math.max(-1, Math.min(1, v / TILT_RANGE));
  tilt = { dx: n(g - base.g) * TILT_SHIFT, dy: n(b - base.b) * TILT_SHIFT };
}
function bindOrientation() {
  if (orientationBound || typeof DeviceOrientationEvent === "undefined") return;
  orientationBound = true;
  // počúvame hneď (Android, prehliadače bez povolenia); na iOS prídu udalosti až po povolení
  addEventListener("deviceorientation", onOrientation);
  const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
  if (typeof DOE.requestPermission === "function") {
    // iOS 13+: povolenie sa dá vyžiadať len pri dotyku; ak sa nepodarí, skúsi sa pri ďalšom dotyku
    const ask = () => {
      DOE.requestPermission!().then(s => {
        dbg.permission = s; renderDbg();
        off(); // granted: udalosti začnú chodiť; denied: ostane voľný pohyb
      }).catch(err => { dbg.permission = "chyba: " + (err?.message || err); renderDbg(); });
    };
    const off = () => { removeEventListener("touchend", ask); removeEventListener("click", ask); };
    addEventListener("touchend", ask, { passive: true });
    addEventListener("click", ask);
    dbg.permission = "čaká na ťuknutie"; renderDbg();
  } else dbg.permission = "netreba";
}

class RasterTile {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  loc: Record<string, WebGLUniformLocation | null> = {};
  pos: [number, number]; target: [number, number] | null = null;
  hover = 0; hoverT = 0; visible = false; dirty = true;
  t0 = performance.now() + Math.random() * 10000;

  get p(): Params { return (MOBILE?.matches && this.cfg.mobile) || this.cfg.desktop; }
  constructor(public el: HTMLElement, public canvas: HTMLCanvasElement, public cfg: { desktop: Params; mobile?: Params }, public reduce: boolean) {
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false, alpha: false });
    if (!gl) throw new Error("WebGL2 nie je k dispozícii");
    this.gl = gl;
    this.prog = this.compile();
    this.pos = [...this.p.center];
    MOBILE?.addEventListener("change", () => { this.pos = [...this.p.center]; this.draw(); });
    el.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse" || reduce) return;
      const r = el.getBoundingClientRect();
      this.target = [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100];
      this.hoverT = 1; el.classList.add("is-pointer");
    });
    const leave = () => { this.target = null; this.hoverT = 0; el.classList.remove("is-pointer"); };
    el.addEventListener("pointerleave", leave);
    new ResizeObserver(() => { this.resize(); this.draw(); }).observe(el);
    new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }, { rootMargin: "50px" }).observe(el);
    this.resize();
  }

  compile() {
    const gl = this.gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
    gl.useProgram(prog);
    // rovnaký quad ako vo Figme: pos.xy, uv.xy (uv.y = 0 hore)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 1, 1, 1, 1, 1, 0]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos"), aUv = gl.getAttribLocation(prog, "aUv");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUv); gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
    for (const n of ["res", "density", "strength", "bias", "mscale", "mrot", "mask", "center", "bg", "fg", "extra"]) this.loc[n] = gl.getUniformLocation(prog, "u_" + n);
    return prog;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = this.el.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(r.width * dpr));
    this.canvas.height = Math.max(1, Math.round(r.height * dpr));
  }

  step(now: number, dt: number) {
    const p = this.p;
    let goal: [number, number] = [...p.center];
    if (!this.reduce) {
      // voľný pohyb okolo pozície z dizajnu: amplitúda ~10 % plochy, perióda ~21 s a ~17 s
      const t = (now - this.t0) / 1000;
      const drift = [Math.sin((t * 2 * Math.PI) / 21) * 10, Math.cos((t * 2 * Math.PI) / 17) * 10];
      if (this.target) goal = this.target;
      // naklonenie telefónu + slabší voľný pohyb, aby raster nestál, ani keď telefón držíš v pokoji
      else if (tilt) goal = [p.center[0] + tilt.dx + drift[0] * 0.4, p.center[1] + tilt.dy + drift[1] * 0.4];
      else goal = [p.center[0] + drift[0], p.center[1] + drift[1]];
      const k = 1 - Math.pow(1 - 0.075, dt / (1000 / 60)); // 0.075 za frame pri 60 fps
      this.pos[0] += (goal[0] - this.pos[0]) * k;
      this.pos[1] += (goal[1] - this.pos[1]) * k;
      this.hover += (this.hoverT - this.hover) * Math.min(1, 0.06 * dt / 16.67);
    }
    this.draw();
  }

  draw() {
    const { gl, p, loc } = this;
    const w = this.canvas.width, h = this.canvas.height, asp = w / h;
    gl.viewport(0, 0, w, h);
    const cx = this.pos[0] / 100, cy = this.pos[1] / 100;
    gl.uniform2f(loc.res, w, h);
    gl.uniform1f(loc.density, p.density);
    gl.uniform1f(loc.strength, p.strength);
    gl.uniform1f(loc.bias, p.bias);
    gl.uniform1f(loc.mscale, p.mscale * (1 + 0.15 * this.hover)); // hover: max +15 %
    gl.uniform1f(loc.mrot, p.mrot ?? 0);
    gl.uniform1f(loc.mask, p.mask ?? 0);
    gl.uniform2f(loc.center, (cx - 0.5) * asp, -(cy - 0.5));
    gl.uniform4f(loc.bg, ...(hex(p.bg) as [number, number, number]), 1);
    gl.uniform4f(loc.fg, ...(hex(p.fg) as [number, number, number]), 1);
    gl.uniform4f(loc.extra, p.gradLen, p.maspect ?? 1, p.contrast ?? 1, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    this.dirty = false;
    this.el.classList.add("is-live");
  }
}

export function initRasters() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tiles: RasterTile[] = [];
  document.querySelectorAll<HTMLElement>("[data-raster]").forEach(el => {
    const canvas = el.querySelector("canvas");
    const params = RASTERS[el.dataset.raster!];
    if (!canvas || !params) return;
    try { tiles.push(new RasterTile(el, canvas, params, reduce)); }
    catch { el.classList.add("raster-fallback"); } // bez WebGL2: statický PNG (raster-fallback v CSS)
  });
  if (!tiles.length) return;
  if (reduce) {
    // statický raster v hodnotách z dizajnu (prekreslí sa len pri zmene veľkosti, pozri ResizeObserver)
    tiles.forEach(t => t.draw());
    return;
  }
  if (matchMedia("(pointer: coarse)").matches || "ontouchstart" in window) bindOrientation();
  let last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min(64, now - last); last = now;
    for (const t of tiles) if (t.visible && t.el.offsetParent !== null) t.step(now, dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
