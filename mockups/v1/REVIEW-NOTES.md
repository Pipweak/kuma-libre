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

- Ajouter les traductions espagnoles aux quelque 909 lignes de tableaux détectées dans les 19 fichiers de contenu, puis les faire relire avant d’activer la locale espagnole en production.
- Ajouter des titres thématiques uniquement s’ils sont édités et validés dans les métadonnées du corpus ; ne jamais les déduire ou les inventer dans un composant.

Le détail de la migration est consigné dans [`../../reference/corpus-i18n-audit.md`](../../reference/corpus-i18n-audit.md).

