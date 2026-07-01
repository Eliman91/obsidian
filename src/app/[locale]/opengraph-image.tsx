import { ImageResponse } from "next/og";

/* =============================================================
   OPEN GRAPH IMAGE — visuel de partage (réseaux sociaux, WhatsApp,
   iMessage, Slack…). Générée au build pour /fr et /en.
   Sans elle, un lien partagé s'affiche nu → taux de clic en berne.
   ============================================================= */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "OBSIDIAN — Gadgets futuristes de luxe";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tagline =
    locale === "en"
      ? "Futuristic Luxury Gadgets — Titanium & Chrome"
      : "Gadgets futuristes de luxe — Titane & Chrome";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 50% 120%, rgba(0,243,255,0.18) 0%, rgba(112,0,255,0.10) 40%, transparent 70%)",
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 700,
            letterSpacing: "0.35em",
            color: "#f5f5f7",
            display: "flex",
            // Compense l'espacement de la dernière lettre pour un centrage optique.
            paddingLeft: "0.35em",
          }}
        >
          OBSIDIAN
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 30,
            letterSpacing: "0.18em",
            color: "#00f3ff",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            marginTop: 60,
            width: 160,
            height: 2,
            backgroundColor: "rgba(229,229,229,0.35)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
