import { useRef } from "react";
import { gsap, SplitText, useGSAP, EASE, buildOnApproach } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { CAMPAIGN_VIDEOS, INSTAGRAM_URL, reelHref } from "@/config/site";
import { analytics } from "@/lib/analytics";
import { SectionLabel } from "@/components/SectionLabel";
import { BrandIcon } from "@/components/BrandIcon";
import { ExternalLink } from "@/components/links";

const TOTAL = String(CAMPAIGN_VIDEOS.length).padStart(2, "0");

function PlayIcon() {
  return (
    <span
      data-play
      aria-hidden
      className="absolute bottom-4 left-4 grid size-14 place-items-center rounded-pill bg-yellow text-navy shadow-[0_10px_30px_rgb(1_27_114/0.45)] transition-transform duration-500 ease-out-expo group-hover:scale-110 group-focus-visible:scale-110"
    >
      <svg viewBox="0 0 24 24" className="ml-0.5 size-5 fill-current">
        <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
      </svg>
    </span>
  );
}

/**
 * Campanha — desktop: o scroll vertical move os cards na horizontal (seção pinada,
 * tween linear usado como containerAnimation para as entradas de cada card).
 * Mobile / reduced motion: carrossel nativo com scroll-snap.
 */
export function Campanha() {
  const root = useRef<HTMLElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  const setIndex = (i: number, progress: number) => {
    if (counter.current) counter.current.textContent = String(i + 1).padStart(2, "0");
    if (bar.current) bar.current.style.transform = `scaleX(${Math.max(0.2, progress)})`;
  };

  useGSAP(
    (_, contextSafe) =>
      deferSetup(contextSafe!, () => {
        const q = gsap.utils.selector(root);
        const row = q<HTMLElement>("[data-row]")[0];
        const cards = q<HTMLElement>("[data-card]");
        const mm = gsap.matchMedia();

        // Contador no carrossel nativo
        const onRowScroll = contextSafe!(() => {
          if (!row || !cards.length) return;
          const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
          const max = row.scrollWidth - row.clientWidth;
          const i = Math.min(cards.length - 1, Math.round(row.scrollLeft / step));
          setIndex(i, max > 0 ? row.scrollLeft / max : 1);
        });
        row.addEventListener("scroll", onRowScroll, { passive: true });
        setIndex(0, 0);

        mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
          buildOnApproach(ctx, root.current, () => {
            const title = SplitText.create(q("[data-title]"), {
              type: "lines",
              mask: "lines",
              linesClass: "split-line",
              aria: "none",
            });
            gsap
              .timeline({ scrollTrigger: { trigger: root.current, start: "top 70%", once: true } })
              .fromTo(
                q("[data-label]"),
                { autoAlpha: 0, x: -16 },
                { autoAlpha: 1, x: 0, duration: 0.6, ease: EASE.soft },
                0,
              )
              .fromTo(
                title.lines,
                { yPercent: 130 },
                { yPercent: 0, duration: 1, stagger: 0.12, ease: EASE.enter },
                0.1,
              )
              .fromTo(
                q("[data-intro-tail]"),
                { autoAlpha: 0, y: 16 },
                { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: EASE.soft },
                0.5,
              )
              .fromTo(
                cards,
                { autoAlpha: 0, y: 40 },
                { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: EASE.enter },
                0.4,
              );
            return () => title.revert();
          });
        });

        mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
          const track = q<HTMLElement>("[data-track]")[0];
          root.current!.classList.add("is-pinned");
          const distance = () => track.scrollWidth - window.innerWidth;

          const move = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => "+=" + distance(),
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                setIndex(Math.min(cards.length - 1, Math.floor(self.progress * cards.length * 0.999)), self.progress);
              },
            },
          });

          // Cada card ganha vida ao cruzar a tela (containerAnimation)
          cards.forEach((card) => {
            gsap.fromTo(
              card.querySelector("[data-thumb]"),
              { rotate: 2.5, scale: 0.92 },
              {
                rotate: 0,
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: move,
                  start: "left right",
                  end: "left 55%",
                  scrub: true,
                },
              },
            );
          });

          return () => root.current?.classList.remove("is-pinned");
        });

        return () => row.removeEventListener("scroll", onRowScroll);
      }),
    { scope: root },
  );

  return (
    <section
      id="campanha"
      ref={root}
      aria-labelledby="campanha-title"
      className="group/section relative overflow-hidden bg-navy py-[var(--section-y)] text-white [&.is-pinned]:flex [&.is-pinned]:h-svh [&.is-pinned]:flex-col [&.is-pinned]:justify-center [&.is-pinned]:py-0"
    >
      <div className="group-[.is-pinned]/section:overflow-visible">
        <div
          data-track
          className="flex w-full flex-col will-change-transform group-[.is-pinned]/section:w-max group-[.is-pinned]/section:flex-row group-[.is-pinned]/section:items-start group-[.is-pinned]/section:gap-[clamp(1rem,2.2vw,2rem)] group-[.is-pinned]/section:px-[var(--gutter)]"
        >
          {/* Introdução: no desktop é o primeiro "painel" da faixa */}
          <div className="container-site shrink-0 group-[.is-pinned]/section:w-[min(34vw,30rem)] group-[.is-pinned]/section:self-center group-[.is-pinned]/section:px-0 group-[.is-pinned]/section:pr-8">
            <SectionLabel data-label className="text-white">
              Na campanha
            </SectionLabel>
            <h2
              id="campanha-title"
              data-title
              className="display mt-6 text-[clamp(2.75rem,11vw,3.75rem)] leading-[0.96] md:text-[clamp(2.75rem,3.9vw,4.25rem)]"
            >
              Assista e compartilhe.
            </h2>
            <ExternalLink
              data-intro-tail
              href={INSTAGRAM_URL}
              onClick={() => analytics.instagram("campanha")}
              className="mt-8 inline-flex items-center gap-2.5 font-display font-bold underline decoration-yellow decoration-2 underline-offset-[6px] hover:decoration-4"
            >
              <BrandIcon name="instagram" className="size-[1.1rem]" />
              Ver mais no Instagram
            </ExternalLink>
          </div>

          <ul
            data-row
            className="snap-row mt-10 flex gap-[clamp(1rem,2.2vw,2rem)] overflow-x-auto overscroll-x-contain scroll-px-[var(--gutter)] px-[var(--gutter)] group-[.is-pinned]/section:mt-0 group-[.is-pinned]/section:overflow-visible group-[.is-pinned]/section:px-0"
          >
            {CAMPAIGN_VIDEOS.map((v, i) => (
              <li
                key={v.id}
                data-card
                className="w-[72vw] max-w-[17rem] shrink-0 snap-start group-[.is-pinned]/section:w-[calc(min(64svh,38rem)*9/16)] group-[.is-pinned]/section:max-w-none"
              >
                <ExternalLink href={reelHref(v.url)} onClick={() => analytics.video(v.id)} className="group block">
                  <div data-thumb className="relative aspect-[9/16] overflow-hidden rounded-lg bg-royal">
                    <picture>
                      <source srcSet={`${v.thumb}.webp`} type="image/webp" />
                      <img
                        src={`${v.thumb}.jpg`}
                        alt=""
                        width={720}
                        height={1280}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
                      />
                    </picture>
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgb(1_27_114/0.7),transparent)]"
                    />
                    <span
                      aria-hidden
                      className="absolute right-4 top-4 font-display text-sm font-extrabold tabular text-white/90"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <PlayIcon />
                  </div>
                  <p className="mt-4 font-display text-lg font-extrabold leading-snug md:text-xl">{v.title}</p>
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contador + progresso */}
      <div
        data-intro-tail
        className="container-site mt-8 flex items-center gap-4 font-display text-sm font-extrabold tabular text-white/85 group-[.is-pinned]/section:absolute group-[.is-pinned]/section:inset-x-0 group-[.is-pinned]/section:bottom-8 group-[.is-pinned]/section:mt-0"
      >
        <span aria-hidden>
          <span ref={counter} className="text-yellow">
            01
          </span>{" "}
          / {TOTAL}
        </span>
        <span aria-hidden className="relative h-0.5 w-24 overflow-hidden bg-white/20">
          <span ref={bar} className="absolute inset-0 origin-left scale-x-[0.2] bg-yellow" />
        </span>
      </div>
    </section>
  );
}
