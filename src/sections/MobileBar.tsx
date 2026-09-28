import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { SHARE_URL } from "@/config/site";
import { analytics } from "@/lib/analytics";
import { Urna } from "@/components/Urna";
import { BrandIcon } from "@/components/BrandIcon";
import { ExternalLink } from "@/components/links";

/**
 * Barra fixa (mobile): aparece depois da hero, some com #vote na tela,
 * esconde ao rolar pra baixo e volta ao rolar pra cima.
 */
export function MobileBar() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(contextSafe!, () => {
        const state = { afterHero: false, inVote: false, goingUp: true };
        let shown: boolean | null = null;

        const render = () => {
          const visible = state.afterHero && !state.inVote && state.goingUp;
          if (visible === shown) return;
          shown = visible;
          root.current?.toggleAttribute("inert", !visible);
          gsap.to(root.current, {
            y: 0,
            yPercent: visible ? 0 : 130,
            duration: prefersReducedMotion() ? 0 : visible ? 0.5 : 0.35,
            ease: visible ? EASE.enter : EASE.exit,
            overwrite: true,
          });
        };

        ScrollTrigger.create({
          refreshPriority: -1,
          trigger: document.getElementById("quem-e"),
          start: "top bottom-=2",
          onToggle: (self) => {
            state.afterHero = self.isActive || self.progress === 1;
            render();
          },
          end: "max",
        });
        ScrollTrigger.create({
          refreshPriority: -1,
          trigger: document.getElementById("vote"),
          start: "top bottom",
          end: "max",
          onToggle: (self) => {
            state.inVote = self.isActive;
            render();
          },
        });
        ScrollTrigger.create({
          refreshPriority: -1,
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const up = self.direction === -1;
            if (up !== state.goingUp && Math.abs(self.getVelocity()) > 40) {
              state.goingUp = up;
              render();
            }
          },
        });
        render();
      }),
    { scope: root },
  );

  return (
    <div
      ref={root}
      inert
      className="fixed inset-x-0 bottom-0 z-40 translate-y-[130%] border-t border-white/12 bg-navy/92 px-4 pb-[calc(0.75rem+var(--safe-bottom))] pt-3 text-white backdrop-blur-md md:hidden"
    >
      <div className="flex items-center justify-between gap-4">
        <Urna size="sm" trigger="manual" />
        <ExternalLink
          href={SHARE_URL}
          onClick={() => analytics.share("barra_mobile")}
          className="inline-flex h-12 items-center gap-2.5 rounded-pill bg-yellow px-6 font-display text-[0.95rem] font-extrabold text-navy active:scale-[0.98]"
        >
          <BrandIcon name="whatsapp" />
          Compartilhar
        </ExternalLink>
      </div>
    </div>
  );
}
