import { useRef } from "react";
import { gsap, SplitText, useGSAP, EASE, buildOnApproach } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { SectionLabel } from "@/components/SectionLabel";

const FICHA = [
  ["Cargo", "Candidato a Deputado Federal · 1123"],
  ["Formação", "Pedagogia · Professor de Teologia"],
  ["Fé", "Pastor"],
  ["Família", "Casado, pai de 3 filhos"],
  ["Experiência", "Já foi Deputado Federal por MT"],
] as const;

/**
 * Quem é — uma timeline com scrub: a foto abre de baixo pra cima (com parallax),
 * o título sobe por linhas, os parágrafos "acendem" palavra por palavra
 * conforme a página desce, e a ficha entra no fim.
 */
export function QuemE() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(contextSafe!, () => {
        const mm = gsap.matchMedia();
        mm.add({ isDesktop: "(min-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
          const { isDesktop, motion } = ctx.conditions as { isDesktop: boolean; motion: boolean };
          if (!motion) return;
          const q = gsap.utils.selector(root);

          buildOnApproach(ctx, root.current, () => {
            const title = SplitText.create(q("[data-title]"), {
              type: "lines",
              mask: "lines",
              linesClass: "split-line",
              aria: "none",
            });
            const story = SplitText.create(q("[data-story] p"), { type: "words", aria: "none" });

            const tl = gsap.timeline({
              defaults: { ease: EASE.scrub },
              scrollTrigger: {
                trigger: root.current,
                start: "top 80%",
                end: isDesktop ? "bottom 85%" : "bottom 95%",
                scrub: 0.6,
              },
            });

            tl.fromTo(
              q("[data-photo]"),
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 18, ease: EASE.soft },
              0,
            )
              .fromTo(
                q("[data-label]"),
                { autoAlpha: 0, x: -16 },
                { autoAlpha: 1, x: 0, duration: 6, ease: EASE.soft },
                2,
              )
              .fromTo(title.lines, { yPercent: 130 }, { yPercent: 0, duration: 10, stagger: 2.5, ease: EASE.enter }, 4)
              .fromTo(story.words, { opacity: 0.15 }, { opacity: 1, duration: 1.5, stagger: 0.5 }, 16);

            const afterStory = Math.max(tl.duration(), 60);
            tl.fromTo(
              q("[data-ficha] > div"),
              { autoAlpha: 0, y: 18 },
              { autoAlpha: 1, y: 0, duration: 5, stagger: 1.6, ease: EASE.soft },
              afterStory - 4,
            ).fromTo(
              q("[data-ficha] [data-rule]"),
              { scaleX: 0 },
              { scaleX: 1, duration: 6, stagger: 1.6, ease: EASE.soft },
              afterStory - 4,
            );

            // Parallax da foto: acompanha a timeline inteira
            tl.fromTo(
              q("[data-photo] img"),
              { scale: 1.18, yPercent: -7 },
              { scale: 1.06, yPercent: 7, duration: tl.duration() },
              0,
            );

            return () => {
              title.revert();
              story.revert();
            };
          });
        });
      }),
    { scope: root },
  );

  return (
    <section id="quem-e" ref={root} aria-labelledby="quem-e-title" className="section-y bg-paper text-navy">
      <div className="container-site grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-[clamp(3rem,6vw,7rem)]">
        <div className="md:sticky md:top-[calc(var(--header-h)+2rem)] md:self-start">
          <div data-photo className="relative aspect-[4/5] overflow-hidden rounded-lg bg-navy md:aspect-[3/4]">
            <picture>
              <source
                srcSet="/site/quem-e-540.webp 540w, /site/quem-e.webp 1080w"
                sizes="(min-width: 768px) 42vw, 100vw"
                type="image/webp"
              />
              <img
                src="/site/quem-e.jpg"
                alt="Victório Galli"
                width={1080}
                height={1350}
                loading="lazy"
                decoding="async"
                className="size-full object-cover object-[55%_30%]"
              />
            </picture>
          </div>
        </div>

        <div>
          <SectionLabel data-label>Quem é</SectionLabel>
          <h2
            id="quem-e-title"
            data-title
            className="display mt-6 text-[clamp(2.9rem,12vw,4rem)] leading-[0.95] md:text-[clamp(3.75rem,6.4vw,6.5rem)]"
          >
            Acordava às{" "}
            <span className="box-decoration-clone bg-[linear-gradient(to_top,var(--color-yellow)_0,var(--color-yellow)_0.3em,transparent_0.3em)] px-[0.04em]">
              3 da manhã
            </span>
            .
          </h2>

          <div
            data-story
            className="mt-10 max-w-[38rem] space-y-6 text-[1.15rem] leading-[1.6] font-medium md:mt-12 md:text-[1.3rem]"
          >
            <p>
              Antes de Brasília, Victório estudava Pedagogia à noite. De dia, era vendedor ambulante: ele mesmo fazia os
              doces (cocada, coco mel, pudim, quebra-queixo) e vendia pros caminhoneiros que faziam fila de madrugada
              perto do Posto Zero.
            </p>
            <p>
              Recém-casado, levantava todos os dias às 3 da manhã com a esposa pra preparar tudo. Foi assim por cerca de
              três anos.
            </p>
            <p>
              Hoje é pastor, professor de Teologia, casado e pai de 3 filhos. E já foi Deputado Federal por Mato Grosso.
            </p>
          </div>

          <dl data-ficha className="mt-12 max-w-[38rem] md:mt-16">
            {FICHA.map(([term, value]) => (
              <div key={term} className="relative grid gap-1 py-4 sm:grid-cols-[9.5rem_1fr] sm:gap-6">
                <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-navy/20" />
                <dt className="eyebrow pt-0.5 text-navy/70">{term}</dt>
                <dd className="font-display text-lg font-bold leading-snug">{value}</dd>
              </div>
            ))}
            <span aria-hidden className="block h-px bg-navy/20" />
          </dl>
        </div>
      </div>
    </section>
  );
}
