# Architecture frontend et applicative

> **Statut :** architecture technique de référence, initialisée dans l'application.
> **Version :** 12 — 29 octobre 2026.

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

Toutes les routes `/app/*` utilisent `AppLayout` comme garde protégé. Le layout lui-même est chargé à la demande afin que l'accueil public ne télécharge ni le corpus ni la navigation connectée. Sans session, il redirige vers `/auth` avec un paramètre `returnTo` limité aux chemins internes commençant par `/app`. Le callback valide à nouveau cette destination avant de la restaurer afin d'empêcher les redirections ouvertes.

`AuthProvider` possède l'unique état de session React et dépend du contrat `AuthRepository`. `SupabaseAuthRepository` implémente Google, magic link, callback PKCE ou `token_hash`, renouvellement de session et déconnexion. `PreviewAuthRepository` fournit une session fictive uniquement au serveur Vite local sans configuration et au build E2E explicitement marqué. `UnavailableAuthRepository` maintient un build de production non configuré anonyme, avec une erreur utilisateur contrôlée. Le drapeau `VITE_ENABLE_APP_PREVIEW` reste strictement réservé à la CI Playwright et ne doit jamais être configuré dans un déploiement public.

`ProgressProvider` attend ensuite une session authentifiée avant de charger `word_progress`. Il expose un snapshot en lecture seule aux pages, met ce snapshot à jour après chaque RPC réussie et bloque l’espace applicatif sur un état de chargement ou d’erreur explicite. L’aperçu local utilise `InMemoryProgressRepository` pour la durée de l’onglet uniquement ; un build public configuré utilise `SupabaseProgressRepository` et ne bascule jamais silencieusement vers une progression locale.

`summarizeProgress` calcule depuis ce snapshot les nombres et pourcentages verts en compréhension, en production et dans les deux sens. La fonction reste pure dans `domain/progress` ; les pages lui fournissent uniquement les identifiants du corpus ou de la leçon à résumer. Aucun agrégat global ou par leçon n'est persisté.

## 4. Structure cible

```text
kuma-libre/
├── lessons/                         # Sources Markdown du corpus
├── reference/                       # Glossaire et audit du corpus
├── mockups/                         # Explorations et référence UX
├── docs/                            # Architecture détaillée et mémoire de conception
├── scripts/
│   └── corpus/
│       └── generate-corpus.ts       # CLI de génération et de validation
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
│   │   ├── vocabulary/              # Import, types et validation du corpus
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

Le chemin canonique du JSON généré est `src/generated/corpus.json`. Il s'agit d'un artefact versionné et déterministe, consommé en lecture seule par l'application et jamais édité manuellement.

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
- `AppHeader` et `ProfileMenu` ;
- `LessonCard` et `LessonListItem` ;
- `VocabularyRow` ;
- `ProgressSummary` ;
- `QuickReviewCard` ;
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
  getSession(): Promise<AuthSession | null>;
  onAuthStateChange(listener: AuthStateListener): () => void;
  signInWithGoogle(): Promise<void>;
  signInWithMagicLink(email: string): Promise<void>;
  completeSignIn(callbackUrl: string): Promise<AuthSession>;
  signOut(): Promise<void>;
}

interface ProgressRepository {
  getProgress(): Promise<ProgressByEntry>;
  getHistory(options?: HistoryQuery): Promise<readonly ReviewEvent[]>;
  recordReview(input: ReviewSubmission): Promise<DirectionProgress>;
}

interface SpeechRecognizer {
  isSupported(): boolean;
  start(options: {
    language: string;
    maxAlternatives?: number;
    onListening: () => void;
  }): Promise<string>;
  stop(): void;
  cancel(): void;
}

interface SpeechSynthesizer {
  isSupported(): boolean;
  speak(text: string, options: { language: string; rate?: number }): Promise<void>;
  stop(): void;
}
```

Les implémentations initiales sont `SupabaseAuthRepository`, `SupabaseProgressRepository`, `WebSpeechRecognizer` et `WebSpeechSynthesizer`. `SpeechProvider` injecte les deux adaptateurs au niveau de l’application. Les tests les remplacent par des versions contrôlées et n’appellent jamais une vraie voix ou un vrai microphone.

`WebSpeechSynthesizer` sélectionne une voix exacte pour la locale demandée, puis une voix de la même langue et enfin la voix par défaut. `WebSpeechRecognizer` normalise les erreurs propres aux navigateurs vers `permission-denied`, `no-speech`, `network-error`, `cancelled` ou `unsupported`. Le reducer local de `features/speech` pilote les états `permission`, `listening`, `transcribing`, `ready`, `error` et `cancelled`. Il ne connaît aucune règle de correction et transmet uniquement le texte final à l’input du quiz.

Le client génère l’identifiant UUID d’une tentative avant l’appel. `record_review` déduit l’utilisateur avec `auth.uid()`, insère `review_events` et met à jour `word_progress` dans la même transaction. Une répétition strictement identique du même UUID retourne le score existant ; un contenu différent utilisant cet UUID est rejeté. La correction n’est révélée qu’après confirmation de la RPC. En cas d’échec, l’UI conserve l’objet `ReviewSubmission` et renvoie exactement le même identifiant.

Le frontend configure Supabase exclusivement avec `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`. Le client utilise PKCE, désactive l'échange automatique de l'URL afin que `/auth/callback` porte explicitement l'état d'interface, puis laisse le SDK persister et renouveler sa session technique. Aucune clé administrative et aucune donnée de progression ne passent par ce stockage.

Le SDK `@supabase/supabase-js@2.118.0` possède actuellement une déclaration WebAuthn incompatible avec TypeScript 6 lorsque `skipLibCheck` reste désactivé. Le dépôt applique par `patch-package` le correctif de déclaration proposé dans la PR amont Supabase `#2629`. Le patch est supprimé dès sa publication dans une version stable ; il ne modifie pas le runtime.

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

Le snapshot de progression est global uniquement à l’espace authentifié. Il ne duplique pas la source de vérité : Supabase reste autoritaire et le Context React sert de vue courante pour filtrer les questions et produire les synthèses sans requête par composant.

`AppHeader` centralise les variantes du header protégé : mot-symbole et profil pour l'accueil et la liste des leçons, puis retour contextuel, titre et profil sur les écrans secondaires, y compris la configuration du quiz. Ses trois colonnes sont explicitement positionnées afin que la flèche reste à gauche, le titre au centre et le profil à droite, même lorsque le titre visuel passe dans le contenu sur desktop. Les pages secondaires ne dupliquent pas le retour dans leur contenu. La question active masque ce header afin de préserver la concentration et conserve sa confirmation de sortie dédiée.

Le bouton de profil ouvre depuis la droite, côté déclencheur, un panneau de navigation secondaire accessible et adapté au mobile. Il relie l'accueil de révision, la progression, la langue et le compte sans ajouter une barre de navigation permanente au parcours de quiz. Son entrée de `250 ms`, sa sortie de `180 ms`, son piège de focus, sa fermeture par `Escape` et sa réduction de mouvement restent gérés dans le composant.

`HomePage` assemble `QuickReviewCard` et les trois premières leçons réelles. `QuickReviewCard` appelle directement la fonction pure `buildQuickReviewSession` : il ne recopie donc pas la priorité rouge puis jaune, la limite de dix ou l'exclusion des verts dans React. `LessonsPage` réutilise une variante compacte de ce composant avant la liste complète.

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
- `src/assets/brand` contient les PNG transparents de production ; `BrandLogo` conserve leurs dimensions intrinsèques et utilise `object-contain` afin d'éviter tout recadrage. Le mot-symbole original reste archivé sans être embarqué par le build, tandis que la variante `wordmark` utilise la V2 dans les headers : son canevas est recadré au plus près des pixels visibles avec une marge de sécurité transparente, sans modifier le dessin.
- Tailwind gère en priorité layout, espacements, responsive et états simples.
- `src/shared/styles/tokens.css` est la source canonique des couleurs, rayons, ombres, espacements, polices et variables de thème Tailwind.
- `src/shared/styles/_tokens.scss` constitue le pont vers les modules SCSS sans recopier les valeurs primitives.
- Les animations et composants complexes utilisent des modules SCSS colocalisés avec une imbrication peu profonde.
- Les durées `fast`, `exit`, `base`, `slow` et `loop`, ainsi que les courbes `enter`, `exit` et `standard`, proviennent exclusivement des tokens CSS partagés.
- Les entrées utilisent en priorité `transform`; `opacity` reste réservé aux couches décoratives qui ne portent pas de texte. Une sortie reste plus courte que l’entrée correspondante et aucune navigation ne dépend de la fin d’une animation.
- Les modules animés définissent leur comportement `prefers-reduced-motion`; la fondation globale neutralise également les animations non essentielles par sécurité.
- `AppLoader` est le loader plein écran partagé : logo empilé non recadré, libellé annoncé et barre décorative. Les petits chargements d’action continuent d’utiliser `Spinner`.
- `index.html` contient un shell de chargement initial minimal, stylé par la feuille globale chargée avant le JavaScript. Il reste visible tant que l’entrée React est indisponible, puis React le remplace sans temporisation artificielle.

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
8. Ajouter la synthèse et la dictée vocales. *(implémenté)*
9. Déployer sur Cloudflare Pages.

### État du socle

Les huit premières étapes sont initialisées avec :

- React, TypeScript strict et Vite ;
- React Router en Data Mode ;
- i18next et les premiers catalogues FR, EN et ES ;
- Tailwind CSS via son plugin Vite, les tokens visuels canoniques et le pont vers les modules SCSS ;
- les assets PNG transparents de la marque et le composant `BrandLogo` sans recadrage ;
- les premières primitives partagées `Button`, `IconButton`, `Card`, `FlagIcon`, `ProgressBar`, `Spinner` et `AppLoader`, avec leurs états accessibles et leurs tests ;
- Vitest, React Testing Library, couverture V8, Playwright et axe ;
- ESLint, Prettier, audit npm et une CI GitHub composée des checks `database`, `quality` et `e2e`.
- l'importeur pur des formats Markdown historiques, les identifiants stables, les catégories et l'artefact `src/generated/corpus.json` ;
- les validations structurelles exécutées au build et le contrôle séparé `corpus:validate-ready` pour suivre la migration des traductions espagnoles et des lectures manquantes.
- le domaine pur `src/domain/quiz`, qui construit les sessions configurées et rapides, crée les questions dans les deux directions, normalise et valide les réponses, puis applique les transitions de maîtrise indépendantes ;
- une source aléatoire injectable pour tester de manière déterministe la sélection prioritaire et le mélange des questions.
- le premier parcours React vertical : liste continue des leçons réelles, détail du vocabulaire par catégorie, configuration du quiz, question, correction, confirmation de sortie et bilan ;
- le chargement différé des pages applicatives afin que le corpus ne gonfle pas le JavaScript initial de l'accueil public ;
- un fallback de chargement accessible et traduit pendant la résolution du premier chunk de route ;
- des tests de composants sur les interactions critiques et un parcours Playwright desktop/mobile fondé sur une entrée réelle du corpus.
- la synthèse vocale locale de la question, la dictée vers l’input sans validation automatique, les états accessibles inspirés des messageries mobiles et le repli clavier lorsque les API Web Speech sont absentes ;
- des adaptateurs vocaux remplaçables, testés avec des dépendances contrôlées, sans stockage d’audio ni dépendance du domaine de quiz aux API navigateur.

Les primitives restantes seront ajoutées au rythme des parcours réels. Le corpus normalisé contient 904 entrées trilingues prêtes pour le quiz dans 18 leçons, avec leurs formes japonaises et leur rōmaji stocké. Supabase Auth est connecté derrière un repository testable : Google, magic link, callback, garde de route, restauration de destination, compte et déconnexion sont implémentés. Les migrations `profiles`, `user_preferences`, `review_events` et `word_progress`, leurs politiques RLS et la RPC idempotente `record_review` sont versionnées et testées par la CI. Le frontend charge les scores, filtre la configuration avec le sens sélectionné et persiste chaque réponse avant d’afficher la correction. L’aperçu sans configuration Supabase conserve ce comportement avec un repository en mémoire réinitialisé au rechargement. Les synthèses globale et par leçon sont connectées à ce snapshot, la liste des leçons affiche la maîtrise dans les deux sens et chaque entrée expose ses deux scores sur trois. L'accueil connecté expose la révision rapide et les premières leçons, le panneau animé du profil donne accès aux pages secondaires et la page inconnue choisit un retour public ou connecté sûr. La passe de fidélité visuelle V1 est suivie page par page dans [`../quality/ui-fidelity-v1.md`](../quality/ui-fidelity-v1.md).

## 13. Qualité et synchronisation documentaire

Les conventions exécutables et critères de fin sont définis dans [`../quality/README.md`](../quality/README.md). Ils couvrent notamment :

- le nommage et le mode TypeScript strict ;
- la documentation TSDoc des contrats et comportements non triviaux ;
- la matrice de tests unitaires, composants, intégration, SQL et end-to-end ;
- les budgets de performance et exigences d'accessibilité ;
- la Definition of Done.

Toute évolution fonctionnelle doit synchroniser dans le même changement les implémentations, tests, clés i18n, documents vivants et maquettes réellement affectés. Le workflow détaillé se trouve dans le skill local [`kuma-libre-feature-sync`](../../.agents/skills/kuma-libre-feature-sync/SKILL.md), et le contrôle final dans [`kuma-libre-quality-gate`](../../.agents/skills/kuma-libre-quality-gate/SKILL.md).

L’intégration continue exécute le formatage, le lint, le typecheck, la couverture, le build, l’audit, les parcours critiques, l’accessibilité et les tests PostgreSQL. Le job `database` démarre la stack Supabase, réapplique les migrations puis vérifie le schéma, les privilèges, la RLS, les transitions de maîtrise et l’idempotence. Localement, ce job nécessite Docker Desktop ; son absence doit être signalée et ne doit jamais être maquillée par un faux succès.

## 14. Références techniques

- [Supabase Auth avec React](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions/auth)
- [React : reducer et context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [React Router : modes](https://reactrouter.com/start/modes)
- [react-i18next](https://react.i18next.com/getting-started)
- [Lucide React](https://lucide.dev/guide/react/)
