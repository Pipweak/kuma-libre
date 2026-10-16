# Architecture cible — Kuma Libre

> **Statut :** proposition initiale validée pour guider le démarrage du projet.  
> **Version :** 2 — 15 octobre 2026.
> Ce document est vivant : il doit être mis à jour lorsque les besoins ou les décisions techniques évoluent.

## 1. Objectif du projet

L'application doit permettre de réviser le vocabulaire japonais extrait des supports d'étude présents dans ce dépôt.

Le premier corpus provient du volume actuellement transcrit de *Minna no Nihongo*. L'architecture doit toutefois permettre d'ajouter ultérieurement d'autres volumes ou d'autres sources sans réécrire le moteur de quiz.

L'application doit notamment permettre :

- de sélectionner un ouvrage puis une ou plusieurs leçons ;
- de réviser dans les deux sens, japonais vers signification et signification vers japonais ;
- de configurer le périmètre et l'ordre des questions sans alourdir l'écran de quiz ;
- d'accepter plusieurs réponses correctes pour une même question ;
- de suivre la maîtrise de chaque entrée ;
- d'utiliser le site sans compte ;
- de sauvegarder et synchroniser la progression après connexion ;
- d'ajouter ultérieurement la lecture vocale des questions et la dictée des réponses.

L'application sera un outil d'étude indépendant, avec son propre nom, son propre logo et sa propre interface. Aucun scan du manuel ne sera publié.

## 2. Décisions d'architecture

| Sujet | Décision actuelle |
| --- | --- |
| Framework frontend | React avec TypeScript |
| Outil de développement et de build | Vite |
| Hébergement frontend | Cloudflare Pages |
| Accès au site | Public, sans barrière Cloudflare Access |
| Authentification | Supabase Auth |
| Méthodes de connexion | Google et email, de préférence par magic link ou OTP |
| Base de données utilisateur | Supabase Postgres |
| Autorisation | Row Level Security de Supabase |
| Backend personnalisé | Aucun pour la première version |
| Source du vocabulaire | Fichiers Markdown versionnés dans le dépôt |
| Format consommé par React | JSON normalisé et généré au build |
| Progression des visiteurs | Mémoire de la page uniquement |
| Progression des utilisateurs connectés | Supabase, source de vérité unique |
| Données métier dans `localStorage` | Non |
| Styling | À décider entre Tailwind CSS et SCSS/CSS Modules |
| Audio | Amélioration progressive après le MVP |
| Approche UI | Mobile-first, centrée sur un quiz volontairement minimal |

## 3. Vue générale

```text
Fichiers Markdown versionnés
          |
          v
Import, normalisation et validation au build
          |
          v
Corpus JSON statique ----------------------+
                                            |
                                            v
                                  Application React
                                    |             |
                         visiteur anonyme     utilisateur connecté
                                    |             |
                           état en mémoire        |
                                                  v
                                      Supabase Auth + Postgres
```

Le corpus de vocabulaire est public et statique. Les données personnelles et la progression sont privées et isolées par utilisateur dans Supabase.

## 4. Modes de quiz

Le produit expose deux modes principaux. Les langues française et anglaise ne constituent pas deux directions séparées : elles représentent deux réponses ou deux formulations possibles de la même signification.

### 4.1 Japonais vers signification

L'application affiche une forme japonaise, par exemple :

```text
医者（いしゃ）
```

L'utilisateur peut répondre en français ou en anglais :

```text
médecin
doctor
```

Une entrée peut posséder plusieurs traductions ou synonymes valides dans chaque langue.

### 4.2 Signification vers japonais

L'application affiche simultanément le français et l'anglais, par exemple :

```text
médecin (doctor)
```

L'utilisateur peut répondre avec une représentation japonaise valide :

```text
isha
いしゃ
医者
```

Selon l'entrée, les réponses acceptées peuvent inclure :

- le rōmaji ;
- les hiragana ;
- les katakana ;
- les kanji ;
- plusieurs graphies explicitement définies.

### 4.3 Validation d'une réponse

La validation suit les étapes suivantes :

1. normalisation Unicode ;
2. suppression des espaces superflus ;
3. normalisation de la casse pour le français, l'anglais et le rōmaji ;
4. normalisation de la ponctuation pertinente ;
5. comparaison avec toutes les réponses acceptées pour le mode courant ;
6. affichage des autres réponses valides après validation.

La normalisation ne doit pas transformer arbitrairement le sens d'une réponse. Les variantes ambiguës ou particulières doivent pouvoir être déclarées explicitement dans le corpus.

Pour les traductions, l'interface pourra permettre à l'utilisateur de se compter correct lorsqu'un synonyme légitime n'a pas encore été enregistré. Cette action devra rester visible dans l'historique afin d'améliorer ultérieurement le corpus.

### 4.4 Configuration d'une session

Avant de démarrer, l'utilisateur peut configurer le quiz sans exposer des réglages secondaires sur l'écran de question :

- ouvrage ;
- une, plusieurs ou toutes les leçons de l'ouvrage ;
- sens de révision ;
- périmètre de maîtrise : uniquement les mots rouges et jaunes, ou tous les mots en incluant les verts ;
- ordre des questions : aléatoire ou ordre du corpus et des leçons.

La configuration doit proposer des valeurs par défaut permettant de commencer rapidement. Pour un visiteur, la configuration courante reste en mémoire pendant l'utilisation de la page. Pour un utilisateur connecté, la dernière configuration pourra être enregistrée avec ses préférences dans Supabase. Elle ne doit pas devenir une seconde source de progression dans `localStorage`.

## 5. Modèle du corpus

Les fichiers Markdown existants utilisent plusieurs formats de tableaux. Ils restent adaptés à la lecture et à l'édition humaine, mais ne doivent pas être analysés directement par l'application dans le navigateur.

Un script exécuté au build convertit les différentes formes de tableaux vers un modèle unique.

```ts
type VocabularyEntry = {
  id: string;
  bookId: string;
  lesson: number;
  section: "vocabulary" | "conversation" | "proper-name" | "useful-word" | "reference";
  kana: string[];
  kanji: string[];
  romaji: string[];
  meanings: {
    fr: string[];
    en: string[];
  };
  notes?: string[];
  source: {
    file: string;
    section?: string;
  };
};
```

### 5.1 Identifiants

Chaque entrée doit recevoir un identifiant stable, indépendant de sa graphie et de sa traduction, par exemple :

```text
mnn1-l01-vocabulary-001
```

Un identifiant construit uniquement à partir du mot japonais n'est pas suffisant : le même mot peut apparaître dans plusieurs leçons ou sections, et une correction éditoriale ne doit pas casser l'historique de progression.

### 5.2 Validation du corpus

Le build doit échouer lorsqu'une donnée structurante est invalide, notamment en cas de :

- doublon d'identifiant ;
- numéro de leçon absent ;
- entrée sans forme japonaise ;
- entrée sans signification française et anglaise ;
- section inconnue ;
- ligne Markdown impossible à convertir ;
- fichier généré qui n'est plus synchronisé avec les sources.

Le fichier JSON généré est un artefact de build. Les Markdown restent les sources éditables de référence.

## 6. Moteur de quiz

Le moteur de quiz appartient au domaine et ne doit dépendre ni de React ni de Supabase. Il doit pouvoir être testé avec de simples fonctions TypeScript.

Ses responsabilités sont :

- filtrer le corpus par livre, leçon et section ;
- filtrer les entrées selon leur niveau de maîtrise, avec ou sans les mots verts ;
- choisir le prochain mot selon la progression ;
- respecter l'ordre aléatoire ou séquentiel choisi pour la session ;
- produire une question dans l'un des deux modes ;
- calculer les réponses acceptées ;
- évaluer une réponse normalisée ;
- produire le résultat de révision ;
- éviter les répétitions immédiates inutiles ;
- réintroduire périodiquement les mots déjà maîtrisés.

React orchestre l'expérience utilisateur, mais ne porte pas directement les règles de sélection, de validation ou de progression.

## 7. Progression

La première version conserve la logique actuellement décrite dans `progress-vincent.json` :

- une première réussite fait passer le mot de rouge à jaune ;
- trois réussites sur trois dates locales distinctes font passer le mot au vert ;
- une erreur fait redescendre le mot d'un niveau ;
- une erreur remet à zéro la série utilisée pour atteindre le vert ;
- une seule réussite par mot et par date locale compte dans cette série.

Cette règle doit être implémentée comme une fonction pure et couverte par des tests unitaires. Elle pourra être remplacée plus tard par un algorithme de répétition espacée sans modifier l'interface du quiz.

### 7.1 Historique et état courant

Deux concepts sont conservés séparément :

- **événement de révision** : tentative immuable contenant la question, la réponse et le résultat ;
- **progression du mot** : résumé courant utilisé pour sélectionner rapidement les prochaines questions.

L'historique permet de recalculer la progression, d'afficher des statistiques et de faire évoluer l'algorithme.

## 8. Authentification et persistance

### 8.1 Site public

Le chargement de l'application et l'accès au quiz ne nécessitent aucune connexion. Cloudflare Pages sert les fichiers statiques publiquement.

### 8.2 Visiteur non connecté

Un visiteur peut lancer une session de révision immédiatement. Son état reste en mémoire tant que la page est ouverte.

La version déployée ne conserve pas la progression métier dans `localStorage`. L'interface indique qu'une connexion est nécessaire pour sauvegarder et synchroniser la progression.

### 8.3 Utilisateur connecté

Supabase Auth gère :

- la connexion avec Google ;
- la connexion par email ;
- la création et le renouvellement de session ;
- la déconnexion ;
- l'identifiant stable de l'utilisateur.

Le SDK d'authentification peut conserver les éléments techniques nécessaires à la session dans son stockage dédié. Cette exception ne doit pas être utilisée pour stocker le corpus, la progression ou un cache métier concurrent de Supabase. La déconnexion doit supprimer la session gérée par le SDK.

### 8.4 Contrat de persistance

Le domaine dépend d'une abstraction et non directement du SDK Supabase :

```ts
interface ProgressRepository {
  getProgress(): Promise<WordProgress[]>;
  recordReview(review: ReviewSubmission): Promise<ReviewResult>;
  getHistory(options?: HistoryQuery): Promise<ReviewEvent[]>;
}
```

Deux implémentations sont prévues :

- une implémentation en mémoire pour les visiteurs et les tests ;
- une implémentation Supabase pour les utilisateurs connectés.

Il n'existe pas de fallback silencieux vers d'anciennes données locales.

## 9. Modèle de données Supabase

### 9.1 `profiles`

Informations publiques minimales associées au compte :

- `user_id` ;
- `display_name` facultatif ;
- `avatar_url` facultatif ;
- `created_at` ;
- `updated_at`.

### 9.2 `review_events`

Historique immuable des tentatives :

- `id` ;
- `user_id` ;
- `word_id` ;
- `mode` ;
- `prompt_snapshot` ;
- `submitted_answer` ;
- `normalized_answer` ;
- `result` ;
- `response_time_ms` facultatif ;
- `reviewed_at`.

### 9.3 `word_progress`

État courant d'une entrée pour un utilisateur :

- `user_id` ;
- `word_id` ;
- `status` : `red`, `yellow` ou `green` ;
- `correct_total` ;
- `incorrect_total` ;
- `progress_streak` ;
- `successful_dates` ;
- `last_reviewed_at` ;
- `last_result`.

La paire `(user_id, word_id)` est unique.

### 9.4 Mise à jour atomique

L'enregistrement de l'événement et la mise à jour de la progression doivent idéalement s'effectuer dans une seule transaction Postgres, exposée par une fonction Supabase RPC. Cela évite qu'un événement soit enregistré sans que la progression soit mise à jour, ou inversement.

## 10. Sécurité

Les règles suivantes sont obligatoires :

- toutes les tables utilisateur activent la Row Level Security ;
- un utilisateur ne peut lire et modifier que les lignes liées à son propre identifiant ;
- l'identifiant utilisateur provient de la session authentifiée, jamais d'un champ libre envoyé par le client ;
- la clé publique Supabase peut être utilisée par le frontend avec la RLS activée ;
- une éventuelle clé `service_role` ne doit jamais être incluse dans le frontend ou dans Git ;
- aucune confiance n'est accordée à des headers d'identité fabriqués par le navigateur ;
- les environnements local, preview et production utilisent des projets ou configurations explicitement identifiés.

## 11. Interface envisagée

L'interface est conçue mobile-first. Le produit doit rester immédiatement identifiable comme un quiz : les fonctions de navigation et de consultation ne doivent pas concurrencer la question, l'input et l'action principale.

### 11.1 Écrans initiaux

- **Accueil** : démarrage immédiat d'une révision et accès à sa configuration ;
- **Bibliothèque / configuration du quiz** : ouvrage, leçons, sens, périmètre de maîtrise et ordre des questions ;
- **Quiz** : question, lecture vocale, input, dictée, validation et correction ;
- **Progression** : état par leçon et répartition rouge/jaune/vert ;
- **Compte** : connexion, identité et déconnexion.

La navigation secondaire peut être regroupée derrière un menu compact, notamment sur mobile. La configuration du quiz reste toutefois accessible directement depuis l'accueil, car elle fait partie du parcours principal.

### 11.2 Écran de quiz

L'écran principal reste volontairement simple :

- progression de la session ;
- leçon ou source de la question ;
- question centrale lisible ;
- bouton permettant d'écouter ou de réécouter la question ;
- champ de réponse automatiquement focalisé ;
- bouton de microphone intégré au champ lorsqu'il est disponible ;
- validation par le bouton ou la touche Entrée ;
- zone de correction affichée sous l'input après validation ;
- passage explicite à la question suivante.

L'interface doit être utilisable au clavier et avec un lecteur d'écran. Les états correct, incorrect et maîtrise ne doivent pas dépendre uniquement de la couleur.

### 11.3 États de réponse et correction

Une question possède deux états d'interface clairement distincts :

1. **Réponse** : l'input est modifiable, le microphone est disponible et l'action principale est `Valider` ;
2. **Correction** : l'input conserve la réponse donnée mais devient non modifiable, le microphone est désactivé et l'action principale devient `Question suivante`.

Après validation, le résultat apparaît directement sous l'input, à proximité de l'endroit où se trouve déjà le regard de l'utilisateur :

- une réponse correcte affiche une confirmation courte ainsi que les autres formes acceptées utiles ;
- une réponse incorrecte affiche un libellé explicite, la réponse donnée et la solution attendue ;
- les formes japonaises pertinentes et les significations française et anglaise peuvent être rappelées dans la correction ;
- l'action permettant de signaler un synonyme légitime reste secondaire et discrète.

Le résultat ne doit jamais être communiqué uniquement par une couleur : une icône et un texte accompagnent les états vert et rouge. La mise en page réserve autant que possible une zone stable à la correction afin d'éviter un saut vertical important sur mobile.

Le passage à la question suivante n'est pas automatique. L'utilisateur doit avoir le temps de lire la solution. La touche Entrée valide la réponse dans le premier état, puis passe à la question suivante dans le second. Le changement d'état peut utiliser une animation courte et non bloquante, et le résultat doit être annoncé par une zone accessible de type `aria-live`.

### 11.4 Progression sans surcharge

L'écran de progression reste séparé du quiz et accessible depuis la navigation secondaire. Sa première version affiche uniquement :

- la progression globale d'un ouvrage ;
- la progression de chaque leçon ;
- la répartition rouge, jaune et vert lorsque l'utilisateur ouvre le détail d'une leçon.

Pendant le quiz, seule la progression de la session courante est affichée. Les graphiques détaillés, classements et mécanismes de gamification ne doivent pas encombrer ce parcours.

## 12. Audio et reconnaissance vocale

La fonctionnalité vocale est une amélioration progressive ajoutée après stabilisation du quiz textuel. Elle comporte uniquement deux capacités : faire entendre la question et dicter une réponse dans l'input.

Les commandes vocales telles que « suivant », « répète » ou « valide » ne sont pas prévues. L'évaluation de la qualité de la prononciation n'est pas non plus un objectif du produit.

### 12.1 Lecture vocale de la question

Un bouton haut-parleur placé près de la question permet de l'écouter ou de la réécouter. Une option utilisateur pourra également déclencher automatiquement la lecture lors de l'affichage d'une nouvelle question.

La langue de synthèse dépend du sens du quiz :

- une question japonaise est prononcée en japonais ;
- une question française est prononcée en français ;
- l'anglais affiché entre parenthèses n'est pas nécessairement prononcé lorsque le français est la langue principale de la question.

Lorsque des kanji sont affichés, l'application peut transmettre les kana au synthétiseur pour imposer la bonne lecture :

```text
Affiché : 医者
Prononcé : いしゃ
```

Les marqueurs utiles à l'étude mais inutiles à l'oral, comme `～`, les groupes verbaux ou certaines annotations entre crochets, doivent être retirés du texte prononcé.

La lecture vocale et la liste des voix disponibles dépendent du navigateur et du système. L'utilisateur doit pouvoir régler au minimum l'activation de la lecture automatique et sa vitesse.

### 12.2 Dictée vocale de la réponse

Le bouton microphone est intégré à l'input, selon un comportement proche des applications de messagerie :

1. l'utilisateur active le microphone ;
2. l'application demande l'autorisation si nécessaire ;
3. l'interface indique clairement que l'écoute est active ;
4. la transcription provisoire peut être affichée dans l'input ;
5. la transcription finale est insérée dans ce même input ;
6. l'input reprend le focus ;
7. l'utilisateur peut corriger le texte ;
8. l'utilisateur valide avec Entrée ou avec le bouton de validation.

La dictée ne valide jamais automatiquement la réponse.

La langue de reconnaissance dépend de la réponse attendue :

- réponse japonaise : `ja-JP` ;
- réponse française : `fr-FR` ;
- réponse anglaise : variante anglaise configurée, par exemple `en-CA` ou `en-US`.

Lorsque la question est en japonais, l'utilisateur choisit sa langue de réponse vocale préférée entre le français et l'anglais. La saisie au clavier continue dans tous les cas à accepter les deux langues.

Une réponse japonaise parlée peut être transcrite en kana ou en kanji. Le texte final est traité comme une saisie clavier ordinaire et comparé à toutes les représentations acceptées de l'entrée.

### 12.3 Intégration avec l'input

Le clavier et le microphone alimentent exactement le même état de réponse. Le moteur de quiz ne connaît pas l'origine du texte :

```text
Clavier --------+
                +--> input --> normalisation --> validation manuelle
Microphone -----+
```

Une fois la transcription terminée, elle devient du texte normal librement modifiable. Les règles de normalisation et de validation existantes s'appliquent sans branche métier spécifique à la voix.

### 12.4 États et erreurs

Le composant de dictée gère explicitement les états suivants :

```text
idle -> permission -> listening -> transcribing -> ready
```

Il doit également représenter les cas `permission-denied`, `no-speech`, `unsupported`, `network-error` et `cancelled` avec un message compréhensible.

Le quiz reste entièrement utilisable au clavier si la reconnaissance vocale est absente, refusée ou défaillante.

### 12.5 Contraintes techniques et confidentialité

- la synthèse vocale est arrêtée avant l'activation du microphone afin que l'application ne transcrive pas sa propre voix ;
- l'application ne conserve pas d'enregistrement audio ;
- seule la transcription finale alimente l'input ;
- la réponse n'est enregistrée dans l'historique qu'après validation explicite de l'utilisateur ;
- l'accès aux API vocales passe par des adaptateurs afin de pouvoir changer de fournisseur sans modifier le moteur de quiz.

Interfaces envisagées :

```ts
interface SpeechSynthesizer {
  isSupported(): boolean;
  speak(text: string, options: { language: string; rate?: number }): Promise<void>;
  stop(): void;
}

interface SpeechRecognizer {
  isSupported(): boolean;
  listen(options: { language: string; maxAlternatives?: number }): Promise<string>;
  cancel(): void;
}
```

L'implémentation initiale utilisera les capacités du navigateur. Une autre implémentation pourra être ajoutée plus tard si leur qualité ou leur compatibilité devient insuffisante.

## 13. Organisation du code cible

L'application peut rester dans un dépôt unique sans introduire immédiatement un monorepo complexe.

```text
kuma-libre/
├── lessons/                         # Sources Markdown par leçon
├── reference/                       # Références complémentaires
├── scripts/
│   └── content/                     # Import et validation du corpus
├── generated/
│   └── vocabulary.json              # Artefact normalisé
├── src/
│   ├── app/                         # Composition, routing et providers
│   ├── domain/
│   │   ├── vocabulary/              # Types et accès au corpus
│   │   ├── quiz/                    # Sélection et génération des questions
│   │   ├── answers/                 # Normalisation et validation
│   │   └── progress/                # Règles de maîtrise
│   ├── features/
│   │   ├── auth/
│   │   ├── practice/
│   │   ├── lesson-selection/
│   │   └── progress-dashboard/
│   ├── infrastructure/
│   │   ├── supabase/
│   │   ├── persistence/
│   │   └── speech/
│   ├── shared/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── main.tsx
├── tests/
│   └── e2e/
├── ARCHITECTURE.md
└── README.md
```

Les noms exacts pourront évoluer. La séparation entre domaine, fonctionnalités, infrastructure et composants partagés doit en revanche rester claire.

## 14. Gestion de l'état React

Principes retenus :

- état local avec `useState` lorsque possible ;
- `useReducer` pour la machine d'état du quiz ;
- hooks personnalisés pour relier le domaine aux composants ;
- contexte React uniquement pour les dépendances réellement globales, comme la session ;
- pas de Redux dans la première version ;
- état distant séparé de l'état d'interface ;
- ajout éventuel de TanStack Query lorsque les interactions Supabase le justifient.

Le code doit suivre les pratiques React plutôt que reproduire une organisation Angular à base de classes et de services omniprésents.

## 15. Déploiement

### 15.1 Cloudflare Pages

Cloudflare Pages construit et publie l'application statique depuis le dépôt Git.

Configuration attendue :

- commande de build : à définir après l'initialisation Vite ;
- répertoire de sortie : `dist` ;
- fallback SPA si le routing client en a besoin ;
- déploiements de preview pour les branches ou pull requests.

### 15.2 Variables publiques

Le frontend reçoit uniquement les valeurs publiques nécessaires :

- URL du projet Supabase ;
- clé publique ou `anon` Supabase ;
- URL publique de redirection OAuth.

Aucun secret administratif ne doit être configuré dans le bundle frontend.

### 15.3 Absence de serveur applicatif initial

La première version ne déploie pas de service Node sur Render et n'a donc pas besoin de mécanisme de keep-alive.

Un backend personnalisé pourra être ajouté si un besoin concret apparaît, par exemple :

- traitement audio serveur ;
- intégration nécessitant un secret ;
- administration complexe ;
- génération ou enrichissement de contenu ;
- agrégations ou traitements impossibles à exposer directement au client.

## 16. Stratégie de tests

### 16.1 Tests unitaires

Vitest couvre en priorité :

- l'import des formats Markdown existants ;
- la normalisation des réponses ;
- les réponses multiples ;
- la génération du rōmaji ;
- la sélection des questions ;
- les transitions rouge/jaune/vert ;
- les règles liées aux dates locales.

### 16.2 Tests de composants

React Testing Library couvre :

- la validation au clavier ;
- les états correct et incorrect ;
- l'affichage des solutions ;
- le verrouillage de l'input et du microphone pendant la correction ;
- le remplacement de `Valider` par `Question suivante` ;
- les configurations de quiz ;
- les états connecté et non connecté.

### 16.3 Tests de bout en bout

Playwright couvre un petit nombre de parcours essentiels :

- lancer un quiz anonyme ;
- configurer l'inclusion ou l'exclusion des mots verts ;
- choisir un ordre aléatoire ou séquentiel ;
- répondre dans chaque sens ;
- se connecter ;
- enregistrer une réponse ;
- retrouver la progression après rechargement ;
- se déconnecter sans conserver de progression métier locale.

## 17. Étapes de réalisation

### Phase 1 — Corpus

- définir définitivement le schéma normalisé ;
- créer les identifiants stables ;
- écrire l'importeur Markdown ;
- générer le JSON ;
- ajouter les validations et tests du corpus.

### Phase 2 — MVP React local

- initialiser React, TypeScript et Vite ;
- créer la sélection des leçons ;
- permettre d'inclure tous les mots ou seulement les mots non maîtrisés ;
- proposer l'ordre aléatoire ou l'ordre des leçons ;
- implémenter les deux modes de quiz ;
- accepter les différentes réponses ;
- implémenter les états de réponse et de correction mobile-first ;
- gérer une progression de session en mémoire ;
- mettre en place le design responsive initial.

### Phase 3 — Comptes et synchronisation

- créer le projet Supabase ;
- ajouter Google et email ;
- créer les tables et politiques RLS ;
- implémenter le repository Supabase ;
- sauvegarder l'historique et la progression ;
- déployer sur Cloudflare Pages.

### Phase 4 — Expérience d'étude

- tableau de progression ;
- statistiques par leçon ;
- filtres par statut de maîtrise ;
- amélioration de la sélection des prochains mots ;
- installation éventuelle en PWA.

### Phase 5 — Voix

- bouton de lecture ou de relecture de la question ;
- lecture automatique facultative ;
- synthèse vocale dans la langue de la question ;
- dictée vocale vers l'input sans validation automatique ;
- choix de la langue de réponse vocale lorsque nécessaire ;
- gestion explicite des navigateurs non compatibles.

## 18. Hors périmètre de la première version

- backend Node/Express dédié ;
- administration éditoriale complète dans le navigateur ;
- partage social ou classement entre utilisateurs ;
- gamification complexe ;
- génération automatique de nouveaux cours ;
- application mobile native ;
- reconnaissance vocale serveur ;
- commandes vocales de navigation ou de validation ;
- évaluation automatique de la prononciation ;
- algorithme avancé de répétition espacée.

Ces éléments restent possibles, mais ne doivent pas retarder une première expérience de quiz utilisable.

## 19. Décisions encore ouvertes

- nom et identité visuelle de l'application ;
- Tailwind CSS ou SCSS/CSS Modules ;
- présentation exacte des kana et kanji dans les questions ;
- génération automatique ou stockage explicite du rōmaji ;
- comportement précis lorsqu'un utilisateur reconnaît lui-même un synonyme ;
- choix du magic link ou de l'OTP pour la connexion email ;
- installation PWA dès le MVP ou dans une phase ultérieure ;
- éventuelle adoption de TanStack Query après intégration de Supabase.

Toute nouvelle décision importante doit être ajoutée à ce document avec sa justification, plutôt que rester implicite dans l'implémentation.
