import { notFound } from "next/navigation";
import GadgetViewer from "@/components/canvas3d/GadgetViewerLazy";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { FaqSection } from "@/components/ui/FaqSection";
import { getDictionary } from "./dictionaries";
import { isLocale } from "@/lib/i18n";
import { getGadgets } from "@/lib/shopify";
import type { Gadget } from "@/lib/types";

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
    gadgets = await getGadgets(9);
  } catch (error) {
    console.error("[home] Échec du chargement des produits Shopify :", error);
  }

  return (
    <main>
      {/* HERO */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 font-mono text-xs tracking-[0.4em] text-graphite uppercase">
          {dict.hero.eyebrow}
        </p>
        <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-tight text-holo md:text-7xl">
          {dict.hero.title}
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base text-graphite md:text-lg">
          {dict.hero.subtitle}
        </p>
        <a
          href="#collection"
          className="glass ring-neon mt-10 rounded-[--radius-luxe] px-8 py-3 text-sm font-medium text-chrome transition-transform duration-300 hover:scale-[1.03]"
        >
          {dict.hero.cta}
        </a>

        <p className="mt-6 text-xs tracking-wide text-graphite">
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
        <span className="absolute bottom-8 font-mono text-[10px] tracking-[0.3em] text-graphite/60 uppercase">
          Scroll ↓
        </span>
      </section>

      {/* CONFIGURATEUR 3D — piloté par le scroll (le cœur du site) */}
      <GadgetViewer scrollLengthVh={3} />

      {/* COLLECTION — produits Shopify en direct */}
      <section id="collection" className="mx-auto max-w-6xl px-6 py-28">
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

      {/* CLUB PRIVÉ */}
      <section id="club" className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="glass-heavy max-w-lg rounded-[--radius-luxe] p-10 text-center">
          <h2 className="text-3xl font-semibold text-holo md:text-4xl">
            {dict.club.title}
          </h2>
          <p className="mt-4 text-graphite">{dict.club.subtitle}</p>
        </div>
      </section>
    </main>
  );
}
