import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { ExitIntentPopup } from "@/components/layout/ExitIntentPopup";
import { Analytics } from "@/components/layout/Analytics";
import { GlassSpotlight } from "@/components/layout/GlassSpotlight";
import { LOCALES, isLocale } from "@/lib/i18n";
import { SITE_NAME, SITE_URL, localizedAlternates } from "@/lib/site";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const COPY = {
  fr: {
    title: `${SITE_NAME} — Bague anti-stress en acier, série numérotée`,
    description:
      "La bague anti-stress à faire tourner entre vos doigts. Acier inoxydable, série limitée numérotée. Respirez, recentrez-vous. Livraison suivie, retours 30 jours.",
  },
  en: {
    title: `${SITE_NAME} — Anti-stress spinner ring in steel, numbered edition`,
    description:
      "The anti-stress ring to spin between your fingers. Stainless steel, limited numbered edition. Breathe, refocus. Tracked shipping, 30-day returns.",
  },
} as const;

/** Pré-génère /fr et /en au build (SSG). */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = isLocale(locale) ? COPY[locale] : COPY.fr;

  return {
    metadataBase: new URL(SITE_URL),
    title: copy.title,
    description: copy.description,
    // NB : chaque page enfant redéclare ses alternates via localizedAlternates()
    // pour ne pas hériter du canonical de l'accueil (bug SEO classique).
    alternates: localizedAlternates("", locale),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: copy.title,
      description: copy.description,
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image", title: copy.title, description: copy.description },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // En Next.js 16, params est asynchrone.
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-vantablack text-chrome antialiased">
        <Providers>
          <Navbar locale={locale} />
          {children}
          <Footer locale={locale} />
          <CookieConsent locale={locale} />
          <ExitIntentPopup locale={locale} />
          {/* Réflexion lumineuse qui suit le curseur sur les surfaces .glass-spot */}
          <GlassSpotlight />
          {/* GA4 : inactif sans NEXT_PUBLIC_GA_ID + consentement. */}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
