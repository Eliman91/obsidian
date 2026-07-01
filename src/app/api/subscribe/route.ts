import { NextResponse, type NextRequest } from "next/server";
import { subscribeEmail } from "@/lib/shopify";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/* =============================================================
   POST /api/subscribe
   Corps : { email, website? }
   Enregistre l'email comme client Shopify (capture newsletter).
   Protections anti-bot :
   • honeypot : le champ caché "website" doit rester vide
     (les bots remplissent tout, les humains ne le voient pas)
   • rate limit : 5 requêtes / minute / IP
   ============================================================= */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  if (!rateLimit(`subscribe:${clientIp(request.headers)}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessaie dans une minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const { email, website } = body as { email?: unknown; website?: unknown };

  // Honeypot rempli → bot. On répond OK pour ne pas l'alerter, sans rien créer.
  if (typeof website === "string" && website.length > 0) {
    return NextResponse.json({ ok: true });
  }

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
