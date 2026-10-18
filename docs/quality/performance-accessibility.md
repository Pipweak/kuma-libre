# Performance et accessibilité

## Budgets de performance

Objectifs mesurés sur mobile dans des conditions reproductibles :

- LCP inférieur ou égal à 2,5 s ;
- INP inférieur ou égal à 200 ms ;
- CLS inférieur ou égal à 0,1 ;
- score Lighthouse Performance d'au moins 90 sur les parcours principaux.

Le premier build de production stable établira la référence du bundle. Une régression supérieure à 10 % sur un bundle ou une métrique suivie doit être expliquée et acceptée explicitement.

## Pratiques attendues

- Charger les routes secondaires à la demande lorsque cela réduit réellement le chargement initial.
- Dimensionner les images et logos pour éviter les décalages de mise en page.
- Importer les icônes individuellement.
- Préparer la liste de questions au démarrage de la session plutôt que recalculer inutilement à chaque rendu.
- Éviter les rerenders globaux et les requêtes en cascade ou N+1.
- Ne pas ajouter `memo`, `useMemo` ou `useCallback` sans raison mesurable ou contrat de référence nécessaire.
- Ne pas bloquer inutilement l'interface sur l'enregistrement distant de la progression ; afficher un état clair lorsque la cohérence exige une attente.

## Accessibilité

- Toutes les actions sont utilisables au clavier et possèdent un focus visible.
- Chaque champ possède un libellé et chaque erreur lui est reliée.
- Les changements de dictée, validation et correction importants utilisent une zone live appropriée sans devenir bavards.
- Une couleur n'est jamais le seul moyen d'exprimer la maîtrise, le succès ou l'erreur.
- Les animations respectent `prefers-reduced-motion`.
- Les icônes seules ont un nom accessible ; les icônes décoratives sont masquées aux technologies d'assistance.
- Le contraste et les tailles de cibles tactiles sont vérifiés sur mobile.

Les composants partagés utilisent des tests d'accessibilité automatisés. Les pages et parcours critiques sont également vérifiés dans le navigateur, car l'automatisation ne détecte pas tous les problèmes.
