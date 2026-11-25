import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/core.css";
import "./styles/v02.css";
import { initRasters } from "./lib/raster";
import { initMarquees } from "./lib/marquee";
import { initMenu, initNewsletter, initReveal, initScale, initScrollSpy, initSliders } from "./lib/ui";
import { initRealizations, initSolutionsIndex } from "./lib/v2";

initScale();
initReveal();
initMenu();
initSliders();
initScrollSpy();
initNewsletter();
initMarquees();
initSolutionsIndex();
initRealizations();
// raster (WebGL) až po načítaní a v čase nečinnosti; dovtedy statický PNG z toho istého shadera
const startRaster = () => ("requestIdleCallback" in window ? requestIdleCallback(() => initRasters(), { timeout: 2000 }) : setTimeout(initRasters, 300));
if (document.readyState === "complete") startRaster(); else addEventListener("load", startRaster, { once: true });
