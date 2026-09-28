import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Logo oficial; se o arquivo não carregar, cai no lettering "GALLI 1123". */
export function Logo({
  className,
  imgClassName,
  lazy = false,
}: {
  className?: string;
  imgClassName?: string;
  lazy?: boolean;
}) {
  const img = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <span className={cn("inline-flex items-center", className)}>
      {failed ? (
        <span className="display flex items-baseline gap-1.5 text-[1.45rem] leading-none tracking-[-0.02em]">
          <span className="text-white">GALLI</span>
          <span className="text-yellow">1123</span>
          <span className="sr-only">Victório Galli, Deputado Federal</span>
        </span>
      ) : (
        <img
          ref={img}
          src="/brand/logo-galli.png"
          alt="Victório Galli 1123"
          height={40}
          width={140}
          decoding="async"
          loading={lazy ? "lazy" : undefined}
          onError={() => setFailed(true)}
          className={cn("h-10 w-auto", imgClassName)}
        />
      )}
    </span>
  );
}
