import { track } from "@vercel/analytics";

export type ShareOrigin = "header" | "vote" | "barra_mobile";

export const analytics = {
  share: (origem: ShareOrigin) => track("click_compartilhar_whatsapp", { origem }),
  contact: (origem: string) => track("click_falar_campanha", { origem }),
  instagram: (origem: string) => track("click_instagram", { origem }),
  video: (video: string) => track("click_video", { video }),
};
