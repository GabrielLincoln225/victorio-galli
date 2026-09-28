import { CNPJ, CONTACT_URL, HAS_WHATSAPP, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/config/site";
import { analytics } from "@/lib/analytics";
import { Logo } from "@/components/Logo";
import { BrandIcon } from "@/components/BrandIcon";
import { ExternalLink } from "@/components/links";

export function Footer() {
  return (
    <footer className="border-t border-white/12 bg-navy pb-[calc(6.5rem+var(--safe-bottom))] pt-14 text-white/70 md:pb-14">
      <div className="container-site grid gap-10 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-14">
        <Logo lazy />

        <div className="space-y-2 text-sm leading-relaxed">
          <p>Propaganda eleitoral · Eleições 2026 · Victório Galli · Deputado Federal 1123 · Progressistas</p>
          <p>CNPJ: {CNPJ}</p>
          <p>Conteúdo produzido com auxílio de inteligência artificial.</p>
        </div>

        <ul className="flex items-center gap-2">
          <li>
            <ExternalLink
              href={INSTAGRAM_URL}
              aria-label={`Instagram ${INSTAGRAM_HANDLE} (abre em nova aba)`}
              onClick={() => analytics.instagram("rodape")}
              className="grid size-11 place-items-center rounded-pill border border-white/25 text-white transition-colors hover:border-yellow hover:text-yellow"
            >
              <BrandIcon name="instagram" />
            </ExternalLink>
          </li>
          {HAS_WHATSAPP && (
            <li>
              <ExternalLink
                href={CONTACT_URL}
                aria-label="Falar com a campanha no WhatsApp (abre em nova aba)"
                onClick={() => analytics.contact("rodape")}
                className="grid size-11 place-items-center rounded-pill border border-white/25 text-white transition-colors hover:border-yellow hover:text-yellow"
              >
                <BrandIcon name="whatsapp" />
              </ExternalLink>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}
