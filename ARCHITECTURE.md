# Architecture cible — Kuma Libre

> **Statut :** architecture cible validée pour guider le démarrage du projet.
> **Version :** 11 — 30 octobre 2026.
> Ce document est vivant : il doit être mis à jour lorsque les besoins ou les décisions techniques évoluent.

## 1. Objectif du projet

L'application doit permettre de réviser le vocabulaire japonais extrait des supports d'étude présents dans ce dépôt.

Le premier corpus provient des leçons actuellement transcrites de *Minna no Nihongo*. Cette provenance reste une information interne au dépôt : le produit public utilise exclusivement l'identité Kuma Libre. Les leçons sont présentées comme une liste continue, sans exposer de livre ni de volume dans l'interface.

L'application doit notamment permettre :

- de sélectionner une, plusieurs ou toutes les leçons ;
- de réviser dans les deux sens, japonais vers signification et signification vers japonais ;
- de configurer le périmètre et l'ordre des questions sans alourdir l'écran de quiz ;
- d'accepter plusieurs réponses correctes pour une même question ;
- de suivre la maîtrise de chaque entrée ;
- de présenter publiquement le produit, puis de réserver les quiz aux utilisateurs connectés ;
- de sauvegarder et synchroniser la progression du compte ;
- d'utiliser l'interface en français, en anglais ou en espagnol ;
- de faire entendre les questions et de dicter une réponse dans l'input.

L'application sera un outil d'étude indépendant, avec son propre nom, son propre logo et sa propre interface. Aucun scan du manuel ne sera publié.

## 2. Décisions d'architecture

| Sujet | Décision actuelle |
| --- | --- |
| Framework frontend | React avec TypeScript |
| Outil de développement et de build | Vite |
| Hébergement frontend | Cloudflare Pages |
| Accès au site | Public, sans barrière Cloudflare Access |
| Authentification | Supabase Auth |
| Méthodes de connexion | Google et email par magic link |
| Base de données utilisateur | Supabase Postgres |
| Autorisation | Row Level Security de Supabase |
| Backend géré | Supabase Auth, Postgres et fonctions SQL/RPC ; Edge Functions si nécessaire |
| Serveur personnalisé | Aucun pour la première version |
| Source du vocabulaire | Fichiers Markdown versionnés dans le dépôt |
| Format consommé par React | JSON normalisé et généré au build |
| Quiz sans compte | Non dans la première version |
| Progression des utilisateurs connectés | Supabase, source de vérité unique |
| Données métier dans `localStorage` | Non |
| Langues de l'interface | Français, anglais et espagnol |
| Langues des significations | Français, anglais et espagnol dans le corpus |
| Fondation visuelle | Variables CSS sémantiques partagées, avec alias SCSS sans duplication |
| Styling des composants | Tailwind CSS majoritaire, complété par des modules SCSS imbriqués lorsque nécessaire |
| Audio | Synthèse et reconnaissance vocales du navigateur, avec saisie clavier toujours disponible |
| Approche UI | Mobile-first, centrée sur un quiz volontairement minimal |
| Mouvement | Animations courtes, non bloquantes, pilotées par des tokens et désactivables via `prefers-reduced-motion` |

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
                           accueil public     espace protégé
                                                  |
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

L'application affiche uniquement la signification correspondant à la langue active, par exemple en français :

```text
médecin
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

Lorsqu'un kanji existe, la question japonaise l'affiche avec le kana en dessous, conformément à la maquette. Une entrée sans kanji affiche uniquement le kana. Le rōmaji est stocké dans le corpus normalisé, accepté comme réponse de production lorsqu'il est déclaré et rappelé dans la correction, mais il n'est pas affiché dans la question japonaise principale.

### 4.3 Validation d'une réponse

La validation suit les étapes suivantes :

1. normalisation Unicode ;
2. suppression des espaces superflus ;
3. normalisation de la casse pour le français, l'anglais, l'espagnol et le rōmaji ;
4. normalisation de la ponctuation pertinente ;
5. comparaison avec toutes les réponses acceptées pour le mode courant ;
6. affichage des autres réponses valides après validation.

La normalisation ne doit pas transformer arbitrairement le sens d'une réponse. Les variantes ambiguës ou particulières doivent pouvoir être déclarées explicitement dans le corpus.

Dans la V1, seules les réponses explicitement enregistrées dans le corpus sont acceptées. Un synonyme absent est donc marqué incorrect ; par exemple, `docteur` reste refusé si l'entrée contient uniquement `médecin`.

Une évolution post-V1 pourra proposer une assistance sémantique ou un RAG limité à un index du corpus pour repérer les réponses probablement synonymes. Cette assistance ne doit ni accepter automatiquement une réponse ambiguë ni modifier rétroactivement le résultat d'une tentative. Elle produit des suggestions éditoriales à valider humainement ; une variante approuvée rejoint ensuite les réponses explicites du corpus et devient déterministe pour tous les utilisateurs.

### 4.4 Configuration d'une session

Avant de démarrer, l'utilisateur peut configurer le quiz sans exposer des réglages secondaires sur l'écran de question :

- une, plusieurs ou toutes les leçons ;
- sens de révision : japonais vers signification ou signification vers japonais ;
- statuts à inclure : rouge, jaune et/ou vert, avec des raccourcis pour les mots non maîtrisés et pour tous les mots ;
- ordre des questions : aléatoire ou ordre du corpus et des leçons.

La configuration doit proposer des valeurs par défaut permettant de commencer rapidement. La dernière configuration pourra être enregistrée avec les préférences du compte dans Supabase. Elle ne doit pas devenir une seconde source de progression dans `localStorage`.

Le sens est présenté par deux cartes compactes et explicites : `Comprendre` pour aller du japonais vers la signification dans la langue active et `Produire` pour aller de cette langue vers le japonais. Chaque carte affiche uniquement le drapeau japonais et celui de la langue sélectionnée dans les réglages. La flèche renforce le repère visuel, mais un libellé textuel et un nom accessible restent obligatoires.

### 4.5 Composition d'une session

Le nombre de questions d'une session configurée n'est pas imposé indépendamment de la sélection. Au démarrage, le moteur construit une liste fixe contenant toutes les entrées qui correspondent aux leçons, au sens et aux statuts choisis. L'interface affiche le nombre obtenu avant de commencer.

Le raccourci `Révision rapide` constitue un préréglage particulier de dix entrées au maximum : il sélectionne d'abord les entrées rouges, puis complète avec des entrées jaunes. Il n'ajoute jamais d'entrée verte. Si moins de dix entrées rouges et jaunes sont disponibles, la passe est plus courte. Lorsque plus de dix entrées possèdent la même priorité, elles sont tirées aléatoirement.

Dans une passe :

- chaque entrée sélectionnée apparaît une fois ;
- l'ordre suit le corpus ou un mélange aléatoire selon la configuration ;
- la progression utilisée pour filtrer une entrée est celle du sens sélectionné ;
- une erreur met à jour la progression, mais la même entrée ne revient pas pendant cette passe ;
- l'entrée pourra être reproposée lors d'une session ultérieure.

La première version ne sauvegarde pas la liste des questions d'une passe inachevée. Un rechargement ou une fermeture quitte la passe ; seules les réponses déjà validées restent enregistrées. L'interface demande confirmation avant de quitter afin d'éviter une perte accidentelle de la position courante.

## 5. Modèle du corpus

Les fichiers Markdown existants utilisent plusieurs formats de tableaux. Ils restent adaptés à la lecture et à l'édition humaine, mais ne doivent pas être analysés directement par l'application dans le navigateur.

L'état actuel et la migration nécessaire pour l'espagnol sont détaillés dans [`reference/corpus-i18n-audit.md`](reference/corpus-i18n-audit.md).

Un script exécuté au build convertit les différentes formes de tableaux vers un modèle unique. Les leçons et les catégories de vocabulaire possèdent leurs propres métadonnées afin que l'interface puisse construire la navigation sans la déduire des chemins de fichiers.

Les intitulés thématiques de leçon ne doivent jamais être inventés par l'interface. Tant qu'aucun titre éditorial n'est défini dans les métadonnées, le libellé de repli est simplement `Leçon 01`, `Leçon 02`, etc. Le nombre d'entrées est calculé à partir du corpus généré. Ces données publiques appartiennent au JSON statique, pas à Supabase ; Supabase ne contient que les données propres à l'utilisateur.

```ts
type LessonDefinition = {
  id: string;
  number: number;
  titles?: Partial<Record<"fr" | "en" | "es", string>>;
  order: number;
  entryCount: number;
};

type VocabularyCategoryDefinition = {
  id: string;
  labels: Record<"fr" | "en" | "es", string>;
  order: number;
};

type VocabularyEntry = {
  id: string;
  lessonId?: string;
  categoryId: string;
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

`vocabulary` et `useful-words` sont des catégories de vocabulaire. Une leçon peut contenir zéro, une ou plusieurs catégories, et le modèle permet d'en ajouter sans modifier le moteur de quiz. Toutes les catégories rattachées à une leçon participent par défaut aux quiz de cette leçon. Le glossaire de référence reste un corpus complémentaire distinct tant qu'aucun parcours dédié n'est défini.

### 5.1 Identifiants

Chaque entrée doit recevoir un identifiant stable, indépendant de sa graphie et de sa traduction, par exemple :

```text
lesson-01-vocabulary-001
```

Un identifiant construit uniquement à partir du mot japonais n'est pas suffisant : le même mot peut apparaître dans plusieurs leçons ou sections, et une correction éditoriale ne doit pas casser l'historique de progression.

Dans la V1, deux occurrences placées dans des leçons différentes restent deux entrées distinctes et possèdent des progressions séparées, même si leur graphie est identique. Cette règle évite de fusionner automatiquement des sens ou contextes différents.

### 5.2 Validation du corpus

Le build doit échouer lorsqu'une donnée structurante est invalide, notamment en cas de :

- doublon d'identifiant ;
- leçon référencée mais inconnue ;
- entrée de leçon sans `lessonId`, hors contenu de référence explicitement identifié ;
- numéro ou ordre de leçon absent ;
- entrée sans forme japonaise ;
- entrée sans signification française, anglaise ou espagnole une fois la migration trilingue activée ;
- catégorie inconnue ;
- ligne Markdown impossible à convertir ;
- fichier généré qui n'est plus synchronisé avec les sources.

Le fichier JSON généré est un artefact de build. Les Markdown restent les sources éditables de référence.

### 5.3 Séparation du corpus et de la progression

Les colonnes de maîtrise actuellement présentes dans certains fichiers Markdown sont des annotations historiques et ne font pas partie du corpus généré pour l'application. Elles ne doivent pas initialiser silencieusement la progression d'un nouvel utilisateur.

La progression appartient exclusivement à l'utilisateur connecté et réside dans Supabase. Le fichier `progress-vincent.json` conserve la progression historique de Vincent pour la direction **compréhension** (`japonais → signification française ou anglaise`). Il sert de source de migration initiale explicite pour ce compte, mais ne constitue pas une troisième source de vérité et ne doit pas être livré comme progression par défaut aux autres utilisateurs. La migration convertit `red` en score `0`, `yellow` en score `1` et un éventuel `green` en score `3`. La direction **production** commence à rouge avec un score `0`.

## 6. Moteur de quiz

Le moteur de quiz appartient au domaine et ne doit dépendre ni de React ni de Supabase. Il doit pouvoir être testé avec de simples fonctions TypeScript.

Ses responsabilités sont :

- filtrer le corpus par leçon et catégorie ;
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

Chaque direction possède un score de maîtrise entier compris entre `0` et `3` :

- `0` correspond à rouge, « non maîtrisé » ;
- `1` ou `2` correspondent à jaune, « à revoir » ;
- `3` correspond à vert, « maîtrisé » ;
- l'absence de progression enregistrée pour un sens équivaut au score `0` ;
- une réussite augmente le score de `1`, jusqu'au maximum `3` ;
- les trois réussites ne doivent être ni consécutives ni réparties sur des dates différentes ;
- une erreur avec un score `0`, `1` ou `2` ne diminue pas le score ;
- une erreur avec un score `3` ramène le score à `2` ;
- une réussite après cette rétrogradation ramène donc immédiatement l'entrée au vert.

Les compteurs totaux de bonnes et mauvaises réponses restent disponibles pour l'historique et les statistiques, mais ne remplacent pas ce score de maîtrise. La transition est implémentée comme une fonction pure et couverte par des tests unitaires. Elle pourra évoluer vers une répétition espacée sans modifier l'interface du quiz.

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

Pour l'ensemble du corpus ou une leçon, l'interface peut calculer trois indicateurs simples :

- pourcentage vert en compréhension ;
- pourcentage vert en production ;
- pourcentage d'entrées vertes dans les deux sens.

Ces pourcentages sont dérivés à la volée depuis les entrées du périmètre, arrondis à l'entier le plus proche et ne sont jamais stockés comme une progression concurrente. La liste des leçons affiche la maîtrise globale, tandis que le détail d'une leçon rappelle les deux pourcentages directionnels et la maîtrise globale. Chaque ligne de vocabulaire affiche également les scores compréhension/production sur `3`, en plus du code couleur, afin que l'état reste explicite sans dépendre uniquement de la couleur.

### 7.2 Historique et état courant

Deux concepts sont conservés séparément :

- **événement de révision** : tentative immuable contenant la question, la réponse et le résultat ;
- **progression d'une direction** : résumé courant d'une entrée et d'un sens, utilisé pour sélectionner rapidement les prochaines questions.

L'historique permet de recalculer la progression, d'afficher des statistiques et de faire évoluer l'algorithme.

## 8. Authentification et persistance

### 8.1 Site public

Cloudflare Pages sert publiquement le chargement, la présentation du produit et les écrans de connexion. Un visiteur non connecté ne peut pas lancer de quiz, consulter les leçons ni accéder à une progression. Toute route applicative protégée redirige vers la connexion puis revient à la destination demandée après authentification.

### 8.2 Utilisateur connecté

Supabase Auth gère :

- la connexion avec Google ;
- la connexion par magic link envoyé par email ;
- la création et le renouvellement de session ;
- la déconnexion ;
- l'identifiant stable de l'utilisateur.

Le SDK d'authentification peut conserver les éléments techniques nécessaires à la session dans son stockage dédié. Cette exception ne doit pas être utilisée pour stocker le corpus, la progression ou un cache métier concurrent de Supabase. La déconnexion doit supprimer la session gérée par le SDK.

### 8.3 Contrat de persistance

Le domaine dépend d'une abstraction et non directement du SDK Supabase :

```ts
interface ProgressRepository {
  getProgress(): Promise<WordProgress[]>;
  recordReview(review: ReviewSubmission): Promise<ReviewResult>;
  getHistory(options?: HistoryQuery): Promise<ReviewEvent[]>;
}
```

Deux implémentations sont prévues :

- une implémentation en mémoire réservée aux tests ;
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
- lecture automatique et vitesse de synthèse, lorsqu'elles seront ajoutées aux réglages ;
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
- `mastery_score` : entier de `0` à `3` ;
- `status` : `red`, `yellow` ou `green` ;
- `correct_total` ;
- `incorrect_total` ;
- `last_reviewed_at` ;
- `last_result`.

Le statut est dérivé de `mastery_score`. Aucune série ni liste de dates de réussite n'est nécessaire au passage de jaune à vert. L'historique immuable permet de recalculer et d'auditer l'état.

Le triplet `(user_id, word_id, direction)` est unique. Aucune colonne de progression globale n'est stockée : elle est toujours dérivée des deux directions.

### 9.5 Mise à jour atomique

L'enregistrement de l'événement et la mise à jour de la progression s'effectuent dans une seule transaction Postgres, exposée par la fonction Supabase RPC `record_review`. Cela évite qu'un événement soit enregistré sans que la progression soit mise à jour, ou inversement.

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

- **Accueil public** : présentation de Kuma Libre et accès à la connexion ;
- **Accueil connecté** : révision rapide, accès aux leçons et à la configuration ;
- **Leçons / configuration du quiz** : liste continue de leçons, sens, statuts de maîtrise et ordre des questions ;
- **Quiz** : question, lecture vocale, input, dictée, validation et correction ;
- **Progression** : compréhension, production et maîtrise globale sur tout le corpus et par leçon ;
- **Langue** : choix entre français, anglais et espagnol ;
- **Compte** : identité et déconnexion.

La navigation secondaire peut être regroupée derrière le bouton de profil, notamment sur mobile. Lorsqu'aucune image de profil n'existe, ce bouton affiche l'initiale du prénom dans un cercle. Le futur upload et recadrage d'avatar restent différés. La configuration du quiz reste toutefois accessible directement depuis l'accueil, car elle fait partie du parcours principal.

Le panneau de profil s'ouvre depuis la droite, au même endroit que son bouton déclencheur. Les pages secondaires protégées utilisent une flèche de retour contextuelle unique dans le header ; elles ne dupliquent pas ce retour sous forme de lien dans leur contenu. La question de quiz active fait exception : son action de sortie explicite remplace la navigation arrière afin de confirmer l'abandon de la passe.

Le sens du quiz utilise deux cartes présentant `Comprendre` et `Produire`, avec une flèche, le drapeau japonais et un seul drapeau de traduction. Ce dernier réagit au choix effectué dans les réglages de langue : français, anglais ou espagnol. Les drapeaux restent décoratifs et sont toujours accompagnés de texte ou d'un nom accessible afin de ne pas rendre le contrôle ambigu.

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

L'action `Je ne sais pas` enregistre une tentative incorrecte distinguée par le résultat `skipped`, applique la même transition de maîtrise qu'une mauvaise réponse et affiche immédiatement la solution. Elle ne valide ni ne soumet le contenu éventuel de l'input.

L'action de sortie ouvre une confirmation qui indique combien de réponses ont déjà été sauvegardées. Confirmer ramène à l'accueil connecté ; annuler restitue le focus à l'action de sortie. À la fin de la dernière question, un bilan immersif récapitule les réponses correctes et incorrectes et propose soit une nouvelle passe, soit un retour à l'accueil. La question active comme le bilan masquent la navigation générale afin de conserver un parcours concentré.

### 11.4 Progression sans surcharge

L'écran de progression reste séparé du quiz et accessible depuis la navigation secondaire. Sa première version affiche uniquement :

- la progression en compréhension japonaise ;
- la progression en production japonaise ;
- la maîtrise globale dérivée des deux sens ;
  - ces mêmes informations par leçon lorsque l'utilisateur ouvre son détail.

Pendant le quiz, seule la progression de la session courante est affichée. Les graphiques détaillés, classements et mécanismes de gamification ne doivent pas encombrer ce parcours.

### 11.5 Internationalisation

Les textes de l'interface ne sont pas écrits directement dans les composants React. Ils utilisent des catalogues typés pour les locales `fr`, `en` et `es`, avec le français comme langue de repli temporaire pendant le développement. Les nombres, dates et pluriels passent par `Intl`.

La langue de l'interface et les langues acceptées par le moteur de quiz sont deux concepts distincts :

- la locale choisie définit les menus, les libellés et la signification principale affichée ;
- le corpus conserve les traductions françaises, anglaises et espagnoles ;
- la validation d'une réponse japonaise vers signification peut accepter toute traduction déclarée dans ces langues ;
- les traductions des autres langues peuvent être rappelées après validation dans la correction, mais pas dans la question de production.

Le choix est disponible dans le menu du profil et synchronisé dans `user_preferences` pour un compte connecté. Les drapeaux ne sont jamais la seule information accessible : chaque option conserve le nom de la langue.

### 11.6 Mouvement et transitions

Le mouvement sert uniquement à expliquer un changement d’état, confirmer une action ou préserver la continuité spatiale. Il ne doit jamais ralentir la réponse au clavier, masquer une information ou devenir nécessaire pour comprendre l’interface.

Le système partagé utilise les durées suivantes :

- `150 ms` pour les interactions immédiates comme la pression, le survol et un changement de couleur ;
- `180 ms` pour une sortie rapide ;
- `250 ms` comme durée principale pour une ouverture, un changement d’état ou l’apparition d’un contenu ;
- `400 ms` au maximum pour une entrée plus ample et non bloquante ;
- environ `1 400 ms` uniquement pour les boucles continues justifiées, comme le loader ou l’écoute du microphone.

Une entrée utilise une courbe de décélération afin d’apparaître rapidement puis de se poser en douceur. Une sortie peut utiliser une accélération plus courte. Les animations continues et décoratives restent exceptionnelles.

Les emplacements prévus sont :

- ouverture et fermeture du panneau de profil et des modales ;
- transitions entre les vues d’authentification ;
- progression et changement de question du quiz ;
- apparition de la correction correcte ou incorrecte ;
- états d’écoute, transcription et erreur du microphone ;
- pression des boutons et cartes interactives ;
- loader Kuma Libre et chargements de session ;
- mise à jour de la progression et bilan de session.

Le chargement initial commence dans le document HTML avant le téléchargement et l’exécution de React. Il reprend le logo empilé, un libellé FR/EN/ES dérivé de la langue du navigateur et la barre animée, puis disparaît naturellement lorsque React prend possession de la racine. Aucun délai minimal artificiel ne ralentit l’accès à l’application.

Les animations privilégient `transform` et, pour les couches purement décoratives, `opacity`. Un conteneur de texte ne réduit pas son opacité pendant son entrée afin de conserver en permanence le contraste attendu. Les animations évitent les déplacements de mise en page et respectent systématiquement `prefers-reduced-motion`, qui supprime les mouvements non essentiels. Les focus clavier et annonces accessibles restent immédiats, sans attendre la fin d’une transition.

## 12. Audio et reconnaissance vocale

La fonctionnalité vocale comporte uniquement deux capacités : faire entendre la question et dicter une réponse dans l'input. Elle peut être livrée après le noyau textuel, mais son contrat UX et technique fait partie de la cible dès maintenant.

Les commandes vocales telles que « suivant », « répète » ou « valide » ne sont pas prévues. L'évaluation de la qualité de la prononciation n'est pas non plus un objectif du produit.

### 12.1 Lecture vocale de la question

Un bouton haut-parleur placé près de la question permet de l'écouter ou de la réécouter. Une option utilisateur pourra ultérieurement déclencher automatiquement la lecture lors de l'affichage d'une nouvelle question.

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

La lecture vocale et la liste des voix disponibles dépendent du navigateur et du système. La première version ne présente pas de sélecteur de voix : l'adaptateur choisit automatiquement la première voix compatible avec la locale de la question, en privilégiant `ja-JP`, `fr-FR`, `en-CA` puis `en-US`, et `es-ES` puis `es-MX`. Si aucune correspondance exacte n'existe, il utilise une voix de la même langue, puis la voix par défaut du navigateur. La vitesse initiale reste neutre ; un réglage de vitesse ou de lecture automatique pourra être ajouté plus tard.

### 12.2 Dictée vocale de la réponse

Le bouton microphone est intégré à l'input, selon un comportement proche de WhatsApp ou LINE, tout en restant une dictée et non l'envoi d'un message audio :

Ce contrôle démarre une session temporaire de reconnaissance vocale, pas un enregistrement audio destiné à être sauvegardé ou réécouté.

1. l'utilisateur touche le microphone ;
2. l'application demande l'autorisation native si nécessaire ;
3. le compositeur se transforme en barre d'écoute avec point rouge pulsant, durée, forme d'onde décorative, action `Annuler` et bouton `Arrêter` ;
4. l'arrêt volontaire ou automatique affiche brièvement `Transcription…` ;
5. la transcription finale est insérée dans le même input ;
6. un libellé discret indique `Transcription ajoutée · modifiable` ;
7. l'input reprend le focus et l'utilisateur peut corriger le texte ;
8. l'utilisateur valide avec Entrée ou avec le bouton de validation.

La dictée ne valide jamais automatiquement la réponse.

La langue de reconnaissance dépend de la réponse attendue :

- réponse japonaise : `ja-JP` ;
- réponse française : `fr-FR` ;
- réponse anglaise : variante anglaise configurée, par exemple `en-CA` ou `en-US` ;
- réponse espagnole : variante espagnole configurée, par exemple `es-ES` ou `es-MX`.

Lorsque la question est en japonais, la reconnaissance vocale utilise la locale active de l'application. La saisie au clavier continue dans tous les cas à accepter les traductions déclarées dans les trois langues. Pour dicter dans une autre langue, l'utilisateur change d'abord sa langue active dans les réglages.

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
                              \-> cancelled -> idle
permission/listening/transcribing -> error -> idle
```

Il doit également représenter les cas `permission-denied`, `no-speech`, `unsupported`, `network-error` et `cancelled` avec un message compréhensible placé près du champ. Une permission refusée propose `Réessayer` et rappelle que la saisie clavier reste disponible. L'animation de forme d'onde respecte `prefers-reduced-motion` et n'est jamais la seule indication de l'état.

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
├── mockups/                         # Référence UX et archives visuelles
├── docs/                            # Architecture détaillée et réflexions datées
├── scripts/
│   └── corpus/                      # Import et validation du corpus
├── generated/
│   └── corpus.json                  # Artefact normalisé
├── src/
│   ├── app/                         # Composition, routing et providers
│   ├── pages/                       # Composants associés aux routes
│   ├── domain/
│   │   ├── vocabulary/              # Types du corpus
│   │   ├── quiz/                    # Sélection, questions et réponses
│   │   └── progress/                # Règles de maîtrise
│   ├── features/
│   │   ├── auth/
│   │   ├── lessons/
│   │   ├── quiz/
│   │   ├── progress/
│   │   ├── speech/
│   │   └── preferences/
│   ├── infrastructure/
│   │   ├── supabase/
│   │   ├── repositories/
│   │   └── speech/
│   ├── shared/
│   │   ├── ui/
│   │   ├── icons/
│   │   ├── i18n/
│   │   ├── hooks/
│   │   ├── styles/                   # Tokens globaux et fondations SCSS
│   │   └── utils/
│   └── main.tsx
├── supabase/                         # Migrations, fonctions et tests SQL
├── tests/
│   └── e2e/
├── AGENTS.md
├── ARCHITECTURE.md
└── README.md
```

Les noms exacts pourront évoluer. La séparation entre domaine, fonctionnalités, infrastructure et composants partagés doit en revanche rester claire. Le découpage détaillé des routes, pages, composants, providers, repositories et dépendances est défini dans [`docs/architecture/frontend-architecture.md`](docs/architecture/frontend-architecture.md).

### 13.1 Stratégie de styles

Tailwind CSS couvre en priorité la mise en page, les espacements, le responsive et les états visuels simples. Les composants nécessitant des styles spécifiques, des animations ou des sélecteurs imbriqués utilisent des modules SCSS colocalisés, par exemple `QuizAnswer.module.scss`.

Les modules peuvent utiliser une imbrication lisible :

```scss
.answer {
  &.correct {
    border-color: var(--kl-color-success);
  }

  .icon {
    margin-inline-end: var(--kl-space-2);
  }
}
```

La profondeur d'imbrication reste faible afin de ne pas coupler les styles à toute la structure HTML. Les couleurs, espacements, rayons et ombres proviennent des variables CSS sémantiques partagées ; les alias SCSS ne recopient pas les valeurs.

## 14. Gestion de l'état React

Principes retenus :

- état local avec `useState` lorsque possible ;
- `useReducer` pour la machine d'état du quiz ;
- hooks personnalisés pour relier le domaine aux composants ;
- contexte React uniquement pour les dépendances réellement globales, comme la session ;
- pas de Redux dans la première version ;
- état distant séparé de l'état d'interface ;
- pas de TanStack Query au démarrage ; son ajout nécessiterait un besoin concret de cache serveur partagé que les hooks et repositories simples ne couvrent plus.

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
- la priorité rouge puis jaune et la limite de dix entrées de la révision rapide ;
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
- les états connecté et non connecté ;
- les états `idle`, `listening`, `transcribing`, `ready` et d'erreur de la dictée.

### 16.3 Tests de bout en bout

Playwright couvre un petit nombre de parcours essentiels :

- refuser l'accès à un quiz sans session puis restaurer la destination après connexion ;
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

**Statut : terminée.** Le corpus normalisé contient 904 entrées trilingues et satisfait le contrôle de préparation aux quiz.

- définir définitivement le schéma normalisé ;
- définir les métadonnées des leçons et des catégories, dont `vocabulary` et `useful-words` ;
- produire les traductions espagnoles de l'ensemble du corpus avec assistance IA, puis les contrôler dans leur contexte avant d'activer la locale espagnole en production ;
- créer les identifiants stables ;
- écrire l'importeur Markdown ;
- générer le JSON ;
- ajouter les validations et tests du corpus.

### Phase 2 — MVP React local

- initialiser React, TypeScript et Vite ;
- créer la liste continue et la sélection des leçons ;
- permettre de choisir les statuts rouge, jaune et/ou vert à inclure ;
- proposer l'ordre aléatoire ou l'ordre des leçons ;
- construire une passe fixe sans répétition immédiate des erreurs ;
- implémenter les deux modes de quiz ;
- accepter les différentes réponses ;
- implémenter les états de réponse et de correction mobile-first ;
- implémenter les deux progressions indépendantes, leur score de `0` à `3` et leur résultat global ;
- mettre en place les catalogues d'interface français, anglais et espagnol ;
- mettre en place le design responsive initial.

### Phase 3 — Comptes et synchronisation

- créer le projet Supabase ;
- ajouter Google et email ;
- utiliser le magic link pour la connexion par email ;
- créer les tables et politiques RLS ;
- implémenter le repository Supabase ;
- sauvegarder l'historique et la progression ;
- afficher la progression minimale par sens, globale et par leçon ;
- déployer sur Cloudflare Pages.

### Phase 4 — Expérience d'étude avancée

- statistiques détaillées ;
- filtres de consultation dans l'écran de progression ;
- amélioration de la sélection des prochains mots ;
- signalement des réponses sémantiquement proches et assistance RAG à la validation éditoriale des synonymes ;
- installation éventuelle en PWA.

### Phase 5 — Voix

- bouton de lecture ou de relecture de la question ;
- lecture automatique facultative ;
- synthèse vocale dans la langue de la question ;
- dictée vocale vers l'input sans validation automatique ;
- reconnaissance en `ja-JP` pour une réponse japonaise, sinon dans la locale active de l'application ;
- barre d'écoute mobile avec durée, annulation, arrêt, transcription et retour éditable dans l'input ;
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
- acceptation automatique de synonymes par un modèle sémantique ou un RAG ;
- algorithme avancé de répétition espacée.

Ces éléments restent possibles, mais ne doivent pas retarder une première expérience de quiz utilisable.

## 19. Stabilisation du périmètre V1

Aucune décision produit structurante ne bloque le démarrage de l'implémentation. Les choix suivants sont fermés :

- quiz réservé aux comptes ;
- liste continue de leçons sans livre ;
- magic link pour l'email ;
- absence de reprise d'une passe dans la V1 ;
- trois réussites non consécutives pour atteindre le vert ;
- erreur verte ramenant à un score de `2` ;
- validation multilingue FR/EN/ES ;
- migration de `progress-vincent.json` vers la compréhension uniquement ;
- kanji accompagné du kana lorsqu'il existe ;
- rōmaji stocké explicitement ;
- synonymes acceptés uniquement lorsqu'ils sont enregistrés ;
- progression séparée pour deux occurrences situées dans des leçons différentes ;
- aucune PWA et aucun TanStack Query dans la V1.

Toute nouvelle décision importante doit être ajoutée à ce document avec sa justification, plutôt que rester implicite dans l'implémentation.
