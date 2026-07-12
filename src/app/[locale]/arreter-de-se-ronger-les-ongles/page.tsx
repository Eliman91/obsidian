import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { SITE_URL, localizedAlternates } from "@/lib/site";
import { safeJsonLd } from "@/lib/format";
import type { Locale } from "@/lib/types";

/* =============================================================
   ARTICLE SEO — « Comment arrêter de se ronger les ongles »
   Objectif : capter une recherche Google à fort volume et
   positionner Pulse (bague anti-stress) comme un outil parmi
   d'autres. Aucune promesse médicale : conseils honnêtes +
   substitution du geste (occuper les mains).
   ============================================================= */

const SLUG = "/arreter-de-se-ronger-les-ongles";
const PULSE_HANDLE = "obsidian-pulse";

const META = {
  fr: {
    title: "Comment arrêter de se ronger les ongles : 5 méthodes efficaces — OBSIDIAN",
    description:
      "Se ronger les ongles vient souvent du stress. Voici 5 méthodes simples pour arrêter durablement — dont l'astuce d'occuper ses mains.",
  },
  en: {
    title: "How to stop biting your nails: 5 methods that work — OBSIDIAN",
    description:
      "Nail biting often comes from stress. Here are 5 simple methods to stop for good — including the trick of keeping your hands busy.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = isLocale(locale) ? META[locale] : META.fr;
  return {
    ...meta,
    alternates: localizedAlternates(SLUG, locale),
    openGraph: {
      type: "article",
      url: `/${locale}${SLUG}`,
      title: meta.title,
      description: meta.description,
    },
  };
}

interface Section {
  h: string;
  p: string;
}

const CONTENT: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    intro: string;
    sections: Section[];
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
  }
> = {
  fr: {
    eyebrow: "Conseils bien-être",
    title: "Comment arrêter de se ronger les ongles : 5 méthodes efficaces",
    intro:
      "Se ronger les ongles (l'onychophagie) touche près d'un adulte sur trois. Ce n'est pas qu'une mauvaise habitude : c'est le plus souvent une réponse au stress, à l'ennui ou à la concentration. La bonne nouvelle, c'est qu'on peut s'en défaire. Voici 5 méthodes simples, sans matériel compliqué.",
    sections: [
      {
        h: "1. Repérez vos moments déclencheurs",
        p: "On ne se ronge pas les ongles au hasard. C'est presque toujours lié à un moment précis : une réunion tendue, les transports, devant un écran, avant de dormir. Pendant quelques jours, notez quand votre main monte vers votre bouche. Prendre conscience du déclencheur, c'est déjà la moitié du chemin.",
      },
      {
        h: "2. Occupez vos mains autrement",
        p: "La méthode la plus efficace n'est pas de vous interdire le geste, mais de le remplacer. C'est ce qu'on appelle la substitution d'habitude : donnez à vos doigts quelque chose d'autre à faire. Une balle anti-stress, un élastique, ou une bague qui tourne entre les doigts occupent la main au moment exact où l'envie monte. Le geste de stress devient un geste apaisant, discret, que vous pouvez faire partout.",
      },
      {
        h: "3. Gardez les ongles courts et soignés",
        p: "Moins il y a de matière, moins il y a à ronger. Coupez et limez régulièrement. Beaucoup de personnes constatent qu'un ongle propre et net, dont on prend soin, donne moins envie d'être abîmé. C'est un cercle vertueux tout simple.",
      },
      {
        h: "4. Créez un rappel visuel",
        p: "Le vernis au goût amer fonctionne pour certains. Une autre astuce, plus douce : porter un objet au doigt ou au poignet qui, chaque fois que la main monte, vous rappelle votre intention. Ce micro-rappel suffit souvent à interrompre le geste avant qu'il ne devienne automatique.",
      },
      {
        h: "5. Agissez sur le stress, à la source",
        p: "Se ronger les ongles est un symptôme ; le stress est souvent la cause. Quelques minutes de respiration lente (inspirez sur 4 secondes, expirez sur 6), des vraies pauses loin des écrans et un sommeil suffisant réduisent l'anxiété de fond — et donc l'envie. Traitez la racine, pas seulement la surface.",
      },
    ],
    ctaTitle: "Un geste apaisant, à portée de doigts",
    ctaBody:
      "Beaucoup de personnes combinent ces méthodes avec un objet discret à faire tourner entre les doigts pour occuper leurs mains. C'est exactement l'idée de Pulse : une bague anti-stress rotative en acier inoxydable, à faire tourner sans y penser, en réunion comme dans les transports.",
    ctaButton: "Découvrir la bague Pulse",
  },
  en: {
    eyebrow: "Wellness tips",
    title: "How to stop biting your nails: 5 methods that work",
    intro:
      "Nail biting (onychophagia) affects nearly one adult in three. It is not just a bad habit: it is most often a response to stress, boredom or concentration. The good news is that you can break free from it. Here are 5 simple methods, no complicated equipment needed.",
    sections: [
      {
        h: "1. Spot your trigger moments",
        p: "Nobody bites their nails at random. It is almost always tied to a specific moment: a tense meeting, commuting, in front of a screen, before sleep. For a few days, note when your hand moves toward your mouth. Becoming aware of the trigger is already half the battle.",
      },
      {
        h: "2. Keep your hands busy in another way",
        p: "The most effective method is not to forbid the gesture, but to replace it. This is called habit substitution: give your fingers something else to do. A stress ball, an elastic band, or a ring that spins between your fingers keeps the hand busy at the exact moment the urge rises. The stress gesture becomes a calming, discreet one you can do anywhere.",
      },
      {
        h: "3. Keep your nails short and cared for",
        p: "The less material there is, the less there is to bite. Trim and file regularly. Many people find that a clean, neat nail they take care of feels less tempting to damage. It is a simple virtuous circle.",
      },
      {
        h: "4. Create a visual reminder",
        p: "Bitter-tasting polish works for some. A gentler trick: wear an object on your finger or wrist that, each time your hand rises, reminds you of your intention. This micro-reminder is often enough to interrupt the gesture before it becomes automatic.",
      },
      {
        h: "5. Address stress at the source",
        p: "Nail biting is a symptom; stress is often the cause. A few minutes of slow breathing (breathe in for 4 seconds, out for 6), real breaks away from screens and enough sleep reduce background anxiety — and therefore the urge. Treat the root, not just the surface.",
      },
    ],
    ctaTitle: "A calming gesture, at your fingertips",
    ctaBody:
      "Many people combine these methods with a discreet object to spin between their fingers to keep their hands busy. That is exactly the idea behind Pulse: a spinning anti-stress ring in stainless steel, to turn without thinking, in meetings or on the go.",
    ctaButton: "Discover the Pulse ring",
  },
};

export default async function NailBitingArticle({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = CONTENT[locale];

  // Donnée structurée Article : aide Google à comprendre la page éditoriale.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: META[locale].description,
    inLanguage: locale === "fr" ? "fr-FR" : "en-US",
    author: { "@type": "Organization", name: "OBSIDIAN" },
    publisher: { "@type": "Organization", name: "OBSIDIAN" },
    mainEntityOfPage: `${SITE_URL}/${locale}${SLUG}`,
  };

  return (
    <main className="mx-auto max-w-2xl px-6 pb-28 pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />
      <p className="mb-6 text-center font-mono text-xs tracking-[0.4em] text-graphite uppercase">
        {c.eyebrow}
      </p>
      <h1 className="text-center text-3xl font-semibold leading-tight text-holo md:text-4xl">
        {c.title}
      </h1>
      <p className="mt-8 text-lg leading-relaxed text-chrome">{c.intro}</p>

      <div className="mt-14 space-y-10">
        {c.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-semibold text-titanium">{s.h}</h2>
            <p className="mt-3 leading-relaxed text-graphite">{s.p}</p>
          </section>
        ))}
      </div>

      {/* CTA produit — Pulse présenté comme un outil parmi d'autres. */}
      <div className="mt-16 glass rounded-[--radius-luxe] p-8 text-center">
        <h2 className="text-lg font-semibold text-chrome">{c.ctaTitle}</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-graphite">
          {c.ctaBody}
        </p>
        <Link
          href={`/${locale}/produit/${PULSE_HANDLE}`}
          className="glass ring-neon mt-6 inline-block rounded-[--radius-luxe] px-8 py-3 text-sm font-medium text-chrome transition-transform duration-300 hover:scale-[1.03]"
        >
          {c.ctaButton}
        </Link>
      </div>
    </main>
  );
}
