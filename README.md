# OBSIDIAN — Gadgets futuristes de luxe

Site e-commerce **headless** (découplé) haut de gamme : vitrine 3D interactive de gadgets de luxe, pilotée par Shopify.

🔗 **Démo en ligne** : https://obsidian-mauve-chi.vercel.app

## ✨ Fonctionnalités

- **Configurateur 3D** temps réel (Three.js) piloté au scroll, style « Apple »
- **Headless Shopify** : catalogue, produits et prix via la Storefront API GraphQL
- **Internationalisation** FR/EN (routing localisé)
- **Design system** sur mesure (Tailwind v4, glassmorphism, néons holographiques)
- **Panier** persistant + pages produit dynamiques
- **SEO** complet : sitemap, robots, métadonnées Open Graph, données structurées JSON-LD

## 📊 Performance

Audit Lighthouse (desktop) :

| Performance | Accessibilité | Bonnes pratiques | SEO |
|:---:|:---:|:---:|:---:|
| 99 | 96 | 96 | 100 |

## 🛠️ Stack technique

- **Next.js 16** (App Router, React 19, Server Components)
- **TypeScript**
- **Three.js** + React Three Fiber + Drei
- **GSAP** (ScrollTrigger) + Lenis (smooth scroll)
- **Tailwind CSS v4**
- **Shopify Storefront API** (canal Headless)
- **Déploiement** : Vercel

## 🚀 Démarrage local

```bash
npm install
cp .env.example .env.local   # renseigner les clés Shopify
npm run dev
```

---

Projet réalisé comme vitrine de compétences (front-end, 3D, e-commerce headless).
