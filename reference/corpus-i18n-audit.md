# Audit du corpus pour l’internationalisation

> État observé et validé par l'importeur le 18 octobre 2026.

## Situation actuelle

- Le dépôt contient 18 dossiers de leçon et 19 fichiers Markdown de contenu ; la leçon 06 possède un fichier de vocabulaire et un fichier `useful-words`.
- L'importeur normalise 904 entrées réparties dans 18 leçons, sans identifiant dupliqué : 701 entrées de vocabulaire, 96 expressions, 65 noms propres et 42 entrées `useful-words`.
- Les traductions disponibles sont le français et l’anglais.
- Les 904 entrées possèdent au moins une signification française et une signification anglaise.
- Aucune colonne espagnole structurée n’existe encore : les 904 entrées sont donc signalées par le contrôle de préparation aux quiz trilingues.
- 46 expressions ou noms propres écrits en japonais ne possèdent pas encore de lecture déclarée dans les sources ; ils n'ont par conséquent pas de rōmaji généré. L'importeur les signale sans inventer de prononciation.
- Les leçons possèdent un numéro, mais aucun titre thématique éditorial fiable. L’interface doit donc afficher `Leçon 01`, `Leçon 02`, etc. tant que des métadonnées validées n’ont pas été ajoutées.
- Aucun fichier audio ni URL audio n’existe dans le corpus.
- Les fichiers n'utilisent pas tous les mêmes en-têtes de tableau. L'importeur reconnaît les formats historiques puis produit une représentation unique dans `src/generated/corpus.json`.

## Sources de vérité

Le corpus de vocabulaire, ses catégories et les métadonnées publiques de leçon restent dans les fichiers versionnés, puis sont convertis en JSON au build. Ils ne sont pas stockés dans les tables utilisateur Supabase. `useful-words` est une catégorie de vocabulaire possible dans toute leçon, pas une exception propre à la leçon 06.

Les commandes de contrôle sont :

- `npm run corpus:generate` pour régénérer l'artefact après une modification des sources ;
- `npm run corpus:check` pour vérifier la structure et l'absence de décalage entre les Markdown et le JSON versionné ;
- `npm run corpus:validate-ready` pour exiger en plus l'espagnol, les lectures kana nécessaires et le rōmaji. Ce dernier contrôle décrit actuellement les lacunes de migration et deviendra bloquant avant l'activation des quiz trilingues.

La valeur complète d'une traduction reste le libellé d'affichage. Les alternatives séparées explicitement dans la cellule source par une virgule, une barre oblique ou un point-virgule sont aussi normalisées comme réponses acceptées.

Supabase contient uniquement les données propres à l’utilisateur : profil, préférences, historique et progression. Les pourcentages affichés à côté des leçons sont calculés en croisant le corpus statique avec cette progression.

## Migration espagnole

La migration doit être complète à l’échelle du corpus afin d’éviter une interface partiellement traduite :

1. ajouter `es: string[]` au modèle normalisé ;
2. produire avec assistance IA une première traduction espagnole pour chaque entrée ;
3. contrôler les traductions dans leur contexte, notamment les niveaux de politesse, les faux amis et les expressions ;
4. valider automatiquement qu’aucune entrée activée ne possède une liste espagnole vide ;
5. activer ensuite la locale espagnole dans l’application.

La production et le contrôle des traductions sont une tâche de préparation du corpus, pas une décision produit demandée à l'utilisateur. La maquette utilise seulement quelques traductions espagnoles d'exemple tant que la migration des 18 leçons n'est pas terminée.

## Audio

La lecture d’une question peut fonctionner sans donnée audio : le navigateur synthétise la voix à partir du texte du corpus avec `window.speechSynthesis`. Pour un mot japonais, l’application prononce la forme kana afin de contrôler la lecture. Si aucune voix compatible n’est disponible, le bouton est masqué ou désactivé et le quiz reste entièrement utilisable.

