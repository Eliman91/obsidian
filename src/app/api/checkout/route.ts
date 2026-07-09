import { NextResponse, type NextRequest } from "next/server";
import { createCheckoutUrl, type CheckoutLineInput } from "@/lib/shopify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { WELCOME_DISCOUNT_CODE } from "@/lib/site";
import { isLocale } from "@/lib/i18n";

/* =============================================================
   POST /api/checkout
   Corps attendu : { lines: [{ variantId, quantity }], locale? }
   Réponse : { url } — URL de paiement Shopify sécurisée.
   Le code de bienvenue est appliqué d'office (Shopify le retire
   seul s'il n'est pas applicable) et le checkout est servi dans
   la langue du visiteur.
   Garde-fous : 20 lignes max, 99 unités max par ligne, 10 req/min/IP.
   ============================================================= */

const MAX_LINES = 20;
const MAX_QUANTITY = 99;
const MAX_ATTRIBUTES = 5;
const MAX_ATTR_VALUE = 100;

/** Valide les attributs de ligne optionnels (ex. texte de gravure). */
function areValidAttributes(value: unknown): boolean {
  if (value === undefined) return true;
  if (!Array.isArray(value) || value.length > MAX_ATTRIBUTES) return false;
  return value.every((attr) => {
    if (typeof attr !== "object" || attr === null) return false;
    const a = attr as Record<string, unknown>;
    return (
      typeof a.key === "string" &&
      a.key.length > 0 &&
      a.key.length <= 50 &&
      typeof a.value === "string" &&
      a.value.length > 0 &&
      a.value.length <= MAX_ATTR_VALUE
    );
  });
}

function isValidLine(value: unknown): value is CheckoutLineInput {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.variantId === "string" &&
    line.variantId.startsWith("gid://shopify/ProductVariant/") &&
    typeof line.quantity === "number" &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0 &&
    line.quantity <= MAX_QUANTITY &&
    areValidAttributes(line.attributes)
  );
}

export async function POST(request: NextRequest) {
  if (!rateLimit(`checkout:${clientIp(request.headers)}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessaie dans une minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const lines = (body as { lines?: unknown }).lines;
  if (
    !Array.isArray(lines) ||
    lines.length === 0 ||
    lines.length > MAX_LINES ||
    !lines.every(isValidLine)
  ) {
    return NextResponse.json(
      { error: "Panier invalide ou vide." },
      { status: 400 },
    );
  }

  // Locale du visiteur (langue du checkout Shopify). "fr" par défaut.
  const rawLocale = (body as { locale?: unknown }).locale;
  const locale = typeof rawLocale === "string" && isLocale(rawLocale) ? rawLocale : "fr";

  try {
    const url = await createCheckoutUrl(lines, {
      locale,
      // Boutique France/EUR : pays présumé de livraison.
      countryCode: "FR",
      discountCodes: [WELCOME_DISCOUNT_CODE],
    });
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[api/checkout]", error);
    return NextResponse.json(
      { error: "Impossible de créer le paiement." },
      { status: 502 },
    );
  }
}
