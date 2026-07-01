import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LOCALES, isLocale } from "@/lib/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const COPY = {
  fr: {
    title: `${SITE_NAME} — Gadgets futuristes de luxe`,
    description:
      "Des gadgets d'exception façonnés dans le titane et le chrome. La collection Obsidian, réservée à quelques initiés.",
  },
  en: {
    title: `${SITE_NAME} — Futuristic Luxury Gadgets`,
    description:
      "Exceptional gadgets forged in titanium and chrome. The Obsidian collection, reserved for a chosen few.",
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
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", en: "/en" },
    },
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
        </Providers>
      </body>
    </html>
  );
}
