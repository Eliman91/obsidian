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
