"use client";

/* =============================================================
   CLUB SIGNUP — inscription au Club Privé (accès anticipé aux drops).
   Capture l'email comme client Shopify via /api/subscribe.
   ============================================================= */

import { useState } from "react";
import type { Locale } from "@/lib/types";

const COPY = {
  fr: {
    placeholder: "Votre email",
    cta: "Demander une invitation",
    sending: "…",
    success: "Votre demande est enregistrée. Nous revenons vers vous.",
    error: "Une erreur est survenue. Réessayez.",
  },
  en: {
    placeholder: "Your email",
    cta: "Request an invitation",
    sending: "…",
    success: "Your request is in. We'll be in touch.",
    error: "Something went wrong. Try again.",
  },
} as const;

export function ClubSignup({
  locale,
  title,
  subtitle,
}: {
  locale: Locale;
  title: string;
  subtitle: string;
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
    <div className="glass-heavy max-w-lg rounded-[--radius-luxe] p-10 text-center">
      <h2 className="text-3xl font-semibold text-holo md:text-4xl">{title}</h2>
      <p className="mt-4 text-graphite">{subtitle}</p>

      {status === "success" ? (
        <p className="mt-8 text-sm text-cyan">{t.success}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
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
