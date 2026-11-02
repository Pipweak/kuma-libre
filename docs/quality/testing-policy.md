# Politique de tests

Les tests sont choisis selon le risque. Il n'est pas utile de répéter exactement le même scénario à toutes les couches.

| Changement | Test attendu |
| --- | --- |
| Règle de quiz, sélection ou maîtrise | Test unitaire du domaine |
| Normalisation ou validation d'une réponse | Tests unitaires avec cas limites |
| Composant interactif | Test de composant avec React Testing Library |
| Composant purement visuel | Test seulement s'il possède des variantes ou états significatifs |
| Hook complexe ou reducer | Test unitaire ou de composant selon son contrat |
| Repository, auth ou adapter | Test d'intégration avec dépendance contrôlée |
| Migration, RPC ou politique RLS | Test SQL/Supabase |
| Parcours utilisateur critique | Test Playwright |
| Correction de bug | Test de régression reproduisant le défaut |
| Dictée ou synthèse vocale | Tests de l'adapter et des états du composant, sans dépendre d'une vraie voix système |

## Principes

- Tester le comportement observable et les contrats, pas les détails internes.
- Pour l'interface, privilégier les requêtes par rôle et libellé accessible.
- Éviter les snapshots volumineux et fragiles.
- Utiliser des fixtures explicites et minimales.
- Couvrir les chemins heureux, erreurs, limites et indisponibilités pertinentes.
- Ne pas appeler Supabase, Google ou les API vocales réelles dans les tests unitaires.

## Couverture

- Les branches critiques du domaine de quiz et de progression visent 100 %.
- Le projet vise au moins 85 % de couverture globale une fois le socle stabilisé.
- Une baisse de couverture ou une exclusion doit être expliquée.

La couverture reste un signal : un test utile et lisible prime sur un pourcentage obtenu avec des assertions faibles.
