// Gera os assets derivados em /public:
//  - WebP do poster e do avatar da hero
//  - placeholders VISÍVEIS (com [colchetes]) para a foto do Quem é e as miniaturas
//    da campanha, apenas se os arquivos reais ainda não existirem
//  - favicon (svg/png), apple-touch-icon
//  - imagem de compartilhamento /og/share.jpg (1200x630, < 300 KB)
// Uso: npm run assets   (requer Chrome instalado; caminho em CHROME_PATH)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { chromium } from "playwright-core";

const root = process.cwd();
const pub = (...p) => path.join(root, "public", ...p);
const exists = (p) => fs.existsSync(p);
const CHROME =
  process.env.CHROME_PATH ||
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
  ].find(exists);

// Fontes embutidas em base64 (file:// é bloqueado em páginas about:blank)
const font = (rel) =>
  "data:font/woff2;base64," + fs.readFileSync(path.join(root, "node_modules", rel)).toString("base64");
const FONTS = `
  @font-face{font-family:"Montserrat";src:url(${font("@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2")}) format("woff2");font-weight:100 900}
  @font-face{font-family:"Inter";src:url(${font("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2")}) format("woff2");font-weight:100 900}
  @font-face{font-family:"Playfair";font-style:italic;src:url(${font("@fontsource/playfair-display/files/playfair-display-latin-700-italic.woff2")}) format("woff2");font-weight:700}
  *{margin:0;padding:0;box-sizing:border-box} html,body{background:#011b72}
`;
const NAVY = "#011b72";
const YELLOW = "#fec601";

const urna = (fs, gap = 0.09) => `
  <div style="display:flex;gap:${gap}em;font:900 ${fs}px/1 Montserrat">
    ${["1", "1", "2", "3"]
      .map(
        (d, i) => `<span style="display:grid;place-items:center;width:.74em;height:1em;border-radius:.15em;
        background:${i % 2 ? YELLOW : NAVY};color:${i % 2 ? NAVY : "#fff"};
        ${i % 2 ? "" : "box-shadow:inset 0 0 0 2px rgb(255 255 255 / .22);"}"><span style="font-size:.74em;letter-spacing:-.04em">${d}</span></span>`,
      )
      .join("")}
  </div>`;

const dataUrl = async (file, width) =>
  "data:image/jpeg;base64," + (await sharp(file).resize({ width }).jpeg({ quality: 85 }).toBuffer()).toString("base64");

async function main() {
  fs.mkdirSync(pub("og"), { recursive: true });
  fs.mkdirSync(pub("site"), { recursive: true });
  fs.mkdirSync(pub("campanha"), { recursive: true });

  // 1) WebP da hero
  await sharp(pub("hero", "hero-poster.jpg")).webp({ quality: 72 }).toFile(pub("hero", "hero-poster.webp"));
  await sharp(pub("hero", "hero-poster-mobile.jpg")).webp({ quality: 60 }).toFile(pub("hero", "hero-poster-mobile.webp"));
  await sharp(pub("hero", "galli-avatar.jpg"))
    .resize(192, 192)
    .webp({ quality: 80 })
    .toFile(pub("hero", "galli-avatar.webp"));
  console.log("webp: hero-poster, galli-avatar");

  // Tile de grão (ruído monocromático) para o fundo royal: barato de pintar, ao contrário de feTurbulence
  fs.mkdirSync(pub("textures"), { recursive: true });
  const N = 160;
  const px = Buffer.alloc(N * N * 2);
  for (let i = 0; i < N * N; i++) {
    px[i * 2] = 255;
    px[i * 2 + 1] = Math.random() < 0.5 ? 0 : Math.round(Math.random() * 60);
  }
  await sharp(px, { raw: { width: N, height: N, channels: 2 } })
    .png({ compressionLevel: 9 })
    .toFile(pub("textures", "grain.png"));
  console.log("textures/grain.png");

  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage();
  const shot = async (html, w, h, out, type = "png", quality) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}</style></head><body>${html}</body></html>`,
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: out, type, quality, clip: { x: 0, y: 0, width: w, height: h } });
  };

  const poster = await dataUrl(pub("hero", "hero-poster.jpg"), 1920);

  // 2) Placeholders visíveis (só se o arquivo real não existir)
  const placeholder = (w, h, label, pos) => `
    <div style="position:relative;width:${w}px;height:${h}px;overflow:hidden;background:${NAVY}">
      <img src="${poster}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};filter:saturate(.9)">
      <div style="position:absolute;inset:0;background:linear-gradient(to top,rgb(1 27 114 / .75),rgb(1 27 114 / .15) 60%)"></div>
      <div style="position:absolute;left:12%;right:12%;top:50%;transform:translateY(-50%);text-align:center;
        font:800 ${Math.round(w / 22)}px/1.25 Inter;color:#fff;background:${NAVY};padding:.8em 1em;
        border-radius:10px;border:2px dashed ${YELLOW}">${label}</div>
    </div>`;

  if (!exists(pub("site", "quem-e.jpg"))) {
    await shot(
      placeholder(1080, 1350, "[FOTO QUEM É — substituir /public/site/quem-e.jpg]", "72% 30%"),
      1080,
      1350,
      pub("site", "quem-e.jpg"),
      "jpeg",
      82,
    );
    console.log("placeholder: site/quem-e.jpg");
  }
  const thumbs = [
    ["experiencia", "66% 40%"],
    ["agricultura", "60% 60%"],
    ["educacao", "72% 30%"],
    ["infraestrutura", "55% 45%"],
    ["historia", "68% 70%"],
  ];
  for (const [name, pos] of thumbs) {
    const out = pub("campanha", `${name}.jpg`);
    if (!exists(out)) {
      await shot(placeholder(540, 960, `[MINIATURA ${name}.jpg]`, pos), 540, 960, out, "jpeg", 80);
      console.log(`placeholder: campanha/${name}.jpg`);
    }
  }

  // WebP de tudo que estiver em /site e /campanha
  for (const dir of ["site", "campanha"]) {
    for (const f of fs.readdirSync(pub(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
      const src = pub(dir, f);
      const out = src.replace(/\.(jpe?g|png)$/i, ".webp");
      await sharp(src)
        .resize({ width: dir === "site" ? 1080 : 720, withoutEnlargement: true })
        .webp({ quality: 74 })
        .toFile(out);
      if (dir === "site") {
        await sharp(src)
          .resize({ width: 540 })
          .webp({ quality: 74 })
          .toFile(out.replace(/\.webp$/, "-540.webp"));
      }
    }
  }
  console.log("webp: site/*, campanha/*");

  // 3) Favicons: "1123" amarelo sobre azul marinho
  const icon = (s, r) => `
    <div style="width:${s}px;height:${s}px;background:${NAVY};border-radius:${r}px;display:grid;place-items:center">
      <span style="font:900 ${Math.round(s * 0.36)}px/1 Montserrat;letter-spacing:-.06em;color:${YELLOW}">1123</span>
    </div>`;
  await shot(icon(180, 0), 180, 180, pub("apple-touch-icon.png"));
  await shot(icon(32, 6), 32, 32, pub("favicon-32.png"));
  fs.writeFileSync(
    pub("favicon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${NAVY}"/><text x="32" y="41.5" text-anchor="middle" font-family="Montserrat,'Arial Black',Arial,sans-serif" font-weight="900" font-size="24" letter-spacing="-1.5" fill="${YELLOW}">1123</text></svg>\n`,
  );
  console.log("favicons: favicon.svg, favicon-32.png, apple-touch-icon.png");

  // 4) Imagem de compartilhamento 1200x630
  const og = `
    <div style="position:relative;width:1200px;height:630px;overflow:hidden;background:${NAVY};color:#fff">
      <img src="${poster}" style="position:absolute;top:0;right:-150px;height:630px;width:1120px;object-fit:cover;object-position:75% 30%">
      <div style="position:absolute;inset:0;background:linear-gradient(to right,${NAVY} 0%,${NAVY} 34%,rgb(1 27 114 / .75) 48%,transparent 66%)"></div>
      <div style="position:absolute;left:64px;top:62px;width:560px">
        <div style="display:flex;align-items:center;gap:12px;font:700 22px/1 Inter;letter-spacing:.14em;text-transform:uppercase">
          <span style="width:12px;height:12px;background:${YELLOW}"></span>Deputado Federal
        </div>
        <div style="margin-top:26px;font:900 104px/.9 Montserrat;letter-spacing:-.035em">VICTÓRIO<br>GALLI</div>
        <div style="margin-top:34px;font:italic 700 36px/1 Playfair">Digite</div>
        <div style="margin-top:14px">${urna(132)}</div>
        <div style="margin-top:16px;font:italic 700 36px/1 Playfair">e confirme</div>
      </div>
    </div>`;
  let q = 84;
  const ogPath = pub("og", "share.jpg");
  do {
    await shot(og, 1200, 630, ogPath, "jpeg", q);
    q -= 6;
  } while (fs.statSync(ogPath).size > 300 * 1024 && q > 40);
  console.log(`og/share.jpg: ${(fs.statSync(ogPath).size / 1024).toFixed(0)} KB (q=${q + 6})`);

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
