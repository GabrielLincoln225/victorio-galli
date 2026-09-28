import { forwardRef, useImperativeHandle, useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const NUMBER = "1123";
/** Cada casa tem os dígitos 0–9 duas vezes; ela rola uma volta inteira e para no dígito certo. */
const STRIP = [...Array(20).keys()].map((n) => n % 10);
const TONES = ["navy", "yellow", "navy", "yellow"] as const;

type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, { root: string; label: string }> = {
  sm: { root: "text-[2.1rem]", label: "text-[0.8rem]" },
  md: { root: "text-[3.6rem] md:text-[4.25rem]", label: "text-lg md:text-xl" },
  lg: { root: "text-[clamp(4.25rem,19vw,8.5rem)]", label: "text-2xl md:text-[2rem]" },
};

export type UrnaHandle = {
  /** Timeline pausada do odômetro, para ser encaixada numa timeline de seção. */
  roll: () => gsap.core.Timeline;
};

type UrnaProps = {
  size?: Size;
  /** Mostra "Para apertar" acima das casas. */
  label?: boolean;
  /** "inview": rola sozinha ao entrar na tela (uma vez). "manual": a seção controla via ref.roll(). */
  trigger?: "inview" | "manual";
  className?: string;
  labelClassName?: string;
};

const targetPercent = (digit: number) => -((10 + digit) / STRIP.length) * 100;

export const Urna = forwardRef<UrnaHandle, UrnaProps>(function Urna(
  { size = "md", label = false, trigger = "inview", className, labelClassName },
  ref,
) {
  const root = useRef<HTMLDivElement>(null);

  const buildRoll = () => {
    const strips = gsap.utils.toArray<HTMLElement>("[data-strip]", root.current);
    const tl = gsap.timeline({ paused: true });
    strips.forEach((strip, i) => {
      const digit = Number(NUMBER[i]);
      tl.fromTo(
        strip,
        { y: 0, yPercent: 0 },
        { yPercent: targetPercent(digit), duration: 1.15, ease: "power4.out" },
        i * 0.12,
      );
    });
    return tl;
  };

  useImperativeHandle(ref, () => ({ roll: buildRoll }));

  useGSAP(
    () => {
      if (trigger !== "inview" || prefersReducedMotion()) return;
      const tl = buildRoll();
      tl.progress(0).pause();
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 88%",
        once: true,
        onEnter: () => tl.play(),
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("inline-flex flex-col items-start", className)}>
      {label && <p className={cn("accent mb-[0.35em] leading-none", SIZE[size].label, labelClassName)}>Para apertar</p>}
      <div
        role="img"
        aria-label="Número 1123"
        className={cn("flex gap-[0.09em] font-display font-black leading-none", SIZE[size].root)}
      >
        {NUMBER.split("").map((d, i) => {
          const tone = TONES[i];
          return (
            <span
              key={i}
              aria-hidden="true"
              data-tone={tone}
              className={cn(
                "urna-cell relative block h-[1em] w-[0.74em] overflow-hidden rounded-[0.15em]",
                tone === "navy" ? "bg-navy text-white ring-1 ring-inset ring-white/20" : "bg-yellow text-navy",
              )}
            >
              <span
                data-strip
                className="absolute inset-x-0 top-0 block will-change-transform"
                /* Estado estático (sem JS / reduced motion): já parado no dígito certo */
                style={{ transform: `translateY(${targetPercent(Number(d))}%)` }}
              >
                {STRIP.map((n, k) => (
                  <span key={k} className="flex h-[1em] items-center justify-center">
                    <span className="text-[0.74em] leading-none tracking-[-0.04em]">{n}</span>
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
});
