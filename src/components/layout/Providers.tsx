"use client";

/* =============================================================
   PROVIDERS — enveloppe client unique montée dans le root layout.
   • Démarre le smooth scroll global (Lenis + ScrollTrigger)
   • Fournit les contextes Panier et Club Privé à tout l'arbre
   ============================================================= */

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { PrivateClubProvider } from "@/context/PrivateClubContext";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export function Providers({ children }: { children: ReactNode }) {
  useSmoothScroll();

  return (
    <PrivateClubProvider>
      <CartProvider>{children}</CartProvider>
    </PrivateClubProvider>
  );
}
