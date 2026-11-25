import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// HTTPS=1: dev server cez HTTPS (self-signed). Telefón posiela údaje o naklonení (gyroskop) len cez HTTPS.
const https = process.env.HTTPS === "1";

/** Prerender: stránka sa poskladá z komponentov (src/page.ts) priamo do index.html, výstup je statické HTML. */
function prerender(): Plugin {
  let server: ViteDevServer | undefined;
  let isBuild = false;
  return {
    name: "areaprint-prerender",
    configureServer(s) { server = s; },
    configResolved(c) { isBuild = c.command === "build"; },
    async transformIndexHtml(html) {
      const mod = server
        ? await server.ssrLoadModule("/src/page.ts")
        : await import(/* @vite-ignore */ new URL("./src/page.ts", import.meta.url).href); // nie ako závislosť configu (inak dev server pri zmene reštartuje)
      const out = html.replace("<!--app-->", mod.renderPage());
      // build: relatívne cesty k súborom z public/, aby web fungoval aj v podpriečinku (GitHub Pages: /areaprint-v0x/)
      return isBuild ? out.replace(/(["\s,(])\/(img|fonts|favicon)/g, "$1./$2") : out;
    },
    handleHotUpdate({ file, server: s }) {
      if (/src\/(page|components|icons)/.test(file)) s.ws.send({ type: "full-reload" });
    },
  };
}

export default defineConfig({
  base: "./", // relatívne cesty: build sa dá nasadiť do koreňa domény aj do podpriečinka
  plugins: [prerender(), ...(https ? [basicSsl()] : [])],
  server: { port: 5173, host: true },
  build: { target: "es2020", cssMinify: true, assetsInlineLimit: 0 },
});
