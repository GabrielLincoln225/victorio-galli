/**
 * Constantes do site. Todo link, mensagem e dado de contato sai daqui.
 * Valores entre [colchetes] são placeholders que ainda precisam ser preenchidos.
 */
export const SITE_URL = "https://victorio-galli.vercel.app";
export const INSTAGRAM_URL = "https://www.instagram.com/victoriogallimt";
export const INSTAGRAM_HANDLE = "@victoriogallimt";
export const WHATSAPP_NUMBER = "[55DDNÚMERO]";
export const CNPJ = "[CNPJ DA CAMPANHA]";

export const SHARE_MESSAGE =
  "Victório Galli, Deputado Federal 1123. Vote em quem já conhece o caminho. Conheça: " + SITE_URL;
export const CONTACT_MESSAGE = "Olá! Vim pelo site e quero falar com a campanha do Victório Galli 1123.";

export const SHARE_URL = "https://wa.me/?text=" + encodeURIComponent(SHARE_MESSAGE);
export const CONTACT_URL = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(CONTACT_MESSAGE);

export const isPlaceholder = (value: string) => /^\[.*\]$/.test(value.trim());

/** Enquanto o número for placeholder, os botões "Falar com a campanha" ficam escondidos. */
export const HAS_WHATSAPP = !isPlaceholder(WHATSAPP_NUMBER);

/** Dia da eleição (1º turno), meia-noite em Cuiabá (UTC-4). */
export const ELECTION_DATE_CUIABA = "2026-10-04";

export const SEO = {
  title: "Victório Galli 1123 | Deputado Federal por Mato Grosso",
  description:
    "Victório Galli, pastor e professor, candidato a Deputado Federal por Mato Grosso pelo Progressistas. Para apertar: 1123. Vote em quem já conhece o caminho.",
  ogImage: SITE_URL + "/og/share.jpg",
  themeColor: "#011B72",
};

export const NAV_LINKS = [
  { id: "quem-e", label: "Quem é" },
  { id: "trabalho", label: "Trabalho" },
  { id: "bandeiras", label: "Bandeiras" },
  { id: "campanha", label: "Campanha" },
] as const;

export const CAMPAIGN_VIDEOS = [
  {
    id: "experiencia",
    title: "Quem já conhece o caminho",
    thumb: "/campanha/experiencia",
    url: "https://www.instagram.com/reel/Ddy_ZB5BGQL/",
  },
  {
    id: "agricultura",
    title: "R$ 5,4 milhões para a agricultura familiar",
    thumb: "/campanha/agricultura",
    url: "https://www.instagram.com/reel/DdrQ5PRBNFJ/",
  },
  {
    id: "educacao",
    title: "R$ 7 milhões para a educação",
    thumb: "/campanha/educacao",
    url: "https://www.instagram.com/reel/DdosF7Ghsaq/",
  },
  {
    id: "infraestrutura",
    title: "Quase R$ 14 milhões para infraestrutura",
    thumb: "/campanha/infraestrutura",
    url: "https://www.instagram.com/reel/DdmHW6iBynU/",
  },
  {
    id: "historia",
    title: "Das 3 da manhã a Brasília",
    thumb: "/campanha/historia",
    url: "https://www.instagram.com/reel/DdjiilrBKb2/",
  },
] as const;

/** Enquanto a URL do reel for placeholder, o card leva ao perfil do Instagram. */
export const reelHref = (url: string) => (isPlaceholder(url) ? INSTAGRAM_URL : url);
