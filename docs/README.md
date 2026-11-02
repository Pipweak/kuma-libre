# Documentation du projet

Ce dossier complète les documents placés à la racine sans les remplacer.

## Documents vivants

- [`../ARCHITECTURE.md`](../ARCHITECTURE.md) : architecture produit et décisions fonctionnelles de référence.
- [`architecture/frontend-architecture.md`](architecture/frontend-architecture.md) : découpage React, routes, composants, état, internationalisation et frontière backend.
- [`../reference/corpus-i18n-audit.md`](../reference/corpus-i18n-audit.md) : état du corpus et migration trilingue.
- [`../mockups/v1/flows.html`](../mockups/v1/flows.html) : référence fonctionnelle visuelle actuelle.
- [`../supabase/README.md`](../supabase/README.md) : exécution locale, tests SQL et déploiement des migrations Supabase.

## Qualité et contribution

- [`quality/README.md`](quality/README.md) : point d'entrée des conventions de qualité.
- [`quality/quality-standards.md`](quality/quality-standards.md) : nommage, TypeScript, structure et documentation du code.
- [`quality/testing-policy.md`](quality/testing-policy.md) : tests attendus selon le type de changement.
- [`quality/performance-accessibility.md`](quality/performance-accessibility.md) : budgets de performance et exigences d'accessibilité.
- [`quality/definition-of-done.md`](quality/definition-of-done.md) : contrôle final avant de déclarer un changement terminé.
- [`quality/ui-fidelity-v1.md`](quality/ui-fidelity-v1.md) : suivi page par page du rendu, du responsive et des animations V1.
- [`development/git-flow.md`](development/git-flow.md) : branches, pull requests, release candidates, tags et releases.
- [`development/deployment.md`](development/deployment.md) : préparation et validation du déploiement Cloudflare Pages avec Supabase.
- [`development/vincent-progress-import.md`](development/vincent-progress-import.md) : import administratif, contrôlé et unique de la progression historique de Vincent.

## Instructions pour les agents

- [`../AGENTS.md`](../AGENTS.md) : règles toujours applicables dans le dépôt.
- [`../.agents/skills/kuma-libre-development/SKILL.md`](../.agents/skills/kuma-libre-development/SKILL.md) : architecture et invariants de Kuma Libre.
- [`../.agents/skills/kuma-libre-feature-sync/SKILL.md`](../.agents/skills/kuma-libre-feature-sync/SKILL.md) : synchronisation automatique d'une feature avec ses tests, traductions, documents et maquettes.
- [`../.agents/skills/kuma-libre-quality-gate/SKILL.md`](../.agents/skills/kuma-libre-quality-gate/SKILL.md) : contrôle qualité avant de déclarer le travail terminé.
- [`../.agents/skills/kuma-libre-git-flow/SKILL.md`](../.agents/skills/kuma-libre-git-flow/SKILL.md) : application du Git Flow et du cycle de release.

## Trace des réflexions

Le dossier [`reflexion`](reflexion/) contient des synthèses datées. Ces documents expliquent pourquoi les décisions ont été prises et conservent la mémoire des explorations, sans devenir une seconde source de vérité.

- [`reflexion/2026-10-17-fondations-v1.md`](reflexion/2026-10-17-fondations-v1.md) : cadrage produit, UX et technique réalisé avant le démarrage de l'application.

En cas de différence entre une synthèse datée et un document vivant, `ARCHITECTURE.md` et la maquette `mockups/v1/flows.html` prévalent.
