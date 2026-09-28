// Gera os vídeos e posters da hero a partir do vídeo original da produção.
//
// Por que existe: o original (8 s) tem, entre 2,6 s e 5,3 s (quadros 63–127), a cabeça
// tremendo de um quadro para o outro, e o fim não emenda com o começo. Usamos só o trecho
// calmo (quadros 0–62, rosto parado). Um vai-e-volta simples ainda dava um "tranco" a cada
// virada (a bandeira inverte de repente e ele parece pular), então o tempo é remapeado como
// um pêndulo: a posição no trecho segue 1 − cos, desacelera até parar em cada ponta e volta
// acelerando. Posições fracionárias mesclam os dois quadros vizinhos. O laço fecha no
// quadro 0, parado, sem emenda nenhuma.
//
// Uso: node scripts/hero-video.mjs [caminho/do/original.mp4]
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = process.argv[2] || path.join(root, "Man_standing_before_waving_flag_20260927222310.mp4");
if (!fs.existsSync(src)) throw new Error(`Original não encontrado: ${src}`);
const out = (f) => path.join(root, "public", "hero", f);

const FIRST = 0; // primeiro quadro do trecho calmo
const LAST = 62; // último quadro do trecho calmo
const FPS = 24;
const CYCLE = 7 * FPS; // um vai-e-volta completo em 7 s (pico ~1,15x a velocidade original)

// O original tem faixas pretas de ~5 px no topo e na base: recortamos (16:9 mantido)
// e voltamos para 1920x1080 (ampliação de ~1%, imperceptível).
const DESKTOP = { w: 1920, h: 1080, vf: "crop=1896:1066:12:6,scale=1920:1080:flags=lanczos", crf: 21 };
// Recorte vertical para o mobile (2:3), mãos inteiras + rosto, em resolução nativa
const MOBILE = { w: 720, h: 1080, vf: "crop=711:1066:780:6,scale=720:1080:flags=lanczos", crf: 24 };

async function build({ w, h, vf, crf }, file) {
  const size = w * h * 3;
  const raw = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", src, "-vf", `select='between(n\\,${FIRST}\\,${LAST})',${vf},format=rgb24`, "-fps_mode", "passthrough", "-f", "rawvideo", "-"],
    { maxBuffer: 2 ** 31 - 1 },
  );
  const frames = Array.from({ length: raw.length / size }, (_, i) => raw.subarray(i * size, (i + 1) * size));
  const span = frames.length - 1;

  const enc = spawn("ffmpeg", [
    "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${w}x${h}`, "-r", String(FPS), "-i", "-",
    "-an", "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-pix_fmt", "yuv420p", "-profile:v", "high",
    "-movflags", "+faststart", out(file),
  ], { stdio: ["pipe", "inherit", "inherit"] });

  const buf = Buffer.alloc(size);
  for (let k = 0; k < CYCLE; k++) {
    const p = (span / 2) * (1 - Math.cos((2 * Math.PI * k) / CYCLE)); // 0 → span → 0, velocidade zero nas pontas
    const i = Math.min(Math.floor(p), span - 1);
    const f = p - i;
    const a = frames[i], b = frames[i + 1];
    for (let j = 0; j < size; j++) buf[j] = a[j] + (b[j] - a[j]) * f + 0.5;
    if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once("drain", r));
  }
  enc.stdin.end();
  await new Promise((r, j) => enc.on("close", (c) => (c ? j(new Error(`ffmpeg saiu com ${c}`)) : r())));
}

const ffmpeg = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

await build(DESKTOP, "hero-loop.mp4");
await build(MOBILE, "hero-loop-mobile.mp4");

// Posters = primeiro quadro de cada laço
ffmpeg(["-i", out("hero-loop.mp4"), "-frames:v", "1", "-q:v", "3", out("hero-poster.jpg")]);
ffmpeg(["-i", out("hero-loop-mobile.mp4"), "-frames:v", "1", "-q:v", "3", out("hero-poster-mobile.jpg")]);

for (const f of ["hero-loop.mp4", "hero-loop-mobile.mp4", "hero-poster.jpg", "hero-poster-mobile.jpg"]) {
  console.log(`${f.padEnd(24)} ${(fs.statSync(out(f)).size / 1024).toFixed(0)} KB`);
}
console.log("Rode `npm run assets` em seguida para gerar os WebP e a imagem de compartilhamento.");
