import Link from "next/link";

/* =============================================================
   404 — page introuvable, habillée aux couleurs OBSIDIAN.
   (Les composants not-found ne reçoivent pas de params : on
   renvoie vers "/", le proxy redirige vers la bonne langue.)
   ============================================================= */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-7xl font-semibold text-holo md:text-9xl">404</p>
      <h1 className="mt-6 text-lg font-medium text-chrome">
        Cette page appartient à un futur qui n&apos;existe pas.
      </h1>
      <p className="mt-3 text-sm text-graphite">
        This page belongs to a future that doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="glass ring-neon mt-10 rounded-[--radius-luxe] px-8 py-3 text-sm font-medium text-chrome transition-transform duration-300 hover:scale-[1.03]"
      >
        ← Retour · Home
      </Link>
    </main>
  );
}
