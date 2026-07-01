import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";

/* =============================================================
   PROXY (ex-Middleware, renommé en Next.js 16)
   Rôle : routing i18n par sous-chemin (/fr, /en).
   Redirige toute requête sans locale vers la meilleure locale
   déduite de l'en-tête Accept-Language.
   ============================================================= */

function resolveLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language") ?? "";
  // Ex. "en-US,en;q=0.9,fr;q=0.8" -> ["en-us", "en", "fr"]
  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase());

  for (const lang of preferred) {
    const base = lang.split("-")[0];
    const match = LOCALES.find((l) => l === base);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = resolveLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // On ignore les assets internes, l'API et les fichiers avec extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
