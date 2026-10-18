# Maquettes UI — Kuma Libre

Ce dossier contient la proposition visuelle mobile-first retenue pour guider la future application React. Il ne contient aucun composant de production et ne dépend d'aucune bibliothèque.

La direction visuelle est partagée avec les autres futurs écrans via `../design-system` :

- variables CSS primitives et sémantiques ;
- pont SCSS sans duplication des valeurs, destiné aux futurs modules SCSS en complément de Tailwind ;
- typographie sobre d’origine fondée sur Inter et les fontes système ;
- mascotte PNG provisoire avec clin d’œil, en attendant la validation d’une future version vectorielle.

## Consultation

Ouvrir `flows.html` pour consulter la référence fonctionnelle actuelle : carte globale, parcours complets et états de dictée vocale.

`index.html` est la première planche d'écrans isolés. Elle reste disponible comme archive visuelle avec deux modes :

- **Planche** : tous les écrans sont visibles pour les comparer ;
- **Prototype** : un seul écran est affiché et les boutons permettent de parcourir le flux.

En mode Prototype, les flèches gauche et droite du clavier passent également d'un écran à l'autre.

Un écran peut être ouvert directement avec des paramètres, par exemple `index.html?view=focus&screen=config`.

La page `flows.html` remplace les écrans isolés comme source de vérité fonctionnelle avec :

- une carte globale des destinations et embranchements ;
- quinze parcours détaillés sous forme de storyboards horizontaux ;
- les états publics, connectés, de quiz, d'authentification et de dictée ;
- des liens entre chaque nœud de la carte et le parcours correspondant.

Les remarques formulées pendant la lecture de cette planche sont suivies dans [`REVIEW-NOTES.md`](REVIEW-NOTES.md).

Deux captures sont également fournies :

- `preview-board.png` pour un aperçu rapide de la partie supérieure ;
- `preview-full.png` pour la planche complète en une image.
- `flows-preview.png` pour un aperçu de la cartographie et des premiers parcours.
- `flows-full.png` pour une vue d'ensemble des storyboards à la date de sa dernière génération.

## Écrans proposés

1. accueil et révision rapide ;
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

- affichage systématique ou facultatif des kana sous les kanji ;
- validation finale de la mascotte, du mot-symbole et de leurs proportions ;
- contenu exact du bilan de fin de passe.

Les décisions fonctionnelles à jour sont consignées dans [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md). En particulier : le quiz nécessite un compte, les leçons forment une liste continue sans ouvrage, le magic link est retenu, la révision rapide prend au maximum dix mots rouges puis jaunes, et une passe interrompue n'est pas reprise dans le MVP.
