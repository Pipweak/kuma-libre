# Kuma Libre — Révision du japonais 🇯🇵

Notes de vocabulaire transcrites à partir des photos personnelles du manuel *Minna no Nihongo — Shokyū I*.

## Développement de l'application

Le socle applicatif utilise Node.js 22.13, npm, React, TypeScript, Vite, React Router en Data Mode, i18next, Tailwind CSS et Sass.

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

`npm run quality` exécute les contrôles locaux obligatoires hors Playwright et audit réseau. La CI GitHub ajoute l'audit des dépendances et les parcours Playwright sur Chromium.

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

Chaque entrée est une ligne de tableau Markdown. Les anciennes transcriptions utilisent plusieurs formes de colonnes, notamment **Japonais | Lecture | Français | English | Maîtrise** et **Kana | Kanji | English | Français | Maîtrise**. Le futur importeur les convertira vers un même modèle JSON contenant les formes japonaises et les traductions `fr`, `en` et `es`.

Les entrées sont regroupées par leçon et par catégorie : vocabulaire principal, expressions, noms propres ou `useful-words`. `Useful Words and Information` est une catégorie de vocabulaire possible dans n'importe quelle leçon ; elle est conservée dans un fichier distinct lorsqu'elle existe et participe aux quiz de la leçon. Les lectures de mots écrits en katakana restent en katakana.

Les traductions espagnoles ne sont pas encore présentes dans les tableaux historiques. Leur ajout au corpus fait partie de la préparation des données de l'application.

## Utilisation en révision

La future application propose deux directions : japonais → signification et signification → japonais. Une réponse de signification peut être donnée en français, en anglais ou en espagnol. Une réponse japonaise peut utiliser les formes romaji, kana ou kanji déclarées. Les fichiers restent la source des questions : aucun mot ne doit être présenté comme appartenant à une leçon sans figurer dans son fichier.

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
