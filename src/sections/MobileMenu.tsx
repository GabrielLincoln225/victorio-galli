import { INSTAGRAM_HANDLE, INSTAGRAM_URL, NAV_LINKS, SHARE_URL } from "@/config/site";
import { analytics } from "@/lib/analytics";
import { BrandIcon } from "@/components/BrandIcon";
import { ExternalLink } from "@/components/links";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active: string | null;
  onNavigate: (id: string) => void;
};

/** Menu mobile (shadcn Sheet). Carregado sob demanda pelo Header. */
export default function MobileMenu({ open, onOpenChange, active, onNavigate }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby={undefined} className="px-6 pb-[calc(2rem+var(--safe-bottom))] pt-20">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <nav aria-label="Seções">
          <ul className="border-t border-white/15">
            {NAV_LINKS.map(({ id, label }) => (
              <li key={id} className="border-b border-white/15">
                <a
                  href={"#" + id}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(id);
                  }}
                  className="display flex items-center justify-between py-5 text-[2rem] tracking-[-0.02em]"
                >
                  {label}
                  {active === id && <span aria-hidden className="size-2.5 bg-yellow" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <Button asChild variant="onDark" size="lg">
            <ExternalLink href={INSTAGRAM_URL} onClick={() => analytics.instagram("menu")}>
              <BrandIcon name="instagram" />
              Seguir {INSTAGRAM_HANDLE}
            </ExternalLink>
          </Button>
          <Button asChild size="lg">
            <ExternalLink href={SHARE_URL} onClick={() => analytics.share("header")}>
              <BrandIcon name="whatsapp" />
              Compartilhar no WhatsApp
            </ExternalLink>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
