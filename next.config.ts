import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/* =============================================================
   CONTENT SECURITY POLICY
   Chaque directive n'autorise QUE les origines réellement
   utilisées par le site :
   - cdn.shopify.com        → images produits + modèles 3D (.glb)
   - raw.githack.com        → HDRI du préréglage drei <Environment>
                              (mieux : auto-héberger le .hdr dans /public
                              et passer files="…" pour retirer cette ligne)
   - googletagmanager / google-analytics → GA4 (chargé après consentement)
   'unsafe-inline' (script) : requis par les scripts inline de Next
   et l'init GA ; 'unsafe-eval' uniquement en dev (React Refresh).
   ============================================================= */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.shopify.com https://www.googletagmanager.com https://*.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://cdn.shopify.com https://raw.githack.com https://www.googletagmanager.com https://*.google-analytics.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/** En-têtes de sécurité appliqués à toutes les routes. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // HSTS : force HTTPS 2 ans, sous-domaines inclus (Vercel sert déjà en HTTPS).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Interdit le MIME-sniffing (un fichier servi = son Content-Type, point).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Anti-clickjacking (doublon legacy de frame-ancestors pour vieux navigateurs).
  { key: "X-Frame-Options", value: "DENY" },
  // N'envoie que l'origine aux sites tiers (pas l'URL complète).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Coupe les APIs navigateur inutilisées (réduit l'impact d'un XSS éventuel).
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    // Autorise les images servies par le CDN Shopify (next/image).
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
