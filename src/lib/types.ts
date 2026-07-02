/**
 * Types métier partagés — domaine e-commerce ultra-luxe.
 * Centralisés ici pour être réutilisés côté serveur (lib) et client (composants).
 */

export type Locale = "fr" | "en";

/** Prix normalisé (Shopify renvoie amount en string). */
export interface Money {
  amount: number;
  currencyCode: string;
}

export interface MediaImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

/**
 * Metafields personnalisés d'un gadget de luxe.
 * Renseignés dans l'admin Shopify (namespace "custom").
 */
export interface GadgetMetafields {
  /** URL du modèle 3D (.glb / .gltf) pour le configurateur GadgetViewer. */
  model3dUrl: string | null;
  /** Playback ID Mux pour la vidéo de fond en streaming ultra-rapide. */
  muxPlaybackId: string | null;
  /** Matériau dominant (titane, chrome…) → pilote l'environnement HDRI. */
  material: string | null;
}

/** Produit normalisé, prêt à consommer par l'UI. */
export interface Gadget {
  id: string;
  handle: string;
  title: string;
  description: string;
  /** Description au format HTML (listes, gras…) pour la page produit. */
  descriptionHtml: string;
  featuredImage: MediaImage | null;
  /** merchandiseId de la première variante (pour l'ajout au panier). */
  variantId: string | null;
  /** SKU de la première variante (donnée structurée Product). */
  sku: string | null;
  /**
   * Champs SEO renseignés dans Shopify (Admin > Référencement).
   * Prioritaires sur les valeurs générées pour title/meta description.
   */
  seo: { title: string | null; description: string | null };
  price: Money;
  compareAtPrice: Money | null;
  availableForSale: boolean;
  /**
   * Taille totale de la série (édition limitée). null si non défini.
   * Metafield custom.edition_size — pilote le badge de rareté.
   */
  editionSize: number | null;
  /**
   * Nombre de pièces encore disponibles (stock live Shopify).
   * null si le droit `unauthenticated_read_product_inventory` n'est pas
   * accordé au token → le badge retombe sur la seule taille d'édition.
   */
  quantityAvailable: number | null;
  metafields: GadgetMetafields;
}
