# Qualité du projet

Ces documents définissent les exigences applicables au futur code de Kuma Libre. Ils complètent l'architecture sans répéter les règles produit.

- [`quality-standards.md`](quality-standards.md) : nommage, TypeScript, découpage et documentation du code.
- [`testing-policy.md`](testing-policy.md) : stratégie et matrice de tests.
- [`performance-accessibility.md`](performance-accessibility.md) : budgets de performance et accessibilité.
- [`definition-of-done.md`](definition-of-done.md) : conditions minimales pour déclarer une modification terminée.
- [`ui-fidelity-v1.md`](ui-fidelity-v1.md) : contrôle vivant page par page de la fidélité à la maquette et des animations V1.

Ces règles s'appliquent progressivement dès l'initialisation de l'application. Une commande qui n'existe pas encore doit être signalée comme indisponible, jamais présentée comme réussie.

## Exception d'audit suivie

Au 31 octobre 2026, `npm audit` signale l'avis modéré `GHSA-g3hv-75wg-m249` sur `minimatch 10.2.6`, dépendance transitive de l'outillage ESLint. Cette dépendance de développement n'est pas incluse dans le bundle navigateur. Les versions courantes d'ESLint et `typescript-eslint` exigent encore `minimatch 10.x` ; la correction automatique avec `--force` proposerait une rétrogradation cassante et n'est pas appliquée. Le seuil CI reste `high` et l'avis doit être réévalué lors de chaque mise à jour de l'outillage.
