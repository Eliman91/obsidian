/** Métadonnées globales du site (URL canonique, nom). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://obsidian-mauve-chi.vercel.app";

export const SITE_NAME = "OBSIDIAN";

/** Portail de compte client hébergé par Shopify (connexion / inscription). */
export const SHOP_ACCOUNT_URL = "https://1jbrjy-qc.myshopify.com/account";

/**
 * Code promo de bienvenue, appliqué automatiquement à la création
 * du panier (levier CRO : zéro friction). Shopify l'écarte de
 * lui-même si le client n'y a plus droit (déjà utilisé, etc.).
 * Doit rester synchronisé avec le code créé dans Shopify Admin.
 */
export const WELCOME_DISCOUNT_CODE = "WELCOME10";

/* -------------------------------------------------------------
   CONTACT — pour joindre la boutique en cas de problème.
   ------------------------------------------------------------- */
export const CONTACT_EMAIL = "eliesse.chaib@gmail.com";

/* -------------------------------------------------------------
   DROP — date du prochain lancement (crée l'événement + l'attente).
   Format ISO avec fuseau. Modifie juste cette ligne pour changer la
   date. Passe la date : le compte à rebours devient "Ouvert" tout seul.
   ------------------------------------------------------------- */
export const DROP_DATE = "2026-07-23T18:00:00+02:00";

/**
 * Numéro WhatsApp au format international, chiffres uniquement (sans + ni espaces).
 * Laisser VIDE tant qu'il n'y a pas de numéro dédié : le bouton WhatsApp
 * n'apparaît que lorsque ce champ est renseigné (ex. "33612345678").
 */
export const WHATSAPP_NUMBER = "";

/** true si un numéro WhatsApp est configuré → affiche le bouton. */
export const HAS_WHATSAPP = WHATSAPP_NUMBER.length > 0;

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
