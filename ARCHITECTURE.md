# Architecture cible — Kuma Libre

> **Statut :** proposition initiale validée pour guider le démarrage du projet.  
> **Version :** 5 — 17 octobre 2026.
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
- d'utiliser l'interface en français, en anglais ou en espagnol ;
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
| Langues de l'interface | Français, anglais et espagnol |
| Langues des significations | Français, anglais et espagnol dans le corpus |
| Fondation visuelle | Variables CSS sémantiques partagées, avec alias SCSS sans duplication |
| Styling des composants | À décider entre Tailwind CSS et SCSS/CSS Modules |
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

Le produit expose deux modes principaux. Les langues française, anglaise et espagnole ne constituent pas trois directions séparées : elles représentent plusieurs réponses ou formulations possibles de la même signification.

### 4.1 Japonais vers signification

L'application affiche une forme japonaise, par exemple :

```text
医者（いしゃ）
```

L'utilisateur peut répondre en français, en anglais ou en espagnol :

```text
médecin
doctor
médico
```

Une entrée peut posséder plusieurs traductions ou synonymes valides dans chaque langue.

### 4.2 Signification vers japonais

L'application affiche la langue d'interface comme signification principale et peut montrer les autres traductions disponibles comme aides secondaires, par exemple en français :

```text
médecin (doctor · médico)
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
3. normalisation de la casse pour le français, l'anglais, l'espagnol et le rōmaji ;
4. normalisation de la ponctuation pertinente ;
5. comparaison avec toutes les réponses acceptées pour le mode courant ;
6. affichage des autres réponses valides après validation.

La normalisation ne doit pas transformer arbitrairement le sens d'une réponse. Les variantes ambiguës ou particulières doivent pouvoir être déclarées explicitement dans le corpus.

Pour les traductions, l'interface pourra permettre à l'utilisateur de se compter correct lorsqu'un synonyme légitime n'a pas encore été enregistré. Cette action devra rester visible dans l'historique afin d'améliorer ultérieurement le corpus.

### 4.4 Configuration d'une session

Avant de démarrer, l'utilisateur peut configurer le quiz sans exposer des réglages secondaires sur l'écran de question :

- ouvrage ;
- une, plusieurs ou toutes les leçons de l'ouvrage ;
- sens de révision : japonais vers signification ou signification vers japonais ;
- statuts à inclure : rouge, jaune et/ou vert, avec des raccourcis pour les mots non maîtrisés et pour tous les mots ;
- ordre des questions : aléatoire ou ordre du corpus et des leçons.

La configuration doit proposer des valeurs par défaut permettant de commencer rapidement. Pour un visiteur, la configuration courante reste en mémoire pendant l'utilisation de la page. Pour un utilisateur connecté, la dernière configuration pourra être enregistrée avec ses préférences dans Supabase. Elle ne doit pas devenir une seconde source de progression dans `localStorage`.

Le sens est présenté par deux cartes compactes et explicites : `Comprendre` pour aller du japonais vers les significations et `Produire` pour aller des significations vers le japonais. Les drapeaux et la flèche renforcent le repère visuel, mais un libellé textuel et un nom accessible restent obligatoires.

### 4.5 Composition d'une session

Le nombre de questions n'est pas imposé indépendamment de la sélection. Au démarrage, le moteur construit une liste fixe contenant toutes les entrées qui correspondent à l'ouvrage, aux leçons, au sens et aux statuts choisis. L'interface affiche le nombre obtenu avant de commencer.

Dans une passe :

- chaque entrée sélectionnée apparaît une fois ;
- l'ordre suit le corpus ou un mélange aléatoire selon la configuration ;
- la progression utilisée pour filtrer une entrée est celle du sens sélectionné ;
- une erreur met à jour la progression, mais la même entrée ne revient pas pendant cette passe ;
- l'entrée pourra être reproposée lors d'une session ultérieure.

## 5. Modèle du corpus

Les fichiers Markdown existants utilisent plusieurs formats de tableaux. Ils restent adaptés à la lecture et à l'édition humaine, mais ne doivent pas être analysés directement par l'application dans le navigateur.

L'état actuel et la migration nécessaire pour l'espagnol sont détaillés dans [`reference/corpus-i18n-audit.md`](reference/corpus-i18n-audit.md).

Un script exécuté au build convertit les différentes formes de tableaux vers un modèle unique. Les ouvrages et les leçons possèdent leurs propres métadonnées afin que l'interface puisse construire la bibliothèque sans déduire sa navigation des chemins de fichiers.

Les intitulés thématiques de leçon ne doivent jamais être inventés par l'interface. Tant qu'aucun titre éditorial n'est défini dans les métadonnées, le libellé de repli est simplement `Leçon 01`, `Leçon 02`, etc. Le nombre d'entrées est calculé à partir du corpus généré. Ces données publiques appartiennent au JSON statique, pas à Supabase ; Supabase ne contient que les données propres à l'utilisateur.

```ts
type BookDefinition = {
  id: string;
  title: string;
  volume?: string;
  order: number;
};

type LessonDefinition = {
  id: string;
  bookId: string;
  number: number;
  titles?: Partial<Record<"fr" | "en" | "es", string>>;
  order: number;
  entryCount: number;
};

type VocabularyEntry = {
  id: string;
  bookId: string;
  lessonId?: string;
  section: "vocabulary" | "conversation" | "proper-name" | "useful-word" | "reference";
  kana: string[];
  kanji: string[];
  romaji: string[];
  meanings: {
    fr: string[];
    en: string[];
    es: string[];
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
- ouvrage ou leçon référencé mais inconnu ;
- entrée de leçon sans `lessonId`, hors contenu de référence explicitement rattaché à l'ouvrage ;
- numéro ou ordre de leçon absent ;
- entrée sans forme japonaise ;
- entrée sans signification française, anglaise ou espagnole une fois la migration trilingue activée ;
- section inconnue ;
- ligne Markdown impossible à convertir ;
- fichier généré qui n'est plus synchronisé avec les sources.

Le fichier JSON généré est un artefact de build. Les Markdown restent les sources éditables de référence.

### 5.3 Séparation du corpus et de la progression

Les colonnes de maîtrise actuellement présentes dans certains fichiers Markdown sont des annotations historiques et ne font pas partie du corpus généré pour l'application. Elles ne doivent pas initialiser silencieusement la progression d'un nouvel utilisateur.

La progression appartient exclusivement à l'utilisateur : elle réside en mémoire pour un visiteur et dans Supabase pour un compte connecté. Le fichier `progress-vincent.json` peut servir à une migration initiale explicite pour le compte concerné, mais ne constitue pas une troisième source de vérité et ne doit pas être livré comme progression par défaut.

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
- éviter toute répétition d'une même entrée dans la passe courante ;
- inclure les mots maîtrisés uniquement lorsque la configuration de la session le demande.

React orchestre l'expérience utilisateur, mais ne porte pas directement les règles de sélection, de validation ou de progression.

## 7. Progression

Chaque entrée possède deux progressions indépendantes :

- **compréhension** : japonais vers signification française, anglaise ou espagnole ;
- **production** : signification française, anglaise ou espagnole vers japonais.

Une réussite ou une erreur dans un sens ne modifie jamais la progression de l'autre sens. Le français, l'anglais et l'espagnol ne possèdent pas de progressions séparées : une signification correcte dans l'une de ces langues valide la même progression de compréhension. De même, le rōmaji, les kana et les kanji acceptés alimentent tous la progression de production.

La base de fonctionnement validée est :

- rouge signifie « non maîtrisé », sans distinguer un mot jamais présenté d'un mot encore jamais réussi ;
- l'absence de progression enregistrée pour un sens équivaut à rouge dans ce sens ;
- une erreur rouge laisse l'entrée rouge ;
- une première réussite fait passer l'entrée de rouge à jaune ;
- une erreur jaune laisse l'entrée jaune ;
- le seuil de réussites permettant de passer de jaune à vert reste à préciser ;
- une réussite verte laisse l'entrée verte ;
- une erreur verte fait redescendre l'entrée à jaune.

L'effet d'une erreur jaune sur le compteur menant au vert ainsi que la nature exacte du seuil — réussites totales, consécutives ou réparties sur plusieurs jours — restent des décisions ouvertes. La règle finale doit être implémentée comme une fonction pure et couverte par des tests unitaires. Elle pourra évoluer vers une répétition espacée sans modifier l'interface du quiz.

### 7.1 Progression globale dérivée

La progression globale d'une entrée n'est pas stockée. Elle est calculée à partir de ses deux directions en retenant le niveau le plus faible :

```text
vert   + vert   = vert
vert   + jaune  = jaune
vert   + rouge  = rouge
jaune  + jaune  = jaune
jaune  + rouge  = rouge
```

Une entrée est donc globalement maîtrisée uniquement lorsqu'elle est verte dans les deux sens.

Pour un ouvrage ou une leçon, l'interface peut calculer trois indicateurs simples :

- pourcentage vert en compréhension ;
- pourcentage vert en production ;
- pourcentage d'entrées vertes dans les deux sens.

### 7.2 Historique et état courant

Deux concepts sont conservés séparément :

- **événement de révision** : tentative immuable contenant la question, la réponse et le résultat ;
- **progression d'une direction** : résumé courant d'une entrée et d'un sens, utilisé pour sélectionner rapidement les prochaines questions.

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

Informations privées minimales associées au compte :

- `user_id` ;
- `display_name` facultatif ;
- `avatar_url` facultatif ;
- `created_at` ;
- `updated_at`.

### 9.2 `user_preferences`

Préférences facultatives synchronisées pour éviter de surcharger le stockage local :

- `user_id` ;
- dernière configuration de quiz ;
- langue de l'interface : `fr`, `en` ou `es` ;
- langue préférée pour une réponse vocale à une question japonaise ;
- lecture automatique et vitesse de synthèse ;
- `updated_at`.

Ces préférences ne contiennent aucune progression et peuvent être réinitialisées sans perdre l'historique de révision.

### 9.3 `review_events`

Historique immuable des tentatives :

- `id` ;
- `user_id` ;
- `word_id` ;
- `direction` : `japanese_to_meaning` ou `meaning_to_japanese` ;
- `prompt_snapshot` ;
- `submitted_answer` ;
- `normalized_answer` ;
- `result` ;
- `response_time_ms` facultatif ;
- `reviewed_at`.

### 9.4 `word_progress`

État courant d'une entrée, d'un sens et d'un utilisateur :

- `user_id` ;
- `word_id` ;
- `direction` : `japanese_to_meaning` ou `meaning_to_japanese` ;
- `status` : `red`, `yellow` ou `green` ;
- `correct_total` ;
- `incorrect_total` ;
- `last_reviewed_at` ;
- `last_result`.

Le compteur ou les dates éventuellement nécessaires au passage de jaune à vert seront ajoutés après validation de la règle exacte. L'historique immuable permet entre-temps de recalculer l'état.

Le triplet `(user_id, word_id, direction)` est unique. Aucune colonne de progression globale n'est stockée : elle est toujours dérivée des deux directions.

### 9.5 Mise à jour atomique

L'enregistrement de l'événement et la mise à jour de la progression doivent idéalement s'effectuer dans une seule transaction Postgres, exposée par une fonction Supabase RPC. Cela évite qu'un événement soit enregistré sans que la progression soit mise à jour, ou inversement.

L'identifiant d'une tentative est généré avant l'appel et sert de clé d'idempotence. Une nouvelle tentative avec le même identifiant ne doit pas modifier deux fois la progression. En cas d'échec réseau, l'interface conserve la tentative en mémoire et permet de réessayer sans avancer silencieusement.

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
- **Bibliothèque / configuration du quiz** : ouvrage, leçons, sens, statuts de maîtrise et ordre des questions ;
- **Quiz** : question, lecture vocale, input, dictée, validation et correction ;
- **Progression** : compréhension, production et maîtrise globale par ouvrage et par leçon ;
- **Langue** : choix entre français, anglais et espagnol ;
- **Compte** : connexion, identité et déconnexion.

La navigation secondaire peut être regroupée derrière le bouton de profil, notamment sur mobile. Lorsqu'aucune image de profil n'existe, ce bouton affiche l'initiale du prénom dans un cercle. Le futur upload et recadrage d'avatar restent différés. La configuration du quiz reste toutefois accessible directement depuis l'accueil, car elle fait partie du parcours principal.

Le sens du quiz utilise deux cartes présentant `Comprendre` et `Produire`, avec une flèche et des repères de langue. Les drapeaux restent décoratifs et sont toujours accompagnés de texte ou d'un nom accessible afin de ne pas rendre le contrôle ambigu.

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
- les formes japonaises pertinentes et les significations française, anglaise et espagnole peuvent être rappelées dans la correction ;
- l'action permettant de signaler un synonyme légitime reste secondaire et discrète.

Le résultat ne doit jamais être communiqué uniquement par une couleur : une icône et un texte accompagnent les états vert et rouge. La mise en page réserve autant que possible une zone stable à la correction afin d'éviter un saut vertical important sur mobile.

Le passage à la question suivante n'est pas automatique. L'utilisateur doit avoir le temps de lire la solution. La touche Entrée valide la réponse dans le premier état, puis passe à la question suivante dans le second. Le changement d'état peut utiliser une animation courte et non bloquante, et le résultat doit être annoncé par une zone accessible de type `aria-live`.

### 11.4 Progression sans surcharge

L'écran de progression reste séparé du quiz et accessible depuis la navigation secondaire. Sa première version affiche uniquement :

- la progression en compréhension japonaise ;
- la progression en production japonaise ;
- la maîtrise globale dérivée des deux sens ;
- ces mêmes informations par leçon lorsque l'utilisateur ouvre le détail d'un ouvrage.

Pendant le quiz, seule la progression de la session courante est affichée. Les graphiques détaillés, classements et mécanismes de gamification ne doivent pas encombrer ce parcours.

### 11.5 Internationalisation

Les textes de l'interface ne sont pas écrits directement dans les composants React. Ils utilisent des catalogues typés pour les locales `fr`, `en` et `es`, avec le français comme langue de repli temporaire pendant le développement. Les nombres, dates et pluriels passent par `Intl`.

La langue de l'interface et les langues acceptées par le moteur de quiz sont deux concepts distincts :

- la locale choisie définit les menus, les libellés et la signification principale affichée ;
- le corpus conserve les traductions françaises, anglaises et espagnoles ;
- la validation d'une réponse japonaise vers signification peut accepter toute traduction déclarée dans ces langues ;
- l'affichage éventuel de traductions secondaires reste une préférence du quiz et ne crée pas une nouvelle direction de progression.

Le choix est disponible dans le menu du profil et synchronisé dans `user_preferences` pour un compte connecté. Les drapeaux ne sont jamais la seule information accessible : chaque option conserve le nom de la langue.

## 12. Audio et reconnaissance vocale

La fonctionnalité vocale est une amélioration progressive ajoutée après stabilisation du quiz textuel. Elle comporte uniquement deux capacités : faire entendre la question et dicter une réponse dans l'input.

Les commandes vocales telles que « suivant », « répète » ou « valide » ne sont pas prévues. L'évaluation de la qualité de la prononciation n'est pas non plus un objectif du produit.

### 12.1 Lecture vocale de la question

Un bouton haut-parleur placé près de la question permet de l'écouter ou de la réécouter. Une option utilisateur pourra également déclencher automatiquement la lecture lors de l'affichage d'une nouvelle question.

La première implémentation ne dépend d'aucun fichier audio et n'ajoute aucune colonne de son au corpus ou à Supabase. Elle utilise la synthèse vocale du navigateur, via `window.speechSynthesis`, à partir du texte déjà présent dans le corpus. Pour le japonais, la forme kana sert de texte à prononcer même lorsque le kanji est affiché. Le contrôle `Écouter` est masqué ou désactivé avec une explication lorsque le navigateur ne fournit pas de voix compatible.

La langue de synthèse dépend du sens du quiz :

- une question japonaise est prononcée en japonais ;
- une question française est prononcée en français ;
- une question anglaise est prononcée en anglais ;
- une question espagnole est prononcée en espagnol ;
- les traductions secondaires ne sont pas nécessairement prononcées lorsque seule la signification principale constitue la question.

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
- réponse anglaise : variante anglaise configurée, par exemple `en-CA` ou `en-US` ;
- réponse espagnole : variante espagnole configurée, par exemple `es-ES` ou `es-MX`.

Lorsque la question est en japonais, l'utilisateur choisit sa langue de réponse vocale préférée entre le français, l'anglais et l'espagnol. La saisie au clavier continue dans tous les cas à accepter les traductions déclarées dans les trois langues.

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
│   │   ├── quiz-configuration/
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
- l'indépendance des deux directions de progression ;
- le calcul de la maîtrise globale ;
- la composition et l'ordre d'une passe sans répétition.

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
- constater des progressions différentes pour un même mot selon le sens ;
- se connecter ;
- enregistrer une réponse ;
- retrouver la progression après rechargement ;
- se déconnecter sans conserver de progression métier locale.

## 17. Étapes de réalisation

### Phase 1 — Corpus

- définir définitivement le schéma normalisé ;
- définir les métadonnées des ouvrages et des leçons ;
- ajouter et relire les traductions espagnoles de l'ensemble du corpus avant d'activer la locale espagnole en production ;
- créer les identifiants stables ;
- écrire l'importeur Markdown ;
- générer le JSON ;
- ajouter les validations et tests du corpus.

### Phase 2 — MVP React local

- initialiser React, TypeScript et Vite ;
- créer la sélection de l'ouvrage et des leçons ;
- permettre de choisir les statuts rouge, jaune et/ou vert à inclure ;
- proposer l'ordre aléatoire ou l'ordre des leçons ;
- construire une passe fixe sans répétition immédiate des erreurs ;
- implémenter les deux modes de quiz ;
- accepter les différentes réponses ;
- implémenter les états de réponse et de correction mobile-first ;
- gérer en mémoire les deux progressions indépendantes et leur résultat global ;
- mettre en place les catalogues d'interface français, anglais et espagnol ;
- mettre en place le design responsive initial.

### Phase 3 — Comptes et synchronisation

- créer le projet Supabase ;
- ajouter Google et email ;
- créer les tables et politiques RLS ;
- implémenter le repository Supabase ;
- sauvegarder l'historique et la progression ;
- afficher la progression minimale par sens, globale et par leçon ;
- déployer sur Cloudflare Pages.

### Phase 4 — Expérience d'étude avancée

- statistiques détaillées ;
- filtres de consultation dans l'écran de progression ;
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
- upload et recadrage d'un avatar personnalisé dans la première version ;
- reconnaissance vocale serveur ;
- commandes vocales de navigation ou de validation ;
- évaluation automatique de la prononciation ;
- algorithme avancé de répétition espacée.

Ces éléments restent possibles, mais ne doivent pas retarder une première expérience de quiz utilisable.

## 19. Décisions encore ouvertes

- Tailwind CSS ou SCSS/CSS Modules ;
- présentation exacte des kana et kanji dans les questions ;
- génération automatique ou stockage explicite du rōmaji ;
- seuil exact de passage du jaune au vert : réussites totales, consécutives ou réparties sur plusieurs jours ;
- effet d'une erreur jaune sur le compteur menant au vert ;
- présence et effet exact d'une action `Je ne sais pas` dans le quiz ;
- comportement précis lorsqu'un utilisateur reconnaît lui-même un synonyme ;
- migration éventuelle de `progress-vincent.json`, qui ne distingue pas les deux directions ;
- règle d'affichage des traductions secondaires dans une question lorsque trois langues sont disponibles ;
- partage ou non de la maîtrise lorsqu'un même mot apparaît dans plusieurs ouvrages ;
- comportement lorsqu'un visiteur se connecte au milieu d'une session en mémoire ;
- reprise éventuelle d'une longue passe interrompue ;
- choix du magic link ou de l'OTP pour la connexion email ;
- installation PWA dès le MVP ou dans une phase ultérieure ;
- éventuelle adoption de TanStack Query après intégration de Supabase.

Toute nouvelle décision importante doit être ajoutée à ce document avec sa justification, plutôt que rester implicite dans l'implémentation.
