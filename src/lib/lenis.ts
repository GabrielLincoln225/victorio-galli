import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

let lenis: Lenis | null = null;

/** Lenis ligado ao ticker do GSAP, para o ScrollTrigger ler a mesma posição. */
export function startLenis() {
  if (lenis || prefersReducedMotion()) return lenis;
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function raf(time: number) {
  lenis?.raf(time * 1000);
}

export function getLenis() {
  return lenis;
}

/** Rola até uma âncora respeitando o header fixo; sem Lenis usa o scroll nativo. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  history.replaceState(null, "", "#" + id);
  if (lenis) {
    lenis.scrollTo(el, { offset: -headerOffset(), duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
}

function headerOffset() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
  return parseFloat(v) * 16 || 72;
}
