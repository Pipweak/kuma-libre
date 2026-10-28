# Audit du corpus pour l’internationalisation

> État observé et validé par l'importeur le 28 octobre 2026.

## Situation actuelle

- Le dépôt contient 18 dossiers de leçon et 19 fichiers Markdown de contenu ; la leçon 06 possède un fichier de vocabulaire et un fichier `useful-words`.
- L'importeur normalise 904 entrées réparties dans 18 leçons, sans identifiant dupliqué : 701 entrées de vocabulaire, 96 expressions, 65 noms propres et 42 entrées `useful-words`.
- Les 904 entrées possèdent au moins une signification française, anglaise et espagnole.
- Les traductions espagnoles ont reçu une première version assistée, puis ont été contrôlées dans le contexte français, anglais et japonais. Les ambiguïtés lexicales, niveaux de politesse et noms propres détectés ont été corrigés dans les sources Markdown.
- Toutes les expressions et tous les noms propres écrits en japonais possèdent désormais une lecture kana déclarée ; l'importeur peut donc générer leur rōmaji sans deviner de prononciation.
- Les leçons possèdent un numéro, mais aucun titre thématique éditorial fiable. L’interface doit donc afficher `Leçon 01`, `Leçon 02`, etc. tant que des métadonnées validées n’ont pas été ajoutées.
- Aucun fichier audio ni URL audio n’existe dans le corpus.
- Les fichiers n'utilisent pas tous les mêmes en-têtes de tableau. L'importeur reconnaît les formats historiques puis produit une représentation unique dans `src/generated/corpus.json`.

## Sources de vérité

Le corpus de vocabulaire, ses catégories et les métadonnées publiques de leçon restent dans les fichiers versionnés, puis sont convertis en JSON au build. Ils ne sont pas stockés dans les tables utilisateur Supabase. `useful-words` est une catégorie de vocabulaire possible dans toute leçon, pas une exception propre à la leçon 06.

Les commandes de contrôle sont :

- `npm run corpus:generate` pour régénérer l'artefact après une modification des sources ;
- `npm run corpus:check` pour vérifier la structure et l'absence de décalage entre les Markdown et le JSON versionné ;
- `npm run corpus:validate-ready` pour exiger en plus l'espagnol, les lectures kana nécessaires et le rōmaji. Le corpus versionné satisfait ce contrôle, qui doit rester bloquant pour toute nouvelle donnée destinée aux quiz.

La valeur complète d'une traduction reste le libellé d'affichage. Les alternatives séparées explicitement dans la cellule source par une virgule, une barre oblique ou un point-virgule sont aussi normalisées comme réponses acceptées.

Supabase contient uniquement les données propres à l’utilisateur : profil, préférences, historique et progression. Les pourcentages affichés à côté des leçons sont calculés en croisant le corpus statique avec cette progression.

## Migration espagnole terminée

La migration a été réalisée à l’échelle du corpus afin d’éviter une interface partiellement traduite :

1. `es: string[]` appartient au modèle normalisé ;
2. chaque entrée possède une traduction espagnole initiale ;
3. les traductions ont été contrôlées dans leur contexte, notamment pour les niveaux de politesse, les faux amis et les expressions ;
4. la validation automatique refuse toute entrée activée dont une signification ou une lecture requise est vide ;
5. la locale espagnole peut être utilisée sur l'ensemble des 18 leçons.

La production et le contrôle des traductions restent une tâche éditoriale du corpus. Toute correction future doit être apportée au Markdown de la leçon concernée, puis propagée vers le JSON avec `npm run corpus:generate`.

## Audio

La lecture d’une question peut fonctionner sans donnée audio : le navigateur synthétise la voix à partir du texte du corpus avec `window.speechSynthesis`. Pour un mot japonais, l’application prononce la forme kana afin de contrôler la lecture. Si aucune voix compatible n’est disponible, le bouton est masqué ou désactivé et le quiz reste entièrement utilisable.

