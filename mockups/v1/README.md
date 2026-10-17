# Maquettes UI — Kuma Libre

Ce dossier contient une proposition visuelle mobile-first destinée à guider la future application React. Il ne contient aucun composant de production et ne dépend d'aucune bibliothèque.

La direction visuelle est partagée avec les autres futurs écrans via `../design-system` :

- variables CSS primitives et sémantiques ;
- pont SCSS sans duplication des valeurs ;
- typographie sobre d’origine fondée sur Inter et les fontes système ;
- mascotte PNG provisoire avec clin d’œil, en attendant la validation d’une future version vectorielle.

## Consultation

Ouvrir `index.html` dans un navigateur. Deux modes sont disponibles :

- **Planche** : tous les écrans sont visibles pour les comparer ;
- **Prototype** : un seul écran est affiché et les boutons permettent de parcourir le flux.

En mode Prototype, les flèches gauche et droite du clavier passent également d'un écran à l'autre.

Un écran peut être ouvert directement avec des paramètres, par exemple `index.html?view=focus&screen=config`.

La page `flows.html` complète les écrans isolés avec :

- une carte globale des destinations et embranchements ;
- douze parcours détaillés sous forme de storyboards horizontaux ;
- les états publics, connectés, de quiz, d'authentification et de reprise ;
- des liens entre chaque nœud de la carte et le parcours correspondant.

Deux captures sont également fournies :

- `preview-board.png` pour un aperçu rapide de la partie supérieure ;
- `preview-full.png` pour la planche complète en une image.
- `flows-preview.png` pour un aperçu de la cartographie et des premiers parcours.
- `flows-full.png` pour une vue d'ensemble des douze storyboards.

## Écrans proposés

1. accueil et reprise rapide ;
2. configuration de la passe ;
3. question sans correction ;
4. réponse correcte ;
5. réponse incorrecte ;
6. progression dans les deux sens ;
7. menu secondaire ;
8. fin de passe ;
9. adaptation bureau de l'écran de quiz.

## Principes de la proposition

- le quiz demeure l'action centrale ;
- une seule action principale est mise en avant à la fois ;
- les réglages restent en dehors de l'écran de question ;
- les résultats utilisent une icône et un libellé en plus de la couleur ;
- la progression distingue compréhension, production et maîtrise globale ;
- la version bureau conserve une colonne de lecture étroite au lieu d'étirer le contenu ;
- aucun framework ou asset distant n'est nécessaire pour consulter les maquettes.

## Points encore à confirmer

- présence définitive du bouton `Je ne sais pas` ;
- règle exacte de passage du jaune au vert ;
- affichage systématique ou facultatif des kana sous les kanji ;
- validation finale de la mascotte, du mot-symbole et de leurs proportions ;
- contenu exact du bilan de fin de passe.
