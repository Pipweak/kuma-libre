# Architecture frontend et applicative

> **Statut :** architecture technique de référence, initialisée dans l'application.
> **Version :** 3 — 17 octobre 2026.

Ce document précise le découpage technique de Kuma Libre. Les règles produit restent définies dans [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md).

## 1. Stack retenue

| Besoin | Choix initial |
| --- | --- |
| Application | React avec TypeScript |
| Build | Vite |
| Routing | React Router en Data Mode |
| Authentification et données privées | Supabase Auth et Postgres |
| Autorisation | Row Level Security |
| Backend métier minimal | fonctions PostgreSQL/RPC Supabase |
| Internationalisation de l'interface | i18next et react-i18next |
| Styles | Tailwind CSS majoritaire, variables CSS et modules SCSS |
| Icônes génériques | lucide-react |
| Tests unitaires | Vitest |
| Tests de composants | React Testing Library |
| Tests de parcours | Playwright |
| Hébergement | Cloudflare Pages |

Redux, TanStack Query, une PWA et un serveur Node/Express ne sont pas introduits dans la V1. Ils ne seront ajoutés que si un besoin concret apparaît.

## 2. Frontière du backend

Supabase constitue le backend de la V1. L'absence de serveur Express ne signifie pas que l'application ne possède aucun backend.

Supabase fournit :

- l'authentification Google et par magic link ;
- PostgreSQL pour les profils, préférences, événements et progressions ;
- la Row Level Security pour isoler les données de chaque compte ;
- une fonction RPC `record_review` pour enregistrer une tentative et mettre à jour la maîtrise dans une même transaction ;
- des Edge Functions disponibles ultérieurement pour une opération nécessitant un secret ou un traitement serveur.

Le corpus reste public, versionné dans Git et généré en JSON au build. Il ne doit pas être copié dans les tables propres aux utilisateurs.

Un serveur personnalisé deviendrait pertinent uniquement en cas de traitement audio serveur, d'administration complexe, de secret tiers ou de règle impossible à garantir avec PostgreSQL et les Edge Functions.

## 3. Routes et pages

```text
/                           LandingPage
/auth                       LoginPage
/auth/callback              AuthCallbackPage
/app                        HomePage
/app/lessons                LessonsPage
/app/lessons/:lessonId      LessonPage
/app/quiz/configure         QuizConfigurationPage
/app/quiz                   QuizPage
/app/quiz/result            QuizResultPage
/app/progress               ProgressPage
/app/settings/language      LanguagePage
/app/account                AccountPage
*                           NotFoundPage
```

`/auth/callback` est une route technique. Le chargement, les corrections, les erreurs vocales, le menu et les confirmations de sortie sont des états ou des composants, pas des pages.

Toutes les routes `/app/*` utilisent un layout protégé. Après authentification, l'utilisateur est renvoyé vers la destination initialement demandée.

## 4. Structure cible

```text
kuma-libre/
├── lessons/                         # Sources Markdown du corpus
├── reference/                       # Glossaire et audit du corpus
├── mockups/                         # Explorations et référence UX
├── docs/                            # Architecture détaillée et mémoire de conception
├── scripts/
│   └── corpus/
│       ├── parse-markdown.ts
│       ├── normalize-entry.ts
│       └── validate-corpus.ts
├── generated/
│   └── corpus.json                  # Artefact de build non édité manuellement
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── layouts/
│   │   ├── providers/
│   │   └── App.tsx
│   ├── pages/
│   ├── features/
│   │   ├── auth/
│   │   ├── lessons/
│   │   ├── quiz/
│   │   ├── progress/
│   │   ├── speech/
│   │   └── preferences/
│   ├── domain/
│   │   ├── vocabulary/
│   │   ├── quiz/
│   │   └── progress/
│   ├── infrastructure/
│   │   ├── supabase/
│   │   ├── repositories/
│   │   └── speech/
│   ├── shared/
│   │   ├── ui/
│   │   ├── icons/
│   │   ├── i18n/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── styles/
│   ├── generated/
│   │   └── corpus.json
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── tests/
│   └── config.toml
└── tests/
    └── e2e/
```

Le chemin définitif du JSON généré sera choisi lors de l'initialisation. Il ne doit exister qu'à un seul emplacement consommé par l'application.

## 5. Règles de dépendance

```text
pages -> features -> domain
             |
             v
          shared

infrastructure -> implémente les contrats du domain
app            -> assemble le routeur, les providers et les implémentations
```

- `domain` n'importe ni React, ni Supabase, ni i18next.
- `shared/ui` ne connaît aucune règle de quiz ou de progression.
- `pages` assemble des fonctionnalités et contient très peu de logique.
- `features` contient les composants, hooks et états propres à un cas d'usage.
- `infrastructure` contient les détails remplaçables : Supabase et Web Speech API.
- les imports entre features sont évités ; le code véritablement commun remonte vers `domain` ou `shared`.

## 6. Atomic Design pragmatique

Les principes d'Atomic Design servent à identifier les niveaux de réutilisation, sans imposer des dossiers génériques `atoms`, `molecules` et `organisms` à toute l'application.

### 6.1 Primitives partagées

`shared/ui` contient des composants sans connaissance métier :

- `Button` et `IconButton` ;
- `TextField` ;
- `Checkbox` ;
- `RadioCard` ;
- `Card` ;
- `Badge` ;
- `ProgressBar` ;
- `Spinner` ;
- `Avatar` ;
- `Dialog` ;
- `Drawer` ;
- `Tooltip` ;
- `PageHeader` et `SectionHeading` ;
- `Logo` ;
- `FlagIcon`.

Chaque primitive définit ses variantes, états, accessibilité et tests. Un élément HTML simple n'est pas abstrait sans répétition réelle : tous les titres ne deviennent pas automatiquement un composant `Title`.

### 6.2 Composants composés

Les composants suivants peuvent être partagés par plusieurs pages, tout en restant proches du produit :

- `FormField` ;
- `ProfileButton` et `ProfileDrawer` ;
- `LessonCard` et `LessonListItem` ;
- `VocabularyRow` ;
- `ProgressSummary` ;
- `DirectionSelector` ;
- `MasteryFilter` ;
- `LanguageSelector` ;
- `AnswerComposer` ;
- `AudioButton` ;
- `VoiceRecorder` ;
- `AnswerFeedback` ;
- `SessionProgress` ;
- `ExitQuizDialog`.

Un composant reste dans sa feature s'il n'a de sens que dans celle-ci. Il ne rejoint `shared` qu'après une réutilisation réelle et stable.

### 6.3 Exemple de feature

```text
features/quiz/
├── components/
│   ├── QuizQuestion.tsx
│   ├── QuizAnswer.tsx
│   ├── QuizCorrection.tsx
│   ├── QuizConfiguration.tsx
│   └── QuizSummary.tsx
├── hooks/
│   ├── useQuizSession.ts
│   └── useQuizKeyboard.ts
├── state/
│   ├── quizReducer.ts
│   ├── quizActions.ts
│   └── quizState.ts
└── index.ts
```

## 7. Domaine et services

Les règles suivantes sont des fonctions TypeScript pures :

- import et normalisation du corpus ;
- construction d'une passe ;
- priorité rouge puis jaune ;
- normalisation et validation d'une réponse ;
- calcul du score de maîtrise ;
- calcul de la progression globale ;
- choix de la prochaine question.

Les dépendances externes sont représentées par des contrats plutôt que par des classes omniprésentes :

```ts
interface AuthRepository {
  signInWithGoogle(): Promise<void>;
  signInWithMagicLink(email: string): Promise<void>;
  signOut(): Promise<void>;
}

interface ProgressRepository {
  getProgress(userId: string): Promise<WordProgress[]>;
  recordReview(input: ReviewInput): Promise<WordProgress>;
}

interface SpeechRecognizer {
  start(locale: string): Promise<string>;
  stop(): void;
}
```

Les implémentations initiales sont `SupabaseAuthRepository`, `SupabaseProgressRepository`, `WebSpeechRecognizer` et `WebSpeechSynthesizer`. Les tests peuvent les remplacer par des versions en mémoire.

## 8. Gestion de l'état

| Nature de l'état | Solution |
| --- | --- |
| input, menu ou dialogue local | `useState` |
| machine d'état du quiz | `useReducer` |
| session authentifiée | Context dédié |
| langue et préférences globales | Context léger synchronisé avec Supabase |
| corpus | import statique du JSON généré |
| progression distante | hooks et repository Supabase |
| microphone et transcription | reducer local à la feature speech |

Redux n'est pas requis pour la V1. Le quiz utilise un reducer explicite, par exemple :

```text
idle -> answering -> validating -> correct/incorrect -> next-question -> completed
```

Le store du quiz n'est pas global : il appartient au layout de la session. Un rechargement détruit cette session, conformément à la décision de ne pas reprendre une passe interrompue.

## 9. Internationalisation

`react-i18next` traduit uniquement l'interface : boutons, titres, messages, erreurs et textes d'aide.

```text
shared/i18n/
├── i18n.ts
└── locales/
    ├── fr/
    │   ├── common.json
    │   ├── auth.json
    │   └── quiz.json
    ├── en/
    └── es/
```

Le corpus conserve séparément les significations :

```ts
meanings: {
  fr: string[];
  en: string[];
  es: string[];
}
```

La langue active sélectionne la signification affichée dans une question de production et la locale de dictée correspondante. Une réponse de compréhension reste valide si elle correspond à une traduction déclarée en français, anglais ou espagnol.

La préférence du compte est stockée dans Supabase. Avant la connexion, l'accueil public utilise la langue du navigateur avec un repli français. Aucun cache métier concurrent n'est créé dans `localStorage`.

## 10. Icônes, marque et styles

- `lucide-react` fournit les icônes génériques importées individuellement.
- Les drapeaux japonais, français, anglais et espagnol sont de petits SVG internes accompagnés d'un libellé accessible.
- Les logos de fournisseurs et les assets Kuma Libre restent des assets de marque séparés.
- Tailwind gère en priorité layout, espacements, responsive et états simples.
- Les variables CSS du design system restent la source des couleurs, rayons, ombres et espacements.
- Les animations et composants complexes utilisent des modules SCSS colocalisés avec une imbrication peu profonde.

## 11. Tests attendus

- tests unitaires du domaine sans React ;
- tests de l'importeur sur chaque format Markdown historique ;
- tests de composants pour les états du quiz, de la dictée et de l'authentification ;
- tests SQL des politiques RLS et de `record_review` ;
- tests Playwright des parcours critiques ;
- contrôles d'accessibilité sur les composants partagés et les pages principales.

## 12. Ordre d'implémentation

1. Initialiser React, TypeScript, Vite, le routing, les tests et i18next.
2. Intégrer les tokens, les assets et les premières primitives UI.
3. Construire et valider l'importeur Markdown vers JSON.
4. Implémenter le moteur de quiz en TypeScript pur.
5. Livrer un premier parcours vertical : leçon, configuration, question et correction.
6. Ajouter Supabase Auth, les migrations, la RLS et `record_review`.
7. Connecter la progression et les pages secondaires.
8. Ajouter la synthèse et la dictée vocales.
9. Déployer sur Cloudflare Pages.

### État du socle

La première étape est initialisée sur la branche `chore/react-foundation` avec :

- React, TypeScript strict et Vite ;
- React Router en Data Mode ;
- i18next et les premiers catalogues FR, EN et ES ;
- Tailwind CSS via son plugin Vite et Sass disponible pour les futurs modules SCSS ;
- Vitest, React Testing Library, couverture V8, Playwright et axe ;
- ESLint, Prettier, audit npm et une CI GitHub composée des checks `quality` et `e2e`.

Le design system complet, le corpus normalisé, le moteur de quiz et Supabase restent volontairement hors de cette première tranche.

## 13. Qualité et synchronisation documentaire

Les conventions exécutables et critères de fin sont définis dans [`../quality/README.md`](../quality/README.md). Ils couvrent notamment :

- le nommage et le mode TypeScript strict ;
- la documentation TSDoc des contrats et comportements non triviaux ;
- la matrice de tests unitaires, composants, intégration, SQL et end-to-end ;
- les budgets de performance et exigences d'accessibilité ;
- la Definition of Done.

Toute évolution fonctionnelle doit synchroniser dans le même changement les implémentations, tests, clés i18n, documents vivants et maquettes réellement affectés. Le workflow détaillé se trouve dans le skill local [`kuma-libre-feature-sync`](../../.agents/skills/kuma-libre-feature-sync/SKILL.md), et le contrôle final dans [`kuma-libre-quality-gate`](../../.agents/skills/kuma-libre-quality-gate/SKILL.md).

La future intégration continue devra au minimum exécuter les contrôles disponibles de formatage, lint, typecheck, couverture, build, parcours critiques et accessibilité. Les migrations et politiques RLS devront posséder leurs propres tests. Un contrôle absent est signalé comme non disponible jusqu'à son introduction ; il n'est pas simulé.

## 14. Références techniques

- [Supabase Auth avec React](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions/auth)
- [React : reducer et context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [React Router : modes](https://reactrouter.com/start/modes)
- [react-i18next](https://react.i18next.com/getting-started)
- [Lucide React](https://lucide.dev/guide/react/)
