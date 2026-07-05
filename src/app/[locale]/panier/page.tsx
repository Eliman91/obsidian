import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "../dictionaries";
import { isLocale } from "@/lib/i18n";
import { CartView } from "@/components/ui/CartView";
import { ReassuranceBar } from "@/components/ui/ReassuranceBar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Cart — OBSIDIAN" : "Panier — OBSIDIAN",
    robots: { index: false }, // page panier : pas d'indexation moteur.
  };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-28 pt-32">
      <h1 className="mb-10 text-3xl font-semibold text-holo md:text-4xl">
        {dict.cart.title}
      </h1>
      <CartView locale={locale} labels={dict.cart} />

      {/* Réassurance répétée à l'étape panier : à ces niveaux de prix,
          rappeler paiement sécurisé / retours au moment de payer est clé. */}
      <div className="mt-12">
        <ReassuranceBar locale={locale} />
      </div>
    </main>
  );
}
