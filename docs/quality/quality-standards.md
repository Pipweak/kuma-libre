# Standards de qualité et de code

## Nommage

- Composants React et types : `PascalCase`.
- Fonctions, variables et propriétés : `camelCase`.
- Hooks : préfixe `use`.
- Booléens : préfixe explicite `is`, `has`, `can` ou `should`.
- Callbacks exposés par des props : `onX`; gestionnaires internes : `handleX`.
- Constantes réellement globales et immuables : `UPPER_SNAKE_CASE`.
- Routes : minuscules avec segments en `kebab-case`.
- Pas de préfixe `I` pour les interfaces et pas d'abréviation opaque.

Exemples de fichiers : `Button.tsx`, `Button.test.tsx`, `Button.module.scss`, `useQuizSession.ts`, `validateAnswer.ts` et `SupabaseProgressRepository.ts`.

## TypeScript

Le projet utilise le mode strict avec, au minimum :

- `strict` ;
- `noUncheckedIndexedAccess` ;
- `exactOptionalPropertyTypes` ;
- `noImplicitOverride` ;
- `noFallthroughCasesInSwitch` ;
- `noUnusedLocals` et `noUnusedParameters`.

Éviter `any`, les assertions non sûres et les valeurs magiques. Une exception doit être locale et justifiée. Les API publiques et les fonctions du domaine exposent des types de retour explicites. Les machines d'état utilisent de préférence des unions discriminées.

## Structure et dépendances

- Une page compose ; elle ne porte pas les règles métier.
- Une feature possède ses composants, hooks et état tant qu'ils ne sont pas véritablement partagés.
- Le domaine ne dépend ni de React, ni de Supabase, ni d'i18next.
- Les accès externes passent par des contrats et des adapters.
- Une abstraction partagée doit résoudre une répétition réelle et stable.
- Les modules SCSS sont colocalisés, avec une imbrication courte utilisant `&` lorsque cela clarifie le lien entre états et composant.

## Documentation du code

Dans ce projet TypeScript, l'équivalent pertinent de JavaDoc est TSDoc/JSDoc.

Il est attendu pour :

- les fonctions exportées du domaine ;
- les contrats de repository et les adapters ;
- les hooks publics non triviaux ;
- les algorithmes complexes ;
- les effets de bord, erreurs possibles et contraintes non évidentes ;
- les composants partagés dont le contrat ne se comprend pas avec leurs types seuls.

Le commentaire explique le pourquoi, le contrat et les limites. Il ne répète pas ligne par ligne ce que le code exprime déjà.

## Maintenance

- Pas d'avertissement de lint, TypeScript ou build ignoré sans justification.
- Pas de code mort, de TODO anonyme ou de dépendance ajoutée sans usage démontré.
- Les erreurs destinées à l'utilisateur passent par l'internationalisation.
- Les modifications fonctionnelles suivent le workflow de synchronisation documentaire défini dans `AGENTS.md`.
