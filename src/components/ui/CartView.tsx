"use client";

/* =============================================================
   CART VIEW — contenu interactif de la page panier.
   Liste des lignes (quantité, retrait), sous-total, et bouton
   « Passer au paiement » qui crée un panier Shopify côté serveur
   puis redirige vers le checkout sécurisé.
   ============================================================= */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/types";

interface CartLabels {
  title: string;
  empty: string;
  continue: string;
  subtotal: string;
  checkout: string;
  remove: string;
  processing: string;
}

export function CartView({
  locale,
  labels,
}: {
  locale: Locale;
  labels: CartLabels;
}) {
  const { lines, subtotal, currencyCode, setQuantity, removeLine } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (lines.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({
            variantId: l.variantId,
            quantity: l.quantity,
          })),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Erreur inconnue.");
    } catch {
      setError("Connexion impossible. Réessaie.");
    }
    setLoading(false);
  }

  if (lines.length === 0) {
    return (
      <div className="glass rounded-[--radius-luxe] p-12 text-center">
        <p className="text-graphite">{labels.empty}</p>
        <Link
          href={`/${locale}#collection`}
          className="ring-neon mt-6 inline-block rounded-full border border-cyan/30 px-6 py-2 text-xs font-medium text-cyan transition-all hover:bg-cyan hover:text-vantablack"
        >
          {labels.continue}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Lignes */}
      <ul className="lg:col-span-2 flex flex-col gap-4">
        {lines.map((line) => (
          <li
            key={line.variantId}
            className="glass flex items-center gap-4 rounded-[--radius-luxe] p-4"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gunmetal">
              {line.imageUrl && (
                <Image
                  src={line.imageUrl}
                  alt={line.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-chrome">{line.title}</p>
              <p className="mt-1 text-xs text-graphite">
                {formatPrice(line.unitPrice, line.currencyCode, locale)}
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center rounded-full border border-titanium/15">
                  <button
                    type="button"
                    aria-label="-"
                    onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                    className="px-3 py-1 text-graphite hover:text-chrome"
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center text-xs text-chrome tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="+"
                    onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                    className="px-3 py-1 text-graphite hover:text-chrome"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(line.variantId)}
                  className="text-[11px] tracking-wide text-graphite uppercase hover:text-plasma"
                >
                  {labels.remove}
                </button>
              </div>
            </div>

            <span className="text-sm font-semibold text-titanium tabular-nums">
              {formatPrice(line.unitPrice * line.quantity, line.currencyCode, locale)}
            </span>
          </li>
        ))}
      </ul>

      {/* Résumé */}
      <aside className="glass-heavy h-fit rounded-[--radius-luxe] p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-graphite">{labels.subtotal}</span>
          <span className="font-semibold text-chrome tabular-nums">
            {formatPrice(subtotal, currencyCode, locale)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="ring-neon mt-6 w-full rounded-full bg-cyan px-6 py-3 text-sm font-semibold text-vantablack transition-all hover:brightness-110 disabled:opacity-60"
        >
          {loading ? labels.processing : labels.checkout}
        </button>

        {error && <p className="mt-3 text-xs text-plasma">{error}</p>}

        <Link
          href={`/${locale}#collection`}
          className="mt-4 block text-center text-[11px] tracking-widest text-graphite uppercase hover:text-chrome"
        >
          {labels.continue}
        </Link>
      </aside>
    </div>
  );
}
