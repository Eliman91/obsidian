import "server-only";

/* =============================================================
   CLIENT SANITY (CMS headless)
   Contenu éditorial de luxe : storytelling produit, lookbooks,
   pages "savoir-faire", traductions FR/EN. Interrogé via GROQ.
   ------------------------------------------------------------
   Squelette léger sans dépendance : on tape directement l'API
   HTTP de Sanity (endpoint `query`) pour garder le bundle minimal.
   ============================================================= */

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`[sanity] Variable manquante : ${name}`);
  return value;
}

const PROJECT_ID = () => env("SANITY_PROJECT_ID");
const DATASET = () => process.env.SANITY_DATASET ?? "production";
const API_VERSION = "2025-02-19";

/**
 * Exécute une requête GROQ typée.
 * @param query  Requête GROQ.
 * @param params Paramètres (interpolés côté serveur Sanity).
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const url = new URL(
    `https://${PROJECT_ID()}.api.sanity.io/v${API_VERSION}/data/query/${DATASET()}`,
  );
  url.searchParams.set("query", query);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env("SANITY_API_READ_TOKEN")}` },
    // ISR : le contenu éditorial change peu, on le revalide toutes les 60 s.
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`[sanity] Requête échouée : ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { result: T };
  return json.result;
}
