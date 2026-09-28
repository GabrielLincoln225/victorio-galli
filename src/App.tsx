import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { ScrollTrigger } from "@/lib/gsap";
import { startLenis } from "@/lib/lenis";
import { whenQueueIdle } from "@/lib/schedule";
import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { QuemE } from "@/sections/QuemE";
import { Trabalho } from "@/sections/Trabalho";
import { Bandeiras } from "@/sections/Bandeiras";
import { Campanha } from "@/sections/Campanha";
import { Vote } from "@/sections/Vote";
import { Footer } from "@/sections/Footer";
import { MobileBar } from "@/sections/MobileBar";

export function App() {
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Quando todas as seções terminarem de montar (lib/schedule): liga o Lenis e recalcula
    // os gatilhos uma única vez, em ordem de página (o pin da campanha muda posições).
    whenQueueIdle(() => {
      startLenis();
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    // Imagens lazy e fontes podem mudar alturas: refresh (agrupado) quando carregarem.

    let timer = 0;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    const imgs = Array.from(document.images).filter((img) => !img.complete);
    imgs.forEach((img) => img.addEventListener("load", refresh, { once: true }));
    document.fonts?.ready.then(refresh);

    // Abre na âncora certa quando a URL tiver hash
    if (location.hash) {
      const id = location.hash.slice(1);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    }

    return () => {
      window.clearTimeout(timer);
      imgs.forEach((img) => img.removeEventListener("load", refresh));
    };
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <QuemE />
        <Trabalho />
        <Bandeiras />
        <Campanha />
        <Vote />
      </main>
      <Footer />
      <MobileBar />
      <Analytics />
    </>
  );
}
