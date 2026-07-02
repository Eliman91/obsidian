"use client";

/* =============================================================
   DROP COUNTDOWN — compte à rebours du prochain lancement.
   Crée l'événement et l'attente (rareté temporelle). Une fois la
   date passée, bascule sur "Ouvert" + CTA vers la collection.
   Rendu SSR-safe : on n'affiche les chiffres qu'après montage
   client (évite tout décalage d'hydratation lié à Date.now()).
   ============================================================= */

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/types";

const COPY = {
  fr: {
    eyebrow: "Prochain drop",
    title: "Édition limitée — ouverture imminente",
    subtitle:
      "Les pièces partent en quelques heures. Rejoignez la liste pour être prévenu avant tout le monde.",
    cta: "Être prévenu",
    open: "C'est ouvert",
    openCta: "Voir la collection",
    units: { d: "jours", h: "h", m: "min", s: "s" },
  },
  en: {
    eyebrow: "Next drop",
    title: "Limited edition — opening soon",
    subtitle:
      "Pieces sell out within hours. Join the list to be notified before anyone else.",
    cta: "Notify me",
    open: "It's live",
    openCta: "See the collection",
    units: { d: "days", h: "h", m: "min", s: "s" },
  },
} as const;

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    m: Math.floor((ms / 60_000) % 60),
    s: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  };
}

export function DropCountdown({
  locale,
  isoDate,
}: {
  locale: Locale;
  isoDate: string;
}) {
  const target = new Date(isoDate).getTime();
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);
  const c = COPY[locale];

  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const done = t?.done ?? false;
  const cells: [number, string][] = t
    ? [
        [t.d, c.units.d],
        [t.h, c.units.h],
        [t.m, c.units.m],
        [t.s, c.units.s],
      ]
    : [];

  return (
    <div className="glass-heavy w-full max-w-lg rounded-[--radius-luxe] px-8 py-8 text-center">
      <p className="mb-3 font-mono text-[11px] tracking-[0.3em] text-cyan uppercase">
        {c.eyebrow}
      </p>
      <h2 className="text-2xl font-semibold text-holo md:text-3xl">
        {done ? c.open : c.title}
      </h2>

      {!done && (
        <>
          {/* Réserve l'espace même avant montage (min-h) → pas de saut. */}
          <div className="mt-6 flex min-h-[64px] items-center justify-center gap-3">
            {cells.map(([value, label], i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="font-mono text-3xl font-semibold tabular-nums text-titanium md:text-4xl">
                  {String(value).padStart(2, "0")}
                </span>
                <span className="mt-1 text-[10px] tracking-widest text-graphite uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-graphite">{c.subtitle}</p>
        </>
      )}

      <a
        href={done ? "#collection" : "#club"}
        className="ring-neon mt-7 inline-block rounded-full bg-cyan px-7 py-3 text-sm font-semibold text-vantablack transition-all hover:brightness-110"
      >
        {done ? c.openCta : c.cta}
      </a>
    </div>
  );
}
