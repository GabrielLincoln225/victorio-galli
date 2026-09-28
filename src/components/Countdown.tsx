import { useEffect, useState } from "react";
import { ELECTION_DATE_CUIABA } from "@/config/site";

declare const __BUILD_TIME__: number;

const cuiabaDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Cuiaba",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Dias de calendário (fuso de Cuiabá) entre hoje e o dia da eleição. */
export function daysUntilElection(now: number) {
  const [y, m, d] = cuiabaDay.format(now).split("-").map(Number);
  const [ey, em, ed] = ELECTION_DATE_CUIABA.split("-").map(Number);
  return Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(y, m - 1, d)) / 86_400_000);
}

export function countdownText(days: number) {
  if (days < 0) return null;
  if (days === 0) return "É hoje. Vote 1123.";
  return days === 1 ? "Falta 1 dia" : `Faltam ${days} dias`;
}

/** Renderiza com a data do build (HTML estático) e corrige para a data real ao hidratar. */
export function Countdown({ className }: { className?: string }) {
  const [days, setDays] = useState(() => daysUntilElection(__BUILD_TIME__));

  useEffect(() => {
    const update = () => setDays(daysUntilElection(Date.now()));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const text = countdownText(days);
  if (!text) return null;
  return (
    <p className={className} aria-live="polite">
      {text}
    </p>
  );
}
