import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "../dictionaries";
import { isLocale } from "@/lib/i18n";
import { CartView } from "@/components/ui/CartView";

export const metadata: Metadata = {
  title: "Panier — OBSIDIAN",
  robots: { index: false }, // page panier : pas d'indexation moteur.
};

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
    </main>
  );
}
