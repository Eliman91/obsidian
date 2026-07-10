import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "../../dictionaries";
import { isLocale } from "@/lib/i18n";
import { getGadgetByHandle, getGadgets, getCollectionByHandle } from "@/lib/shopify";
import { SITE_URL, localizedAlternates } from "@/lib/site";
import { formatPrice, truncateAtWord, safeJsonLd } from "@/lib/format";
import { formatDropDate, isComingSoon } from "@/lib/drop";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { VariantPurchase } from "@/components/ui/VariantPurchase";
import { WaitlistSignup } from "@/components/ui/WaitlistSignup";
import { ReassuranceBar } from "@/components/ui/ReassuranceBar";
import { ScarcityBadge } from "@/components/ui/ScarcityBadge";
import { ProductCard } from "@/components/ui/ProductCard";
import { StickyBuyBar } from "@/components/ui/StickyBuyBar";
import { ProductAnalytics } from "@/components/ui/ProductAnalytics";

export const revalidate = 300;

interface PageParams {
  params: Promise<{ locale: string; handle: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, handle } = await params;
  const gadget = await getGadgetByHandle(
    handle,
    isLocale(locale) ? locale : "fr",
  ).catch(() => null);
  if (!gadget) {
    return {
      title:
        locale === "en"
          ? "Product not found — OBSIDIAN"
          : "Produit introuvable — OBSIDIAN",
    };
  }

  // Priorité aux champs SEO rédigés dans Shopify (Admin > Référencement) ;
  // sinon repli sur un title généré + une description coupée entre deux mots.
  const title = gadget.seo.title ?? `${gadget.title} — OBSIDIAN`;
  const description =
    gadget.seo.description ?? truncateAtWord(gadget.description, 155);
  const images = gadget.featuredImage
    ? [
        {
          url: gadget.featuredImage.url,
          alt: gadget.featuredImage.altText ?? gadget.title,
        },
      ]
    : undefined;

  return {
    title,
    description,
    // Canonical propre à la page produit (sinon héritage de l'accueil → doublon SEO).
    alternates: localizedAlternates(`/produit/${handle}`, locale),
    openGraph: {
      type: "website",
      url: `/${locale}/produit/${handle}`,
      title,
      description,
      ...(images && { images }),
    },
    // Sans surcharge explicite, les cartes Twitter héritent du layout
    // (titre/description de l'accueil) → mauvais texte au partage.
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images && { images: images.map((i) => i.url) }),
    },
  };
}

export default async function ProductPage({ params }: PageParams) {
  const { locale, handle } = await params;
  if (!isLocale(locale)) notFound();

  const [gadget, dict, allGadgets, antiStress] = await Promise.all([
    getGadgetByHandle(handle, locale).catch(() => null),
    getDictionary(locale),
    getGadgets(6, locale).catch(() => []),
    // Collection « Anti-stress » (Pulse/Zephyr/Cryo) pour un cross-sell ciblé.
    getCollectionByHandle("anti-stress", locale).catch(() => null),
  ]);

  if (!gadget) notFound();

  // Cross-sell : si le produit appartient à la collection anti-stress, on
  // propose ses voisins de collection (rituel cohérent) ; sinon repli sur
  // les best-sellers. On exclut toujours la fiche affichée.
  const antiStressMembers = antiStress?.gadgets ?? [];
  const inAntiStress = antiStressMembers.some((g) => g.handle === handle);
  const related = (inAntiStress ? antiStressMembers : allGadgets)
    .filter((g) => g.handle !== handle)
    .slice(0, 3);

  const productUrl = `${SITE_URL}/${locale}/produit/${handle}`;
  // Drop à venir (tag Shopify) : visible mais non achetable → liste d'attente.
  const comingSoon = isComingSoon(gadget);

  // priceValidUntil : prix garanti 90 jours glissants (régénéré par l'ISR).
  // Évite l'avertissement Search Console « priceValidUntil manquant ».
  // Server Component évalué à la revalidation (pas de re-render client) :
  // la date « impure » est volontaire et stable pour tout le cycle ISR.
  // eslint-disable-next-line react-hooks/purity
  const priceValidUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // Donnée structurée Product (rich snippets moteurs de recherche).
  // sku + politiques retour/livraison : lèvent les avertissements
  // Search Console et débloquent l'affichage Marchand enrichi.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: gadget.title,
    url: productUrl,
    image: gadget.featuredImage ? [gadget.featuredImage.url] : undefined,
    description: gadget.description,
    ...(gadget.sku && { sku: gadget.sku }),
    brand: { "@type": "Brand", name: "OBSIDIAN" },
    offers: {
      "@type": "Offer",
      url: productUrl,
      price: gadget.price.amount,
      priceCurrency: gadget.price.currencyCode,
      priceValidUntil,
      availability: comingSoon
        ? "https://schema.org/PreOrder"
        : gadget.availableForSale
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      // Retours 30 jours (aligné sur la FAQ et les CGV Shopify).
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "FR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
      },
      // Livraison France : série préparée à la demande. Délai total annoncé
      // sur le site = 10 à 20 j (préparation 2-4 j + transit 8-16 j). Doit
      // rester cohérent avec le messaging « Expédition suivie sous 10 à 20 jours ».
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "FR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 4,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 8,
            maxValue: 16,
            unitCode: "DAY",
          },
        },
      },
    },
  };

  // Fil d'Ariane structuré : situe la fiche dans l'arborescence du site.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "OBSIDIAN",
        item: `${SITE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: gadget.title,
        item: productUrl,
      },
    ],
  };

  return (
    <main className="mx-auto max-w-6xl px-6 pb-28 pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <ProductAnalytics
        item={{
          id: gadget.variantId ?? gadget.id,
          name: gadget.title,
          price: gadget.price.amount,
          quantity: 1,
        }}
        currency={gadget.price.currencyCode}
      />
      <Link
        href={`/${locale}#collection`}
        className="mb-10 inline-block text-xs tracking-widest text-graphite uppercase transition-colors hover:text-cyan"
      >
        ← {dict.hero.eyebrow}
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Visuel */}
        <div className="glass glass-liquid relative aspect-square overflow-hidden rounded-[--radius-luxe] bg-gunmetal">
          {gadget.featuredImage && (
            <Image
              src={gadget.featuredImage.url}
              alt={gadget.featuredImage.altText ?? gadget.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>

        {/* Détails */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold text-holo md:text-4xl">
            {gadget.title}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-titanium">
              {formatPrice(gadget.price.amount, gadget.price.currencyCode, locale)}
            </span>
            {gadget.compareAtPrice && (
              <span className="text-sm text-graphite line-through">
                {formatPrice(
                  gadget.compareAtPrice.amount,
                  gadget.compareAtPrice.currencyCode,
                  locale,
                )}
              </span>
            )}
          </div>

          <Link
            href={`/${locale}/savoir-faire`}
            className="mt-2 inline-block text-xs text-graphite underline decoration-graphite/30 underline-offset-4 transition-colors hover:text-cyan"
          >
            {locale === "fr" ? "Pourquoi ce prix ?" : "Why this price?"}
          </Link>

          <div className="mt-6">
            <ScarcityBadge
              editionSize={gadget.editionSize}
              remaining={gadget.quantityAvailable}
              locale={locale}
            />
          </div>

          <div
            className="prose-obsidian mt-8 space-y-3 text-sm leading-relaxed text-graphite [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-chrome"
            dangerouslySetInnerHTML={{ __html: gadget.descriptionHtml }}
          />

          <div className="mt-10">
            {comingSoon ? (
              /* Drop à venir : liste d'attente au lieu de l'achat. */
              <WaitlistSignup locale={locale} dropDate={formatDropDate(locale)} />
            ) : gadget.variants.length > 1 ? (
              /* Produit à options (taille, gravure…) : sélecteur complet. */
              <VariantPurchase
                gadget={gadget}
                locale={locale}
                labels={{ addToCart: dict.product.addToCart, soldOut: dict.product.soldOut }}
              />
            ) : (
              <AddToCartButton
                gadget={gadget}
                labels={{ addToCart: dict.product.addToCart, soldOut: dict.product.soldOut }}
                className="px-8 py-3 text-sm"
              />
            )}
          </div>

          {/* Réversion du risque : rassure juste après le bouton d'achat.
              Cohérent avec la politique retours 30 j (FAQ + JSON-LD). */}
          <div className="mt-4 flex items-center gap-2.5 rounded-[--radius-luxe] border border-cyan/20 bg-cyan/[0.05] px-4 py-3 text-sm text-chrome">
            <span aria-hidden className="text-base">🛡️</span>
            <span>
              <span className="font-medium text-cyan">
                {locale === "fr" ? "Satisfait ou remboursé" : "Money-back guarantee"}
              </span>{" "}
              {locale === "fr"
                ? "sous 30 jours — retour simple."
                : "within 30 days — easy returns."}
            </span>
          </div>

          <div className="mt-8">
            <ReassuranceBar locale={locale} />
          </div>
        </div>
      </div>

      {/* CROSS-SELL — augmente le panier moyen */}
      {related.length > 0 && (
        <section className="mt-28">
          <h2 className="mb-10 text-center text-2xl font-semibold text-holo md:text-3xl">
            {locale === "fr" ? "Vous aimerez aussi" : "You may also like"}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((g) => (
              <ProductCard
                key={g.id}
                gadget={g}
                locale={locale}
                labels={dict.product}
              />
            ))}
          </div>
        </section>
      )}

      {/* Barre d'achat mobile : produits achetables mono-variante seulement
          (un produit à options doit passer par le sélecteur ci-dessus). */}
      {!comingSoon && gadget.variants.length <= 1 && (
        <StickyBuyBar
          gadget={gadget}
          locale={locale}
          labels={{ addToCart: dict.product.addToCart, soldOut: dict.product.soldOut }}
        />
      )}
    </main>
  );
}
