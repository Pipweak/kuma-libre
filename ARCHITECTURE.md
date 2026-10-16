# Architecture cible — Application de révision du japonais

> **Statut :** proposition initiale validée pour guider le démarrage du projet.  
> **Version :** 1 — 15 octobre 2026.  
> Ce document est vivant : il doit être mis à jour lorsque les besoins ou les décisions techniques évoluent.

## 1. Objectif du projet

L'application doit permettre de réviser le vocabulaire japonais extrait des supports d'étude présents dans ce dépôt.

Le premier corpus provient du volume actuellement transcrit de *Minna no Nihongo*. L'architecture doit toutefois permettre d'ajouter ultérieurement d'autres volumes ou d'autres sources sans réécrire le moteur de quiz.

L'application doit notamment permettre :

- de sélectionner une ou plusieurs leçons ;
- de réviser dans les deux sens, japonais vers signification et signification vers japonais ;
- d'accepter plusieurs réponses correctes pour une même question ;
- de suivre la maîtrise de chaque entrée ;
- d'utiliser le site sans compte ;
- de sauvegarder et synchroniser la progression après connexion ;
- d'ajouter ultérieurement la prononciation et la reconnaissance vocale.

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
- choisir le prochain mot selon la progression ;
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

### 11.1 Écrans initiaux

- **Accueil** : présentation courte et démarrage d'une révision ;
- **Configuration du quiz** : leçons, sections et sens de révision ;
- **Quiz** : question, input, microphone futur, validation et correction ;
- **Progression** : état par leçon et répartition rouge/jaune/vert ;
- **Compte** : connexion, identité et déconnexion.

### 11.2 Écran de quiz

L'écran principal reste volontairement simple :

- progression de la session ;
- leçon ou source de la question ;
- question centrale lisible ;
- champ de réponse automatiquement focalisé ;
- bouton de microphone lorsqu'il est disponible ;
- validation par le bouton ou la touche Entrée ;
- retour correct/incorrect ;
- affichage de toutes les réponses acceptées ;
- action permettant de reconnaître un synonyme légitime ;
- passage à la question suivante.

L'interface doit être utilisable au clavier et avec un lecteur d'écran. Les états correct, incorrect et maîtrise ne doivent pas dépendre uniquement de la couleur.

## 12. Audio et reconnaissance vocale

L'audio est ajouté après stabilisation du quiz textuel.

### 12.1 Synthèse vocale

La synthèse vocale permet :

- d'écouter un mot ou une expression japonaise ;
- de créer un mode écoute vers signification ;
- de répéter la prononciation à la demande.

### 12.2 Reconnaissance vocale

La reconnaissance vocale :

- utilise la langue correspondant à la réponse attendue ;
- écrit la transcription dans le même champ que la saisie clavier ;
- passe par le même normalisateur et le même validateur ;
- reste optionnelle lorsque le navigateur ne la prend pas en charge.

Une transcription japonaise peut retourner des kana ou des kanji. Elle doit donc être comparée à toutes les représentations acceptées de l'entrée.

L'accès aux API vocales du navigateur doit passer par une abstraction afin de pouvoir ajouter ultérieurement un autre fournisseur sans modifier le moteur de quiz.

## 13. Organisation du code cible

L'application peut rester dans un dépôt unique sans introduire immédiatement un monorepo complexe.

```text
minna-no-nihongo/
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
- les configurations de quiz ;
- les états connecté et non connecté.

### 16.3 Tests de bout en bout

Playwright couvre un petit nombre de parcours essentiels :

- lancer un quiz anonyme ;
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
- implémenter les deux modes de quiz ;
- accepter les différentes réponses ;
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

- synthèse vocale japonaise ;
- mode écoute ;
- reconnaissance vocale ;
- gestion explicite des navigateurs non compatibles.

## 18. Hors périmètre de la première version

- backend Node/Express dédié ;
- administration éditoriale complète dans le navigateur ;
- partage social ou classement entre utilisateurs ;
- gamification complexe ;
- génération automatique de nouveaux cours ;
- application mobile native ;
- reconnaissance vocale serveur ;
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
