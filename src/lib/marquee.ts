/**
 * Nekonečný pás (pilulky, logá). Položky sa naklonujú, pás sa posúva o modulo šírky jednej sady,
 * takže sa nikdy neukáže medzera. Pri posune 0 je pás presne v pozícii z Figmy
 * (align=center: vycentrovaný ako v auto-layoute, align=start: od ľavého okraja).
 *  - data-marquee="scroll": posun naviazaný na scroll (lerp), pri prechode sekcie cez obrazovku cca 40 % šírky pásu.
 *  - data-marquee="time": ticker (logá, pilulky v hero), pomaly a plynulo, pri hoveri stojí.
 *  - data-marquee="range": bez opakovania; počas prechodu sekcie obrazovkou prejde pás od prvej po poslednú položku (Technológie).
 * prefers-reduced-motion: pás stojí, dá sa posúvať horizontálne (overflow scroll).
 */
type M = {
  el: HTMLElement; track: HTMLElement; mode: "scroll" | "time" | "range"; range: number; dir: number; align: "center" | "start";
  setW: number; baseX: number; shift: number; target: number; paused: boolean; active: boolean; visible: boolean;
};

const COPIES = 3;
// Technológie: koľko px sa pás posunie na 1 px scrollu, kým je sekcia pripnutá (menej = pomalšie)
const PIN_RATIO = 0.6; // originál v strede, kópia vľavo aj vpravo

export function initMarquees() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items: M[] = [];
  document.querySelectorAll<HTMLElement>("[data-marquee]").forEach(el => {
    const track = el.querySelector<HTMLElement>(".marquee__track");
    if (!track) return;
    if (reduce) {
      // statický pás v pozícii z dizajnu, posúvateľný horizontálne
      el.classList.add("marquee--static");
      const place = () => {
        const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
        const inner = el.clientWidth - 2 * pad;
        el.scrollLeft = el.dataset.align === "start" ? 0 : Math.max(0, (track.scrollWidth - inner) / 2);
      };
      place(); document.fonts?.ready.then(place); new ResizeObserver(place).observe(el);
      return;
    }
    const mode = el.dataset.marquee as M["mode"];
    const originals = [...track.children] as HTMLElement[];
    // kópie: vľavo a vpravo, skryté pre čítačky aj klávesnicu
    const mk = () => originals.map(n => {
      const c = n.cloneNode(true) as HTMLElement;
      c.setAttribute("aria-hidden", "true"); c.dataset.clone = "";
      c.querySelectorAll("a, button").forEach(a => a.setAttribute("tabindex", "-1"));
      c.querySelectorAll("img").forEach(i => i.setAttribute("alt", ""));
      return c;
    });
    if (mode !== "range") { track.prepend(...mk()); track.append(...mk()); }
    const m: M = {
      el, track, mode, range: 0, dir: Number(el.dataset.dir || -1),
      align: (el.dataset.align as M["align"]) || "center", setW: 0, baseX: 0, shift: 0, target: 0,
      paused: false, active: true, visible: true,
    };
    if (m.mode === "time") {
      el.addEventListener("pointerenter", () => (m.paused = true));
      el.addEventListener("pointerleave", () => (m.paused = false));
      el.addEventListener("focusin", () => (m.paused = true));
      el.addEventListener("focusout", () => (m.paused = false));
    }
    new IntersectionObserver(([e]) => (m.visible = e.isIntersecting), { rootMargin: "100px" }).observe(el);
    items.push(m);
  });
  if (!items.length) return;

  let remScale = 1;
  const measure = () => {
    remScale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
    for (const m of items) {
      const kids = m.track.children;
      const n = kids.length / COPIES;
      const first = kids[n] as HTMLElement, nextSet = kids[2 * n] as HTMLElement;
      // pás technológií je na mobile zoznam pod sebou: tam sa nehýbe
      m.active = getComputedStyle(m.track).flexDirection === "row" && getComputedStyle(m.track).display === "flex";
      if (!m.active) { m.track.style.transform = ""; continue; }
      if (m.mode === "range") {
        m.range = Math.max(0, m.track.scrollWidth - m.el.clientWidth);
        // pripnutie: obal dostane výšku sekcie + dráhu scrollu; 1 px scrollu = PIN_RATIO px posunu pásu
        const pin = m.el.closest<HTMLElement>("[data-pin]");
        const sec = m.el.closest<HTMLElement>("section");
        if (pin && sec) {
          const pinned = getComputedStyle(sec).position === "sticky";
          pin.style.height = pinned ? `${sec.offsetHeight + m.range / PIN_RATIO}px` : "";
        }
        continue;
      }
      m.setW = nextSet.offsetLeft - first.offsetLeft;
      const gap = parseFloat(getComputedStyle(m.track).columnGap) || 0;
      const contentW = m.setW - gap;
      const vw = m.el.clientWidth;
      const designX = m.align === "center" ? (vw - contentW) / 2 : 0;
      m.baseX = designX - first.offsetLeft;
    }
  };
  measure();
  new ResizeObserver(measure).observe(document.body);
  document.fonts?.ready.then(measure);

  const wrap = (v: number, w: number) => (w ? ((v % w) + w) % w : 0);
  let last = performance.now();
  const loop = (now: number) => {
    const dt = Math.min(64, now - last); last = now;
    for (const m of items) {
      if (!m.active || !m.visible) continue;
      if (m.mode === "range") {
        const pin = m.el.closest<HTMLElement>("[data-pin]");
        const sec = (m.el.closest("section") ?? m.el) as HTMLElement;
        let p: number;
        if (pin && getComputedStyle(sec).position === "sticky") {
          // sekcia stojí v strede obrazovky; postup = koľko z obalu sme už prescrollovali
          const pr = pin.getBoundingClientRect();
          const stickyTop = parseFloat(getComputedStyle(sec).top) || 0;
          p = (stickyTop - pr.top) / Math.max(1, pr.height - sec.offsetHeight);
        } else {
          // bez pripnutia: sekcia vojde celá zdola (0) → horný okraj dôjde k hornému okraju obrazovky (1)
          const r = sec.getBoundingClientRect();
          p = (innerHeight - r.bottom) / Math.max(1, innerHeight - r.height);
        }
        p = Math.min(1, Math.max(0, p));
        m.target = -p * m.range;
        m.shift += (m.target - m.shift) * (1 - Math.pow(1 - 0.12, dt / 16.67));
        m.track.style.transform = `translate3d(${m.shift.toFixed(2)}px,0,0)`;
        continue;
      }
      if (m.mode === "scroll") {
        // posun podľa polohy sekcie vo viewporte: prechod cez celú obrazovku = 40 % šírky pásu.
        // Pozícia z dizajnu je v strede prechodu (hero: hneď pri načítaní).
        const r = m.el.getBoundingClientRect();
        const progress = (innerHeight - r.top) / (innerHeight + r.height); // 0..1 počas prechodu
        const atLoad = (innerHeight - (r.top + scrollY)) / (innerHeight + r.height); // stav pri scrollY = 0
        const ref = atLoad > 0 ? atLoad : 0.5;
        m.target = (progress - ref) * m.el.clientWidth * 0.4 * m.dir;
        m.shift += (m.target - m.shift) * (1 - Math.pow(1 - 0.1, dt / 16.67));
      } else if (!m.paused) {
        m.shift += m.dir * 0.03 * dt * remScale; // ~30 px/s pri 1280
      }
      // výsledný posun: dizajnová pozícia + shift, zabalený do intervalu jednej sady
      const w = wrap(m.shift, m.setW);
      const x = m.baseX + (w > m.setW / 2 ? w - m.setW : w);
      m.track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
