import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { FaqSection } from "@/components/ui/FaqSection";
import { ClubSignup } from "@/components/ui/ClubSignup";
import { DropCountdown } from "@/components/ui/DropCountdown";
import { getDictionary } from "./dictionaries";
import { isLocale } from "@/lib/i18n";
import { CONTACT_EMAIL, DROP_DATE, SITE_NAME, SITE_URL } from "@/lib/site";
import { getGadgets } from "@/lib/shopify";
import { Aurora } from "@/components/ui/Aurora";
import { HeroSceneLazy } from "@/components/canvas3d/HeroSceneLazy";
import { HeroCTA } from "@/components/ui/HeroCTA";
import { ParallaxLayer } from "@/components/ui/ParallaxLayer";
import type { Gadget } from "@/lib/types";
import { safeJsonLd } from "@/lib/format";

// ISR : la page est régénérée au plus toutes les 5 min (produits à jour).
export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  // On récupère les produits Shopify ; en cas d'erreur, on n'affiche pas
  // la section plutôt que de casser toute la page.
  let gadgets: Gadget[] = [];
  try {
    gadgets = await getGadgets(9, locale);
  } catch (error) {
    console.error("[home] Échec du chargement des produits Shopify :", error);
  }

  // Entités structurées du site : identité de marque (Organization)
  // + entité site (WebSite). Déclarées une seule fois, sur l'accueil.
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/${locale}/opengraph-image`,
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT_EMAIL,
      contactType: "customer service",
      availableLanguage: ["French", "English"],
    },
  };
  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: locale === "fr" ? "fr-FR" : "en-US",
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(webSiteJsonLd) }}
      />
      {/* HERO */}
      <section className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        <Aurora />
        <HeroSceneLazy />
        <ParallaxLayer speed={1.2} className="relative z-10 mb-6">
          <p className="font-mono text-xs tracking-[0.4em] text-graphite uppercase">
            {dict.hero.eyebrow}
          </p>
        </ParallaxLayer>
        <ParallaxLayer speed={0.4} className="relative z-10">
          <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-tight text-holo md:text-7xl">
            {dict.hero.title}
          </h1>
        </ParallaxLayer>
        <ParallaxLayer speed={0.8} className="relative z-10 mt-6">
          <p className="max-w-xl text-pretty text-base text-graphite md:text-lg">
            {dict.hero.subtitle}
          </p>
        </ParallaxLayer>
        <ParallaxLayer speed={0.6} className="relative z-10 mt-10">
          <HeroCTA href="#collection">{dict.hero.cta}</HeroCTA>
        </ParallaxLayer>

        <p className="relative z-10 mt-6 text-xs tracking-wide text-graphite">
          {locale === "fr" ? (
            <>
              🎁 <span className="text-cyan">−10 %</span> sur votre première commande avec le code{" "}
              <span className="font-mono font-semibold text-chrome">WELCOME10</span>
            </>
          ) : (
            <>
              🎁 <span className="text-cyan">−10%</span> on your first order with code{" "}
              <span className="font-mono font-semibold text-chrome">WELCOME10</span>
            </>
          )}
        </p>
        <span className="absolute bottom-8 z-10 font-mono text-[10px] tracking-[0.3em] text-graphite/60 uppercase">
          Scroll ↓
        </span>
      </section>

      {/* COLLECTION — produits Shopify (remontée en haut pour la conversion) */}
      <section id="collection" className="mx-auto max-w-6xl px-6 py-24">
        <header className="mb-14 text-center">
          <p className="mb-4 font-mono text-xs tracking-[0.4em] text-graphite uppercase">
            {dict.hero.eyebrow}
          </p>
          <h2 className="text-4xl font-semibold text-holo md:text-5xl">
            {dict.hero.cta}
          </h2>
        </header>

        <ProductGrid gadgets={gadgets} locale={locale} labels={dict.product} />
      </section>

      {/* FAQ — lève les objections d'achat */}
      <FaqSection locale={locale} />

      {/* MEMBRES FONDATEURS + CERCLE */}
      <section
        id="club"
        className="flex min-h-[70vh] flex-col items-center justify-center gap-10 px-6 py-24"
      >
        {/* Drop daté — crée l'événement et l'attente */}
        <DropCountdown locale={locale} isoDate={DROP_DATE} />

        {/* Fondateurs — récompense les premiers acheteurs (rareté sociale) */}
        <div className="glass max-w-lg rounded-[--radius-luxe] px-8 py-6 text-center">
          <p className="mb-3 font-mono text-[11px] tracking-[0.3em] text-cyan uppercase">
            {locale === "fr" ? "Membres Fondateurs" : "Founding Members"}
          </p>
          <p className="text-sm leading-relaxed text-graphite">
            {locale === "fr" ? (
              <>
                Les <span className="text-titanium">100 premières commandes</span> reçoivent
                un numéro de série gravé, un tarif gelé à vie et l’accès permanent au Cercle.
                Un statut qui ne se rachètera jamais.
              </>
            ) : (
              <>
                The <span className="text-titanium">first 100 orders</span> receive an engraved
                serial number, a price locked for life and permanent access to the Circle.
                A status that can never be bought back.
              </>
            )}
          </p>
        </div>

        <ClubSignup
          locale={locale}
          title={dict.club.title}
          subtitle={dict.club.subtitle}
        />
      </section>
    </main>
  );
}
