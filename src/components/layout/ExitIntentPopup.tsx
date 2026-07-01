"use client";

/* =============================================================
   EXIT-INTENT POPUP — capture d'email contre le code WELCOME10.
   • Desktop : se déclenche quand la souris quitte le haut de l'écran.
   • Mobile / repli : minuterie (30 s).
   • Ne s'affiche qu'une fois (mémorisé en localStorage).
   • À la soumission : crée un client Shopify puis révèle le code.
   ============================================================= */

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/types";

const STORAGE_KEY = "obsidian.newsletter.v1";
const PROMO_CODE = "WELCOME10";

const COPY = {
  fr: {
    title: "Rejoignez le cercle",
    subtitle: "−10 % sur votre première commande + accès anticipé aux drops.",
    placeholder: "Votre email",
    cta: "Recevoir mon code",
    sending: "…",
    successTitle: "Bienvenue.",
    successText: "Voici votre code, à saisir au paiement :",
    invalid: "Email invalide.",
    error: "Une erreur est survenue. Réessayez.",
    copied: "Copié !",
    copy: "Copier",
  },
  en: {
    title: "Join the circle",
    subtitle: "−10% off your first order + early access to drops.",
    placeholder: "Your email",
    cta: "Get my code",
    sending: "…",
    successTitle: "Welcome.",
    successText: "Here is your code, enter it at checkout:",
    invalid: "Invalid email.",
    error: "Something went wrong. Try again.",
    copied: "Copied!",
    copy: "Copy",
  },
} as const;

export function ExitIntentPopup({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [copied, setCopied] = useState(false);
  const t = COPY[locale];

  useEffect(() => {
    let done = false;
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) done = true;
    } catch {
      /* ignore */
    }
    if (done) return;

    const trigger = () => {
      setOpen(true);
      cleanup();
    };
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    const timer = window.setTimeout(trigger, 30_000);
    document.addEventListener("mouseout", onMouseOut);

    function cleanup() {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", onMouseOut);
    }
    return cleanup;
  }, []);

  function persistDismissed() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function close() {
    persistDismissed();
    setOpen(false);
  }

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
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      persistDismissed();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function copyCode() {
    navigator.clipboard?.writeText(PROMO_CODE).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-vantablack/70 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="glass-heavy relative w-full max-w-md rounded-[--radius-luxe] p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-4 top-4 text-graphite transition-colors hover:text-chrome"
        >
          ✕
        </button>

        {status === "success" ? (
          <>
            <h2 className="text-2xl font-semibold text-holo">{t.successTitle}</h2>
            <p className="mt-3 text-sm text-graphite">{t.successText}</p>
            <button
              type="button"
              onClick={copyCode}
              className="ring-neon mt-5 inline-flex items-center gap-3 rounded-[--radius-luxe] border border-cyan/40 px-6 py-3 font-mono text-lg font-semibold tracking-widest text-cyan transition-all hover:bg-cyan hover:text-vantablack"
            >
              {PROMO_CODE}
              <span className="text-[10px] tracking-normal uppercase opacity-70">
                {copied ? t.copied : t.copy}
              </span>
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-holo">{t.title}</h2>
            <p className="mt-3 text-sm text-graphite">{t.subtitle}</p>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                className="rounded-full border border-titanium/20 bg-vantablack/60 px-5 py-3 text-sm text-chrome placeholder:text-graphite focus:border-cyan/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="ring-neon rounded-full bg-cyan px-6 py-3 text-sm font-semibold text-vantablack transition-all hover:brightness-110 disabled:opacity-60"
              >
                {status === "sending" ? t.sending : t.cta}
              </button>
              {status === "error" && (
                <p className="text-xs text-plasma">{t.error}</p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
