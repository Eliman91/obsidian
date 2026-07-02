/* =============================================================
   SCARCITY BADGE — rareté « édition limitée » (levier CRO).
   Composant serveur (aucune interactivité) affiché sur la fiche
   produit. Deux modes automatiques :
     1. LIVE  : le stock est lisible (quantityAvailable) →
                « Plus que X sur N » + barre de progression.
     2. STATIC: stock non lisible (droit inventaire non accordé) →
                « Édition limitée · N pièces numérotées ».
   Aucun chiffre inventé : tout vient de Shopify.
   ============================================================= */

import type { Locale } from "@/lib/types";

interface ScarcityBadgeProps {
  editionSize: number | null;
  /** Stock live (null si le droit inventaire n'est pas accordé). */
  remaining: number | null;
  locale: Locale;
}

const COPY = {
  fr: {
    limited: "Édition limitée",
    pieces: (n: number) => `${n} pièces numérotées`,
    remaining: (r: number, n: number) => `Plus que ${r} sur ${n}`,
    almost: "Bientôt épuisé",
    soldout: "Série épuisée",
  },
  en: {
    limited: "Limited edition",
    pieces: (n: number) => `${n} numbered pieces`,
    remaining: (r: number, n: number) => `Only ${r} of ${n} left`,
    almost: "Almost gone",
    soldout: "Sold out",
  },
} as const;

export function ScarcityBadge({ editionSize, remaining, locale }: ScarcityBadgeProps) {
  if (!editionSize || editionSize <= 0) return null;
  const c = COPY[locale];

  // Mode LIVE : le stock est connu et cohérent (≤ taille d'édition).
  const isLive = remaining !== null && remaining <= editionSize;
  const soldOut = isLive && remaining <= 0;
  // % vendu (pour la barre). En mode statique : 0 (barre pleine à droite).
  const sold = isLive ? editionSize - remaining : 0;
  const soldPct = Math.min(100, Math.max(0, Math.round((sold / editionSize) * 100)));
  // Seuil « bientôt épuisé » : moins de 10 % du stock restant.
  const almost = isLive && !soldOut && remaining <= editionSize * 0.1;

  return (
    <div className="glass rounded-[--radius-luxe] px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-cyan uppercase">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" aria-hidden />
          {c.limited}
        </span>
        <span className="text-sm font-semibold text-titanium">
          {soldOut
            ? c.soldout
            : isLive
              ? c.remaining(remaining, editionSize)
              : c.pieces(editionSize)}
        </span>
      </div>

      {/* Barre de progression (visible seulement en mode live). */}
      {isLive && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-titanium/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan to-plasma transition-all"
            style={{ width: `${soldPct}%` }}
          />
        </div>
      )}

      {almost && (
        <p className="mt-2 text-xs font-medium text-plasma">{c.almost}</p>
      )}
    </div>
  );
}
