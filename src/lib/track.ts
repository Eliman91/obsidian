/* =============================================================
   TRACK — événements e-commerce envoyés aux 3 pixels.
   ------------------------------------------------------------
   GA4 (gtag) + Meta (fbq) + TikTok (ttq) partagent un même
   moment (voir produit, ajout panier, début checkout) mais
   attendent des noms d'événements différents. Ces helpers
   traduisent une fois pour les trois.

   RÈGLE : chaque appel est SANS EFFET si le pixel correspondant
   n'est pas chargé (env var absente OU consentement refusé) —
   on lit simplement `window.gtag/fbq/ttq` et on no-op sinon.
   Donc rien à conditionner côté appelant : on tracke toujours,
   le pixel absent ignore.
   ============================================================= */

type Gtag = (command: string, event: string, params?: Record<string, unknown>) => void;
type Fbq = (command: string, event: string, params?: Record<string, unknown>) => void;
type Ttq = { track: (event: string, params?: Record<string, unknown>) => void };

declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: Fbq;
    ttq?: Ttq;
  }
}

/** Un article, dans une forme neutre indépendante du pixel. */
export interface TrackItem {
  id: string; // variantId ou productId Shopify
  name: string;
  price: number;
  quantity: number;
}

/** Extrait l'identifiant numérique d'un gid Shopify (pour les pixels). */
function shortId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}

/** Envoie le même événement aux 3 pixels, chacun dans son dialecte. */
function dispatch(
  ga: string,
  meta: string,
  tiktok: string,
  items: TrackItem[],
  currency: string,
) {
  if (typeof window === "undefined" || items.length === 0) return;

  const value = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const ids = items.map((i) => shortId(i.id));

  // GA4
  window.gtag?.("event", ga, {
    currency,
    value,
    items: items.map((i) => ({
      item_id: shortId(i.id),
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });

  // Meta Pixel
  window.fbq?.("track", meta, {
    content_type: "product",
    content_ids: ids,
    contents: items.map((i) => ({ id: shortId(i.id), quantity: i.quantity })),
    value,
    currency,
  });

  // TikTok Pixel
  window.ttq?.track(tiktok, {
    content_type: "product",
    contents: items.map((i) => ({
      content_id: shortId(i.id),
      content_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
    value,
    currency,
  });
}

/** Consultation d'une fiche produit. */
export function trackViewItem(item: TrackItem, currency: string) {
  dispatch("view_item", "ViewContent", "ViewContent", [item], currency);
}

/** Ajout au panier. */
export function trackAddToCart(item: TrackItem, currency: string) {
  dispatch("add_to_cart", "AddToCart", "AddToCart", [item], currency);
}

/** Clic « Passer au paiement ». */
export function trackBeginCheckout(items: TrackItem[], currency: string) {
  dispatch("begin_checkout", "InitiateCheckout", "InitiateCheckout", items, currency);
}
