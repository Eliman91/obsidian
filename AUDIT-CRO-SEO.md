# Audit CRO + SEO — OBSIDIAN (2026-07-02)

Périmètre : site live (obsidian-mauve-chi.vercel.app), code du storefront, catalogue Shopify (6 produits actifs, 5 collections). Constats vérifiés sur le site en production et via l'API Admin.

---

## P1 — Critique (fort impact, faible effort)

### 1. Le site /en sert du contenu produit 100 % français
Vérifié en prod : `/en/produit/obsidian-aura` affiche description, points forts, spécifications et meta description en français. Le hreflang déclare pourtant ces pages comme anglaises → signal contradictoire pour Google (contenu dupliqué en mauvaise langue), et expérience dissuasive pour un acheteur anglophone sur des produits à 490–2 400 €.

Cause racine (double) :
- Shopify : la locale `en` existe mais est **non publiée** et **0 traduction** n'est enregistrée.
- Code : les requêtes Storefront n'utilisent pas la directive `@inContext(language: ...)` — même traduits, les produits resteraient en FR.

Correctif : traduire les produits (Translate & Adapt, gratuit) + publier la locale EN + ajouter `@inContext(language: $language)` dans `src/lib/shopify.ts`. En attendant, option de repli : retirer `/en` du sitemap et des hreflang plutôt que d'exposer des pages mixtes.

### 2. Les champs SEO Shopify sont soignés… et ignorés par le site
Chaque produit a un `seo.title` et une `seo.description` bien rédigés dans Shopify (ex. « OBSIDIAN Aura — Casque audio à lévitation magnétique »). Le storefront n'exploite pas ces champs : il génère `title` = `{titre} — OBSIDIAN` et `description` = `description.slice(0, 155)`, ce qui coupe en plein mot (vérifié en prod : « …scène sonore spat »).

Correctif : ajouter `seo { title description }` au fragment GraphQL et l'utiliser dans `generateMetadata` (fallback sur l'actuel).

### 3. Métadonnées Twitter non surchargées sur les fiches produit
Vérifié en prod : sur une fiche produit, `twitter:title` et `twitter:description` restent ceux de la page d'accueil (hérités du layout). Un partage de fiche produit sur X affiche le mauvais texte.

Correctif : compléter `generateMetadata` de la page produit (twitter + og cohérents).

### 4. JSON-LD Product incomplet
Le schéma actuel omet : `sku` (disponible : OBS-AURA-TI…), `priceValidUntil`, `hasMerchantReturnPolicy` et `shippingDetails` (les données réelles existent : retours 30 j, garantie 2 ans, livraison FR 2-5 j / UE 5-10 j). Ce sont les avertissements classiques de Search Console qui limitent l'éligibilité aux résultats enrichis Marchand.

Manquent aussi : `BreadcrumbList` (fiches produit) et `Organization` + `WebSite` (accueil).

---

## P2 — Conversion (impact direct sur le tunnel)

### 5. WELCOME10 annoncé partout, appliqué nulle part
Le code promo est promu sur le hero et le popup exit-intent, mais le client doit le retaper au checkout (friction + oubli = abandon). `cartCreate` accepte `discountCodes` : appliquer automatiquement le code à la création du panier (ou l'ajouter en paramètre du `checkoutUrl`), au minimum pour les visiteurs venus du popup.

### 6. Checkout sans contexte acheteur
`cartCreate` est appelé sans `buyerIdentity` ni langue → un client sur `/en` atterrit sur un checkout en français. Passer la locale (`@inContext`) et `buyerIdentity.countryCode` à la création du panier.

### 7. Réassurance paiement sous-exploitée au panier
La page panier n'affiche ni logos de paiement, ni rappel garantie/retours (présents seulement sur les fiches). À ces niveaux de prix, répéter la réassurance à l'étape panier est standard. Envisager aussi l'affichage du paiement en plusieurs fois si activé côté Shopify.

### 8. Rareté : bord de seuil
« Plus que 500 sur 500 » (stock plein) n'exprime aucune rareté. Masquer la barre quand 0 % vendu, ou basculer en mode statique (« Édition limitée · 500 pièces »).

---

## P3 — Structure & moyen terme

### 9. Collections invisibles
4 collections réelles existent dans Shopify (Wearables, Audio & Image, Maison & Sécurité, Édition limitée) mais aucune page collection côté storefront. Des pages `/collection/[handle]` créeraient des pages d'atterrissage SEO par catégorie + maillage interne. (Collection « Page d'accueil » vide : à supprimer ou utiliser.)

### 10. Sitemap incomplet
`/contact` absent du sitemap ; pas de `lastModified`. Mineur mais gratuit à corriger.

### 11. Images produit
Nexus, Cipher et Dock n'ont qu'une seule image. 3-4 visuels (détail, contexte, échelle) sont la norme du luxe. Les alt existants sont bons.

### 12. Domaine
`*.vercel.app` pénalise la confiance (et un futur changement de domaine remettra le SEO à zéro). Un domaine custom (~10 €/an) est le meilleur ratio effort/impact branding.

### 13. Vérifier l'accès à la boutique myshopify.com
S'assurer que la vitrine `1jbrjy-qc.myshopify.com` est protégée par mot de passe (sinon : contenu dupliqué indexable concurrent du site headless).

---

## Ce qui est déjà bien
Canonicals et hreflang par page, sitemap produits, robots.txt propre, JSON-LD Product présent, alt images descriptifs, cross-sell, sticky buy bar, exit-intent, FAQ, réassurance fiche produit, Lighthouse 99/96/96/100.

## Ordre d'exécution recommandé
1. Quick wins code (constats 2, 3, 4, 8, 10) — une session.
2. WELCOME10 auto-appliqué + buyerIdentity (5, 6).
3. Traductions EN dans Shopify + `@inContext` (1).
4. Pages collections (9), images (11), domaine (12).
