import type { AnchorHTMLAttributes } from "react";
import { scrollToId } from "@/lib/lenis";

/** Link externo: sempre nova aba, sem vazar referrer/opener. */
export function ExternalLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

/** Âncora interna que passa pelo Lenis (com fallback nativo via href). */
export function AnchorLink({ to, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  return (
    <a
      href={"#" + to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        scrollToId(to);
      }}
      {...props}
    />
  );
}
