import { useRef } from "react";
import { gsap, SplitText, useGSAP, EASE } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { Urna, type UrnaHandle } from "@/components/Urna";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/BrandIcon";
import { AnchorLink, ExternalLink } from "@/components/links";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/config/site";
import { analytics } from "@/lib/analytics";

/**
 * Hero: vídeo em loop (toca sozinho) + textos controlados pelo scroll.
 * Uma única timeline com scrub, em unidades de 0 a 100 (= % do scroll pinado):
 *   0–25 etapa 1 · 25–50 etapa 2 · 50–75 etapa 3 · 75–100 bloco final.
 * O vídeo inteiro faz zoom 1 → 1.08 e o gradiente escurece conforme avança.
 */
/** Executa `fn` depois do First Contentful Paint (com fallback). Devolve um cancelamento. */
function afterFirstPaint(fn: () => void) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    observer?.disconnect();
    window.clearTimeout(fallback);
    fn();
  };
  const fallback = window.setTimeout(run, 2500);
  let observer: PerformanceObserver | undefined;
  if (performance.getEntriesByName("first-contentful-paint").length) {
    window.setTimeout(run, 0);
  } else if ("PerformanceObserver" in window) {
    observer = new PerformanceObserver(() => window.setTimeout(run, 0));
    try {
      observer.observe({ type: "paint", buffered: true });
    } catch {
      /* navegador sem suporte: fica o fallback */
    }
  }
  return () => {
    done = true;
    observer?.disconnect();
    window.clearTimeout(fallback);
  };
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const urna = useRef<UrnaHandle>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(contextSafe!, () => {
        const mm = gsap.matchMedia();

        mm.add(
          {
            isDesktop: "(min-width: 768px)",
            isMobile: "(max-width: 767px)",
            reduce: "(prefers-reduced-motion: reduce)",
          },
          (ctx) => {
            const { reduce, isMobile } = ctx.conditions as { reduce: boolean; isMobile: boolean };

            // Reduced motion: sem pin, sem zoom, vídeo parado no poster, bloco final completo (via CSS).
            if (reduce) return;

            // O vídeo toca sozinho (não depende do scroll). A fonte só entra depois da primeira
            // pintura (poster + nome); o vídeo aparece por cima com fade quando começa a tocar.
            const v = video.current;
            const src = isMobile ? "/hero/hero-loop-mobile.mp4" : "/hero/hero-loop.mp4";
            const startVideo = () => {
              if (!v) return;
              if (!v.src.endsWith(src)) v.src = src;
              v.play().catch(() => {});
            };
            const cancelStart = afterFirstPaint(startVideo);

            const q = gsap.utils.selector(root);
            const [stage1, stage2, stage3, final] = ["1", "2", "3", "final"].map((s) => q(`[data-stage="${s}"]`)[0]);

            const nameSplit = SplitText.create(q("[data-final-name]"), {
              type: "chars",
              mask: "chars",
              charsClass: "split-char",
              aria: "none",
            });
            const sloganSplit = SplitText.create(q("[data-final-slogan]"), { type: "words", aria: "none" });
            const accentWord = q("[data-final-slogan] [data-last]")[0];
            const lastWords = sloganSplit.words.filter((w) => accentWord.contains(w) || w.textContent?.trim() === ".");
            const firstWords = sloganSplit.words.filter((w) => !lastWords.includes(w));

            const tl = gsap.timeline({
              defaults: { ease: EASE.scrub },
              scrollTrigger: {
                trigger: root.current,
                // Pin nativo (position: sticky): a trilha tem 350svh no desktop e 280svh no
                // mobile (CSS .hero-track), ou seja, ~250vh / ~180vh de scroll preso.
                start: "top top",
                end: "bottom bottom",
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            });

            const inFrom = { autoAlpha: 0, y: 28 };
            const inTo = { autoAlpha: 1, y: 0, duration: 6, ease: EASE.soft };
            const out = { autoAlpha: 0, y: -28, duration: 6, ease: EASE.exit };

            // Vídeo e legibilidade — correm o scroll inteiro
            tl.fromTo(q("[data-media]"), { scale: 1 }, { scale: 1.08, duration: 100 }, 0)
              .fromTo(q(".hero-shade"), { opacity: 0.3 }, { opacity: 0.5, duration: 6 }, 20)
              .to(q(".hero-shade"), { opacity: 0.7, duration: 6 }, 70)
              .to(q(".hero-scroll-hint"), { autoAlpha: 0, y: 12, duration: 5 }, 3);

            // Etapas: cada uma sai antes da próxima entrar
            tl.to(stage1, out, 18)
              .fromTo(stage2, inFrom, inTo, 26)
              .to(stage2, out, 43)
              .fromTo(stage3, inFrom, inTo, 51)
              .to(stage3, out, 68);

            // Bloco final: tudo assentado em ~94%, o resto do pin é respiro antes de soltar
            tl.set(final, { autoAlpha: 1 }, 75)
              .fromTo(
                q("[data-final-eyebrow]"),
                { autoAlpha: 0, x: -24 },
                { autoAlpha: 1, x: 0, duration: 3, ease: EASE.soft },
                75.5,
              )
              .fromTo(
                nameSplit.chars,
                { yPercent: 150 },
                { yPercent: 0, duration: 4.5, stagger: 0.22, ease: EASE.enter },
                76,
              )
              .fromTo(q("[data-final-cred]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.5, ease: EASE.soft }, 81.5)
              .fromTo(
                firstWords,
                { autoAlpha: 0, filter: "blur(8px)", y: 8 },
                { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 3, stagger: 0.4, ease: EASE.soft },
                83,
              )
              .fromTo(
                lastWords,
                { autoAlpha: 0, filter: "blur(8px)", y: 8 },
                { autoAlpha: 1, filter: "blur(0px)", y: 0, duration: 3, ease: EASE.soft },
                86.5,
              )
              .fromTo(
                q("[data-final-urna-label], [data-final-urna]"),
                { autoAlpha: 0, y: 10 },
                { autoAlpha: 1, y: 0, duration: 2, stagger: 0.4, ease: EASE.soft },
                87.5,
              )
              .fromTo(
                q("[data-final-avatar]"),
                { autoAlpha: 0, scale: 0.9 },
                { autoAlpha: 1, scale: 1, duration: 3, ease: EASE.soft },
                87.5,
              );

            const roll = urna.current?.roll();
            if (roll) tl.add(roll.paused(false).duration(5), 88);

            tl.fromTo(
              q("[data-final-tail]"),
              { autoAlpha: 0, y: 16 },
              { autoAlpha: 1, y: 0, duration: 2.5, stagger: 0.6, ease: EASE.soft },
              90.5,
            ).set({}, {}, 100);

            return () => {
              cancelStart();
              nameSplit.revert();
              sloganSplit.revert();
            };
          },
        );

        const v = video.current;
        if (v && !v.paused && v.readyState >= 3) v.classList.add("is-playing");

        // Mantém o vídeo tocando se o navegador pausar ao voltar para a aba
        const resume = contextSafe!(() => {
          const v = video.current;
          if (v && document.visibilityState === "visible" && v.paused && v.hasAttribute("autoplay")) {
            v.play().catch(() => {});
          }
        });
        document.addEventListener("visibilitychange", resume);
        return () => document.removeEventListener("visibilitychange", resume);
      }),
    { scope: root },
  );

  return (
    <section id="inicio" ref={root} aria-labelledby="hero-title" className="hero-track relative bg-navy text-white">
      <div className="sticky top-0 h-svh min-h-[34rem] overflow-hidden">
        <h1 id="hero-title" className="sr-only">
          Victório Galli – Deputado Federal 1123
        </h1>

        {/* Vídeo: autoplay/loop independente do scroll; o scroll só aplica o zoom.
          No mobile ele ocupa a parte de baixo, deixando o topo livre para o texto. */}
        <div
          data-media
          className="absolute inset-x-0 bottom-0 top-[30%] origin-[70%_40%] will-change-transform md:top-0"
        >
          {/* Poster real (LCP): aparece de imediato; o vídeo entra por cima quando começa a tocar */}
          <picture>
            <source srcSet="/hero/hero-poster-960.webp" media="(max-width: 767px)" type="image/webp" />
            <img
              src="/hero/hero-poster.webp"
              alt=""
              width={1920}
              height={1080}
              fetchPriority="high"
              className="absolute inset-0 size-full object-cover object-[70%_center] md:object-center"
            />
          </picture>
          <video
            ref={video}
            data-hero-video
            onPlaying={(e) => e.currentTarget.classList.add("is-playing")}
            className="relative size-full object-cover object-[70%_center] transition-opacity duration-500 md:object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero/hero-poster-960.webp"
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
          ></video>
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-2/5 bg-[linear-gradient(to_bottom,#011b72,transparent)] md:hidden"
          />
        </div>

        {/* Gradiente de legibilidade: esquerda→direita no desktop, cima→baixo no mobile */}
        <div
          aria-hidden="true"
          className="hero-shade pointer-events-none absolute inset-0 opacity-30 [background:linear-gradient(to_bottom,#011b72_0%,#011b72_38%,rgb(1_27_114/0.55)_62%,transparent_85%)] md:[background:linear-gradient(to_right,#011b72_0%,#011b72_22%,rgb(1_27_114/0.6)_40%,transparent_55%)]"
        />
        {/* Base fixa do gradiente para garantir AA desde o primeiro frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background:linear-gradient(to_bottom,rgb(1_27_114/0.55),transparent_45%)] md:[background:linear-gradient(to_right,rgb(1_27_114/0.5),transparent_45%)]"
        />

        <div className="hero-content container-site relative flex h-full items-start pt-[max(4.5rem,9svh)] md:items-center md:pt-0">
          <div className="grid w-full md:w-[48%] lg:w-[45%] [&>*]:[grid-area:1/1]">
            {/* Etapa 1 */}
            <div data-stage="1" className="hero-stage self-start md:self-center">
              <p className="eyebrow flex items-center gap-2.5 text-white/90">
                <span aria-hidden className="size-2 bg-yellow" />
                Deputado Federal · Mato Grosso
              </p>
              <p className="display mt-5 text-[clamp(3rem,13vw,4.5rem)] md:text-[clamp(4rem,min(8vw,13svh),8rem)]">
                VICTÓRIO
                <br />
                GALLI
              </p>
              <p className="display mt-3 text-[clamp(3.25rem,15vw,5rem)] text-yellow md:text-[clamp(4.5rem,min(9vw,14svh),9rem)]">
                1123
              </p>
            </div>

            {/* Etapa 2 */}
            <div data-stage="2" className="hero-stage self-start md:self-center">
              <p className="display text-[clamp(2.4rem,10.5vw,3.5rem)] leading-[0.98] md:text-[clamp(3rem,min(5.6vw,10svh),5.75rem)]">
                Já foi Deputado Federal.
              </p>
              <p className="mt-6 max-w-[26ch] text-lg font-medium text-white/90 md:text-2xl">
                Conhece Brasília e os ministérios.
              </p>
            </div>

            {/* Etapa 3 */}
            <div data-stage="3" className="hero-stage self-start md:self-center">
              <p className="display text-[clamp(2.1rem,9.2vw,3.25rem)] leading-[1] md:text-[clamp(2.75rem,min(4.8vw,9svh),5.25rem)]">
                Mais de <span className="text-yellow">R$ 100 milhões</span> destinados às cidades de Mato Grosso.
              </p>
            </div>

            {/* Bloco final */}
            <div data-stage="final" className="hero-stage self-start pb-10 md:self-center md:pb-0">
              <p data-final-eyebrow className="eyebrow flex items-center gap-2.5 text-white/90">
                <span aria-hidden className="size-2 bg-yellow" />
                Deputado Federal · Progressistas
              </p>

              <div data-final-name className="mt-3 md:mt-5">
                <p className="font-display text-lg font-extrabold tracking-[-0.01em] text-white/90 md:text-2xl">
                  Professor
                </p>
                <p className="display mt-1 text-[clamp(2.5rem,11vw,3.75rem)] md:text-[clamp(3.25rem,min(6.6vw,11svh),7rem)]">
                  VICTÓRIO
                  <br />
                  GALLI
                </p>
              </div>

              <p
                data-final-cred
                className="mt-3 max-w-[42ch] text-[0.95rem] font-medium leading-snug text-white/90 md:mt-5 md:text-lg"
              >
                Pastor e professor de Teologia · Casado e pai de 3 filhos
              </p>

              <p
                data-final-slogan
                className="mt-3 max-w-[18ch] font-display text-[1.6rem] font-extrabold leading-[1.08] tracking-[-0.02em] md:mt-5 md:text-[clamp(1.75rem,min(2.7vw,5svh),2.75rem)]"
              >
                <span className="accent text-[1.08em]">Vote</span> em quem já conhece o{" "}
                <span data-last className="text-yellow">
                  caminho
                </span>
                .
              </p>

              <div className="mt-5 flex items-end gap-4 md:mt-[min(2rem,3.5svh)]">
                <img
                  data-final-avatar
                  src="/hero/galli-avatar.webp"
                  alt=""
                  width={96}
                  height={96}
                  loading="lazy"
                  decoding="async"
                  className="size-[4.75rem] shrink-0 rounded-md object-cover ring-2 ring-yellow md:hidden"
                />
                <div>
                  <p data-final-urna-label className="accent mb-1.5 text-xl leading-none md:text-2xl">
                    Para apertar
                  </p>
                  <div data-final-urna>
                    <Urna ref={urna} size="md" trigger="manual" />
                  </div>
                </div>
              </div>

              <p data-final-tail className="mt-4 text-sm font-semibold tracking-wide text-white/85 md:mt-5">
                Um abraço federal
              </p>

              <div
                data-final-tail
                className="mt-5 flex flex-col items-stretch gap-4 md:mt-6 md:flex-row md:items-center md:gap-7"
              >
                <Button asChild size="lg" className="w-full md:w-auto">
                  <AnchorLink to="trabalho">Conheça o trabalho</AnchorLink>
                </Button>
                <Button asChild variant="link" size="link" className="self-center text-white md:self-auto">
                  <ExternalLink href={INSTAGRAM_URL} onClick={() => analytics.instagram("hero")}>
                    <BrandIcon name="instagram" className="size-[1.1rem]" />
                    Seguir {INSTAGRAM_HANDLE}
                  </ExternalLink>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de scroll (etapa 1) */}
        <div
          aria-hidden="true"
          className="hero-scroll-hint pointer-events-none absolute bottom-12 left-[var(--gutter)] flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 md:bottom-14"
        >
          <span className="relative block h-9 w-px overflow-hidden bg-white/25">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-hint_1.8s_var(--ease-out-quart)_infinite] bg-yellow" />
          </span>
          role para baixo
        </div>

        <p className="absolute inset-x-0 bottom-3 px-[var(--gutter)] text-[0.7rem] leading-tight text-white/80 md:bottom-4 md:text-right md:text-xs">
          Conteúdo produzido com auxílio de inteligência artificial.
        </p>
      </div>
    </section>
  );
}
