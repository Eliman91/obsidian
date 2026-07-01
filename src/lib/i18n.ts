/**
 * Configuration i18n partagée (proxy + layout + pages).
 * Locales supportées pour le routing localisé /fr et /en.
 */
import type { Locale } from "@/lib/types";

export const LOCALES = ["fr", "en"] as const;
export const DEFAULT_LOCALE: Locale = "fr";

/** Type guard : la string est-elle une locale supportée ? */
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
