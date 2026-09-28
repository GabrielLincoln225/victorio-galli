import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

export const isBrowser = typeof window !== "undefined";

if (isBrowser) {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
}

/** Easings do sistema (espelham --ease-out-expo / --ease-out-quart do CSS). */
export const EASE = {
  enter: "expo.out",
  soft: "power3.out",
  exit: "power2.in",
  scrub: "none",
} as const;

/** true quando o usuário pediu menos movimento (ou no servidor). */
export function prefersReducedMotion() {
  if (!isBrowser) return true;
  return !document.documentElement.classList.contains("motion");
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

/**
 * Monta a animação de uma seção só quando ela se aproxima da tela: menos trabalho
 * no carregamento e nenhum texto "apagado" (estado inicial) antes da hora.
 * `ctx` é o Context do matchMedia, então o que for criado depois é revertido junto.
 */
export function buildOnApproach(ctx: gsap.Context, trigger: Element | null, build: () => void | (() => void)) {
  if (!trigger) return;
  const run = ctx.add("build", build) as () => void;
  ScrollTrigger.create({ trigger, start: "top bottom+=75%", once: true, onEnter: () => run() });
}
