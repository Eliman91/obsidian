import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Génère /robots.txt et pointe vers le sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Pages sans valeur SEO : API interne et panier (déjà en noindex).
      disallow: ["/api/", "/fr/panier", "/en/panier"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
