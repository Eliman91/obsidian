import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { getGadgets } from "@/lib/shopify";

/** Génère /sitemap.xml : pages d'accueil localisées + pages produit. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let handles: string[] = [];
  try {
    handles = (await getGadgets(50)).map((g) => g.handle);
  } catch {
    // Shopify indisponible au build : sitemap réduit aux pages statiques.
  }

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    entries.push({
      url: `${SITE_URL}/${locale}`,
      changeFrequency: "weekly",
      priority: 1,
    });
    // Pages éditoriales statiques.
    entries.push(
      {
        url: `${SITE_URL}/${locale}/manifeste`,
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/${locale}/legal`,
        changeFrequency: "monthly",
        priority: 0.3,
      },
    );
    for (const handle of handles) {
      entries.push({
        url: `${SITE_URL}/${locale}/produit/${handle}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }
  return entries;
}
