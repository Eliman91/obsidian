"use client";

/* =============================================================
   WAITLIST SIGNUP — liste d'attente d'un drop à venir.
   Remplace le bouton d'achat sur les produits concept : capture
   l'email (client Shopify via /api/subscribe, comme le Club) et
   annonce la date du drop. Chaque inscrit = un acheteur potentiel
   à relancer le jour J.
   ============================================================= */

import { useState } from "react";
import type { Locale } from "@/lib/types";

const COPY = {
  fr: {
    badge: "Drop à venir",
    heading: (date: string) => `Ouverture des commandes le ${date}`,
    body: "Les inscrits sont prévenus en premier — les éditions numérotées partent dans l'ordre d'arrivée.",
    placeholder: "Votre email",
    cta: "Me prévenir du drop",
    sending: "…",
    success: "C'est noté. Vous serez prévenu·e avant tout le monde.",
    error: "Une erreur est survenue. Réessayez.",
  },
  en: {
    badge: "Coming drop",
    heading: (date: string) => `Orders open on ${date}`,
    body: "Subscribers are notified first — numbered editions go in order of arrival.",
    placeholder: "Your email",
    cta: "Notify me",
    sending: "…",
    success: "Noted. You'll be the first to know.",
    error: "Something went wrong. Try again.",
  },
} as const;

export function WaitlistSignup({
  locale,
  dropDate,
}: {
  locale: Locale;
  /** Date du drop déjà formatée pour la locale. */
  dropDate: string;
}) {
  const [email, setEmail] = useState("");
  // Honeypot anti-bot : champ invisible qui doit rester vide.
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const t = COPY[locale];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div id="waitlist" className="glass-heavy rounded-[--radius-luxe] p-6">
      <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-cyan uppercase">
        <span
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan"
          aria-hidden
        />
        {t.badge}
      </p>
      <p className="mt-3 text-lg font-semibold text-titanium">
        {t.heading(dropDate)}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-graphite">{t.body}</p>

      {status === "success" ? (
        <p className="mt-6 text-sm text-cyan">{t.success}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          {/* Honeypot : invisible pour les humains, rempli par les bots. */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px opacity-0"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 rounded-full border border-titanium/20 bg-vantablack/60 px-5 py-3 text-sm text-chrome placeholder:text-graphite focus:border-cyan/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="ring-neon shrink-0 rounded-full bg-cyan px-6 py-3 text-sm font-semibold text-vantablack transition-all hover:brightness-110 disabled:opacity-60"
          >
            {status === "sending" ? t.sending : t.cta}
          </button>
        </form>
      )}
      {status === "error" && <p className="mt-3 text-xs text-plasma">{t.error}</p>}
    </div>
  );
}
