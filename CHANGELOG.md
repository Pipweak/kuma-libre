# Journal des versions

Les changements notables de Kuma Libre sont regroupés dans ce fichier. Le projet suit [Semantic Versioning](https://semver.org/lang/fr/).

## [0.1.0] — 2 novembre 2026

Premier release candidate public de la V1.

### Fonctionnalités

- authentification Supabase par Google ou magic link, avec protection des routes applicatives ;
- accueil mobile-first, liste continue de 18 leçons, détail du vocabulaire et progression globale ;
- quiz de compréhension et de production avec configuration des leçons, états de maîtrise et ordre des questions ;
- progressions indépendantes dans les deux sens, enregistrées dans Supabase avec RLS ;
- révision rapide de dix mots au maximum, en privilégiant les mots non maîtrisés puis ceux à revoir ;
- synthèse vocale des questions et dictée vocale avec saisie clavier toujours disponible ;
- interface et significations disponibles en français, anglais et espagnol ;
- corpus normalisé de 904 entrées, généré depuis les fichiers Markdown de 18 leçons ;
- outil administratif idempotent pour importer la progression historique de Vincent en compréhension uniquement.

### Qualité et exploitation

- tests unitaires, composants, parcours Playwright, accessibilité et tests PostgreSQL/RLS automatisés ;
- budgets de bundle contrôlés pendant la CI et chunks séparés pour React et Supabase ;
- configuration Cloudflare Pages avec fallback SPA, cache immutable et headers de sécurité ;
- documentation du déploiement, du rollback, de Supabase et du Git Flow.

### Limites connues de la V1

- seules les traductions, formes japonaises et synonymes explicitement enregistrés sont acceptés ; aucune correction sémantique ou RAG n'est appliquée ;
- la dictée et les voix disponibles dépendent du navigateur et du système ;
- une session de quiz interrompue n'est pas reprise, même si les réponses déjà validées restent enregistrées ;
- le téléchargement et le recadrage d'un avatar ne font pas partie de cette version ;
- les Core Web Vitals réels doivent être mesurés sur la preview Cloudflare du release candidate ;
- `npm audit` signale un avis modéré transitif dans l'outillage ESLint, sans vulnérabilité haute ou critique ni correctif compatible à cette date.

### Déploiement

- appliquer les migrations Supabase avant l'ouverture de la production ;
- configurer les callbacks Google, magic link et les variables publiques Cloudflare selon `docs/development/deployment.md` ;
- importer la progression historique uniquement après la première connexion du compte Vincent.
