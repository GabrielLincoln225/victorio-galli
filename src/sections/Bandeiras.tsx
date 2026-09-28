import { useRef } from "react";
import { gsap, SplitText, useGSAP, EASE, buildOnApproach } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { SectionLabel } from "@/components/SectionLabel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const A_FAVOR = ["Da família", "Do agro", "De menos impostos", "Da alfabetização fônica"];
const CONTRA = [
  "As facções criminosas",
  "As “saidinhas” de presos",
  "As drogas",
  "A impunidade de corruptos",
  "O alívio de penas",
  "A violência contra as mulheres",
  "A censura",
  "As leis que aumentam a burocracia",
];

type Side = "favor" | "contra";

function List({ items, side }: { items: string[]; side: Side }) {
  return (
    <ul className="border-t border-navy/20" data-list={side}>
      {items.map((item, i) => (
        <li
          key={item}
          data-row
          className="flex items-center gap-4 border-b border-navy/20 py-4 font-display text-[1.3rem] font-extrabold leading-tight tracking-[-0.015em] md:py-5 md:text-[clamp(1.4rem,2.1vw,1.9rem)]"
        >
          {/* Quadradinhos alternando como as casas da urna */}
          <span
            data-marker
            aria-hidden
            className={cn(
              "size-3 shrink-0 rounded-[3px]",
              i % 2 === 0 ? "bg-navy" : "bg-yellow ring-1 ring-inset ring-navy/15",
            )}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ColumnTitle({ side }: { side: Side }) {
  return (
    <h3 className="display flex items-center gap-4 text-[clamp(2.25rem,4.2vw,3.75rem)]">
      <span
        aria-hidden
        className={cn("size-[0.42em] shrink-0 rounded-[0.08em]", side === "favor" ? "bg-yellow" : "bg-navy")}
      />
      {side === "favor" ? "A favor" : "Contra"}
    </h3>
  );
}

/**
 * Bandeiras — uma timeline disparada na entrada: título por linhas,
 * "A favor" entra da esquerda, "Contra" da direita, marcadores com scale.
 */
export function Bandeiras() {
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

            const tl = gsap.timeline({
              scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
            });

            const rows = (side: Side) => q(`[data-list="${side}"] [data-row]`);
            const markers = (side: Side) => q(`[data-list="${side}"] [data-marker]`);

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
              .fromTo(
                q("[data-col-title], [data-tabs-list]"),
                { autoAlpha: 0, y: 20 },
                { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: EASE.soft },
                0.45,
              )
              .fromTo(
                rows("favor"),
                { autoAlpha: 0, x: -40 },
                { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.07, ease: EASE.enter },
                0.6,
              )
              .fromTo(
                rows("contra"),
                { autoAlpha: 0, x: 40 },
                { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.06, ease: EASE.enter },
                0.7,
              )
              .fromTo(
                markers("favor"),
                { scale: 0 },
                { scale: 1, duration: 0.5, stagger: 0.07, ease: "back.out(2.5)" },
                0.8,
              )
              .fromTo(
                markers("contra"),
                { scale: 0 },
                { scale: 1, duration: 0.5, stagger: 0.06, ease: "back.out(2.5)" },
                0.9,
              );

            return () => title.revert();
          });
        });
      }),
    { scope: root },
  );

  return (
    <section id="bandeiras" ref={root} aria-labelledby="bandeiras-title" className="section-y bg-white text-navy">
      <div className="container-site">
        <SectionLabel data-label>Bandeiras</SectionLabel>
        <h2
          id="bandeiras-title"
          data-title
          className="display mt-6 text-[clamp(2.75rem,11vw,3.75rem)] leading-[0.96] md:text-[clamp(3.75rem,6.6vw,6.75rem)]"
        >
          Cristão e conservador.
        </h2>

        {/* Desktop: duas colunas */}
        <div className="mt-16 hidden gap-[clamp(3rem,6vw,6rem)] md:grid md:grid-cols-[5fr_7fr]">
          <div>
            <div data-col-title className="mb-8">
              <ColumnTitle side="favor" />
            </div>
            <List items={A_FAVOR} side="favor" />
          </div>
          <div>
            <div data-col-title className="mb-8">
              <ColumnTitle side="contra" />
            </div>
            <List items={CONTRA} side="contra" />
          </div>
        </div>

        {/* Mobile: tabs (as duas listas ficam no HTML; a inativa só é escondida) */}
        <Tabs defaultValue="favor" className="mt-10 md:hidden">
          <TabsList data-tabs-list aria-label="Bandeiras">
            <TabsTrigger value="favor">
              <span aria-hidden className="size-2.5 bg-yellow" />A favor
            </TabsTrigger>
            <TabsTrigger value="contra">
              <span aria-hidden className="size-2.5 bg-navy ring-1 ring-white/60" />
              Contra
            </TabsTrigger>
          </TabsList>
          <TabsContent value="favor" forceMount className="data-[state=inactive]:hidden">
            <List items={A_FAVOR} side="favor" />
          </TabsContent>
          <TabsContent value="contra" forceMount className="data-[state=inactive]:hidden">
            <List items={CONTRA} side="contra" />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
