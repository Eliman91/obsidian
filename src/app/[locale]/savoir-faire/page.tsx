import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/site";
import type { Locale } from "@/lib/types";

const META = {
  fr: {
    title: "Pourquoi ce prix — OBSIDIAN",
    description:
      "Ce que vous payez chez OBSIDIAN : matière noble, séries courtes, garantie longue. Et ce que vous ne payez pas.",
  },
  en: {
    title: "Why this price — OBSIDIAN",
    description:
      "What you pay for at OBSIDIAN: noble materials, short series, long warranty. And what you don't pay for.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = isLocale(locale) ? META[locale] : META.fr;
  return { ...meta, alternates: localizedAlternates("/savoir-faire", locale) };
}

interface Block {
  k: string;
  title: string;
  body: string;
}

const CONTENT: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    intro: string;
    blocks: Block[];
    notTitle: string;
    not: string[];
    cta: string;
  }
> = {
  fr: {
    eyebrow: "Le prix, expliqué",
    title: "Un prix juste n'est pas un prix bas.",
    intro:
      "Nous ne cherchons pas à être les moins chers. Nous cherchons à être les derniers que vous achèterez. Voici où va chaque euro.",
    blocks: [
      {
        k: "01",
        title: "La matière, jamais le plastique",
        body: "Titane grade aérospatial, chrome massif usiné dans la masse. Des matériaux qui coûtent cher à travailler, mais qui ne vieillissent pas et ne se remplacent pas.",
      },
      {
        k: "02",
        title: "Des séries courtes, numérotées",
        body: "Nous produisons par éditions limitées, jamais rééditées. Pas de stock de masse à écouler : chaque pièce est fabriquée pour durer, pas pour saturer un entrepôt.",
      },
      {
        k: "03",
        title: "Une garantie qui engage",
        body: "Retour sous 30 jours, garantie 2 ans, conciergerie dédiée. Le prix inclut le service — pas seulement l'objet.",
      },
    ],
    notTitle: "Ce que vous ne payez pas",
    not: [
      "Aucune publicité criée, aucun influenceur payé.",
      "Aucun intermédiaire : nous vendons en direct.",
      "Aucune obsolescence programmée : réparable, transmissible.",
    ],
    cta: "Voir la collection",
  },
  en: {
    eyebrow: "The price, explained",
    title: "A fair price is not a low price.",
    intro:
      "We are not trying to be the cheapest. We are trying to be the last thing you buy. Here is where every euro goes.",
    blocks: [
      {
        k: "01",
        title: "Material, never plastic",
        body: "Aerospace-grade titanium, solid chrome machined from a single block. Materials that are expensive to work — but that do not age and are not replaced.",
      },
      {
        k: "02",
        title: "Short, numbered series",
        body: "We produce in limited editions, never reissued. No mass stock to clear: each piece is built to last, not to fill a warehouse.",
      },
      {
        k: "03",
        title: "A warranty that commits",
        body: "30-day returns, 2-year warranty, dedicated concierge. The price includes the service — not just the object.",
      },
    ],
    notTitle: "What you don't pay for",
    not: [
      "No loud advertising, no paid influencers.",
      "No middlemen: we sell direct.",
      "No planned obsolescence: repairable, passed on.",
    ],
    cta: "See the collection",
  },
};

export default async function SavoirFairePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = CONTENT[locale];

  return (
    <main className="mx-auto max-w-2xl px-6 pb-28 pt-36">
      <p className="mb-6 text-center font-mono text-xs tracking-[0.4em] text-graphite uppercase">
        {c.eyebrow}
      </p>
      <h1 className="text-center text-4xl font-semibold leading-tight text-holo md:text-5xl">
        {c.title}
      </h1>
      <p className="mt-8 text-center text-lg leading-relaxed text-chrome">{c.intro}</p>

      <div className="mt-16 space-y-6">
        {c.blocks.map((b) => (
          <div key={b.k} className="glass rounded-[--radius-luxe] p-7">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-sm text-cyan">{b.k}</span>
              <h2 className="text-lg font-semibold text-titanium">{b.title}</h2>
            </div>
            <p className="mt-3 leading-relaxed text-graphite">{b.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-[--radius-luxe] border border-titanium/10 p-7">
        <p className="mb-4 font-mono text-xs tracking-[0.3em] text-graphite uppercase">
          {c.notTitle}
        </p>
        <ul className="space-y-2">
          {c.not.map((n, i) => (
            <li key={i} className="flex gap-3 text-sm text-graphite">
              <span aria-hidden className="text-cyan">
                —
              </span>
              {n}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 text-center">
        <Link
          href={`/${locale}#collection`}
          className="glass ring-neon inline-block rounded-[--radius-luxe] px-8 py-3 text-sm font-medium text-chrome transition-transform duration-300 hover:scale-[1.03]"
        >
          {c.cta}
        </Link>
      </div>
    </main>
  );
}
