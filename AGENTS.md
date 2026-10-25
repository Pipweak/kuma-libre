# Instructions de travail — Kuma Libre

## Lecture initiale

Avant toute modification significative :

1. lire [`ARCHITECTURE.md`](ARCHITECTURE.md) ;
2. lire [`docs/architecture/frontend-architecture.md`](docs/architecture/frontend-architecture.md) pour du code applicatif ;
3. consulter [`mockups/v1/flows.html`](mockups/v1/flows.html) pour un changement d'interface ou de parcours ;
4. consulter [`reference/corpus-i18n-audit.md`](reference/corpus-i18n-audit.md) pour le corpus ou l'internationalisation ;
5. consulter [`docs/quality/README.md`](docs/quality/README.md) avant toute implémentation, correction ou revue de code ;
6. lire [`docs/development/git-flow.md`](docs/development/git-flow.md) avant toute opération Git, pull request ou release.

La synthèse datée [`docs/reflexion/2026-10-17-fondations-v1.md`](docs/reflexion/2026-10-17-fondations-v1.md) explique l'origine des décisions, mais ne remplace pas les documents vivants.

## Invariants produit

- L'identité publique est Kuma Libre ; ne pas exposer le nom du manuel dans l'interface publique.
- Le quiz nécessite un compte dans la V1.
- Les leçons forment une liste continue sans livre ni volume public.
- `useful-words` est une catégorie possible dans toute leçon.
- L'interface et les significations prennent en charge `fr`, `en` et `es`.
- La compréhension accepte toute traduction explicitement enregistrée en FR, EN ou ES.
- La production accepte les formes rōmaji, kana ou kanji explicitement enregistrées.
- Le rōmaji est stocké dans le corpus normalisé.
- Compréhension et production ont des progressions indépendantes.
- Trois réussites atteignent le vert ; une erreur verte ramène à deux, puis une réussite remet au vert.
- La révision rapide choisit au maximum dix rouges, puis des jaunes ; jamais de verts.
- Une passe interrompue n'est pas reprise, mais les réponses déjà validées restent enregistrées.
- `progress-vincent.json` initialise uniquement la compréhension de Vincent.

## Contraintes techniques

- Garder le domaine du quiz et de la progression indépendant de React et de Supabase.
- Utiliser Supabase comme backend géré ; ne pas ajouter de serveur personnalisé sans besoin démontré.
- Ne jamais placer une clé `service_role` dans le frontend.
- Ne pas stocker le corpus ou la progression métier dans `localStorage`.
- Utiliser Tailwind en priorité et des modules SCSS pour les besoins spécifiques ; conserver les valeurs visuelles dans les tokens CSS.
- Ne pas introduire Redux, TanStack Query ou une PWA par anticipation.
- La saisie clavier doit toujours rester possible lorsque les API vocales échouent.

## Données et contenu

- Ne jamais inventer un mot, une traduction, un titre thématique ou l'appartenance à une leçon.
- Les Markdown de `lessons/` sont les sources éditables du corpus.
- Le JSON généré est un artefact de build et ne doit pas être édité manuellement.
- Une correction du corpus doit préserver autant que possible les identifiants stables.
- Les synonymes sont acceptés uniquement lorsqu'ils sont déclarés dans les données de la V1.

## Qualité et documentation

- Toute nouvelle fonctionnalité, modification, suppression, correction ou renommage doit faire l'objet d'une analyse d'impact documentaire.
- Mettre à jour dans le même changement tous les documents vivants réellement affectés : architecture produit, architecture technique, README, documentation du corpus, traductions et maquette fonctionnelle.
- La réponse finale doit lister les documents mis à jour ou indiquer explicitement pourquoi aucun document ne devait changer.
- Ajouter les tests exigés par [`docs/quality/testing-policy.md`](docs/quality/testing-policy.md), notamment un test de régression pour toute correction de bug.
- Respecter [`docs/quality/quality-standards.md`](docs/quality/quality-standards.md) et la [`Definition of Done`](docs/quality/definition-of-done.md).
- Vérifier mobile, clavier, accessibilité et performance pour tout changement concerné.
- Mettre à jour `ARCHITECTURE.md` lorsqu'un comportement produit, une règle métier ou une décision technique structurante change.
- Mettre à jour `docs/architecture/frontend-architecture.md` lorsqu'une frontière, un contrat, une dépendance ou une structure applicative change.
- Mettre à jour la maquette fonctionnelle lorsqu'un écran, un état ou un parcours utilisateur change.
- Mettre à jour les fichiers de traduction FR, EN et ES lorsqu'un libellé d'interface change.
- Ne pas modifier les archives V1/V2 pour leur faire porter de nouvelles règles ; modifier `mockups/v1/flows.html`.
- Préserver les changements utilisateur non liés et le dossier `.idea/`.
- À la fin de chaque job ou avant de demander la validation d'une pull request, fournir une procédure de validation utilisateur directement exécutable : commandes exactes, résultats attendus et checklist manuelle ou visuelle adaptée au changement.
- Indiquer explicitement qu'aucun test visuel n'est nécessaire lorsqu'aucune interface ou aucun parcours n'a changé. Signaler séparément les échecs attendus afin qu'ils ne soient pas confondus avec une régression.

Les skills locaux [`kuma-libre-feature-sync`](.agents/skills/kuma-libre-feature-sync/SKILL.md) et [`kuma-libre-quality-gate`](.agents/skills/kuma-libre-quality-gate/SKILL.md) détaillent respectivement la synchronisation d'une feature et son contrôle qualité final.

## Git Flow

- `develop` est la branche par défaut et la branche d'intégration.
- `main` représente uniquement la production.
- Aucun commit direct n'est autorisé sur `develop` ou `main`.
- Tout changement utilise une branche dédiée créée depuis `origin/develop`, sauf les hotfixes créés depuis `origin/main`.
- Les changements ordinaires rejoignent `develop` par pull request après validation et contrôles réussis.
- Une release utilise `release/<version>`, des tags RC annotés `v<version>-rc.N`, une pull request vers `main`, un tag final `v<version>`, puis une pull request de retour vers `develop`.
- Un hotfix utilise `hotfix/<version>`, rejoint `main` par pull request, reçoit un tag de production, puis est reporté vers `develop`.
- Ne jamais forcer un push, déplacer un tag publié ou fusionner une branche protégée avec des contrôles en échec.

Le skill local [`kuma-libre-git-flow`](.agents/skills/kuma-libre-git-flow/SKILL.md) et la documentation [`docs/development/git-flow.md`](docs/development/git-flow.md) définissent le workflow complet.
