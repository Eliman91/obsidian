import "server-only";
import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import type { Gadget, GadgetMetafields, Money } from "@/lib/types";

/* =============================================================
   CLIENT SHOPIFY STOREFRONT API (Shopify Plus)
   Docs : https://shopify.dev/docs/api/storefront
   Toutes les requêtes sont exécutées côté serveur (server-only).
   ============================================================= */

const SHOPIFY_API_VERSION = "2026-07";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[shopify] Variable d'environnement manquante : ${name}. ` +
        `Renseigne-la dans .env.local (voir .env.example).`,
    );
  }
  return value;
}

/**
 * Instance singleton du client Storefront.
 * Token public Storefront (compatible plan Basic, créé via une app custom).
 * On garde l'appel côté serveur (server-only) pour ne pas alourdir le client.
 */
export const shopifyClient = createStorefrontApiClient({
  storeDomain: requireEnv("SHOPIFY_STORE_DOMAIN"),
  apiVersion: SHOPIFY_API_VERSION,
  publicAccessToken: requireEnv("SHOPIFY_STOREFRONT_TOKEN"),
});

/* -------------------------------------------------------------
   FRAGMENTS & QUERIES GraphQL (optimisées : on ne demande QUE
   les champs utiles + les metafields personnalisés du luxe).
   ------------------------------------------------------------- */

const GADGET_FRAGMENT = /* GraphQL */ `
  fragment GadgetFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    featuredImage {
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    # Première variante disponible → merchandiseId pour l'ajout au panier.
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
    # Metafields custom : modèle 3D (.glb/.gltf), vidéo Mux, matériau.
    model3d: metafield(namespace: "custom", key: "model_3d") {
      reference {
        ... on GenericFile {
          url
        }
      }
    }
    muxPlaybackId: metafield(namespace: "custom", key: "mux_playback_id") {
      value
    }
    material: metafield(namespace: "custom", key: "material") {
      value
    }
  }
`;

const PRODUCTS_QUERY = /* GraphQL */ `
  ${GADGET_FRAGMENT}
  query GetGadgets($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ...GadgetFields
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${GADGET_FRAGMENT}
  query GetGadgetByHandle($handle: String!) {
    product(handle: $handle) {
      ...GadgetFields
    }
  }
`;

/* -------------------------------------------------------------
   TYPES bruts de la réponse GraphQL (avant normalisation).
   ------------------------------------------------------------- */

interface RawMoney {
  amount: string;
  currencyCode: string;
}

interface RawGadget {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  featuredImage: {
    url: string;
    altText: string | null;
    width: number;
    height: number;
  } | null;
  priceRange: { minVariantPrice: RawMoney };
  compareAtPriceRange: { minVariantPrice: RawMoney };
  variants: { nodes: { id: string; availableForSale: boolean }[] };
  model3d: { reference: { url: string } | null } | null;
  muxPlaybackId: { value: string } | null;
  material: { value: string } | null;
}

/* -------------------------------------------------------------
   NORMALISATION : RawGadget -> Gadget (types propres pour l'UI).
   ------------------------------------------------------------- */

function toMoney(raw: RawMoney): Money {
  return { amount: Number.parseFloat(raw.amount), currencyCode: raw.currencyCode };
}

function toMetafields(raw: RawGadget): GadgetMetafields {
  return {
    model3dUrl: raw.model3d?.reference?.url ?? null,
    muxPlaybackId: raw.muxPlaybackId?.value ?? null,
    material: raw.material?.value ?? null,
  };
}

function normalizeGadget(raw: RawGadget): Gadget {
  const price = toMoney(raw.priceRange.minVariantPrice);
  const compareAt = toMoney(raw.compareAtPriceRange.minVariantPrice);
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    availableForSale: raw.availableForSale,
    featuredImage: raw.featuredImage,
    variantId: raw.variants.nodes[0]?.id ?? null,
    price,
    // On n'expose compareAtPrice que s'il est réellement supérieur (vraie promo).
    compareAtPrice: compareAt.amount > price.amount ? compareAt : null,
    metafields: toMetafields(raw),
  };
}

/* -------------------------------------------------------------
   API PUBLIQUE de la lib.
   ------------------------------------------------------------- */

/** Récupère les meilleurs gadgets (par défaut 12). */
export async function getGadgets(first = 12): Promise<Gadget[]> {
  const { data, errors } = await shopifyClient.request<{
    products: { nodes: RawGadget[] };
  }>(PRODUCTS_QUERY, { variables: { first } });

  if (errors) {
    throw new Error(`[shopify] getGadgets : ${errors.message ?? "erreur GraphQL"}`);
  }
  return (data?.products.nodes ?? []).map(normalizeGadget);
}

/** Récupère un gadget par son handle (URL), ou null s'il n'existe pas. */
export async function getGadgetByHandle(handle: string): Promise<Gadget | null> {
  const { data, errors } = await shopifyClient.request<{
    product: RawGadget | null;
  }>(PRODUCT_BY_HANDLE_QUERY, { variables: { handle } });

  if (errors) {
    throw new Error(
      `[shopify] getGadgetByHandle : ${errors.message ?? "erreur GraphQL"}`,
    );
  }
  return data?.product ? normalizeGadget(data.product) : null;
}

/* -------------------------------------------------------------
   PAGES LÉGALES (policies gérées dans Shopify Admin > Legal).
   ------------------------------------------------------------- */

export interface ShopPolicy {
  title: string;
  body: string;
}

const SHOP_POLICIES_QUERY = /* GraphQL */ `
  query ShopPolicies {
    shop {
      privacyPolicy { title body }
      refundPolicy { title body }
      termsOfService { title body }
      shippingPolicy { title body }
    }
  }
`;

/** Récupère les pages légales définies dans Shopify (ignore celles absentes). */
export async function getShopPolicies(): Promise<ShopPolicy[]> {
  const { data } = await shopifyClient.request<{
    shop: Record<string, ShopPolicy | null>;
  }>(SHOP_POLICIES_QUERY);

  // Ordre d'affichage voulu.
  const order = ["termsOfService", "shippingPolicy", "refundPolicy", "privacyPolicy"];
  return order
    .map((key) => data?.shop[key])
    .filter((p): p is ShopPolicy => p != null && p.body.trim().length > 0);
}

/* -------------------------------------------------------------
   CHECKOUT : création d'un panier Shopify → URL de paiement.
   ------------------------------------------------------------- */

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface CheckoutLineInput {
  variantId: string;
  quantity: number;
}

/**
 * Crée un panier Shopify avec les lignes fournies et renvoie l'URL
 * de paiement sécurisée (checkout Shopify hébergé).
 */
export async function createCheckoutUrl(
  lines: CheckoutLineInput[],
): Promise<string> {
  if (lines.length === 0) {
    throw new Error("[shopify] createCheckoutUrl : panier vide.");
  }

  const cartLines = lines.map((l) => ({
    merchandiseId: l.variantId,
    quantity: l.quantity,
  }));

  const { data, errors } = await shopifyClient.request<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { field: string[] | null; message: string }[];
    };
  }>(CART_CREATE_MUTATION, { variables: { lines: cartLines } });

  if (errors) {
    throw new Error(`[shopify] createCheckoutUrl : ${errors.message ?? "erreur GraphQL"}`);
  }
  const userErrors = data?.cartCreate.userErrors ?? [];
  if (userErrors.length > 0) {
    throw new Error(`[shopify] createCheckoutUrl : ${userErrors[0].message}`);
  }
  const url = data?.cartCreate.cart?.checkoutUrl;
  if (!url) {
    throw new Error("[shopify] createCheckoutUrl : URL de paiement absente.");
  }
  return url;
}
