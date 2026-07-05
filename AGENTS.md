<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# État Shopify (source de vérité produits)

_Dernière synchro : 2026-07-04._ Boutique headless (canal **Headless** publié sur le site Vercel). **Plancher de gamme = 69 €** ; Pulse (39 €) = produit d'appel.

| Produit | Prix | SKU | Statut Shopify | Mode site | Note |
|---|---|---|---|---|---|
| Halo | 890 € | OBS-HALO-TI | ACTIVE | drop-à-venir | Reprice 890→119 € **validé sur le principe, PAS encore appliqué** (attente échantillon) |
| Prism | 2400 € | OBS-PRISM-CH | ACTIVE | drop-à-venir | Concept |
| Aura | 1590 € | OBS-AURA-TI | ACTIVE | drop-à-venir | Concept |
| Nexus | 640 € | OBS-NEXUS-CH | ACTIVE | drop-à-venir | Concept |
| Cipher | 490 € | OBS-CIPHER-TI | ACTIVE | drop-à-venir | Concept |
| Dock | 140 € | OBS-DOCK-TI | ACTIVE | **achetable** | Produit d'entrée existant |
| Vault | 95 € | OBS-VAULT-TI | ACTIVE | drop-à-venir (publié Headless) | Porte-cartes RFID titane, éd-500 |
| Zephyr | 69 € | OBS-ZEPHYR-ST | ACTIVE | drop-à-venir (publié Headless) | Collier de respiration acier 316L, anti-stress, éd-500 |
| Cryo | 79 € | OBS-CRYO-SS | ACTIVE | drop-à-venir (publié Headless) | Kit gua sha + roller cryo inox, bien-être, éd-500 |
| **Pulse** | **39 € / 54 € gravée** | **OBS-PULSE-ST-07…13 / OBS-PULSE-STG-07…13** | ACTIVE (gid 15577208750420) | drop-à-venir (publié canal Headless) | **Bague anti-stress rotative ACIER INOX (dropship AliExpress), éd-500. 14 variantes : tailles 7-13 × Sans gravure (39 €) / Gravure personnalisée (54 €). SEO + traductions EN enregistrées. Stock 500 (250+250). Le doublon initial est ARCHIVÉ sous handle `obsidian-pulse-old` — ne pas le réactiver.** |

**Règles à respecter :**
- **Coming-soon** = statut `ACTIVE` + tag `drop-a-venir` + publié sur canal **Headless**. Le site rend automatiquement toute fiche publiée (route dynamique `[handle]`) → **aucun code par produit nécessaire**.
- **Badge de rareté « N pièces numérotées »** = piloté **uniquement** par le metafield `custom.edition_size` (number_integer), PAS par le tag `éd-500` (`ScarcityBadge` via `shopify.ts:214` : metafield vide → badge masqué). **Tout produit `éd-500` DOIT avoir `custom.edition_size = 500`.** _Fait le 2026-07-05 : backfill `edition_size=500` sur Pulse, Zephyr, Cryo, Vault (avaient le tag mais pas le metafield → badge invisible)._
- **Pulse** créé **manuellement via API** (pas AutoDS). Quand il passe en vente réelle : dans AutoDS, **ATTACHER au produit existant** (monitor existing product), ne PAS ré-importer → évite un doublon.
- **Matière Pulse = acier inoxydable.** NE JAMAIS écrire « titane » pour Pulse tant que l'échantillon n'est pas validé (316L à confirmer).
- **Collection « Anti-stress » CRÉÉE** (gid://shopify/Collection/718162559316, handle `anti-stress`, publiée canal Headless) = Pulse + Zephyr + Cryo. Cross-sell auto entre eux ; la rendre visible sur le site (nav / bloc collection).
- **Halo** : reprise 890 → 119 € à faire dans Shopify **après** réception d'un échantillon réel. Pas encore appliqué.
- **Gravure Pulse (à implémenter côté site)** : pour les variantes « Gravure personnalisée » (54 €), afficher un champ texte (max 20 caractères, une police) sur la page produit et l'envoyer comme **line item property** (attribut de ligne du panier, ex. `properties[Gravure]`) via le Storefront API, avec confirmation du texte avant paiement. Mentionner : pièces gravées préparées à l'unité (+2-3 jours), ni reprises ni échangées (exclusion légale du droit de rétractation UE pour produits personnalisés).
- **Coût fournisseur Pulse confirmé** : lot de 6 à 11,19 € (~1,87 €/bague, 9,99 €/lot dès 2 lots). Marge brute ≈ 80 % à 39 € après kitting + livraison (~7-9 € de coût livré). Échantillon commandé à valider avant bascule en vente réelle (qualité PVD, rotation, absence de gravure « Bobisty »).
- **Tracking (fait le 2026-07-05 via Cowork)** : `Analytics.tsx` étendu — GA4 + pixel Meta + pixel TikTok, chacun derrière le consentement (`obsidian:consent`) et son env var (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, ajoutées à `.env.example`). **À faire par Claude Code : `npm run build` pour vérifier, puis déployer.** Eliesse crée les 3 comptes et renseigne les IDs dans Vercel (guide : `TRACKING-SETUP.md`). Amélioration future : événements e-commerce côté site (view_item, add_to_cart) via gtag/fbq/ttq — le checkout est tracké via les canaux Shopify (Google & YouTube, Facebook & Instagram).
