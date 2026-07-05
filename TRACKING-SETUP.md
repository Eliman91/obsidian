# Installation du tracking — ta partie (15 min, tout est gratuit)

> Le code est prêt : GA4 + pixel Meta + pixel TikTok sont intégrés au site, bloqués derrière le bandeau cookies (RGPD ok).
> Chaque traceur ne s'active QUE si son identifiant est renseigné. Il te manque 3 identifiants — les voici, pas à pas.

---

## 1. GA4 — Google Analytics (5 min)
1. Va sur analytics.google.com → Commencer → crée un compte « OBSIDIAN ».
2. Crée une **propriété** « obsidian » (fuseau France, devise EUR).
3. Plateforme : **Web** → URL du site (ton domaine, ou l'URL vercel.app en attendant).
4. Copie l'**ID de mesure** qui commence par `G-` (ex. G-AB12CD34).
→ C'est la valeur de `NEXT_PUBLIC_GA_ID`.

## 2. Pixel Meta — Facebook/Instagram (5 min)
1. Va sur business.facebook.com → crée le compte Business « OBSIDIAN » (gratuit).
2. Menu **Gestionnaire d'événements** → Connecter des données → **Web** → nomme le pixel « obsidian ».
3. Copie l'**ID du pixel** (un nombre à ~15 chiffres).
→ C'est la valeur de `NEXT_PUBLIC_META_PIXEL_ID`.

## 3. Pixel TikTok (5 min)
1. Va sur ads.tiktok.com → crée le compte annonceur (gratuit, aucune pub à lancer).
2. **Outils** → **Événements** → Événements web → **Connecter manuellement** → nomme le pixel « obsidian ».
3. Copie l'**ID du pixel** (commence souvent par C…).
→ C'est la valeur de `NEXT_PUBLIC_TIKTOK_PIXEL_ID`.

---

## 4. Renseigner les 3 identifiants dans Vercel (2 min)
1. vercel.com → ton projet → **Settings** → **Environment Variables**.
2. Ajoute les 3 variables ci-dessus avec leurs valeurs (environnement : Production + Preview).
3. Redéploie le site (ou demande à Claude Code : « redéploie avec les nouvelles env vars »).

## 5. Le tracking du CHECKOUT (dans Shopify — important)
Le paiement se passe chez Shopify, pas sur le site : il faut aussi brancher les conversions là-bas.
1. Shopify Admin → **Canaux de vente** → ajoute **Google & YouTube** → connecte ton compte Google → lie la propriété GA4. (= événement « achat » dans GA4)
2. Ajoute le canal **Facebook & Instagram** → connecte le Business Manager → active le pixel + la Conversions API. (= achats visibles côté Meta)

## 6. Vérifier que ça marche (2 min)
- Ouvre le site en navigation privée → accepte les cookies → dans GA4 : **Rapports > Temps réel**, tu dois te voir.
- Extension Chrome « Meta Pixel Helper » : elle doit détecter le pixel après acceptation des cookies (et rien avant — c'est le RGPD qui fonctionne).

## Ce que ça t'apporte dès maintenant
- Tu vois d'où viennent tes visiteurs (TikTok ? DM ? Google ?) → tu doubles ce qui marche.
- Les pixels accumulent de la donnée dès aujourd'hui : le jour où tu lances de la pub payante, les algorithmes partent avec des semaines d'historique au lieu de zéro. C'est ça qui rend ta future pub rentable plus vite.
