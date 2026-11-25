import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// HTTPS=1: dev server cez HTTPS (self-signed). Telefón posiela údaje o naklonení (gyroskop) len cez HTTPS.
const https = process.env.HTTPS === "1";

/** Prerender: stránka sa poskladá z komponentov (src/page.ts) priamo do index.html, výstup je statické HTML. */
function prerender(): Plugin {
  let server: ViteDevServer | undefined;
  return {
    name: "areaprint-prerender",
    configureServer(s) { server = s; },
    async transformIndexHtml(html) {
      const mod = server
        ? await server.ssrLoadModule("/src/page.ts")
        : await import(/* @vite-ignore */ new URL("./src/page.ts", import.meta.url).href); // nie ako závislosť configu (inak dev server pri zmene reštartuje)
      return html.replace("<!--app-->", mod.renderPage());
    },
    handleHotUpdate({ file, server: s }) {
      if (/src\/(page|components|icons)/.test(file)) s.ws.send({ type: "full-reload" });
    },
  };
}

export default defineConfig({
  plugins: [prerender(), ...(https ? [basicSsl()] : [])],
  server: { port: 5173, host: true },
  build: { target: "es2020", cssMinify: true, assetsInlineLimit: 0 },
});
