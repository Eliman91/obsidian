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
| Dock | 140 € | OBS-DOCK-TI | ACTIVE | drop-à-venir (depuis le 2026-07-06) | Produit d'entrée — repasse achetable après validation de son échantillon |
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
- **Alignement honnêteté dropshipping (2026-07-06, Cowork)** : les 6 fiches d'origine affichaient « Livraison France 2-5 jours » — remplacé partout (FR + traductions EN resynchronisées) par « Expédition suivie sous 10 à 20 jours — série limitée préparée à la demande ». Dock est passé en drop-à-venir : PLUS AUCUN produit n'est achetable tant que SIRET + échantillon ne sont pas validés. Ne pas réintroduire de promesse de délai court sans preuve du transporteur.
- **Visuels produits ajoutés le 2026-07-06 (Cowork)** : Vault, Zephyr et Cryo ont maintenant chacun 1 image (rendus 3D IA, alt "Rendu 3D — …", stockés sur le CDN Shopify). À remplacer par des photos réelles à réception des échantillons. Dock/Cipher/Nexus n'ont qu'1 image chacun — prévoir un 2e angle.
- **IDs tracking** : GA4 `G-EKVKMM2PYS` et Meta pixel `2804899086548558` — **poussés sur Vercel (production + preview) et déployés + vérifiés dans le bundle prod le 2026-07-07**. ⚠️ _Correction 2026-07-07 : l'ID Meta noté ici le 06/07 (`1366039795510799`) était erroné ; Eliesse a confirmé dans Meta Events Manager que le bon pixel est `2804899086548558`. `.env.local` et Vercel réalignés dessus — NE PAS remettre `1366...`._ TikTok pixel : en attente (Events Manager inaccessible pour l'instant, réessayer dans 24-48 h), la variable reste vide = traceur inactif, rien à faire.
- **🔴 Faille CSP corrigée (2026-07-07, Claude Code)** : la `Content-Security-Policy` de `next.config.ts` n'autorisait que Google Tag Manager → **le pixel Meta était silencieusement bloqué par le navigateur et ne se déclenchait pas** (l'ID était dans le bundle, mais le script `connect.facebook.net` était refusé). Ajouté à la CSP : `connect.facebook.net` + `www.facebook.com` (script/img/connect) pour Meta, `analytics.tiktok.com` pour TikTok. **Déployé + vérifié en-tête prod le 2026-07-07.** Si tu ajoutes un nouveau traceur/domaine externe, PENSE à l'autoriser dans la CSP sinon il sera muet.
- **Tracking (fait le 2026-07-05 via Cowork)** : `Analytics.tsx` étendu — GA4 + pixel Meta + pixel TikTok, chacun derrière le consentement (`obsidian:consent`) et son env var (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, ajoutées à `.env.example`). **À faire par Claude Code : `npm run build` pour vérifier, puis déployer.** Eliesse crée les 3 comptes et renseigne les IDs dans Vercel (guide : `TRACKING-SETUP.md`). Amélioration future : événements e-commerce côté site (view_item, add_to_cart) via gtag/fbq/ttq — le checkout est tracké via les canaux Shopify (Google & YouTube, Facebook & Instagram).
