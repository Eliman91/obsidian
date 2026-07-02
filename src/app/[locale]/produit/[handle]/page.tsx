import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "../../dictionaries";
import { isLocale } from "@/lib/i18n";
import { getGadgetByHandle, getGadgets } from "@/lib/shopify";
import { SITE_URL, localizedAlternates } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { ReassuranceBar } from "@/components/ui/ReassuranceBar";
import { ScarcityBadge } from "@/components/ui/ScarcityBadge";
import { ProductCard } from "@/components/ui/ProductCard";
import { StickyBuyBar } from "@/components/ui/StickyBuyBar";

export const revalidate = 300;

interface PageParams {
  params: Promise<{ locale: string; handle: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, handle } = await params;
  const gadget = await getGadgetByHandle(handle).catch(() => null);
  if (!gadget) {
    return {
      title:
        locale === "en"
          ? "Product not found — OBSIDIAN"
          : "Produit introuvable — OBSIDIAN",
    };
  }
  return {
    title: `${gadget.title} — OBSIDIAN`,
    description: gadget.description.slice(0, 155),
    // Canonical propre à la page produit (sinon héritage de l'accueil → doublon SEO).
    alternates: localizedAlternates(`/produit/${handle}`, locale),
    openGraph: {
      type: "website",
      url: `/${locale}/produit/${handle}`,
      title: `${gadget.title} — OBSIDIAN`,
      description: gadget.description.slice(0, 155),
      ...(gadget.featuredImage && { images: [{ url: gadget.featuredImage.url }] }),
    },
  };
}

export default async function ProductPage({ params }: PageParams) {
  const { locale, handle } = await params;
  if (!isLocale(locale)) notFound();

  const [gadget, dict, allGadgets] = await Promise.all([
    getGadgetByHandle(handle).catch(() => null),
    getDictionary(locale),
    getGadgets(6).catch(() => []),
  ]);

  if (!gadget) notFound();

  // Cross-sell : autres produits, en excluant celui affiché.
  const related = allGadgets.filter((g) => g.handle !== handle).slice(0, 3);

  // Donnée structurée Product (rich snippets moteurs de recherche).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: gadget.title,
    url: `${SITE_URL}/${locale}/produit/${handle}`,
    image: gadget.featuredImage ? [gadget.featuredImage.url] : undefined,
    description: gadget.description,
    brand: { "@type": "Brand", name: "OBSIDIAN" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/${locale}/produit/${handle}`,
      price: gadget.price.amount,
      priceCurrency: gadget.price.currencyCode,
      availability: gadget.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="mx-auto max-w-6xl px-6 pb-28 pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href={`/${locale}#collection`}
        className="mb-10 inline-block text-xs tracking-widest text-graphite uppercase transition-colors hover:text-cyan"
      >
        ← {dict.hero.eyebrow}
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Visuel */}
        <div className="glass relative aspect-square overflow-hidden rounded-[--radius-luxe] bg-gunmetal">
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
            <AddToCartButton
              gadget={gadget}
              labels={{ addToCart: dict.product.addToCart, soldOut: dict.product.soldOut }}
              className="px-8 py-3 text-sm"
            />
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

      <StickyBuyBar
        gadget={gadget}
        locale={locale}
        labels={{ addToCart: dict.product.addToCart, soldOut: dict.product.soldOut }}
      />
    </main>
  );
}
