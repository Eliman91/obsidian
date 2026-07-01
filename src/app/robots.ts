import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Génère /robots.txt et pointe vers le sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
