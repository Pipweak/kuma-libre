# Supabase — développement et déploiement

Ce dossier versionne le backend géré de Kuma Libre : configuration locale, migrations PostgreSQL, données de seed non sensibles et tests pgTAP.

## Développement local

Prérequis : Node.js 22, les dépendances npm du dépôt et Docker Desktop démarré.

```bash
npm run supabase:start
npm run supabase:reset
npm run test:database
```

`supabase:reset` reconstruit la base locale à partir de toutes les migrations puis exécute `seed.sql`. `test:database` vérifie notamment les politiques RLS et la RPC transactionnelle `record_review`.

Après les tests :

```bash
npm run supabase:stop -- --no-backup
```

Les URL et clés locales affichées par `supabase:start` peuvent être placées dans `.env.local`. Ne jamais copier de clé `service_role` dans une variable `VITE_*`.

## Projet distant

La première liaison demande le project ref affiché dans le dashboard Supabase :

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

`db push` doit être exécuté depuis une branche validée et applique uniquement les migrations versionnées. Les fournisseurs Google et email, les URL de site et les URL de callback restent configurés dans le dashboard Auth pour chaque environnement.

La checklist conjointe Supabase, Google et Cloudflare Pages se trouve dans [`../docs/development/deployment.md`](../docs/development/deployment.md).

## Import historique de Vincent

Après le déploiement des migrations et la première connexion du compte cible, l'import administratif de `progress-vincent.json` s'exécute avec `npm run progress:vincent:import -- --apply`. Il utilise une clé `service_role` uniquement côté script, jamais une variable `VITE_*`, et s'arrête si des scores distants différents existent déjà.

La préparation des variables, l'aperçu sans écriture et les résultats attendus sont détaillés dans [`../docs/development/vincent-progress-import.md`](../docs/development/vincent-progress-import.md).

## Garanties de progression

- `review_events` conserve l’historique immuable ;
- `word_progress` conserve le résumé courant par utilisateur, entrée et direction ;
- `record_review` prend l’utilisateur depuis `auth.uid()` et effectue les deux écritures dans une transaction ;
- l’UUID de tentative rend un retry idempotent ;
- les rôles `anon` et `authenticated` ne peuvent pas écrire directement l’historique ou les scores ;
- la RLS limite toutes les lectures privées au propriétaire de la ligne.

Le corpus reste un artefact statique du frontend. Il n’est pas copié dans PostgreSQL.
