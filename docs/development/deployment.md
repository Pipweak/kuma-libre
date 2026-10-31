# Déploiement Cloudflare Pages et Supabase

Cette procédure prépare un release candidate de Kuma Libre, valide son environnement de preview, puis publie la branche `main` en production. Elle ne remplace pas le [Git Flow](git-flow.md).

## 1. Préparer Supabase

Créer ou sélectionner le projet Supabase explicitement réservé à l'environnement, puis appliquer les migrations validées :

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Dans **Authentication → URL Configuration** :

- définir **Site URL** sur l'origine de production, par exemple `https://kuma-libre.example` ;
- ajouter exactement `https://kuma-libre.example/auth/callback` aux Redirect URLs ;
- conserver `http://127.0.0.1:4173/auth/callback` pour le développement local ;
- ajouter séparément l'URL stable de preview utilisée, par exemple `https://develop.<pages-project>.pages.dev/auth/callback`.

Une URL exacte est préférée en production. Ne pas autoriser un wildcard plus large que les previews réellement utilisées.

### Google

Dans Google Cloud, l'**Authorized redirect URI** est le callback du fournisseur Supabase affiché dans son dashboard, généralement :

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

Le Client ID et le Client Secret Google sont configurés dans **Supabase → Authentication → Providers → Google**. Le secret Google ne rejoint ni Git, ni Cloudflare Pages, ni une variable `VITE_*`.

### Magic link

Activer Email dans Supabase et vérifier que le template utilise la destination demandée (`{{ .RedirectTo }}`) afin que le lien revienne sur `/auth/callback`.

## 2. Configurer Cloudflare Pages

Connecter le dépôt GitHub puis utiliser :

| Réglage | Valeur |
| --- | --- |
| Branche de production | `main` |
| Commande de build | `npm run build` |
| Répertoire de sortie | `dist` |
| Répertoire racine | `/` |
| Version Node.js | `22.13.0` via `.nvmrc` |

Définir dans **Production** et dans chaque preview réellement connectée :

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<public-key>
```

Ne jamais définir `VITE_ENABLE_APP_PREVIEW` sur Cloudflare. Ne jamais ajouter `SUPABASE_SERVICE_ROLE_KEY`, un secret Google ou une clé privée dans l'environnement frontend.

`public/_redirects` fournit le fallback SPA. `public/_headers` applique le cache immutable aux assets hashés et les headers de sécurité aux réponses statiques. Ces fichiers sont copiés automatiquement dans `dist` par Vite.

## 3. Valider le release candidate

Depuis la branche de release :

```bash
npm ci
npm run quality
npm run security:audit
npm run test:e2e
```

Sur l'URL de preview Cloudflare, vérifier :

- l'accueil public et les routes profondes après rechargement ;
- les interfaces française, anglaise et espagnole ;
- Google puis le magic link, avec retour sur la destination protégée demandée ;
- le chargement de la progression, une réponse validée et sa persistance après rechargement ;
- la lecture vocale et le microphone sous HTTPS, tout en conservant la saisie clavier ;
- l'absence d'erreur CSP dans la console ;
- le rendu mobile et desktop des parcours critiques.

Contrôler les headers de la preview :

```powershell
curl.exe -I https://<preview-url>/
```

La réponse doit notamment contenir `Content-Security-Policy`, `Permissions-Policy`, `X-Content-Type-Options` et `X-Frame-Options`. Un asset sous `/assets/` doit recevoir `Cache-Control: public, max-age=31536000, immutable`.

Mesurer ensuite Lighthouse en mode mobile sur l'accueil public et sur un parcours authentifié. Reporter LCP, INP, CLS et le score Performance dans les notes du release candidate ; les objectifs sont définis dans [`../quality/performance-accessibility.md`](../quality/performance-accessibility.md).

## 4. Publier et initialiser le compte Vincent

Après validation du release candidate et fusion vers `main`, vérifier le déploiement de production avec la même checklist. Effectuer une première connexion avec le compte Vincent, puis appliquer la procédure [`vincent-progress-import.md`](vincent-progress-import.md).

## 5. Rollback

En cas de défaut frontend, utiliser **Cloudflare Pages → Deployments → Rollback to this deployment** vers le dernier déploiement de production validé. Ne jamais déplacer ou réutiliser le tag Git publié.

Les migrations Supabase sont conçues comme des migrations en avant. En cas de défaut de données, arrêter le déploiement, préserver les données et livrer une nouvelle migration corrective testée au lieu de modifier manuellement une migration déjà appliquée.

## Références officielles

- [Cloudflare Pages — Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages — Headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [Supabase Auth — Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Auth — Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)
