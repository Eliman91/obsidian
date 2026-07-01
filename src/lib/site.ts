/** Métadonnées globales du site (URL canonique, nom). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://obsidian-mauve-chi.vercel.app";

export const SITE_NAME = "OBSIDIAN";

/** Portail de compte client hébergé par Shopify (connexion / inscription). */
export const SHOP_ACCOUNT_URL = "https://1jbrjy-qc.myshopify.com/account";

/* -------------------------------------------------------------
   CONTACT — pour joindre la boutique en cas de problème.
   ------------------------------------------------------------- */
export const CONTACT_EMAIL = "eliesse.chaib@gmail.com";

/**
 * Numéro WhatsApp au format international, chiffres uniquement (sans + ni espaces).
 * ⚠️ PLACEHOLDER — à remplacer par le vrai numéro (ex. "33612345678").
 */
export const WHATSAPP_NUMBER = "33600000000";

/** Lien direct vers la conversation WhatsApp (message pré-rempli). */
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Bonjour OBSIDIAN, j'ai une question :",
)}`;

/**
 * Génère les balises canonical + hreflang pour une page localisée.
 * IMPORTANT : chaque page doit déclarer SA propre URL canonique
 * (sinon elle hérite de celle du layout et Google la considère
 * comme un doublon de la page d'accueil → désindexation).
 * @param path Chemin SANS la locale (ex. "/produit/mon-gadget", "" pour l'accueil).
 */
export function localizedAlternates(path: string, locale: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      fr: `/fr${path}`,
      en: `/en${path}`,
      "x-default": `/fr${path}`,
    },
  };
}
