import { siInstagram, siWhatsapp } from "simple-icons";
import { cn } from "@/lib/utils";

const ICONS = { instagram: siInstagram, whatsapp: siWhatsapp } as const;

/** Ícones de marca monocromáticos (simple-icons). Decorativos: o texto/aria-label fica no botão. */
export function BrandIcon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={cn("size-5 fill-current", className)}>
      <path d={ICONS[name].path} />
    </svg>
  );
}
