import "server-only";

/* =============================================================
   CLIENT SALESFORCE (Commerce / Marketing Cloud)
   Utilisé pour le CRM du "Club Privé" : profils clients haut de gamme,
   points de fidélité, segments VIP. Auth OAuth 2.0 (client credentials).
   ------------------------------------------------------------
   NOTE : squelette prêt à brancher. On centralise ici l'obtention
   du token et l'appel REST pour ne pas disperser les secrets.
   ============================================================= */

interface SalesforceToken {
  accessToken: string;
  instanceUrl: string;
  /** Timestamp (ms) d'expiration pour la mise en cache. */
  expiresAt: number;
}

let cachedToken: SalesforceToken | null = null;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`[salesforce] Variable manquante : ${name}`);
  return value;
}

/** Récupère (et met en cache) un token OAuth Salesforce. */
async function getAccessToken(): Promise<SalesforceToken> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken;
  }

  const res = await fetch(`${env("SALESFORCE_LOGIN_URL")}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env("SALESFORCE_CLIENT_ID"),
      client_secret: env("SALESFORCE_CLIENT_SECRET"),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`[salesforce] Auth échouée : ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    instance_url: string;
    issued_at: string;
  };

  cachedToken = {
    accessToken: json.access_token,
    instanceUrl: json.instance_url,
    expiresAt: Date.now() + 30 * 60 * 1000, // ~30 min
  };
  return cachedToken;
}

/** Appel générique typé à l'API REST Salesforce. */
export async function salesforceRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${token.instanceUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`[salesforce] ${path} : ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
