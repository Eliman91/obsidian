"use client";

/* =============================================================
   STICKY BUY BAR (mobile) — barre d'achat toujours accessible.
   Fixée en bas de l'écran sur mobile uniquement, elle garde le
   prix et le bouton d'ajout au panier à portée de pouce.
   ============================================================= */

import type { Gadget, Locale } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/ui/AddToCartButton";

export function StickyBuyBar({
  gadget,
  locale,
  labels,
}: {
  gadget: Gadget;
  locale: Locale;
  labels: { addToCart: string; soldOut: string };
}) {
  return (
    <div className="glass-heavy fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 px-4 py-3 sm:hidden">
      <div className="min-w-0">
        <p className="truncate text-xs text-graphite">{gadget.title}</p>
        <p className="text-sm font-semibold text-titanium">
          {formatPrice(gadget.price.amount, gadget.price.currencyCode, locale)}
        </p>
      </div>
      <AddToCartButton gadget={gadget} labels={labels} className="shrink-0 px-6 py-2.5" />
    </div>
  );
}
