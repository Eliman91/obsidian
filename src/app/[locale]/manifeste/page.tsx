import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export const metadata: Metadata = {
  title: "Manifeste — OBSIDIAN",
  description:
    "La philosophie OBSIDIAN : l'objet réduit à son essence, façonné dans le titane et le chrome. Le futur, sans compromis.",
};

const CONTENT: Record<
  Locale,
  { eyebrow: string; title: string; paragraphs: string[]; signature: string; cta: string }
> = {
  fr: {
    eyebrow: "Le Manifeste",
    title: "Moins d'objets. De meilleurs objets.",
    paragraphs: [
      "OBSIDIAN est né d'un refus. Le refus du jetable, du bruyant, du superflu. À une époque où tout crie pour attirer l'attention, nous croyons au silence de l'objet parfait.",
      "Chaque pièce est réduite à son essence : une fonction, une matière, une géométrie. Le titane pour sa froideur noble. Le chrome pour ses reflets sans fin. Rien de décoratif — tout est nécessaire.",
      "Nous ne fabriquons pas des gadgets. Nous façonnons des compagnons de vie, pensés pour durer un siècle plutôt qu'une saison. Un objet OBSIDIAN ne se remplace pas : il se transmet.",
      "Le futur n'est pas une accumulation de fonctionnalités. C'est la clarté. La nôtre tient dans la main.",
    ],
    signature: "— OBSIDIAN",
    cta: "Découvrir la collection",
  },
  en: {
    eyebrow: "The Manifesto",
    title: "Fewer objects. Better objects.",
    paragraphs: [
      "OBSIDIAN was born from a refusal. A refusal of the disposable, the loud, the superfluous. In an age where everything screams for attention, we believe in the silence of the perfect object.",
      "Every piece is reduced to its essence: one function, one material, one geometry. Titanium for its noble coldness. Chrome for its endless reflections. Nothing decorative — everything necessary.",
      "We do not make gadgets. We shape lifelong companions, built to last a century rather than a season. An OBSIDIAN object is not replaced: it is passed on.",
      "The future is not an accumulation of features. It is clarity. Ours fits in the palm of your hand.",
    ],
    signature: "— OBSIDIAN",
    cta: "Discover the collection",
  },
};

export default async function ManifestoPage({
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

      <div className="mt-14 space-y-7">
        {c.paragraphs.map((p, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "text-lg leading-relaxed text-chrome"
                : "leading-relaxed text-graphite"
            }
          >
            {p}
          </p>
        ))}
      </div>

      <p className="mt-12 text-sm tracking-[0.3em] text-titanium uppercase">
        {c.signature}
      </p>

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
