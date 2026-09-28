// Pré-renderização: injeta o HTML do React no index.html gerado pelo Vite.
// Resultado: dist/index.html com todos os textos, sem depender de JS.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");
const entry = fs.readdirSync(ssrDir).find((f) => /^entry-server\.(m?js)$/.test(f));
const { render } = await import(pathToFileURL(path.join(ssrDir, entry)).href);

const templatePath = path.join(dist, "index.html");
const template = fs.readFileSync(templatePath, "utf8");
const html = render();
if (!template.includes("<!--app-html-->")) throw new Error("placeholder <!--app-html--> não encontrado");
fs.writeFileSync(templatePath, template.replace("<!--app-html-->", html));
fs.rmSync(ssrDir, { recursive: true, force: true });
console.log(`prerender: dist/index.html (${(html.length / 1024).toFixed(1)} KB de HTML renderizado)`);
