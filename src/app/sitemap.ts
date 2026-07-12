import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { getCollections, getGadgets } from "@/lib/shopify";

/** Génère /sitemap.xml : accueils localisés + produits + collections + pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let handles: string[] = [];
  let collectionHandles: string[] = [];
  try {
    handles = (await getGadgets(50)).map((g) => g.handle);
    collectionHandles = (await getCollections(20)).map((c) => c.handle);
  } catch {
    // Shopify indisponible au build : sitemap réduit aux pages statiques.
  }

  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    });
    // Pages éditoriales statiques.
    entries.push(
      {
        url: `${SITE_URL}/${locale}/manifeste`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/${locale}/savoir-faire`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/${locale}/cadeau-tech-luxe`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/${locale}/arreter-de-se-ronger-les-ongles`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/${locale}/contact`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/${locale}/legal`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.3,
      },
    );
    for (const handle of handles) {
      entries.push({
        url: `${SITE_URL}/${locale}/produit/${handle}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    // Pages collections (atterrissage SEO par catégorie).
    for (const handle of collectionHandles) {
      entries.push({
        url: `${SITE_URL}/${locale}/collection/${handle}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }
  return entries;
}
