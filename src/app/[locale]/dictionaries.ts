import "server-only";
import type { Locale } from "@/lib/types";

/**
 * Chargement paresseux des dictionnaires de traduction.
 * Seul le JSON de la locale demandée est inclus dans le bundle serveur.
 * Le type `Dictionary` est inféré automatiquement depuis fr.json.
 */
const dictionaries = {
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["fr"]>>;

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
