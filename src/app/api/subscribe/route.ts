import { NextResponse, type NextRequest } from "next/server";
import { subscribeEmail } from "@/lib/shopify";

/* =============================================================
   POST /api/subscribe
   Corps : { email }
   Enregistre l'email comme client Shopify (capture newsletter).
   ============================================================= */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const email = (body as { email?: unknown }).email;
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  try {
    await subscribeEmail(email.trim().toLowerCase());
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/subscribe]", error);
    return NextResponse.json(
      { error: "Inscription impossible. Réessaie." },
      { status: 502 },
    );
  }
}
