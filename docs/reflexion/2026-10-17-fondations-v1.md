# Fondations de la V1 — synthèse du 17 octobre 2026

Ce document conserve la trace de la journée de cadrage ayant précédé le démarrage de l'application Kuma Libre. Il s'agit d'une archive de réflexion : les documents vivants restent `ARCHITECTURE.md` et `mockups/v1/flows.html`.

## Point de départ

Le dépôt contenait initialement des transcriptions Markdown du vocabulaire étudié. L'objectif a évolué vers une application web mobile-first de révision dans les deux sens, avec progression, comptes utilisateurs et fonctionnalités vocales.

Le nom public retenu est **Kuma Libre**. La provenance du premier corpus reste documentée en interne, mais le produit ne reprend pas le nom du manuel dans son identité publique et ne publie aucun scan.

## Périmètre produit retenu

- accueil public expliquant le produit ;
- quiz et leçons réservés aux comptes connectés ;
- connexion Google et email par magic link ;
- accueil connecté avec révision rapide et accès aux leçons ;
- liste continue de leçons sans livre ni volume dans l'interface ;
- détail d'une leçon avec vocabulaire et progression ;
- quiz japonais vers signification et signification vers japonais ;
- configuration par leçons, direction, niveaux de maîtrise et ordre ;
- révision rapide de dix mots maximum : rouges d'abord, puis jaunes, jamais de verts ;
- réponse au clavier ou par dictée, toujours modifiable avant validation ;
- lecture vocale de la question avec la synthèse du navigateur ;
- feedback visuel, solution et passage explicite à la question suivante ;
- progression par leçon et progression générale ;
- interface et corpus en français, anglais et espagnol.

## Corpus et catégories

Les leçons sont la structure publique principale. `Useful Words and Information` n'est ni un livre ni une leçon particulière : il s'agit d'une catégorie de vocabulaire qui peut exister dans toute leçon et qui participe aux quiz de celle-ci.

Les titres thématiques comme « Fondations » ou « Objets du quotidien » ne doivent pas être inventés par l'interface. En l'absence de métadonnée éditoriale validée, l'application affiche simplement `Leçon 01`, `Leçon 02`, etc.

Chaque entrée normalisée contient des formes kana, kanji et rōmaji stockées, ainsi que des listes de significations françaises, anglaises et espagnoles. Les synonymes acceptés sont déclarés explicitement dans ces listes.

## Présentation du japonais

La direction visuelle de la maquette est conservée :

- lorsqu'un kanji existe, il est affiché avec le kana en dessous ;
- lorsqu'il n'existe pas, le kana est affiché seul ;
- le rōmaji n'est pas montré dans la question japonaise principale ;
- la correction peut rappeler le rōmaji, les kana, les kanji et les traductions disponibles.

## Progression

Compréhension et production possèdent des progressions indépendantes.

- score `0` : rouge, non maîtrisé ;
- scores `1` et `2` : jaune, à revoir ;
- score `3` : vert, maîtrisé ;
- chaque réussite ajoute un point jusqu'à trois ;
- les réussites ne doivent pas être consécutives ni avoir lieu sur plusieurs jours ;
- une erreur rouge ou jaune ne retire aucun point ;
- une erreur verte redescend le score à deux ;
- la réussite suivante remet donc immédiatement le mot au vert.

La maîtrise globale correspond au niveau le plus faible des deux directions.

L'ancien fichier `progress-vincent.json` représente exclusivement la compréhension japonais vers signification française ou anglaise. Il initialise ce sens seulement ; la production commence à zéro.

Deux occurrences d'un même mot dans des leçons différentes conservent des identifiants et des progressions séparés dans la V1. Cela évite de fusionner par erreur des usages ou des sens différents.

## Internationalisation

Deux ensembles de traduction sont distingués :

- les labels de l'application, gérés par i18next/react-i18next ;
- les significations du vocabulaire, stockées dans le corpus normalisé sous `fr`, `en` et `es`.

En production japonaise, la question montre uniquement la langue active. En compréhension, une traduction explicitement enregistrée dans l'une des trois langues est acceptée.

La création des traductions espagnoles des entrées existantes est une tâche de préparation du corpus prise en charge pendant l'implémentation, pas une décision produit à redemander.

## Voix

La lecture vocale n'exige aucun fichier son dans la base. La Web Speech API prononce le texte du corpus, avec préférence automatique pour une voix adaptée à la locale.

La dictée reprend le modèle d'un compositeur de messagerie : microphone dans l'input, permission, écoute avec durée et forme d'onde, annulation, arrêt, transcription temporaire, puis texte modifiable dans l'input. La dictée ne valide jamais la réponse automatiquement et aucun enregistrement sonore n'est conservé.

## Interface et identité

La V1 visuelle calme et éditoriale est retenue. La V2 ludique reste archivée comme exploration.

- palette crème, anthracite, vermillon et brun ;
- fontes sobres d'origine ;
- assets PNG transparents de Kuma Libre ;
- aucune mascotte SVG approximative ;
- logo textuel seul dans le header ;
- composition tête et mot-symbole pour le chargement ;
- navigation mobile derrière le bouton de profil ;
- couleurs toujours accompagnées de texte ou d'icônes accessibles.

La source de vérité visuelle est [`../../mockups/v1/flows.html`](../../mockups/v1/flows.html). Les planches `index.html` V1 et V2 sont des archives.

## Architecture technique retenue

- React, TypeScript et Vite ;
- React Router ;
- Supabase comme backend géré ;
- Cloudflare Pages pour le frontend ;
- domaine métier indépendant de React et Supabase ;
- composants organisés entre primitives partagées et features ;
- Tailwind majoritaire, variables CSS et modules SCSS ;
- `useReducer` pour le quiz, Context pour l'authentification et les préférences ;
- aucun Redux, serveur Express, PWA ou TanStack Query dans la V1.

Le détail est conservé dans [`../architecture/frontend-architecture.md`](../architecture/frontend-architecture.md).

## Éléments explicitement différés

- reprise d'une passe interrompue ;
- upload et recadrage d'un avatar ;
- commandes vocales « suivant », « répète » ou « valide » ;
- évaluation automatique de la prononciation ;
- gamification complexe ;
- mode hors ligne/PWA ;
- serveur applicatif personnalisé.

## Artefacts conservés

- [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md) : architecture produit vivante ;
- [`../architecture/frontend-architecture.md`](../architecture/frontend-architecture.md) : architecture technique détaillée ;
- [`../../mockups/design-system/`](../../mockups/design-system/) : tokens et assets ;
- [`../../mockups/v1/flows.html`](../../mockups/v1/flows.html) : parcours fonctionnels ;
- [`../../mockups/v1/REVIEW-NOTES.md`](../../mockups/v1/REVIEW-NOTES.md) : remarques issues des revues ;
- [`../../mockups/v1/index.html`](../../mockups/v1/index.html) : première planche V1 archivée ;
- [`../../mockups/v2/`](../../mockups/v2/) : exploration V2 archivée ;
- [`../../progress-vincent.json`](../../progress-vincent.json) : progression historique ;
- [`../../reference/corpus-i18n-audit.md`](../../reference/corpus-i18n-audit.md) : audit des données.

Cette synthèse doit rester datée. Les évolutions futures sont consignées dans de nouveaux documents de réflexion ou dans un journal de décisions, sans réécrire rétroactivement cette archive.
