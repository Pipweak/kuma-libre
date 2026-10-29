# Revue UX des parcours V1

Ce document consigne les remarques faites pendant la lecture de `flows.html`, afin de distinguer les corrections validées des sujets encore ouverts.

## Passe du 17 octobre 2026 — première partie

### Intégré

- **Chargement initial** : utiliser directement le logo vertical généré avec la tête de Kuma et le mot-symbole en dessous.
- **Headers de l’application** : utiliser le mot-symbole généré `Kuma Libre`, sans petite tête d’ours supplémentaire.
- **Visiteur non connecté** : remplacer le libellé `Connexion` du header par une icône de profil générique.
- **Retours** : remplacer la flèche typographique par une vraie icône vectorielle cohérente.
- **Question audio** : remplacer la bulle ambiguë par un contrôle explicite avec une icône de haut-parleur et le libellé `Écouter`.

Les icônes simples sont dessinées en SVG inline. Une dépendance comme Font Awesome n’est pas nécessaire pour ces trois pictogrammes et pourra être réévaluée si l’application acquiert une iconographie beaucoup plus large.

### À redéfinir

- **Statuts dans les listes de leçons** : les petits indicateurs vert, jaune et rouge ne sont pas satisfaisants. Ne pas figer ce composant avant d’avoir comparé plusieurs solutions : barre de progression, anneau, état textuel, icône ou combinaison accessible.
- **Exemple de vocabulaire sur l’accueil public** : l’exemple `食べます / manger · to eat` est actuellement un contenu statique de démonstration, pas un mot aléatoire ni un mini-quiz. Confirmer plus tard s’il doit rester statique, tourner automatiquement ou disparaître.

### Conservé provisoirement

- texte et barre du chargement ;
- écrans Google, callback et email ;
- structure générale de l’accueil connecté et des parcours de quiz.

## Passe du 17 octobre 2026 — deuxième partie

### Intégré

- **Logos** : agrandir leur zone et réduire le zoom interne afin que le dessin et le mot-symbole restent entièrement visibles.
- **Leçons** : supprimer les titres thématiques inventés. Tant que le corpus ne fournit pas de titre éditorial, afficher seulement `Leçon 01`, `Leçon 02`, etc., avec le nombre réel d’entrées calculé depuis les fichiers.
- **Progression des leçons** : supprimer les rectangles vert, jaune et rouge, dont la signification était ambiguë. Afficher un pourcentage accompagné du mot `maîtrisés`.
- **Sens du quiz** : utiliser deux cartes graphiques `Comprendre` et `Produire`, avec flèches et drapeaux, tout en conservant un nom accessible.
- **Filtres de maîtrise** : représenter les trois choix comme de vraies cases indépendantes avec les libellés `Non maîtrisés`, `À revoir` et `Maîtrisés`.
- **Navigation connectée** : remplacer le burger par l’avatar de repli `V`. L’image personnalisée et son recadrage restent différés.
- **Langues** : ajouter au menu un écran de choix entre français, anglais et espagnol.
- **Audio** : conserver `Écouter`, car la synthèse peut être produite par le navigateur depuis les kana. Aucun son n’est attendu dans la base de données.

### Données à préparer

- Ajouter les traductions espagnoles aux 904 entrées actuellement détectées dans les 19 fichiers de contenu, puis les contrôler avant d’activer la locale espagnole en production.
- Ajouter des titres thématiques uniquement s’ils sont édités et validés dans les métadonnées du corpus ; ne jamais les déduire ou les inventer dans un composant.

Le détail de la migration est consigné dans [`../../reference/corpus-i18n-audit.md`](../../reference/corpus-i18n-audit.md).

## Passe du 17 octobre 2026 — dictée vocale

### Intégré

- **Réponse vocale** : remplacer le point rouge ambigu dans le champ de réponse par une vraie icône de microphone, nommée `Dicter ma réponse` pour les technologies d'assistance.
- **Comportement attendu** : le microphone lance la reconnaissance vocale, puis insère la transcription dans le même input que la saisie clavier. Le texte reste modifiable et n'est validé que par une action explicite de l'utilisateur.
- **Confidentialité** : le contrôle ne représente pas un enregistrement audio persistant. Aucun fichier sonore n'est stocké dans l'application ou dans sa base de données.
- **Interaction mobile** : après un toucher sur le microphone, le compositeur prend la forme d'une barre d'écoute inspirée des applications de messagerie : point rouge, durée, onde, annulation et arrêt. Il passe ensuite par un état `Transcription…` avant de replacer le texte modifiable dans l'input.
- **Erreurs** : une permission refusée ou une absence de parole affiche un message local, un bouton `Réessayer` et conserve la saisie clavier.

## Passe du 17 octobre 2026 — langue du quiz

### Intégré

- **Sens du quiz** : ne plus afficher simultanément les drapeaux français, anglais et espagnol. La carte montre le japonais et uniquement la langue active.
- **Réactivité** : la sélection de `Français`, `English` ou `Español` dans l'écran Langue met à jour les deux cartes de sens dans toutes les configurations de quiz de la planche.
- **Accessibilité** : le nom accessible de chaque carte est également actualisé, par exemple `Comprendre : japonais vers anglais`.

## Passe du 17 octobre 2026 — décisions consolidées

### Intégré

- **Accès** : aucun quiz n'est accessible sans compte dans le MVP.
- **Leçons** : liste continue sans livre ni volume dans l'interface.
- **Email** : connexion par magic link.
- **Révision rapide** : dix mots maximum, rouges en priorité puis jaunes ; aucun mot vert et aucune obligation d'atteindre dix.
- **Progression** : trois réussites non consécutives mènent au vert ; une erreur jaune ne retire rien ; une erreur verte ramène à deux réussites et la bonne réponse suivante remet au vert.
- **Détail du vocabulaire** : chaque ligne affiche désormais les deux scores `C/P` sur 3 en plus de la couleur, afin que le niveau reste compréhensible sans dépendre uniquement du rouge, du jaune ou du vert.
- **Migration de Vincent** : `progress-vincent.json` représente uniquement la compréhension japonais vers signification ; la production démarre rouge.
- **Session interrompue** : pas de reprise dans le MVP ; les réponses déjà validées restent sauvegardées.
- **Styles futurs** : Tailwind majoritaire et modules SCSS imbriqués pour les besoins spécifiques.
- **Catégories** : `useful-words` est une catégorie de vocabulaire possible dans toute leçon et participe aux quiz de la leçon.

## Passe du 29 octobre 2026 — mouvement et fidélité d’interface

### Intégré

- **Durée principale** : une ouverture, une transition d’état ou une apparition structurante dure `250 ms` par défaut.
- **Micro-interactions** : pressions, survols et changements de couleur utilisent `150 ms`; une fermeture peut être raccourcie à `180 ms`.
- **Courbes** : les entrées décélèrent pour apparaître immédiatement puis se poser en douceur; les sorties accélèrent et restent plus courtes.
- **Performance** : privilégier `transform` et `opacity`, sans bloquer la navigation ni animer inutilement la mise en page.
- **Accessibilité** : neutraliser les mouvements non essentiels avec `prefers-reduced-motion`; le focus, les annonces et les actions clavier restent immédiats.
- **Chargement** : le logo empilé transparent respire légèrement et la barre progresse en boucle lente. Le logo conserve toujours son ratio complet.
- **Premier affichage** : le chargement doit être rendu par le document HTML avant React afin de rester visible lorsque le bundle JavaScript est ralenti. Il disparaît dès que React est prêt, sans durée minimale imposée.
- **Accueil public** : entrée discrète du hero et de l’exemple de vocabulaire, pression courte des CTA et élévation légère des cartes sur un pointeur compatible.
- **Authentification** : transition courte entre les méthodes, l’email, la confirmation et le callback.
- **Parcours connectés** : le panneau de profil, les modales, le quiz, la correction, la progression et la dictée recevront le même langage de mouvement pendant leur passe de fidélité respective.

La structure de navigation de `flows.html` ne change pas : cette passe précise la restitution et les transitions des écrans existants.

