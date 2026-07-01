"use client";

/* =============================================================
   ADD TO CART BUTTON — bouton d'ajout au panier réutilisable.
   Gère l'état "ajouté" (feedback visuel court) et le cas rupture.
   ============================================================= */

import { useState } from "react";
import type { Gadget } from "@/lib/types";
import { useCart } from "@/hooks/useCart";

interface AddToCartButtonProps {
  gadget: Gadget;
  labels: { addToCart: string; soldOut: string };
  className?: string;
}

export function AddToCartButton({
  gadget,
  labels,
  className = "",
}: AddToCartButtonProps) {
  const { addLine } = useCart();
  const [added, setAdded] = useState(false);

  const canBuy = gadget.availableForSale && gadget.variantId !== null;

  function handleAdd(event: React.MouseEvent) {
    // Empêche la navigation si le bouton est à l'intérieur d'un lien.
    event.preventDefault();
    event.stopPropagation();
    if (!canBuy || !gadget.variantId) return;

    addLine({
      variantId: gadget.variantId,
      handle: gadget.handle,
      title: gadget.title,
      imageUrl: gadget.featuredImage?.url ?? null,
      unitPrice: gadget.price.amount,
      currencyCode: gadget.price.currencyCode,
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!canBuy}
      className={`ring-neon rounded-full border border-cyan/30 px-4 py-2 text-xs font-medium text-cyan transition-all duration-300 hover:bg-cyan hover:text-vantablack disabled:cursor-not-allowed disabled:border-graphite/20 disabled:text-graphite disabled:shadow-none ${className}`}
    >
      {!canBuy ? labels.soldOut : added ? "✓ Ajouté" : labels.addToCart}
    </button>
  );
}
