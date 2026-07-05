import Link from "next/link";
import type { Locale } from "@/lib/types";
import { SITE_NAME } from "@/lib/site";
import { getCollections, type GadgetCollection } from "@/lib/shopify";

/* =============================================================
   FOOTER — pied de page minimaliste de luxe.
   Liens collections : maillage interne présent sur toutes les
   pages (SEO). En cas d'indisponibilité Shopify, on omet le bloc.
   ============================================================= */
export async function Footer({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();

  let collections: GadgetCollection[] = [];
  try {
    collections = await getCollections(10, locale);
  } catch {
    // Pas bloquant : le footer s'affiche sans les collections.
  }

  return (
    <footer className="border-t border-titanium/10 px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <span className="text-sm font-semibold tracking-[0.4em] text-chrome uppercase">
          {SITE_NAME}
        </span>

        {collections.length > 0 && (
          <nav
            aria-label={locale === "fr" ? "Collections" : "Collections"}
            className="flex flex-wrap justify-center gap-4 text-xs tracking-widest text-graphite/80 uppercase"
          >
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/collection/${c.handle}`}
                className="transition-colors hover:text-cyan"
              >
                {c.title}
              </Link>
            ))}
          </nav>
        )}

        <nav className="flex flex-wrap justify-center gap-6 text-xs tracking-widest text-graphite uppercase">
          <Link href={`/${locale}#collection`} className="transition-colors hover:text-cyan">
            Collection
          </Link>
          <Link href={`/${locale}/savoir-faire`} className="transition-colors hover:text-cyan">
            {locale === "fr" ? "Pourquoi ce prix" : "Why this price"}
          </Link>
          <Link href={`/${locale}/manifeste`} className="transition-colors hover:text-cyan">
            {locale === "fr" ? "Manifeste" : "Manifesto"}
          </Link>
          <Link href={`/${locale}#club`} className="transition-colors hover:text-cyan">
            {locale === "fr" ? "Le Cercle" : "The Circle"}
          </Link>
          <Link href={`/${locale}/legal`} className="transition-colors hover:text-cyan">
            Informations légales
          </Link>
          <Link href={`/${locale}/contact`} className="transition-colors hover:text-cyan">
            Contact
          </Link>
        </nav>

        <p className="text-[11px] tracking-wider text-graphite/60">
          © {year} {SITE_NAME} · Concept futuriste · Tous droits réservés
        </p>
      </div>
    </footer>
  );
}
