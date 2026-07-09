import "server-only";
import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import type {
  Gadget,
  GadgetMetafields,
  GadgetVariant,
  Locale,
  Money,
} from "@/lib/types";
import { COMING_SOON_TAG } from "@/lib/drop";

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

/**
 * Convertit une locale du site en LanguageCode Shopify pour la
 * directive @inContext : les contenus traduits (Translate & Adapt)
 * sont renvoyés dans la langue demandée, avec repli automatique
 * sur la langue principale si la traduction n'existe pas.
 */
function toLanguageCode(locale: Locale): "FR" | "EN" {
  return locale === "en" ? "EN" : "FR";
}

const GADGET_FRAGMENT = /* GraphQL */ `
  fragment GadgetFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    tags
    # Champs SEO renseignés dans l'admin Shopify (prioritaires pour les metas).
    seo {
      title
      description
    }
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
    # Toutes les variantes (max 50) → sélecteur taille/gravure + merchandiseId.
    # quantityAvailable = stock live (rareté). Nécessite le droit
    # unauthenticated_read_product_inventory : sinon renvoyé null (dégradation OK).
    variants(first: 50) {
      nodes {
        id
        title
        sku
        availableForSale
        quantityAvailable
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    # Taille de l'édition limitée (série numérotée).
    editionSize: metafield(namespace: "custom", key: "edition_size") {
      value
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
  query GetGadgets($first: Int!, $language: LanguageCode)
  @inContext(language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ...GadgetFields
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${GADGET_FRAGMENT}
  query GetGadgetByHandle($handle: String!, $language: LanguageCode)
  @inContext(language: $language) {
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
  tags: string[];
  seo: { title: string | null; description: string | null } | null;
  featuredImage: {
    url: string;
    altText: string | null;
    width: number;
    height: number;
  } | null;
  priceRange: { minVariantPrice: RawMoney };
  compareAtPriceRange: { minVariantPrice: RawMoney };
  variants: {
    nodes: {
      id: string;
      title: string;
      sku: string | null;
      availableForSale: boolean;
      quantityAvailable: number | null;
      price: RawMoney;
      selectedOptions: { name: string; value: string }[];
    }[];
  };
  editionSize: { value: string } | null;
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

function toVariant(raw: RawGadget["variants"]["nodes"][number]): GadgetVariant {
  return {
    id: raw.id,
    title: raw.title,
    sku: raw.sku || null,
    availableForSale: raw.availableForSale,
    quantityAvailable: raw.quantityAvailable ?? null,
    price: toMoney(raw.price),
    selectedOptions: raw.selectedOptions ?? [],
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
    tags: raw.tags ?? [],
    seo: {
      title: raw.seo?.title ?? null,
      description: raw.seo?.description ?? null,
    },
    featuredImage: raw.featuredImage,
    variantId: raw.variants.nodes[0]?.id ?? null,
    sku: raw.variants.nodes[0]?.sku || null,
    variants: (raw.variants.nodes ?? []).map(toVariant),
    price,
    // On n'expose compareAtPrice que s'il est réellement supérieur (vraie promo).
    compareAtPrice: compareAt.amount > price.amount ? compareAt : null,
    editionSize: raw.editionSize ? Number.parseInt(raw.editionSize.value, 10) : null,
    quantityAvailable: raw.variants.nodes[0]?.quantityAvailable ?? null,
    metafields: toMetafields(raw),
  };
}

/* -------------------------------------------------------------
   API PUBLIQUE de la lib.
   ------------------------------------------------------------- */

/** Récupère les meilleurs gadgets (par défaut 12), dans la langue demandée. */
export async function getGadgets(first = 12, locale: Locale = "fr"): Promise<Gadget[]> {
  const { data, errors } = await shopifyClient.request<{
    products: { nodes: RawGadget[] };
  }>(PRODUCTS_QUERY, {
    variables: { first, language: toLanguageCode(locale) },
  });

  // On ne bloque que si AUCUNE donnée : Shopify renvoie des erreurs de champ
  // (ex. quantityAvailable sans le scope stock) tout en fournissant le reste.
  if (!data) {
    throw new Error(`[shopify] getGadgets : ${errors?.message ?? "erreur GraphQL"}`);
  }
  return (data.products?.nodes ?? []).map(normalizeGadget);
}

/** Récupère un gadget par son handle (URL) dans la langue demandée, ou null. */
export async function getGadgetByHandle(
  handle: string,
  locale: Locale = "fr",
): Promise<Gadget | null> {
  const { data, errors } = await shopifyClient.request<{
    product: RawGadget | null;
  }>(PRODUCT_BY_HANDLE_QUERY, {
    variables: { handle, language: toLanguageCode(locale) },
  });

  // Erreurs de champ non bloquantes (ex. stock sans scope) : on garde les données.
  if (!data) {
    throw new Error(
      `[shopify] getGadgetByHandle : ${errors?.message ?? "erreur GraphQL"}`,
    );
  }
  return data.product ? normalizeGadget(data.product) : null;
}

/* -------------------------------------------------------------
   NEWSLETTER : inscription d'un email comme client Shopify.
   ------------------------------------------------------------- */

const CUSTOMER_CREATE_MUTATION = /* GraphQL */ `
  mutation NewsletterSignup($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id }
      customerUserErrors { code field message }
    }
  }
`;

/**
 * Inscrit un email (crée un client Shopify avec un mot de passe aléatoire).
 * Un email déjà inscrit n'est pas une erreur : on considère l'inscription OK.
 */
export async function subscribeEmail(email: string): Promise<void> {
  // Mot de passe fort aléatoire (le client le réinitialisera s'il crée un compte).
  const password = `${crypto.randomUUID()}Aa1!`;

  const { data, errors } = await shopifyClient.request<{
    customerCreate: {
      customer: { id: string } | null;
      customerUserErrors: { code: string | null; field: string[] | null; message: string }[];
    };
  }>(CUSTOMER_CREATE_MUTATION, {
    // acceptsMarketing: true → consentement marketing enregistré dans Shopify.
    // Sans lui, l'email est capturé mais NON abonné → newsletters impossibles.
    variables: { input: { email, password, acceptsMarketing: true } },
  });

  if (errors) {
    throw new Error(`[shopify] subscribeEmail : ${errors.message ?? "erreur GraphQL"}`);
  }

  const userErrors = data?.customerCreate.customerUserErrors ?? [];
  // "TAKEN" = email déjà client → déjà inscrit, on ne bloque pas.
  const fatal = userErrors.find((e) => e.code !== "TAKEN");
  if (fatal) {
    throw new Error(`[shopify] subscribeEmail : ${fatal.message}`);
  }
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
  mutation CartCreate(
    $lines: [CartLineInput!]!
    $discountCodes: [String!]
    $buyerIdentity: CartBuyerIdentityInput
    $language: LanguageCode
  ) @inContext(language: $language) {
    cartCreate(
      input: {
        lines: $lines
        discountCodes: $discountCodes
        buyerIdentity: $buyerIdentity
      }
    ) {
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
  /**
   * Attributs de ligne (line item properties), ex. le texte de gravure.
   * Transmis à Shopify → visibles sur la commande et le bon de préparation.
   */
  attributes?: { key: string; value: string }[];
}

export interface CheckoutOptions {
  /** Langue du checkout (page de paiement Shopify localisée). */
  locale?: Locale;
  /** Pays présumé de l'acheteur (adresse pré-contextualisée). */
  countryCode?: string;
  /**
   * Codes promo appliqués d'office au panier. Shopify ignore
   * silencieusement un code non applicable : aucun risque d'erreur.
   */
  discountCodes?: string[];
}

const VARIANT_TAGS_QUERY = /* GraphQL */ `
  query VariantTags($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        product {
          tags
        }
      }
    }
  }
`;

/**
 * Garde-fou serveur : rejette toute ligne dont le produit est un
 * « drop à venir » (l'UI ne le propose plus, mais un panier stocké
 * avant la bascule — ou une requête forgée — pourrait encore le tenter).
 */
async function assertPurchasable(lines: CheckoutLineInput[]): Promise<void> {
  const { data } = await shopifyClient.request<{
    nodes: ({ id: string; product: { tags: string[] } } | null)[];
  }>(VARIANT_TAGS_QUERY, {
    variables: { ids: lines.map((l) => l.variantId) },
  });

  const blocked = (data?.nodes ?? []).some(
    (n) => n?.product.tags.includes(COMING_SOON_TAG),
  );
  if (blocked) {
    throw new Error(
      "[shopify] createCheckoutUrl : un produit du panier n'est pas encore en vente (drop à venir).",
    );
  }
}

/**
 * Crée un panier Shopify avec les lignes fournies et renvoie l'URL
 * de paiement sécurisée (checkout Shopify hébergé).
 */
export async function createCheckoutUrl(
  lines: CheckoutLineInput[],
  options: CheckoutOptions = {},
): Promise<string> {
  if (lines.length === 0) {
    throw new Error("[shopify] createCheckoutUrl : panier vide.");
  }
  await assertPurchasable(lines);

  const cartLines = lines.map((l) => ({
    merchandiseId: l.variantId,
    quantity: l.quantity,
    // Attributs de ligne (gravure…) : uniquement s'il y en a.
    ...(l.attributes && l.attributes.length > 0
      ? { attributes: l.attributes }
      : {}),
  }));

  const { data, errors } = await shopifyClient.request<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { field: string[] | null; message: string }[];
    };
  }>(CART_CREATE_MUTATION, {
    variables: {
      lines: cartLines,
      discountCodes: options.discountCodes ?? [],
      buyerIdentity: options.countryCode
        ? { countryCode: options.countryCode }
        : undefined,
      language: toLanguageCode(options.locale ?? "fr"),
    },
  });

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

/* -------------------------------------------------------------
   COLLECTIONS : pages catégorie (SEO + maillage interne).
   ------------------------------------------------------------- */

export interface GadgetCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  seo: { title: string | null; description: string | null };
  image: { url: string; altText: string | null } | null;
  gadgets: Gadget[];
}

interface RawCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  seo: { title: string | null; description: string | null } | null;
  image: { url: string; altText: string | null } | null;
  products: { nodes: RawGadget[] };
}

function normalizeCollection(raw: RawCollection): GadgetCollection {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    seo: {
      title: raw.seo?.title ?? null,
      description: raw.seo?.description ?? null,
    },
    image: raw.image,
    gadgets: (raw.products?.nodes ?? []).map(normalizeGadget),
  };
}

const COLLECTION_FRAGMENT = /* GraphQL */ `
  ${GADGET_FRAGMENT}
  fragment CollectionFields on Collection {
    id
    handle
    title
    description
    seo {
      title
      description
    }
    image {
      url
      altText
    }
    products(first: 12) {
      nodes {
        ...GadgetFields
      }
    }
  }
`;

const COLLECTIONS_QUERY = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}
  query GetCollections($first: Int!, $language: LanguageCode)
  @inContext(language: $language) {
    collections(first: $first) {
      nodes {
        ...CollectionFields
      }
    }
  }
`;

const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  ${COLLECTION_FRAGMENT}
  query GetCollectionByHandle($handle: String!, $language: LanguageCode)
  @inContext(language: $language) {
    collection(handle: $handle) {
      ...CollectionFields
    }
  }
`;

/**
 * Liste les collections marchandes (la collection technique
 * « frontpage » de Shopify, vide, est exclue).
 */
export async function getCollections(
  first = 10,
  locale: Locale = "fr",
): Promise<GadgetCollection[]> {
  const { data, errors } = await shopifyClient.request<{
    collections: { nodes: RawCollection[] };
  }>(COLLECTIONS_QUERY, {
    variables: { first, language: toLanguageCode(locale) },
  });

  if (!data) {
    throw new Error(`[shopify] getCollections : ${errors?.message ?? "erreur GraphQL"}`);
  }
  return (data.collections?.nodes ?? [])
    .filter((c) => c.handle !== "frontpage")
    .map(normalizeCollection);
}

/** Récupère une collection par son handle (URL), ou null. */
export async function getCollectionByHandle(
  handle: string,
  locale: Locale = "fr",
): Promise<GadgetCollection | null> {
  const { data, errors } = await shopifyClient.request<{
    collection: RawCollection | null;
  }>(COLLECTION_BY_HANDLE_QUERY, {
    variables: { handle, language: toLanguageCode(locale) },
  });

  if (!data) {
    throw new Error(
      `[shopify] getCollectionByHandle : ${errors?.message ?? "erreur GraphQL"}`,
    );
  }
  return data.collection ? normalizeCollection(data.collection) : null;
}
