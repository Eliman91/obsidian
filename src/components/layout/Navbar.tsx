"use client";

/* =============================================================
   NAVBAR — barre supérieure flottante en glassmorphism.
   Logo OBSIDIAN, navigation, sélecteur de langue FR/EN, panier live.
   ============================================================= */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/format";
import { LOCALES } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function Navbar({ locale }: { locale: Locale }) {
  const { totalQuantity, subtotal, currencyCode } = useCart();
  const pathname = usePathname();

  // Reconstruit le chemin courant pour l'autre langue (swap du 1er segment).
  const swapLocale = (target: Locale) => {
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav className="glass flex w-full max-w-5xl items-center justify-between gap-4 rounded-full px-5 py-3">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="text-sm font-semibold tracking-[0.35em] text-chrome uppercase"
        >
          Obsidian
        </Link>

        {/* Liens */}
        <div className="hidden items-center gap-6 text-xs tracking-widest text-graphite uppercase md:flex">
          <Link href={`/${locale}#collection`} className="transition-colors hover:text-cyan">
            Collection
          </Link>
          <Link href={`/${locale}#club`} className="transition-colors hover:text-cyan">
            Club Privé
          </Link>
        </div>

        {/* Langue + panier */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[10px] font-medium tracking-widest uppercase">
            {LOCALES.map((l, i) => (
              <span key={l} className="flex items-center gap-1">
                {i > 0 && <span className="text-graphite/40">/</span>}
                <Link
                  href={swapLocale(l)}
                  className={
                    l === locale ? "text-cyan" : "text-graphite hover:text-chrome"
                  }
                >
                  {l}
                </Link>
              </span>
            ))}
          </div>

          <Link
            href={`/${locale}#collection`}
            className="flex items-center gap-2 rounded-full border border-titanium/15 px-3 py-1.5 text-xs text-chrome transition-colors hover:border-cyan/40"
          >
            <span aria-hidden>🛒</span>
            <span className="tabular-nums">{totalQuantity}</span>
            {totalQuantity > 0 && (
              <span className="border-l border-titanium/15 pl-2 text-titanium tabular-nums">
                {formatPrice(subtotal, currencyCode, locale)}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
