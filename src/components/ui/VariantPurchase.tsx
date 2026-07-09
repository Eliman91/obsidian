"use client";

/* =============================================================
   VARIANT PURCHASE — achat d'un produit à options (ex. Pulse).
   ------------------------------------------------------------
   Gère : sélecteur de taille, choix « sans gravure / gravure
   personnalisée », et champ texte de gravure (max 20 car.).
   La gravure part comme attribut de ligne (line item property
   « Gravure ») → visible sur la commande Shopify et confirmée
   dans le panier avant paiement.
   L'option gravure est détectée automatiquement à partir des
   noms/valeurs de variantes (aucun nom d'option codé en dur).
   ============================================================= */

import { useMemo, useState } from "react";
import type { Gadget, GadgetVariant, Locale } from "@/lib/types";
import { useCart } from "@/hooks/useCart";
import { trackAddToCart } from "@/lib/track";
import { formatPrice } from "@/lib/format";

const ENGRAVING_MAX = 20;
const ENGRAVING_KEY = "Gravure"; // clé de l'attribut (visible côté commande)

function optionValue(v: GadgetVariant, name: string): string | undefined {
  return v.selectedOptions.find((o) => o.name === name)?.value;
}

export function VariantPurchase({
  gadget,
  locale,
  labels,
  className = "",
}: {
  gadget: Gadget;
  locale: Locale;
  labels: { addToCart: string; soldOut: string };
  className?: string;
}) {
  const { addLine } = useCart();
  const { variants } = gadget;
  const fr = locale === "fr";

  // Noms d'options présents sur les variantes (ordre de première apparition).
  const optionNames = useMemo(() => {
    const set: string[] = [];
    for (const v of variants)
      for (const o of v.selectedOptions)
        if (!set.includes(o.name)) set.push(o.name);
    return set;
  }, [variants]);

  // Détecte l'option « gravure » : 2 valeurs, l'une « …gravure… » (hors « sans »).
  const engraving = useMemo(() => {
    for (const name of optionNames) {
      const values = Array.from(
        new Set(
          variants
            .map((v) => optionValue(v, name))
            .filter((x): x is string => Boolean(x)),
        ),
      );
      if (values.length !== 2) continue;
      const engraved = values.find((val) => /grav/i.test(val) && !/sans/i.test(val));
      const plain = values.find((val) => val !== engraved);
      if (engraved && plain) return { name, engraved, plain };
    }
    return null;
  }, [optionNames, variants]);

  // L'autre option (ex. la taille).
  const sizeName = optionNames.find((n) => n !== engraving?.name) ?? null;
  const sizes = useMemo(() => {
    if (!sizeName) return [];
    const seen: string[] = [];
    for (const v of variants) {
      const val = optionValue(v, sizeName);
      if (val && !seen.includes(val)) seen.push(val);
    }
    return seen;
  }, [sizeName, variants]);

  const [engraved, setEngraved] = useState(false);
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [text, setText] = useState("");
  const [added, setAdded] = useState(false);

  // Variante correspondant aux choix courants.
  const selected = useMemo(
    () =>
      variants.find((v) => {
        const sizeOk = !sizeName || optionValue(v, sizeName) === size;
        const engOk =
          !engraving ||
          optionValue(v, engraving.name) ===
            (engraved ? engraving.engraved : engraving.plain);
        return sizeOk && engOk;
      }) ?? null,
    [variants, sizeName, size, engraving, engraved],
  );

  const engravingText = text.trim();
  const needsText = engraving != null && engraved;
  const canBuy =
    !!selected && selected.availableForSale && (!needsText || engravingText.length > 0);

  function handleAdd() {
    if (!selected || !canBuy) return;
    addLine({
      variantId: selected.id,
      handle: gadget.handle,
      title: gadget.title,
      variantTitle: selected.title,
      imageUrl: gadget.featuredImage?.url ?? null,
      unitPrice: selected.price.amount,
      currencyCode: selected.price.currencyCode,
      quantity: 1,
      ...(needsText
        ? { attributes: [{ key: ENGRAVING_KEY, value: engravingText }] }
        : {}),
    });
    trackAddToCart(
      {
        id: selected.id,
        name: selected.title,
        price: selected.price.amount,
        quantity: 1,
      },
      selected.price.currencyCode,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  // Libellé du bouton selon l'état.
  const buttonLabel = !selected
    ? labels.soldOut
    : !selected.availableForSale
      ? engraved
        ? fr
          ? "Gravure bientôt disponible"
          : "Engraving coming soon"
        : labels.soldOut
      : added
        ? fr
          ? "✓ Ajouté"
          : "✓ Added"
        : labels.addToCart;

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Prix de la variante choisie */}
      {selected && (
        <p className="text-2xl font-semibold text-titanium">
          {formatPrice(selected.price.amount, selected.price.currencyCode, locale)}
        </p>
      )}

      {/* Sélecteur de taille */}
      {sizeName && sizes.length > 0 && (
        <div>
          <p className="mb-2 text-xs tracking-widest text-graphite uppercase">
            {sizeName} · {fr ? "choisis la tienne" : "pick yours"}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const isSel = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={isSel}
                  className={`h-11 min-w-11 rounded-full border px-3 text-sm font-medium transition-all ${
                    isSel
                      ? "border-cyan bg-cyan text-vantablack"
                      : "border-titanium/20 text-chrome hover:border-cyan/50"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Choix gravure / sans gravure */}
      {engraving && (
        <div>
          <p className="mb-2 text-xs tracking-widest text-graphite uppercase">
            {fr ? "Personnalisation" : "Personalization"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[false, true].map((eng) => {
              const isSel = eng === engraved;
              const label = eng
                ? fr
                  ? "Gravure personnalisée"
                  : "Custom engraving"
                : fr
                  ? "Sans gravure"
                  : "No engraving";
              return (
                <button
                  key={String(eng)}
                  type="button"
                  onClick={() => setEngraved(eng)}
                  aria-pressed={isSel}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                    isSel
                      ? "border-cyan bg-cyan/10 text-cyan"
                      : "border-titanium/20 text-chrome hover:border-cyan/50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Champ texte de gravure */}
      {needsText && (
        <div>
          <label
            htmlFor="engraving-text"
            className="mb-2 block text-xs tracking-widest text-graphite uppercase"
          >
            {fr ? "Votre gravure" : "Your engraving"}
          </label>
          <input
            id="engraving-text"
            type="text"
            value={text}
            maxLength={ENGRAVING_MAX}
            onChange={(e) => setText(e.target.value)}
            placeholder={fr ? "Initiales, date, un mot…" : "Initials, date, a word…"}
            className="w-full rounded-xl border border-titanium/20 bg-vantablack/40 px-4 py-3 text-sm text-chrome placeholder:text-graphite/60 focus:border-cyan focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-graphite">
              {engravingText.length > 0
                ? `${fr ? "Aperçu" : "Preview"} : « ${engravingText} »`
                : fr
                  ? "Gravée à l'intérieur de l'anneau"
                  : "Engraved inside the ring"}
            </span>
            <span className="tabular-nums text-graphite">
              {text.length}/{ENGRAVING_MAX}
            </span>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-graphite/80">
            {fr
              ? "Pièce gravée à la demande (+2 à 3 jours). Objet personnalisé : ni repris ni échangé (droit de rétractation exclu)."
              : "Made to order (+2–3 days). Personalized item: no returns or exchanges."}
          </p>
        </div>
      )}

      {/* Bouton d'ajout */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!canBuy}
        className="ring-neon rounded-full border border-cyan/30 bg-cyan px-8 py-3 text-sm font-semibold text-vantablack transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:border-graphite/20 disabled:bg-transparent disabled:text-graphite disabled:shadow-none"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
