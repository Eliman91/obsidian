import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Autorise les images servies par le CDN Shopify (next/image).
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
