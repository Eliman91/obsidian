"use client";

/* =============================================================
   COOKIE CONSENT — bandeau RGPD minimaliste.
   S'affiche tant que l'utilisateur n'a pas donné son accord
   (mémorisé dans localStorage). Le site n'utilise que des
   cookies strictement nécessaires (panier) pour l'instant.
   ============================================================= */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/types";

const STORAGE_KEY = "obsidian.consent.v1";

const COPY = {
  fr: {
    text: "Nous utilisons des cookies nécessaires au fonctionnement du site (panier).",
    link: "En savoir plus",
    accept: "J'accepte",
  },
  en: {
    text: "We use cookies strictly necessary for the site to work (cart).",
    link: "Learn more",
    accept: "Accept",
  },
} as const;

export function CookieConsent({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  const copy = COPY[locale];

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* localStorage indisponible : on n'affiche rien. */
    }
  }, []);

  if (!visible) return null;

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="glass flex w-full max-w-3xl flex-col items-center gap-3 rounded-[--radius-luxe] p-4 text-center sm:flex-row sm:text-left">
        <p className="flex-1 text-xs text-graphite">
          {copy.text}{" "}
          <Link href={`/${locale}/legal`} className="text-cyan hover:underline">
            {copy.link}
          </Link>
        </p>
        <button
          type="button"
          onClick={accept}
          className="ring-neon shrink-0 rounded-full border border-cyan/30 px-5 py-2 text-xs font-medium text-cyan transition-all hover:bg-cyan hover:text-vantablack"
        >
          {copy.accept}
        </button>
      </div>
    </div>
  );
}
