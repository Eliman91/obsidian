import type { Locale } from "@/lib/types";
import { safeJsonLd } from "@/lib/format";

/* =============================================================
   FAQ SECTION — lève les objections d'achat.
   Utilise <details>/<summary> (accessible, sans JS) + JSON-LD
   FAQPage pour les rich snippets Google.
   ============================================================= */

const FAQ: Record<Locale, { q: string; a: string }[]> = {
  fr: [
    {
      q: "Quels sont les délais de livraison ?",
      a: "Préparation sous 1 à 3 jours ouvrés. Livraison en France sous 2 à 5 jours, en Europe sous 5 à 10 jours, avec numéro de suivi.",
    },
    {
      q: "Puis-je retourner un article ?",
      a: "Oui. Vous disposez de 30 jours pour retourner tout article neuf dans son emballage d'origine.",
    },
    {
      q: "Les matériaux sont-ils garantis ?",
      a: "Chaque pièce est façonnée en titane de grade aérospatial et chrome poli, et bénéficie d'une garantie de 2 ans.",
    },
    {
      q: "Le paiement est-il sécurisé ?",
      a: "Absolument. Le paiement est chiffré et traité par Shopify ; aucune donnée bancaire n'est stockée sur notre site.",
    },
    {
      q: "Comment utiliser mon code promo ?",
      a: "Saisissez votre code (par exemple WELCOME10) à l'étape du paiement pour appliquer la réduction.",
    },
  ],
  en: [
    {
      q: "What are the delivery times?",
      a: "Orders ship within 1–3 business days. Delivery takes 2–5 days in France and 5–10 days across Europe, with tracking.",
    },
    {
      q: "Can I return an item?",
      a: "Yes. You have 30 days to return any unused item in its original packaging.",
    },
    {
      q: "Are the materials guaranteed?",
      a: "Each piece is crafted from aerospace-grade titanium and polished chrome, and comes with a 2-year warranty.",
    },
    {
      q: "Is payment secure?",
      a: "Absolutely. Payment is encrypted and processed by Shopify; no card details are stored on our site.",
    },
    {
      q: "How do I use my promo code?",
      a: "Enter your code (for example WELCOME10) at checkout to apply the discount.",
    },
  ],
};

export function FaqSection({ locale }: { locale: Locale }) {
  const items = FAQ[locale];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <h2 className="mb-10 text-center text-3xl font-semibold text-holo md:text-4xl">
        FAQ
      </h2>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="glass group rounded-[--radius-luxe] px-5 py-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-chrome">
              {item.q}
              <span className="text-cyan transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-graphite">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
