"use client";

/* =============================================================
   PRODUCT ANALYTICS — déclenche l'événement `view_item` au
   chargement d'une fiche produit (invisible, aucun rendu).
   ------------------------------------------------------------
   Les pixels se chargent en `afterInteractive` APRÈS le
   consentement : au montage, window.gtag/fbq/ttq peuvent ne pas
   exister encore. On réessaie donc quelques fois (max ~4 s) puis
   on abandonne — si le consentement n'est pas donné, rien ne part
   (les helpers no-op), ce qui est le comportement RGPD voulu.
   ============================================================= */

import { useEffect } from "react";
import { trackViewItem, type TrackItem } from "@/lib/track";

export function ProductAnalytics({
  item,
  currency,
}: {
  item: TrackItem;
  currency: string;
}) {
  useEffect(() => {
    let attempts = 0;
    const ready = () =>
      typeof window !== "undefined" &&
      (window.gtag || window.fbq || window.ttq);

    if (ready()) {
      trackViewItem(item, currency);
      return;
    }
    // Aucun pixel prêt : on retente jusqu'à 10× (400 ms) puis stop.
    const timer = window.setInterval(() => {
      attempts += 1;
      if (ready()) {
        trackViewItem(item, currency);
        window.clearInterval(timer);
      } else if (attempts >= 10) {
        window.clearInterval(timer);
      }
    }, 400);
    return () => window.clearInterval(timer);
    // item.id suffit à identifier une nouvelle fiche.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return null;
}
