"use client";

/* =============================================================
   NAVBAR — barre supérieure flottante en glassmorphism.
   Logo OBSIDIAN, navigation, sélecteur de langue FR/EN, panier live.
   Mobile : menu burger accessible (aria-expanded, fermeture Échap).
   ============================================================= */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/format";
import { LOCALES } from "@/lib/i18n";
import { SHOP_ACCOUNT_URL } from "@/lib/site";
import type { Locale } from "@/lib/types";

export function Navbar({ locale }: { locale: Locale }) {
  const { totalQuantity, subtotal, currencyCode } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Ferme le menu mobile à chaque navigation (pattern React officiel :
  // ajustement d'état pendant le rendu, sans useEffect).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  // Ferme le menu mobile avec la touche Échap.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Reconstruit le chemin courant pour l'autre langue (swap du 1er segment).
  const swapLocale = (target: Locale) => {
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  };

  const links = [
    { href: `/${locale}#collection`, label: "Collection" },
    { href: `/${locale}/manifeste`, label: locale === "fr" ? "Manifeste" : "Manifesto" },
    { href: `/${locale}#club`, label: locale === "fr" ? "Club Privé" : "Private Club" },
    { href: `/${locale}/contact`, label: "Contact" },
  ];

  const cartLabel =
    locale === "fr"
      ? `Panier, ${totalQuantity} article${totalQuantity > 1 ? "s" : ""}`
      : `Cart, ${totalQuantity} item${totalQuantity > 1 ? "s" : ""}`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="relative w-full max-w-5xl">
        <nav className="glass flex w-full items-center justify-between gap-4 rounded-full px-5 py-3">
          {/* Burger (mobile uniquement) */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={locale === "fr" ? "Menu" : "Menu"}
            className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <span
              className={`h-px w-4 bg-chrome transition-transform duration-300 ${menuOpen ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-4 bg-chrome transition-transform duration-300 ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>

          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="text-sm font-semibold tracking-[0.35em] text-chrome uppercase"
          >
            Obsidian
          </Link>

          {/* Liens (desktop) */}
          <div className="hidden items-center gap-6 text-xs tracking-widest text-graphite uppercase md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-cyan"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Langue + compte + panier */}
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

            <a
              href={SHOP_ACCOUNT_URL}
              className="hidden items-center gap-1.5 text-xs text-chrome transition-colors hover:text-cyan sm:flex"
              title={locale === "fr" ? "Mon compte" : "My account"}
            >
              <span aria-hidden>👤</span>
              <span className="hidden sm:inline">
                {locale === "fr" ? "Compte" : "Account"}
              </span>
            </a>

            <Link
              href={`/${locale}/panier`}
              aria-label={cartLabel}
              className="flex items-center gap-2 rounded-full border border-titanium/15 px-3 py-1.5 text-xs text-chrome transition-colors hover:border-cyan/40"
            >
              <span aria-hidden>🛒</span>
              <span aria-hidden className="tabular-nums">
                {totalQuantity}
              </span>
              {totalQuantity > 0 && (
                <span className="border-l border-titanium/15 pl-2 text-titanium tabular-nums">
                  {formatPrice(subtotal, currencyCode, locale)}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="glass-heavy absolute inset-x-0 top-full mt-2 flex flex-col gap-1 rounded-[--radius-luxe] p-4 md:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-sm tracking-widest text-chrome uppercase transition-colors hover:text-cyan"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={SHOP_ACCOUNT_URL}
              className="rounded-lg px-4 py-3 text-sm tracking-widest text-graphite uppercase transition-colors hover:text-cyan"
            >
              {locale === "fr" ? "Mon compte" : "My account"}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
