/// <reference types="vite/client" />
declare const __BUILD_TIME__: number;

declare module "virtual:qr-instagram" {
  const qr: { size: number; path: string };
  export default qr;
}
