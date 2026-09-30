import { useRef } from "react";
import { gsap, SplitText, useGSAP, EASE, buildOnApproach } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { CONTACT_URL, HAS_WHATSAPP, INSTAGRAM_HANDLE, INSTAGRAM_URL, SHARE_URL } from "@/config/site";
import { analytics } from "@/lib/analytics";
import { Urna, type UrnaHandle } from "@/components/Urna";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/BrandIcon";
import { ExternalLink } from "@/components/links";
import { QrCode } from "@/components/QrCode";
import { Countdown } from "@/components/Countdown";

/**
 * Vote — fecha o ciclo com o vídeo da hero ao fundo (só no desktop; no mobile,
 * o poster). Uma timeline na entrada: título por linhas, urna rolando,
 * "Galo, Galo, Galo" com bounce e os botões por último.
 */
export function Vote() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const urna = useRef<UrnaHandle>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(contextSafe!, () => {
        const mm = gsap.matchMedia();

        // Vídeo de fundo: só carrega no desktop com movimento, e só toca quando visível
        mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
          const v = video.current;
          if (!v) return;
          const io = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                if (!v.src) {
                  v.src = "/hero/hero-loop.mp4";
                  v.load();
                }
                v.play().catch(() => {});
              } else {
                v.pause();
              }
            },
            { rootMargin: "200px 0px" },
          );
          io.observe(v);
          return () => {
            io.disconnect();
            v.pause();
          };
        });

        mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
          buildOnApproach(ctx, root.current, () => {
            const q = gsap.utils.selector(root);
            const title = SplitText.create(q("[data-title]"), {
              type: "lines",
              mask: "lines",
              linesClass: "split-line",
              aria: "none",
            });

            const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 65%", once: true } });

            tl.fromTo(
              q("[data-countdown]"),
              { autoAlpha: 0, y: -12 },
              { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE.soft },
              0,
            )
              .fromTo(
                title.lines,
                { yPercent: 130 },
                { yPercent: 0, duration: 1.1, stagger: 0.14, ease: EASE.enter },
                0.1,
              )
              .fromTo(
                q("[data-urna-label]"),
                { autoAlpha: 0, y: 12 },
                { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE.soft },
                0.6,
              );

            const roll = urna.current?.roll();
            if (roll) tl.add(roll.paused(false), 0.7);

            // "e confirme" fecha a frase assim que os números param
            tl.fromTo(
              q("[data-urna-confirm]"),
              { autoAlpha: 0, y: -10 },
              { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE.soft },
              1.65,
            );

            tl.fromTo(q("[data-kicker-plain]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.25 }, 1.9)
              .fromTo(
                q("[data-galo]"),
                { autoAlpha: 0, y: 26, scale: 0.6 },
                { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.13, ease: "back.out(3)" },
                2.05,
              )
              .fromTo(
                q("[data-tail]"),
                { autoAlpha: 0, y: 18 },
                { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: EASE.soft },
                2.6,
              );

            return () => title.revert();
          });
        });
      }),
    { scope: root },
  );

  return (
    <section
      id="vote"
      ref={root}
      aria-labelledby="vote-title"
      className="relative isolate overflow-hidden bg-navy py-[clamp(5rem,12vw,9rem)] text-white"
    >
      {/* Fundo: poster (mobile) + vídeo da hero (desktop) + gradiente navy forte */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <picture>
          <source srcSet="/hero/hero-poster-mobile.webp" media="(max-width: 767px)" type="image/webp" />
          <source srcSet="/hero/hero-poster.webp" type="image/webp" />
          <img
            src="/hero/hero-poster.jpg"
            alt=""
            width={1920}
            height={1080}
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-center md:object-[70%_center]"
          />
        </picture>
        <video
          ref={video}
          className="absolute inset-0 hidden size-full object-cover md:block"
          muted
          loop
          playsInline
          preload="none"
          poster="/hero/hero-poster.webp"
          tabIndex={-1}
          disablePictureInPicture
        />
        <div className="absolute inset-0 bg-navy/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(1_27_114/0.6)_75%)]" />
      </div>

      <div className="container-site flex flex-col items-center text-center">
        <div data-countdown>
          <Countdown className="eyebrow mb-8 rounded-pill border border-yellow/60 px-4 py-2 text-yellow" />
        </div>

        <h2
          id="vote-title"
          data-title
          className="display max-w-[13ch] text-[clamp(2.6rem,11vw,3.75rem)] leading-[0.98] md:text-[clamp(3.5rem,6.4vw,6.5rem)]"
        >
          <span className="accent text-[1.06em]">Vote</span> em quem já conhece o{" "}
          <span className="text-yellow">caminho</span>.
        </h2>

        <div className="mt-12 flex flex-col items-center md:mt-16">
          <p data-urna-label className="accent mb-3 text-[1.75rem] leading-none md:text-[2.25rem]">
            Digite
          </p>
          <Urna ref={urna} size="lg" trigger="manual" />
          <p data-urna-confirm className="accent mt-3 text-[1.75rem] leading-none md:text-[2.25rem]">
            e confirme
          </p>
        </div>

        <p className="mt-10 font-display text-[1.35rem] font-extrabold leading-snug tracking-[-0.01em] md:text-[1.9rem]">
          <span data-kicker-plain>É </span>
          <span data-galo className="inline-block text-yellow">
            Galo,
          </span>{" "}
          <span data-galo className="inline-block text-yellow">
            Galo,
          </span>{" "}
          <span data-galo className="inline-block text-yellow">
            Galo,
          </span>{" "}
          <span data-kicker-plain>é onze e vinte e três.</span>
        </p>

        <p data-tail className="mt-6 max-w-[34ch] text-lg leading-relaxed text-white/90 md:text-xl">
          Guarde o número e compartilhe com quem também quer experiência em Brasília.
        </p>

        <div
          data-tail
          className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
        >
          <Button asChild size="lg">
            <ExternalLink href={SHARE_URL} onClick={() => analytics.share("vote")}>
              <BrandIcon name="whatsapp" />
              Compartilhar no WhatsApp
            </ExternalLink>
          </Button>
          <Button asChild variant="onDark" size="lg">
            <ExternalLink href={INSTAGRAM_URL} onClick={() => analytics.instagram("vote")}>
              <BrandIcon name="instagram" />
              Seguir {INSTAGRAM_HANDLE}
            </ExternalLink>
          </Button>
        </div>

        {HAS_WHATSAPP && (
          <ExternalLink
            data-tail
            href={CONTACT_URL}
            onClick={() => analytics.contact("vote")}
            className="mt-6 font-display font-bold underline decoration-yellow decoration-2 underline-offset-[6px] hover:decoration-4"
          >
            Fale com a campanha
          </ExternalLink>
        )}

        <figure data-tail className="mt-14 hidden flex-col items-center gap-3 md:flex">
          <QrCode title={`QR code para o Instagram ${INSTAGRAM_HANDLE}`} className="size-32 rounded-md" />
          <figcaption className="text-sm font-semibold text-white/85">Escaneie e siga</figcaption>
        </figure>

        <p
          data-tail
          className="mt-14 font-display text-xl font-extrabold tracking-[-0.01em] text-white md:mt-12 md:text-2xl"
        >
          Um abraço federal.
        </p>
      </div>
    </section>
  );
}
