import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Label de seção: quadradinho (cor da urna) + texto em caixa alta. */
export function SectionLabel({
  className,
  children,
  marker = "yellow",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { marker?: "yellow" | "navy" | "white" }) {
  return (
    <p className={cn("eyebrow flex items-center gap-3", className)} {...props}>
      <span
        aria-hidden
        className={cn(
          "size-2.5 shrink-0",
          marker === "yellow" && "bg-yellow",
          marker === "navy" && "bg-navy",
          marker === "white" && "bg-white",
        )}
      />
      {children}
    </p>
  );
}
