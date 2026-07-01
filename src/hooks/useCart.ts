"use client";

import { useContext } from "react";
import { CartContext, type CartContextValue } from "@/context/CartContext";

/**
 * Accès typé au panier global.
 * Lève une erreur explicite si utilisé hors <CartProvider>.
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart doit être utilisé à l'intérieur d'un <CartProvider>.");
  }
  return ctx;
}
