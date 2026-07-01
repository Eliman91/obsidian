import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { LOCALES, isLocale } from "@/lib/i18n";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OBSIDIAN — Futuristic Luxury Gadgets",
  description:
    "Des gadgets d'exception façonnés dans le titane et le chrome. Collection Obsidian.",
};

/** Pré-génère /fr et /en au build (SSG). */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
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
        </Providers>
      </body>
    </html>
  );
}
