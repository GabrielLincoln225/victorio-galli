import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import QRCode from "qrcode";
import { INSTAGRAM_URL, SEO, SITE_URL } from "./src/config/site.ts";

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // QR code do Instagram gerado no build com a lib qrcode (o navegador recebe só o SVG pronto)
      name: "qr-instagram",
      resolveId(id) {
        if (id === "virtual:qr-instagram") return "\0virtual:qr-instagram";
      },
      load(id) {
        if (id !== "\0virtual:qr-instagram") return;
        const qr = QRCode.create(INSTAGRAM_URL, { errorCorrectionLevel: "M" });
        const n = qr.modules.size;
        let path = "";
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.modules.get(r, c)) path += `M${c} ${r}h1v1h-1z`;
        return `export default ${JSON.stringify({ size: n, path })};`;
      },
    },
    {
      // Preload das fontes do primeiro frame (nome do candidato na hero) e script do app
      // adiado: o módulo é baixado já (preload), mas só executa depois da primeira pintura,
      // para o HTML pré-renderizado (poster + nome) aparecer sem esperar o JavaScript.
      name: "preloads",
      transformIndexHtml: {
        order: "post",
        handler(html, ctx) {
          if (!ctx.bundle) return html;
          const fonts = Object.keys(ctx.bundle).filter((f) =>
            /(montserrat|inter)-latin-wght-normal-[\w-]+\.woff2$/.test(f),
          );
          const links = fonts
            .map((f) => `<link rel="preload" href="/${f}" as="font" type="font/woff2" crossorigin />`)
            .join("\n    ");
          html = html.replace("</title>", "</title>\n    " + links);
          return html.replace(
            /<script type="module" crossorigin src="([^"]+)"><\/script>/,
            (_, src) =>
              `<link rel="preload" as="script" crossorigin href="${src}" />\n    ` +
              `<script>requestAnimationFrame(function(){setTimeout(function(){` +
              `var s=document.createElement("script");s.type="module";s.crossOrigin="";s.src="${src}";` +
              `document.head.appendChild(s)},0)})</script>`,
          );
        },
      },
    },
    {
      name: "seo-head",
      transformIndexHtml(html) {
        return html
          .replaceAll("%TITLE%", escapeAttr(SEO.title))
          .replaceAll("%DESCRIPTION%", escapeAttr(SEO.description))
          .replaceAll("%SITE_URL%", escapeAttr(SITE_URL))
          .replaceAll("%OG_IMAGE%", escapeAttr(SEO.ogImage))
          .replaceAll("%THEME%", SEO.themeColor);
      },
    },
  ],
  define: {
    __BUILD_TIME__: JSON.stringify(Date.now()),
  },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  ssr: { noExternal: ["gsap", "@gsap/react", "simple-icons"] },
});
