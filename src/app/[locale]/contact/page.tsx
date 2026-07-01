import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { CONTACT_EMAIL, WHATSAPP_URL, localizedAlternates } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Contact — OBSIDIAN" : "Contact — OBSIDIAN",
    description:
      locale === "en"
        ? "A question or an issue? Reach the OBSIDIAN team by WhatsApp or email."
        : "Une question, un problème ? Contactez l'équipe OBSIDIAN par WhatsApp ou email.",
    alternates: localizedAlternates("/contact", locale),
  };
}

const COPY = {
  fr: {
    eyebrow: "Contact",
    title: "Une question, un problème ?",
    subtitle:
      "Notre conciergerie vous répond. Choisissez le canal qui vous convient — réponse sous 24 h ouvrées.",
    whatsapp: "Écrire sur WhatsApp",
    email: "Envoyer un email",
  },
  en: {
    eyebrow: "Contact",
    title: "A question or an issue?",
    subtitle:
      "Our concierge is here to help. Pick the channel you prefer — reply within 24 business hours.",
    whatsapp: "Message us on WhatsApp",
    email: "Send an email",
  },
} as const;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = COPY[locale];

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-32 text-center">
      <p className="mb-4 font-mono text-xs tracking-[0.4em] text-graphite uppercase">
        {c.eyebrow}
      </p>
      <h1 className="text-4xl font-semibold text-holo md:text-5xl">{c.title}</h1>
      <p className="mt-5 max-w-md text-graphite">{c.subtitle}</p>

      <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ring-neon flex items-center justify-center gap-2 rounded-full bg-cyan px-7 py-3 text-sm font-semibold text-vantablack transition-all hover:brightness-110"
        >
          <span aria-hidden>💬</span> {c.whatsapp}
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="glass flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-chrome transition-transform hover:scale-[1.03]"
        >
          <span aria-hidden>✉️</span> {c.email}
        </a>
      </div>

      <p className="mt-8 font-mono text-xs tracking-wide text-graphite/70">
        {CONTACT_EMAIL}
      </p>
    </main>
  );
}
