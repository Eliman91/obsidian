import type { Locale } from "@/lib/types";

/* =============================================================
   REASSURANCE BAR — arguments de confiance près de l'achat.
   Lève les freins : paiement, livraison, retours, authenticité.
   ============================================================= */

const ITEMS = {
  fr: [
    { icon: "🔒", label: "Paiement 100 % sécurisé" },
    { icon: "🚚", label: "Livraison suivie" },
    { icon: "↩️", label: "Retours sous 30 jours" },
    { icon: "💎", label: "Édition numérotée" },
  ],
  en: [
    { icon: "🔒", label: "100% secure payment" },
    { icon: "🚚", label: "Tracked shipping" },
    { icon: "↩️", label: "30-day returns" },
    { icon: "💎", label: "Numbered edition" },
  ],
} as const;

export function ReassuranceBar({ locale }: { locale: Locale }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ITEMS[locale].map((item) => (
        <li
          key={item.label}
          className="glass flex flex-col items-center gap-2 rounded-[--radius-luxe] px-3 py-4 text-center"
        >
          <span aria-hidden className="text-lg">
            {item.icon}
          </span>
          <span className="text-[11px] leading-tight tracking-wide text-graphite">
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
