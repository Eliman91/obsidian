import { NextResponse, type NextRequest } from "next/server";
import { createCheckoutUrl, type CheckoutLineInput } from "@/lib/shopify";

/* =============================================================
   POST /api/checkout
   Corps attendu : { lines: [{ variantId, quantity }] }
   Réponse : { url } — URL de paiement Shopify sécurisée.
   ============================================================= */

function isValidLine(value: unknown): value is CheckoutLineInput {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.variantId === "string" &&
    line.variantId.startsWith("gid://shopify/ProductVariant/") &&
    typeof line.quantity === "number" &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const lines = (body as { lines?: unknown }).lines;
  if (!Array.isArray(lines) || lines.length === 0 || !lines.every(isValidLine)) {
    return NextResponse.json(
      { error: "Panier invalide ou vide." },
      { status: 400 },
    );
  }

  try {
    const url = await createCheckoutUrl(lines);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[api/checkout]", error);
    return NextResponse.json(
      { error: "Impossible de créer le paiement." },
      { status: 502 },
    );
  }
}
