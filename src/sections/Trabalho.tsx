import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, EASE, buildOnApproach } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { SectionLabel } from "@/components/SectionLabel";
import { cn } from "@/lib/utils";

type Item = {
  prefix?: string;
  value: number;
  decimals: number;
  area: string;
  detail?: string;
};

/** Valores exatamente como divulgados pela campanha. */
const ITEMS: Item[] = [
  { prefix: "Mais de", value: 100, decimals: 0, area: "Para as cidades de Mato Grosso" },
  { value: 50, decimals: 0, area: "Para a saúde" },
  {
    prefix: "Quase",
    value: 14,
    decimals: 0,
    area: "Para infraestrutura",
    detail: "Asfalto, desenvolvimento urbano e reformas",
  },
  {
    prefix: "Mais de",
    value: 7,
    decimals: 0,
    area: "Para a educação",
    detail: "Creches, ônibus escolares e apoio à educação",
  },
  {
    prefix: "Mais de",
    value: 5.4,
    decimals: 1,
    area: "Para a agricultura familiar",
    detail: "Tratores, máquinas e equipamentos para quem produz",
  },
];

const format = (v: number, decimals: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function Amount({ item, featured = false }: { item: Item; featured?: boolean }) {
  const final = format(item.value, item.decimals);
  return (
    <p className="font-display font-black leading-none tracking-[-0.03em] text-yellow">
      {item.prefix && (
        <span
          className={cn(
            "mb-2 block font-extrabold tracking-[-0.01em] text-white",
            featured ? "text-[clamp(1.4rem,3vw,2.25rem)]" : "text-xl md:text-2xl",
          )}
        >
          {item.prefix}
        </span>
      )}
      <span className="flex flex-wrap items-baseline gap-x-2 md:gap-x-3">
        <span className={featured ? "text-[clamp(2rem,5vw,4.5rem)]" : "text-[clamp(1.6rem,3vw,2.4rem)]"}>R$</span>
        {/* O valor final reserva a largura; o contador corre por cima sem empurrar o layout */}
        <span
          className={cn(
            "tabular inline-grid [&>*]:[grid-area:1/1]",
            featured
              ? "text-[clamp(7rem,27vw,21rem)] leading-[0.82]"
              : "text-[clamp(4.25rem,9vw,7.5rem)] leading-[0.85]",
          )}
        >
          <span aria-hidden className="invisible">
            {final}
          </span>
          <span data-count={item.value} data-decimals={item.decimals}>
            {final}
          </span>
        </span>
        <span className={featured ? "text-[clamp(2rem,5vw,4.5rem)]" : "text-[clamp(1.6rem,3vw,2.4rem)]"}>milhões</span>
      </span>
      <span data-line aria-hidden className="mt-4 block h-[3px] w-full max-w-[min(100%,28rem)] origin-left bg-yellow" />
    </p>
  );
}

/**
 * Trabalho — uma timeline pausada com um marcador por item. Cada item, ao
 * entrar na tela, avança o playhead até o seu marcador: o número conta de 0
 * até o valor (uma vez só) e a linha amarela se desenha quando ele para.
 */
export function Trabalho() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) =>
      deferSetup(contextSafe!, () => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", (ctx) => {
          buildOnApproach(ctx, root.current, () => {
            const q = gsap.utils.selector(root);
            const title = SplitText.create(q("[data-title]"), {
              type: "lines",
              mask: "lines",
              linesClass: "split-line",
              aria: "none",
            });
            const items = q<HTMLElement>("[data-item]");
            const tl = gsap.timeline({ paused: true });

            tl.fromTo(
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
              .addLabel("head", 0.5);

            items.forEach((item, i) => {
              const counter = item.querySelector<HTMLElement>("[data-count]")!;
              const value = Number(counter.dataset.count);
              const decimals = Number(counter.dataset.decimals);
              const proxy = { v: 0 };
              counter.textContent = format(0, decimals);

              const at = i === 0 ? "head" : `item${i - 1}-=1.1`;
              const sub = gsap
                .timeline()
                .fromTo(
                  item.querySelectorAll("[data-fade]"),
                  { autoAlpha: 0, y: 20 },
                  { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: EASE.soft },
                  0,
                )
                .fromTo(
                  proxy,
                  { v: 0 },
                  {
                    v: value,
                    duration: 1.4,
                    ease: EASE.soft,
                    onUpdate: () => {
                      counter.textContent = format(proxy.v, decimals);
                    },
                  },
                  0.1,
                )
                .fromTo(
                  item.querySelector("[data-line]"),
                  { scaleX: 0 },
                  { scaleX: 1, duration: 0.6, ease: "power2.inOut" },
                  1.5,
                );

              tl.add(sub, at).addLabel(`item${i}`);
            });

            // Cada item só destrava a timeline até o próprio marcador
            let target = 0;
            let playhead: gsap.core.Tween | null = null;
            const advance = (label: string) => {
              const t = tl.labels[label];
              if (t <= target) return;
              target = t;
              playhead?.kill();
              // Se o leitor pulou vários itens, o playhead acelera para não fazê-lo esperar
              const behind = t - tl.time();
              playhead = tl.tweenTo(t, { ease: "none", duration: Math.min(behind, Math.max(1.8, behind / 2.5)) });
            };
            ScrollTrigger.create({
              trigger: root.current,
              start: "top 75%",
              once: true,
              onEnter: () => advance("head"),
            });
            items.forEach((item, i) =>
              ScrollTrigger.create({ trigger: item, start: "top 85%", once: true, onEnter: () => advance(`item${i}`) }),
            );

            return () => title.revert();
          });
        });
      }),
    { scope: root },
  );

  const [featured, ...rest] = ITEMS;

  return (
    <section id="trabalho" ref={root} aria-labelledby="trabalho-title" className="grain section-y bg-royal text-white">
      <div className="container-site">
        <SectionLabel data-label className="text-white">
          Trabalho prestado
        </SectionLabel>
        <h2
          id="trabalho-title"
          data-title
          className="display mt-6 max-w-[14ch] text-[clamp(2.6rem,10vw,3.5rem)] leading-[0.98] md:text-[clamp(3.5rem,6vw,6rem)]"
        >
          Recursos que chegaram a Mato Grosso.
        </h2>

        {/* Item 1: destaque absoluto, largura toda */}
        <div data-item className="mt-14 border-t border-white/30 pt-10 md:mt-20 md:pt-14">
          <div data-fade>
            <Amount item={featured} featured />
          </div>
          <p data-fade className="mt-6 font-display text-2xl font-extrabold leading-tight md:mt-8 md:text-[2.25rem]">
            {featured.area}
          </p>
        </div>

        {/* Itens 2–5: grade 2×2 com divisórias finas */}
        <ul className="mt-12 grid border-t border-white/30 md:mt-16 md:grid-cols-2">
          {rest.map((item, i) => (
            <li
              key={item.area}
              data-item
              className={cn(
                "border-b border-white/30 py-10 md:py-12",
                i % 2 === 0 ? "md:pr-12" : "md:border-l md:pl-12",
                i >= 2 && "md:border-b-0",
              )}
            >
              <div data-fade>
                <Amount item={item} />
              </div>
              <p data-fade className="mt-6 font-display text-xl font-extrabold md:text-2xl">
                {item.area}
              </p>
              {item.detail && (
                <p data-fade className="mt-2 max-w-[34ch] text-base leading-relaxed text-white/80 md:text-lg">
                  {item.detail}
                </p>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-white/80">Valores de recursos destinados, conforme divulgado pela campanha.</p>
      </div>
    </section>
  );
}
