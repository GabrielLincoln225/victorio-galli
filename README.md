# Victório Galli 1123 · site de campanha

One page em Vite + React + Tailwind v4 + shadcn/ui + GSAP (ScrollTrigger, SplitText) + Lenis.
O build gera `dist/index.html` **pré-renderizado**: todos os textos estão no HTML, sem depender de JS.

## Comandos

```bash
npm install
npm run dev       # desenvolvimento (http://localhost:5173)
npm run build     # typecheck + build + pré-render → dist/
npm run preview   # serve o dist/ (http://localhost:4173)
npm run assets    # regenera WebP, favicons, og/share.jpg e placeholders (requer Chrome)
node scripts/hero-video.mjs  # regera os vídeos e posters da hero a partir do original (requer ffmpeg)
```

Deploy: projeto `victorio-galli` na Vercel, conectado a este repositório. Todo push na `main` publica em
https://victorio-galli.vercel.app (framework Vite, build `npm run build`, saída `dist`).

## O que falta preencher

Tudo em `src/config/site.ts`:

| Constante         | Hoje                  | Efeito enquanto for placeholder                                    |
| ----------------- | --------------------- | ------------------------------------------------------------------ |
| `SITE_URL`        | `https://victorio-galli.vercel.app` | Trocar quando houver domínio próprio (afeta `og:*`, `canonical` e a mensagem de compartilhar) |
| `WHATSAPP_NUMBER` | `[55DDNÚMERO]`        | "Fale com a campanha" e o ícone de WhatsApp do rodapé ficam escondidos |
| `CNPJ`            | `[CNPJ DA CAMPANHA]`  | Aparece assim no rodapé                                            |

Arquivos que ainda não existem (o site já trata a ausência):

- `public/brand/logo-galli.png` → sem ele, header e rodapé mostram o lettering "GALLI 1123".
- `public/site/quem-e.jpg`
  → hoje é um **placeholder gerado** com o rótulo `[...]` visível. Coloque a foto real com esse
  nome, apague os `.webp` correspondentes e rode `npm run assets` para gerar os WebP.

## Decisões técnicas

- **Paleta e fontes** ficam em `src/styles/index.css` (`@theme`): só navy, royal, amarelo e branco
  (as cores padrão do Tailwind foram removidas). Montserrat (display), Inter (texto) e Playfair Display
  Italic (só em "Vote" e "Para apertar").
- **Uma timeline por seção.** A de cada seção só é montada quando ela se aproxima da tela
  (`buildOnApproach`), e as montagens rodam numa fila, uma tarefa por seção (`src/lib/schedule.ts`),
  para não travar o celular na hidratação.
- **Pin da hero com `position: sticky`** (trilha de 350svh no desktop / 280svh no mobile, definida no CSS),
  controlada por um ScrollTrigger com `scrub: 0.8`. Evita salto de layout e repintura do LCP.
- **Laço da hero** (`scripts/hero-video.mjs`): o vídeo original tem a cabeça tremendo entre 2,6 s e 5,3 s
  e não emenda com o começo. O laço usa só o trecho calmo (0–2,6 s) em vai-e-volta, sem as faixas pretas
  do original. No mobile é um recorte vertical 720×1080 (nítido, sem ampliar).
- **Vídeo da hero**: `autoplay muted loop playsinline preload="auto"`, independente do scroll. A fonte é
  anexada logo após a primeira pintura; até lá aparece o poster (`<img fetchpriority="high">`) e o vídeo
  entra por cima com fade quando começa a tocar.
- **QR code** gerado no build com a lib `qrcode` (módulo virtual em `vite.config.ts`).
- **Reduced motion**: sem pin, sem zoom, sem Lenis, sem contadores; vídeo parado no poster e bloco
  final da hero completo.
