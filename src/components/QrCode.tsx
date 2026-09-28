import qr from "virtual:qr-instagram";

/** QR code do INSTAGRAM_URL (gerado no build pela lib qrcode; ver vite.config.ts). */
export function QrCode({ className, title }: { className?: string; title: string }) {
  const pad = 2;
  const box = qr.size + pad * 2;
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${box} ${box}`}
      role="img"
      aria-label={title}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect x={-pad} y={-pad} width={box} height={box} fill="#ffffff" />
      <path d={qr.path} fill="#011b72" />
    </svg>
  );
}
