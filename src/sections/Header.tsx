import { lazy, Suspense, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, EASE, prefersReducedMotion } from "@/lib/gsap";
import { deferSetup } from "@/lib/schedule";
import { getLenis, scrollToId } from "@/lib/lenis";
import { analytics } from "@/lib/analytics";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, NAV_LINKS, SHARE_URL } from "@/config/site";

// O Sheet (Radix Dialog) só é baixado quando o menu é aberto pela primeira vez
const loadMobileMenu = () => import("./MobileMenu");
const MobileMenu = lazy(loadMobileMenu);
import { Logo } from "@/components/Logo";
import { BrandIcon } from "@/components/BrandIcon";
import { AnchorLink, ExternalLink } from "@/components/links";
import { Button } from "@/components/ui/button";

export function Header() {
  const root = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [menuRequested, setMenuRequested] = useState(false);
  const loadMenu = () => void loadMobileMenu();

  useGSAP(
    (_, contextSafe) =>
      deferSetup(contextSafe!, () => {
        const reduce = prefersReducedMotion();

        // Entra quando o pin da hero solta (= #quem-e começa a subir pela base da tela)
        if (!reduce) {
          gsap.set(root.current, { y: 0, yPercent: -100, autoAlpha: 0 });
          ScrollTrigger.create({
            refreshPriority: -1,
            trigger: document.getElementById("quem-e"),
            start: "top bottom-=2",
            onEnter: () => gsap.to(root.current, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: EASE.enter }),
            onLeaveBack: () => gsap.to(root.current, { yPercent: -100, autoAlpha: 0, duration: 0.4, ease: EASE.exit }),
          });
        }

        // Seção ativa
        NAV_LINKS.forEach(({ id }) => {
          ScrollTrigger.create({
            refreshPriority: -1,
            trigger: document.getElementById(id),
            start: "top center",
            end: "bottom center",
            onToggle: (self) => setActive((cur) => (self.isActive ? id : cur === id ? null : cur)),
          });
        });
      }),
    { scope: root },
  );

  // Linha amarela desliza até o link ativo
  useGSAP(
    () => {
      const line = bar.current;
      if (!line || !nav.current) return;
      const link = active ? nav.current.querySelector<HTMLElement>(`[data-nav="${active}"]`) : null;
      const reduce = prefersReducedMotion();
      if (!link) {
        gsap.to(line, { scaleX: 0, duration: reduce ? 0 : 0.3, ease: EASE.exit });
        return;
      }
      gsap.to(line, {
        x: link.offsetLeft,
        width: link.offsetWidth,
        scaleX: 1,
        duration: reduce ? 0 : 0.55,
        ease: EASE.enter,
      });
    },
    { dependencies: [active], scope: nav },
  );

  const onOpenChange = (v: boolean) => {
    if (v) setMenuRequested(true);
    setOpen(v);
    const lenis = getLenis();
    if (v) lenis?.stop();
    else lenis?.start();
  };

  const goFromSheet = (id: string) => {
    onOpenChange(false);
    window.setTimeout(() => scrollToId(id), 280);
  };

  return (
    <header
      ref={root}
      className="site-header fixed inset-x-0 top-0 z-50 border-b border-white/12 bg-navy/88 text-white backdrop-blur-md"
    >
      <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-6">
        <AnchorLink to="inicio" aria-label="Voltar ao início" className="shrink-0">
          <Logo />
        </AnchorLink>

        <nav ref={nav} aria-label="Seções" className="relative hidden h-full md:block">
          <ul className="flex h-full items-center gap-1 lg:gap-3">
            {NAV_LINKS.map(({ id, label }) => (
              <li key={id} className="h-full">
                <AnchorLink
                  to={id}
                  data-nav={id}
                  aria-current={active === id ? "true" : undefined}
                  className="flex h-full items-center px-3 font-display text-[0.95rem] font-bold text-white/80 transition-colors hover:text-white aria-[current]:text-white"
                >
                  {label}
                </AnchorLink>
              </li>
            ))}
          </ul>
          <span
            ref={bar}
            aria-hidden
            className="absolute bottom-0 left-0 h-[3px] w-0 origin-left scale-x-0 rounded-pill bg-yellow"
          />
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="onDark" size="icon" className="border-0 text-white/85 hover:text-white">
            <ExternalLink
              href={INSTAGRAM_URL}
              aria-label={`Instagram ${INSTAGRAM_HANDLE} (abre em nova aba)`}
              onClick={() => analytics.instagram("header")}
            >
              <BrandIcon name="instagram" />
            </ExternalLink>
          </Button>
          <Button asChild size="sm" className="h-11 px-5">
            <ExternalLink href={SHARE_URL} onClick={() => analytics.share("header")}>
              <BrandIcon name="whatsapp" />
              Compartilhar
            </ExternalLink>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onPointerEnter={loadMenu}
          onTouchStart={loadMenu}
          onClick={() => onOpenChange(true)}
          className="grid size-11 place-items-center rounded-pill text-white hover:bg-white/10 md:hidden"
        >
          <span aria-hidden className="flex w-5 flex-col gap-[5px]">
            <span className="h-0.5 w-full rounded-pill bg-current" />
            <span className="h-0.5 w-full rounded-pill bg-current" />
            <span className="h-0.5 w-3/5 self-end rounded-pill bg-yellow" />
          </span>
        </button>
        {menuRequested && (
          <Suspense fallback={null}>
            <MobileMenu open={open} onOpenChange={onOpenChange} active={active} onNavigate={goFromSheet} />
          </Suspense>
        )}
      </div>
    </header>
  );
}
