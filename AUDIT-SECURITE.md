# Audit sécurité — OBSIDIAN (2026-07-02)

Périmètre : code du storefront Next.js, routes API, dépendances, secrets, configuration Shopify. Verdict global : base saine (validation des entrées, rate limiting, secrets bien gérés), mais aucun en-tête de sécurité et une dépendance vulnérable. Tout est corrigé ci-dessous.

---

## Corrigé dans cette passe

### 1. Aucun en-tête de sécurité HTTP → ajoutés (next.config.ts)
Le site ne servait ni CSP, ni HSTS, ni X-Frame-Options. Ajoutés sur toutes les routes :
- **Content-Security-Policy** sur liste blanche stricte : uniquement `cdn.shopify.com` (images + modèles 3D), `raw.githack.com` (HDRI du rendu 3D), Google Tag Manager/Analytics (GA4). `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.
- **Strict-Transport-Security** (2 ans, includeSubDomains, preload).
- **X-Content-Type-Options** nosniff, **X-Frame-Options** DENY (anti-clickjacking), **Referrer-Policy** strict-origin-when-cross-origin, **Permissions-Policy** (caméra, micro, géoloc… coupés).
- `'unsafe-eval'` autorisé uniquement en dev (React Refresh) ; jamais en production.

### 2. Dépendance vulnérable → 0 vulnérabilité
`postcss < 8.5.10` (XSS, GHSA-qx2v-qp2m-jg93) tiré par Next. Corrigé par un `overrides` npm forçant `postcss ^8.5.10`. `npm audit` : **0 vulnérabilité**.

### 3. Injection possible dans les scripts JSON-LD → échappement
Les 7 blocs JSON-LD étaient injectés via `JSON.stringify` brut : une valeur contenant `</script>` (titre ou description produit) aurait fermé la balise et exécuté du HTML arbitraire. Nouveau helper `safeJsonLd()` (échappe `<` en `<`, comme la sérialisation interne de Next), appliqué partout.

### 4. Dépendance morte supprimée
`@mux/mux-player-react` était déclaré mais jamais importé : retiré (surface d'attaque et bruit d'audit en moins, −13 packages).

---

## Vérifié sain (rien à changer)

- **Secrets** : `.env*` bien ignoré par git (aucun fichier d'env dans l'historique), token Storefront utilisé exclusivement côté serveur (`server-only`), aucun secret en `NEXT_PUBLIC_*`.
- **Routes API** : `/api/checkout` et `/api/subscribe` valident strictement leurs entrées (types, formats, bornes), limitent le débit par IP, et renvoient des messages d'erreur génériques (pas de fuite interne). Honeypot anti-bot sur l'inscription, garde-fou serveur contre l'achat des produits « drop à venir ».
- **Prix non falsifiables** : le panier local n'envoie que des IDs de variantes ; les prix sont recalculés par Shopify au checkout.
- **Proxy i18n** : redirections limitées à la même origine (pas d'open redirect).
- **GA4** : chargé uniquement après consentement, IP anonymisée.
- **Checkout** : hébergé par Shopify (PCI-DSS géré par eux, rien à faire).

---

## Points acceptés en connaissance de cause

1. **HTML Shopify injecté tel quel** (`descriptionHtml` produits, pages légales) : contenu que TOI seul édites dans l'admin. Risque accepté tant que l'accès admin est protégé ; la CSP limite désormais l'impact d'un éventuel script injecté. Si un jour d'autres personnes éditent le contenu, ajouter une sanitisation (ex. `sanitize-html`).
2. **Rate limiting en mémoire** : par instance serverless, pas global. Suffisant contre le spam naïf ; pour du trafic sérieux, passer à Upstash Ratelimit ou au WAF Vercel (déjà documenté dans le code).
3. **HDRI 3D depuis raw.githack.com** : dépendance tierce à l'exécution, désormais bornée par la CSP. Mieux : télécharger `studio_small_03_1k.hdr` (drei-assets GitHub), le placer dans `/public/hdri/` et passer `files="/hdri/studio_small_03_1k.hdr"` à `<Environment>` — tu pourras alors retirer `raw.githack.com` de la CSP.
4. **`'unsafe-inline'` dans script-src** : requis par les scripts inline de Next et l'init GA sans infrastructure de nonces. Une CSP à nonces (via le proxy) serait le cran au-dessus — chantier optionnel.

## À vérifier manuellement (2 min)

- **Admin Shopify > Boutique en ligne > Préférences** : confirmer que la protection par mot de passe de `1jbrjy-qc.myshopify.com` est active (elle semble l'être — la vitrine ne répond pas publiquement). Sinon, l'activer : évite qu'on achète ou indexe hors du site headless.
- **Compte Shopify** : activer la double authentification (Settings > Users > Security) si ce n'est pas fait — c'est la porte d'entrée la plus critique de toute la boutique.
- Après déploiement : tester les en-têtes sur https://securityheaders.com (attendu : A/A+).
