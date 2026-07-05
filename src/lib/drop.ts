import type { Gadget, Locale } from "@/lib/types";
import { DROP_DATE } from "@/lib/site";

/* =============================================================
   DROP À VENIR — produits concept non achetables (liste d'attente).
   Piloté par le tag Shopify « drop-a-venir » : ajoutez/retirez le
   tag dans l'admin pour basculer un produit, sans toucher au code.
   Fichier importable côté client ET serveur (pas de server-only).
   ============================================================= */

/** Tag Shopify qui bascule un produit en mode « Drop à venir ». */
export const COMING_SOON_TAG = "drop-a-venir";

/** true si le produit est un drop à venir (non achetable). */
export function isComingSoon(gadget: Pick<Gadget, "tags">): boolean {
  return gadget.tags.includes(COMING_SOON_TAG);
}

/** Date du drop formatée pour la locale (ex. « 23 juillet 2026 »). */
export function formatDropDate(locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(DROP_DATE));
}
