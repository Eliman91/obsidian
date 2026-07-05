import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "../../dictionaries";
import { isLocale } from "@/lib/i18n";
import { getCollectionByHandle, getCollections } from "@/lib/shopify";
import { SITE_URL, localizedAlternates } from "@/lib/site";
import { truncateAtWord, safeJsonLd } from "@/lib/format";
import { ProductGrid } from "@/components/ui/ProductGrid";

/* =============================================================
   PAGE COLLECTION — atterrissage SEO par catégorie.
   Contenu piloté par les collections Shopify (titre, description,
   champs SEO, produits) + maillage interne vers les fiches.
   ============================================================= */

export const revalidate = 300;

interface PageParams {
  params: Promise<{ locale: string; handle: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, handle } = await params;
  const collection = await getCollectionByHandle(
    handle,
    isLocale(locale) ? locale : "fr",
  ).catch(() => null);
  if (!collection) {
    return {
      title:
        locale === "en"
          ? "Collection not found — OBSIDIAN"
          : "Collection introuvable — OBSIDIAN",
    };
  }

  // Priorité aux champs SEO Shopify, repli sur les contenus de la collection.
  const title = collection.seo.title ?? `${collection.title} — OBSIDIAN`;
  const description = collection.seo.description
    ? collection.seo.description
    : collection.description
      ? truncateAtWord(collection.description, 155)
      : undefined;

  return {
    title,
    description,
    alternates: localizedAlternates(`/collection/${handle}`, locale),
    openGraph: {
      type: "website",
      url: `/${locale}/collection/${handle}`,
      title,
      description,
      ...(collection.image && {
        images: [
          {
            url: collection.image.url,
            alt: collection.image.altText ?? collection.title,
          },
        ],
      }),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CollectionPage({ params }: PageParams) {
  const { locale, handle } = await params;
  if (!isLocale(locale)) notFound();

  const [collection, dict, allCollections] = await Promise.all([
    getCollectionByHandle(handle, locale).catch(() => null),
    getDictionary(locale),
    getCollections(10, locale).catch(() => []),
  ]);

  if (!collection) notFound();

  const collectionUrl = `${SITE_URL}/${locale}/collection/${handle}`;
  // Autres collections → navigation transversale (maillage interne).
  const others = allCollections.filter((c) => c.handle !== handle);

  // CollectionPage + ItemList : liste structurée des produits de la catégorie.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    url: collectionUrl,
    ...(collection.description && { description: collection.description }),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: collection.gadgets.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/${locale}/produit/${g.handle}`,
        name: g.title,
      })),
    },
  };

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
        name: collection.title,
        item: collectionUrl,
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

      <Link
        href={`/${locale}#collection`}
        className="mb-10 inline-block text-xs tracking-widest text-graphite uppercase transition-colors hover:text-cyan"
      >
        ← {dict.hero.eyebrow}
      </Link>

      <header className="mb-14 text-center">
        <p className="mb-4 font-mono text-xs tracking-[0.4em] text-graphite uppercase">
          {locale === "fr" ? "Collection" : "Collection"}
        </p>
        <h1 className="text-4xl font-semibold text-holo md:text-5xl">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-graphite">
            {collection.description}
          </p>
        )}
      </header>

      <ProductGrid
        gadgets={collection.gadgets}
        locale={locale}
        labels={dict.product}
      />

      {/* Maillage interne : les autres collections. */}
      {others.length > 0 && (
        <nav className="mt-20 text-center" aria-label="Collections">
          <p className="mb-5 font-mono text-[11px] tracking-[0.3em] text-graphite uppercase">
            {locale === "fr" ? "Explorer aussi" : "Also explore"}
          </p>
          <ul className="flex flex-wrap justify-center gap-3">
            {others.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/${locale}/collection/${c.handle}`}
                  className="glass inline-block rounded-full px-5 py-2 text-xs tracking-wide text-chrome transition-colors hover:text-cyan"
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </main>
  );
}
