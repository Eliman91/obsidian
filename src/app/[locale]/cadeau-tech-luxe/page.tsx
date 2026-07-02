import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "../dictionaries";
import { isLocale } from "@/lib/i18n";
import { getGadgets } from "@/lib/shopify";
import { localizedAlternates } from "@/lib/site";
import type { Gadget, Locale } from "@/lib/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { ReassuranceBar } from "@/components/ui/ReassuranceBar";

export const revalidate = 300;

const META = {
  fr: {
    title: "Idée cadeau tech de luxe pour homme & femme — OBSIDIAN",
    description:
      "Un cadeau technologique haut de gamme qui marque : objets connectés en titane et chrome, édition limitée. Livraison soignée, retour 30 jours.",
  },
  en: {
    title: "Luxury tech gift ideas for him & her — OBSIDIAN",
    description:
      "A high-end tech gift that lasts: connected objects in titanium and chrome, limited edition. Careful delivery, 30-day returns.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = isLocale(locale) ? META[locale] : META.fr;
  return { ...meta, alternates: localizedAlternates("/cadeau-tech-luxe", locale) };
}

const CONTENT: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    intro: string;
    tiers: { label: string; caption: string }[];
    why: { title: string; points: string[] };
    cta: string;
  }
> = {
  fr: {
    eyebrow: "Idée cadeau",
    title: "Le cadeau tech qu'on n'oublie pas.",
    intro:
      "Offrir un objet OBSIDIAN, c'est offrir une pièce d'exception en titane et chrome, produite en série limitée. Un cadeau qui ne finit pas dans un tiroir — il se transmet.",
    tiers: [
      { label: "Pour découvrir", caption: "Le premier geste OBSIDIAN, déjà remarquable." },
      { label: "Le cadeau signature", caption: "L'objet dont on se souvient." },
      { label: "L'exception", caption: "Pour marquer un moment qui compte." },
    ],
    why: {
      title: "Pourquoi c'est le bon cadeau",
      points: [
        "Matière noble : titane grade aérospatial, chrome massif.",
        "Édition limitée, numérotée, jamais rééditée.",
        "Livraison soignée, retour offert 30 jours, garantie 2 ans.",
      ],
    },
    cta: "Voir toute la collection",
  },
  en: {
    eyebrow: "Gift idea",
    title: "The tech gift they won't forget.",
    intro:
      "Gifting an OBSIDIAN object means gifting an exceptional piece in titanium and chrome, made in a limited series. A gift that doesn't end up in a drawer — it gets passed on.",
    tiers: [
      { label: "To discover", caption: "The first OBSIDIAN gesture, already remarkable." },
      { label: "The signature gift", caption: "The object they'll remember." },
      { label: "The exception", caption: "To mark a moment that matters." },
    ],
    why: {
      title: "Why it's the right gift",
      points: [
        "Noble materials: aerospace-grade titanium, solid chrome.",
        "Limited edition, numbered, never reissued.",
        "Careful delivery, free 30-day returns, 2-year warranty.",
      ],
    },
    cta: "See the full collection",
  },
};

export default async function GiftPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dict, gadgets] = await Promise.all([
    getDictionary(locale),
    getGadgets(12).catch(() => [] as Gadget[]),
  ]);
  const c = CONTENT[locale];

  // Trois paliers de budget : le moins cher, un médian, le plus cher.
  const sorted = [...gadgets].sort((a, b) => a.price.amount - b.price.amount);
  const picks: Gadget[] = [];
  if (sorted.length > 0) {
    const idx = [0, Math.floor(sorted.length / 2), sorted.length - 1];
    for (const i of Array.from(new Set(idx))) picks.push(sorted[i]);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pb-28 pt-36">
      <header className="mx-auto max-w-2xl text-center">
        <p className="mb-6 font-mono text-xs tracking-[0.4em] text-graphite uppercase">
          {c.eyebrow}
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-holo md:text-5xl">
          {c.title}
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-chrome">{c.intro}</p>
      </header>

      {/* Sélection par budget */}
      {picks.length > 0 && (
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((g, i) => (
            <div key={g.id} className="flex flex-col gap-3">
              <div className="text-center">
                <p className="font-mono text-[11px] tracking-[0.25em] text-cyan uppercase">
                  {c.tiers[i]?.label}
                </p>
                <p className="mt-1 text-xs text-graphite">{c.tiers[i]?.caption}</p>
              </div>
              <ProductCard gadget={g} locale={locale} labels={dict.product} />
            </div>
          ))}
        </div>
      )}

      {/* Pourquoi ce cadeau */}
      <section className="mt-20 rounded-[--radius-luxe] border border-titanium/10 p-8">
        <h2 className="text-center text-2xl font-semibold text-holo">{c.why.title}</h2>
        <ul className="mx-auto mt-6 max-w-xl space-y-3">
          {c.why.points.map((p, i) => (
            <li key={i} className="flex gap-3 text-sm text-graphite">
              <span aria-hidden className="text-cyan">
                —
              </span>
              {p}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12">
        <ReassuranceBar locale={locale} />
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
