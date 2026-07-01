import "server-only";

/* =============================================================
   RATE LIMITER — limite de débit en mémoire, par adresse IP.
   Empêche le spam basique des routes API publiques (bots).
   ------------------------------------------------------------
   LIMITE CONNUE : en serverless (Vercel), chaque instance a sa
   propre mémoire → la limite est "par instance", pas globale.
   Suffisant contre le spam naïf ; pour du trafic sérieux,
   passer à Upstash Ratelimit (Redis) ou Vercel WAF.
   ============================================================= */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Nettoyage paresseux pour éviter une fuite mémoire. */
function sweep(now: number) {
  if (buckets.size < 1_000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Retourne true si la requête est autorisée, false si la limite est atteinte.
 * @param key      Identifiant (ex. `subscribe:1.2.3.4`).
 * @param limit    Nombre max de requêtes par fenêtre.
 * @param windowMs Durée de la fenêtre en millisecondes.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Extrait l'IP client des en-têtes proxy (Vercel : x-forwarded-for). */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
