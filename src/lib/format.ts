import type { Locale } from "@/lib/types";

/** Formate un montant en devise selon la locale (ex. 29,99 €). */
export function formatPrice(
  amount: number,
  currencyCode: string,
  locale: Locale = "fr",
): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

/**
 * Sérialise un objet JSON-LD pour injection dans <script>.
 * Échappe "<" en < : sans cela, une valeur contenant
 * "</script>" fermerait la balise et exécuterait du HTML arbitraire
 * (XSS). Même précaution que la sérialisation interne de Next.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Tronque un texte à `max` caractères SANS couper un mot,
 * et ajoute une ellipse. Utilisé pour les meta descriptions
 * (une coupe en plein mot fait négligé dans les SERP).
 */
export function truncateAtWord(text: string, max = 155): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : max - 1)}…`;
}
