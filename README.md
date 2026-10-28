# Kuma Libre — Révision du japonais 🇯🇵

Notes de vocabulaire transcrites à partir des photos personnelles du manuel *Minna no Nihongo — Shokyū I*.

## Développement de l'application

Le socle applicatif utilise Node.js 22.13, npm, React, TypeScript, Vite, React Router en Data Mode, Supabase Auth, i18next, Tailwind CSS et Sass.

```bash
nvm use
npm ci
npm run dev
```

Contrôles disponibles :

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
npm run test:a11y
npm run security:audit
```

`npm run quality` exécute les contrôles locaux obligatoires hors Playwright, tests PostgreSQL et audit réseau. La CI GitHub ajoute l'audit des dépendances, les tests Supabase locaux et les parcours Playwright sur Chromium.

### Authentification et aperçu local

L'application propose Google et un magic link envoyé par email. Toutes les routes `/app/*` exigent une session ; lorsqu'une destination protégée est demandée, elle est restaurée après le callback d'authentification. Le SDK Supabase conserve uniquement les éléments techniques de session nécessaires à Auth.

Copier [`.env.example`](.env.example) vers `.env.local`, puis renseigner les valeurs publiques affichées par le panneau **Connect** du projet Supabase :

```dotenv
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_public_key
```

La clé est publique et fonctionne avec la Row Level Security ; aucune clé `service_role` ne doit être placée dans un fichier frontend. Dans Supabase Auth, activer Google et email, puis autoriser au minimum les URLs de callback locale et déployée, par exemple `http://127.0.0.1:4173/auth/callback`.

Sans variables Supabase, `npm run dev` utilise le compte fictif `Vincent` afin de conserver un parcours local testable. Dès que les deux variables sont présentes, le serveur local utilise Supabase réellement. Un build de production non configuré reste anonyme et ne donne jamais accès aux routes protégées. `VITE_ENABLE_APP_PREVIEW=true` est réservé au build Playwright de la CI et ne doit jamais être défini sur Cloudflare Pages.

Une session Supabase charge sa progression avant d’ouvrir l’espace protégé. Chaque réponse validée crée ensuite un événement immuable et met à jour atomiquement le score du sens travaillé. Une panne conserve la tentative courante en mémoire et permet de la renvoyer avec le même identifiant, sans double comptage. Recharger une question renvoie toujours vers la configuration, conformément à la règle V1 sur les passes interrompues ; les réponses déjà sauvegardées restent acquises.

Sans variables Supabase, le repository d’aperçu conserve les scores uniquement en mémoire pour la durée de l’onglet. Il ne crée aucun fallback métier dans `localStorage`.

### Progression et navigation secondaire

Le bouton de profil du header ouvre un menu mobile donnant accès aux leçons, à la progression, à la langue de l'interface et au compte. L'écran de progression calcule à partir du snapshot Supabase :

- le pourcentage de mots verts en compréhension ;
- le pourcentage de mots verts en production ;
- le pourcentage de mots verts dans les deux sens, globalement et par leçon.

Ces agrégats sont dérivés à la volée et ne sont pas stockés. Le détail d'une leçon affiche les deux scores `C/P` sur `3` pour chaque entrée, avec un texte accessible en plus des couleurs rouge, jaune et verte.

### Base Supabase locale

Les migrations, politiques RLS et tests SQL se trouvent dans [`supabase`](supabase). Leur exécution locale nécessite Docker Desktop :

```bash
npm run supabase:start
npm run supabase:reset
npm run test:database
npm run supabase:stop -- --no-backup
```

La procédure de liaison et de déploiement vers un projet distant est documentée dans [`supabase/README.md`](supabase/README.md). Les migrations sont toujours appliquées avant de tester l’application avec de vraies variables Supabase.

`@supabase/supabase-js` est verrouillé sur `2.118.0`. Le `postinstall` applique temporairement le correctif de déclaration de la [PR Supabase #2629](https://github.com/supabase/supabase-js/pull/2629), nécessaire à TypeScript 6 avec `skipLibCheck: false`. Ce patch n'affecte aucun comportement d'exécution et devra être supprimé dès qu'une version stable du SDK intègre le correctif.

### Génération du corpus

Les fichiers Markdown de [`lessons`](lessons) sont les sources éditables. L'importeur les convertit en un artefact unique et déterministe, [`src/generated/corpus.json`](src/generated/corpus.json), qui ne doit jamais être modifié manuellement.

```bash
npm run corpus:generate        # régénère le JSON après une modification des Markdown
npm run corpus:check           # vérifie que le JSON versionné est à jour et structurellement valide
npm run corpus:validate-ready  # contrôle les données requises pour activer tous les quiz FR/EN/ES
```

`npm run build` exécute automatiquement `corpus:check`. Le contrôle `corpus:validate-ready` représente la cible de migration : il signale encore les traductions espagnoles et lectures japonaises absentes des sources, sans bloquer le socle structurel actuel. Ces données doivent être ajoutées dans les Markdown, puis le JSON doit être régénéré.

### Design system applicatif

- [`src/shared/styles/tokens.css`](src/shared/styles/tokens.css) est la source canonique des couleurs, espacements, rayons, ombres, typographies et variables Tailwind de Kuma Libre.
- [`src/shared/styles/_tokens.scss`](src/shared/styles/_tokens.scss) expose ces mêmes tokens aux modules SCSS sans dupliquer leurs valeurs.
- [`src/shared/ui`](src/shared/ui) contient les premières primitives accessibles et réutilisables : `BrandLogo`, `Button`, `IconButton`, `Card`, `FlagIcon`, `ProgressBar` et `Spinner`.
- [`src/assets/brand`](src/assets/brand) contient les déclinaisons PNG transparentes de la marque utilisées par l'application. Le composant `BrandLogo` en préserve toujours les proportions.

Tailwind reste le choix principal pour la mise en page et les états simples. Les modules SCSS sont réservés aux besoins spécifiques, notamment les animations et l'imbrication locale.

### Moteur de quiz

Le domaine pur [`src/domain/quiz`](src/domain/quiz) construit les sessions sans dépendre de React ni de Supabase. Il couvre :

- les sessions configurées par leçon, catégorie, direction, niveau de maîtrise et ordre ;
- la révision rapide de dix mots au maximum, avec priorité aux rouges puis aux jaunes ;
- les questions de compréhension et de production avec toutes les réponses explicitement déclarées ;
- la normalisation Unicode, des espaces, de la ponctuation, de la casse et des accents latins sans correction floue ;
- les progressions indépendantes de compréhension et de production, ainsi que la maîtrise globale dérivée.

Les fonctions acceptent une source aléatoire injectable afin que la sélection et le mélange restent entièrement testables. La feature React orchestre ces contrats sans dupliquer leurs règles. `ProgressProvider` charge les scores privés et `SupabaseProgressRepository` délègue l’écriture atomique à la RPC `record_review`.

## Leçons

- [Leçon 1 — Vocabulaire](lessons/lesson-01/vocabulary.md)
- [Leçon 2 — Vocabulaire](lessons/lesson-02/vocabulary.md)
- [Leçon 3 — Vocabulaire](lessons/lesson-03/vocabulary.md)
- [Leçon 4 — Vocabulaire](lessons/lesson-04/vocabulary.md)
- [Leçon 5 — Vocabulaire](lessons/lesson-05/vocabulary.md)
- [Leçon 6 — Vocabulaire](lessons/lesson-06/vocabulary.md)
  - [Leçon 6 — III. Useful Words and Information](lessons/lesson-06/useful-words.md)
- [Leçon 7 — Vocabulaire](lessons/lesson-07/vocabulary.md)
- [Leçon 8 — Vocabulaire](lessons/lesson-08/vocabulary.md)
- [Leçon 9 — Vocabulaire](lessons/lesson-09/vocabulary.md)
- [Leçon 10 — Vocabulaire](lessons/lesson-10/vocabulary.md)
- [Leçon 11 — Vocabulaire](lessons/lesson-11/vocabulary.md)
- [Leçon 12 — Vocabulaire](lessons/lesson-12/vocabulary.md)
- [Leçon 13 — Vocabulaire](lessons/lesson-13/vocabulary.md)
- [Leçon 14 — Vocabulaire](lessons/lesson-14/vocabulary.md)
- [Leçon 15 — Vocabulaire](lessons/lesson-15/vocabulary.md)
- [Leçon 16 — Vocabulaire](lessons/lesson-16/vocabulary.md)
- [Leçon 17 — Vocabulaire](lessons/lesson-17/vocabulary.md)
- [Leçon 18 — Vocabulaire](lessons/lesson-18/vocabulary.md)
- [Glossaire des termes du manuel](reference/instruction-terms.md)

## Format

Chaque entrée est une ligne de tableau Markdown. Les anciennes transcriptions utilisent plusieurs formes de colonnes, notamment **Japonais | Lecture | Français | English | Maîtrise** et **Kana | Kanji | English | Français | Maîtrise**. L'importeur reconnaît ces formats historiques et les convertit vers un même modèle JSON contenant les formes japonaises et les traductions `fr`, `en` et `es`.

La valeur complète d'une cellule de traduction est conservée comme libellé principal. Les variantes séparées explicitement par une virgule, une barre oblique ou un point-virgule deviennent aussi des réponses acceptées. Les formes rōmaji sont générées à partir des lectures déclarées ; une lecture absente reste une lacune de données et n'est jamais inventée par l'importeur.

Les entrées sont regroupées par leçon et par catégorie : vocabulaire principal, expressions, noms propres ou `useful-words`. `Useful Words and Information` est une catégorie de vocabulaire possible dans n'importe quelle leçon ; elle est conservée dans un fichier distinct lorsqu'elle existe et participe aux quiz de la leçon. Les lectures de mots écrits en katakana restent en katakana.

Les traductions espagnoles ne sont pas encore présentes dans les tableaux historiques. Leur ajout au corpus fait partie de la préparation des données de l'application.

## Utilisation en révision

Le moteur propose deux directions : japonais → signification et signification → japonais. Une réponse de signification peut être donnée en français, en anglais ou en espagnol. Une réponse japonaise peut utiliser les formes romaji, kana ou kanji déclarées. Les fichiers restent la source des questions : aucun mot ne doit être présenté comme appartenant à une leçon sans figurer dans son fichier.

## Méthode d'ajout

Pour chaque nouvelle photo, identifier la leçon et la section, transcrire les entrées visibles, puis enrichir le fichier concerné sans supprimer les données existantes.

## Suivi de maîtrise

Chaque mot possède un champ **Maîtrise** :

- 🟢 **OK** : surlignage vert / bleu-vert, mot maîtrisé.
- 🟡 **À réviser** : surlignage jaune, mot à consolider.
- 🔴 **À revoir** : surlignage rouge ou absence de surlignage, mot à réapprendre.

Ces statuts sont uniquement un instantané historique des photos et ne pilotent pas la progression de l'application. La progression utilisateur vit dans Supabase et distingue compréhension et production. Le fichier [`progress-vincent.json`](progress-vincent.json) conserve séparément la progression historique de Vincent pour la compréhension japonais → signification.

## Précision et limites de transcription

- Les photos du manuel constituent la référence pour l'appartenance des mots à une leçon. La transcription doit reprendre uniquement les graphies, lectures et équivalents anglais imprimés sur la photo, sans ajouter de graphies alternatives. Les traductions françaises sont la seule colonne ajoutée.
- Les traductions françaises sont des reformulations pédagogiques vérifiées dans le contexte, et non le texte du livre.
- Les couleurs sont lues sur les photographies ; en cas de photo floue, leur attribution peut être incertaine.
- Un mot sans surlignage est marqué « À revoir » suivant la convention choisie, ce qui n'est pas une mesure indépendante de connaissance.

## Documents de conception

- [Architecture cible](ARCHITECTURE.md)
- [Architecture frontend et applicative](docs/architecture/frontend-architecture.md)
- [Standards de qualité](docs/quality/README.md)
- [Git Flow et cycle de release](docs/development/git-flow.md)
- [Index de la documentation](docs/README.md)
- [Synthèse des fondations de la V1 — 17 octobre 2026](docs/reflexion/2026-10-17-fondations-v1.md)
- [Audit du corpus et de l'internationalisation](reference/corpus-i18n-audit.md)
- [Maquettes et parcours UX](mockups/README.md)

Les instructions destinées aux agents travaillant dans ce dépôt sont définies dans [`AGENTS.md`](AGENTS.md). Quatre skills locaux les complètent :

- [développement Kuma Libre](.agents/skills/kuma-libre-development/SKILL.md) ;
- [synchronisation automatique des features et de leur documentation](.agents/skills/kuma-libre-feature-sync/SKILL.md) ;
- [contrôle qualité final](.agents/skills/kuma-libre-quality-gate/SKILL.md).
- [Git Flow et cycle de release](.agents/skills/kuma-libre-git-flow/SKILL.md).
