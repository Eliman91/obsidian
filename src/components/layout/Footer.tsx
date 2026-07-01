import Link from "next/link";
import type { Locale } from "@/lib/types";
import { SITE_NAME } from "@/lib/site";

/* =============================================================
   FOOTER — pied de page minimaliste de luxe.
   ============================================================= */
export function Footer({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-titanium/10 px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <span className="text-sm font-semibold tracking-[0.4em] text-chrome uppercase">
          {SITE_NAME}
        </span>

        <nav className="flex flex-wrap justify-center gap-6 text-xs tracking-widest text-graphite uppercase">
          <Link href={`/${locale}#collection`} className="transition-colors hover:text-cyan">
            Collection
          </Link>
          <Link href={`/${locale}/manifeste`} className="transition-colors hover:text-cyan">
            {locale === "fr" ? "Manifeste" : "Manifesto"}
          </Link>
          <Link href={`/${locale}#club`} className="transition-colors hover:text-cyan">
            Club Privé
          </Link>
          <Link href={`/${locale}/legal`} className="transition-colors hover:text-cyan">
            Informations légales
          </Link>
        </nav>

        <p className="text-[11px] tracking-wider text-graphite/60">
          © {year} {SITE_NAME} · Concept futuriste · Tous droits réservés
        </p>
      </div>
    </footer>
  );
}
