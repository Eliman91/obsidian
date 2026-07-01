/* =============================================================
   PRODUCT GRID — grille responsive de cartes produits.
   Composant serveur : reçoit les gadgets déjà chargés et délègue
   l'interactivité (panier) aux ProductCard (client).
   ============================================================= */

import type { Gadget, Locale } from "@/lib/types";
import { ProductCard } from "@/components/ui/ProductCard";

interface ProductGridProps {
  gadgets: Gadget[];
  locale: Locale;
  labels: { addToCart: string; soldOut: string; from: string };
}

export function ProductGrid({ gadgets, locale, labels }: ProductGridProps) {
  if (gadgets.length === 0) {
    return (
      <p className="text-center text-sm text-graphite">
        Aucun produit disponible pour le moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {gadgets.map((gadget) => (
        <ProductCard
          key={gadget.id}
          gadget={gadget}
          locale={locale}
          labels={labels}
        />
      ))}
    </div>
  );
}
