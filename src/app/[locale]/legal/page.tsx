import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/site";
import { getShopPolicies, type ShopPolicy } from "@/lib/shopify";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "en"
        ? "Legal information — OBSIDIAN"
        : "Informations légales — OBSIDIAN",
    alternates: localizedAlternates("/legal", locale),
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  let policies: ShopPolicy[] = [];
  try {
    policies = await getShopPolicies();
  } catch {
    // Shopify indisponible : on affiche l'état vide plus bas.
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-28 pt-32">
      <h1 className="mb-12 text-3xl font-semibold text-holo md:text-4xl">
        Informations légales
      </h1>

      {policies.length === 0 ? (
        <p className="text-sm text-graphite">
          Les mentions légales seront publiées prochainement.
        </p>
      ) : (
        <div className="space-y-16">
          {policies.map((policy) => (
            <section key={policy.title} id={slugify(policy.title)}>
              <h2 className="mb-5 text-xl font-semibold text-chrome">
                {policy.title}
              </h2>
              <div
                className="space-y-3 text-sm leading-relaxed text-graphite [&_a]:text-cyan [&_h2]:mt-6 [&_h2]:font-medium [&_h2]:text-chrome [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-chrome"
                dangerouslySetInnerHTML={{ __html: policy.body }}
              />
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

/** Slug ASCII simple ; la normalisation NFD + le filtre a-z0-9 retirent les accents. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
