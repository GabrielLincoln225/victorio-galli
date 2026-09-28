// Gera os vídeos e posters da hero a partir do vídeo original da produção.
//
// Por que existe: o original (8 s) tem, entre 2,6 s e 5,3 s (quadros 63–127), a cabeça
// tremendo de um quadro para o outro, e o fim não emenda com o começo. O laço antigo
// incluía esse trecho e ainda fazia um crossfade no fim (dupla exposição do rosto).
// Aqui usamos só o trecho calmo (quadros 0–62, rosto parado) em vai-e-volta:
// 0 → 62 → 1, e o laço fecha no quadro 0 sem emenda nenhuma.
//
// Uso: node scripts/hero-video.mjs [caminho/do/original.mp4]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = process.argv[2] || path.join(root, "Man_standing_before_waving_flag_20260927222310.mp4");
if (!fs.existsSync(src)) throw new Error(`Original não encontrado: ${src}`);
const out = (f) => path.join(root, "public", "hero", f);

const FIRST = 0; // primeiro quadro do trecho calmo
const LAST = 62; // último quadro do trecho calmo
// O original tem faixas pretas de ~5 px no topo e na base: recortamos (16:9 mantido)
// e voltamos para 1920x1080 (ampliação de ~1%, imperceptível).
const DESKTOP_CROP = "crop=1896:1066:12:6,scale=1920:1080:flags=lanczos";
// Recorte vertical para o mobile (2:3), mãos inteiras + rosto, em resolução nativa
const MOBILE_CROP = "crop=711:1066:780:6,scale=720:1080:flags=lanczos";

const pingPong = (extra) =>
  `[0:v]trim=start_frame=${FIRST}:end_frame=${LAST + 1},setpts=PTS-STARTPTS${extra},split[a][b];` +
  `[b]reverse,trim=start_frame=1:end_frame=${LAST - FIRST},setpts=PTS-STARTPTS[r];` +
  `[a][r]concat=n=2:v=1:a=0,format=yuv420p[v]`;

const ffmpeg = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
const h264 = (crf) => ["-an", "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-profile:v", "high", "-movflags", "+faststart"];

// Desktop: 1920x1080
ffmpeg(["-i", src, "-filter_complex", pingPong("," + DESKTOP_CROP), "-map", "[v]", ...h264(21), out("hero-loop.mp4")]);
// Mobile: vertical 720x1080
ffmpeg(["-i", src, "-filter_complex", pingPong("," + MOBILE_CROP), "-map", "[v]", ...h264(24), out("hero-loop-mobile.mp4")]);

// Posters = primeiro quadro de cada laço
ffmpeg(["-i", out("hero-loop.mp4"), "-frames:v", "1", "-q:v", "3", out("hero-poster.jpg")]);
ffmpeg(["-i", out("hero-loop-mobile.mp4"), "-frames:v", "1", "-q:v", "3", out("hero-poster-mobile.jpg")]);

for (const f of ["hero-loop.mp4", "hero-loop-mobile.mp4", "hero-poster.jpg", "hero-poster-mobile.jpg"]) {
  console.log(`${f.padEnd(24)} ${(fs.statSync(out(f)).size / 1024).toFixed(0)} KB`);
}
console.log("Rode `npm run assets` em seguida para gerar os WebP e a imagem de compartilhamento.");
