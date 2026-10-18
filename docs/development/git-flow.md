# Git Flow et cycle de release

> **Statut :** workflow Git de référence pour Kuma Libre.
> **Version :** 1 — 17 octobre 2026.

## Branches permanentes

| Branche | Rôle | Déploiement |
| --- | --- | --- |
| `develop` | Intégration continue des changements validés | Environnement de preview ou développement |
| `main` | État exact de la production | Production uniquement |

`develop` est la branche par défaut du dépôt. `main` est protégée et ne reçoit jamais de développement direct.

## Branches temporaires

| Préfixe | Base | Destination normale | Usage |
| --- | --- | --- | --- |
| `feature/` | `develop` | `develop` | Nouvelle fonctionnalité |
| `bugfix/` | `develop` | `develop` | Correction hors urgence de production |
| `docs/` | `develop` | `develop` | Documentation et maquettes |
| `refactor/` | `develop` | `develop` | Restructuration sans changement fonctionnel |
| `test/` | `develop` | `develop` | Infrastructure ou couverture de tests |
| `chore/` | `develop` | `develop` | Outillage, dépendances et maintenance |
| `release/` | `develop` | `main`, puis retour dans `develop` | Stabilisation d'une version |
| `hotfix/` | `main` | `main`, puis retour dans `develop` | Correction urgente de production |

Les noms utilisent le kebab-case, par exemple `feature/voice-dictation`, `bugfix/romaji-normalization`, `release/0.1.0` ou `hotfix/0.1.1`.

## Cycle d'un changement ordinaire

```text
origin/develop
      |
      +-- feature|bugfix|docs|refactor|test|chore/<sujet>
                         |
                         +-- commits + tests + documentation
                         |
                         +-- pull request vers develop
                                      |
                                      +-- validation + CI
                                      |
                                      +-- squash merge
```

Règles :

1. mettre à jour les références distantes avant de créer la branche ;
2. partir de `origin/develop`, pas d'une copie locale obsolète ;
3. ne traiter qu'un sujet cohérent par branche ;
4. utiliser des commits et titres de PR conformes à Conventional Commits ;
5. appliquer la Definition of Done avant la fusion ;
6. ouvrir la PR vers `develop` et attendre les contrôles requis ;
7. utiliser de préférence un squash merge pour conserver un historique lisible ;
8. supprimer la branche temporaire après fusion.

Exemples de titres :

```text
feat(quiz): add voice transcription states
fix(progress): preserve direction-specific mastery
docs(workflow): define release candidate process
chore(tooling): configure quality scripts
```

Une feature terminée rejoint `develop`, mais ne déclenche pas automatiquement une release de production.

## Release candidate et production

Kuma Libre suit Semantic Versioning. Tant que le produit n'a pas atteint une API publique stable, les premières versions peuvent évoluer sous `0.x.y`.

Pour publier, par exemple, la version `0.1.0` :

1. vérifier que `develop` contient uniquement le périmètre prévu et que la CI passe ;
2. créer `release/0.1.0` depuis `origin/develop` ;
3. geler les nouvelles features sur cette branche ;
4. effectuer uniquement les corrections de stabilisation et les mises à jour de version ou de notes de release ;
5. créer le tag annoté `v0.1.0-rc.1` sur le premier candidat ;
6. produire `v0.1.0-rc.2`, etc. sur la même branche si des corrections sont nécessaires ;
7. ouvrir une PR `release/0.1.0` vers `main` ;
8. après validation fonctionnelle et technique, fusionner avec un merge commit ;
9. créer le tag annoté final `v0.1.0` sur le commit de `main` et publier la GitHub Release ;
10. ouvrir une PR de retour vers `develop` afin de conserver les corrections de stabilisation ;
11. supprimer la branche de release après ce retour.

Une version cible possède donc une seule branche `release/<version>`. Les différents release candidates sont identifiés par les tags `v<version>-rc.N`.

## Hotfix de production

Un hotfix part toujours de `origin/main` :

```text
main -> hotfix/0.1.1 -> PR main -> tag v0.1.1
                         |
                         +--------> PR de retour develop
```

Le hotfix contient un test de régression. S'il existe une release active, la correction y est également intégrée. Le tag final et la GitHub Release ne sont créés qu'après validation sur `main`.

## Protections attendues sur GitHub

Pour `main` et `develop` :

- fusion uniquement par pull request ;
- contrôles CI obligatoires ;
- branche à jour avant fusion lorsque GitHub peut l'imposer ;
- interdiction des force-pushes et suppressions ;
- résolution obligatoire des conversations de revue ;
- aucune fusion si la Definition of Done n'est pas satisfaite.

Depuis l'initialisation du socle React, les checks GitHub à rendre obligatoires dans les rulesets sont `quality` et `e2e`. Le premier regroupe formatage, lint, typecheck, couverture, build et audit des dépendances ; le second exécute les parcours navigateur et le contrôle axe sur Chromium.

Une approbation externe peut devenir obligatoire lorsqu'un second mainteneur participe au projet. Elle ne doit pas empêcher artificiellement le travail d'un dépôt encore maintenu par une seule personne.

## Commits, tags et historique

- Les branches ordinaires peuvent contenir plusieurs commits de travail ; leur PR est normalement squashée.
- Les branches `release/*` et `hotfix/*` sont fusionnées dans `main` avec un merge commit afin de préserver l'événement de release.
- Les tags RC et production sont annotés et ne sont jamais déplacés ou réutilisés.
- Une erreur publiée reçoit une nouvelle version ; on ne réécrit pas un tag existant.
- Les notes de GitHub Release récapitulent les changements, migrations, limites connues et instructions de déploiement.

## Responsabilités de l'agent

Pour chaque travail, l'agent doit annoncer :

- la branche créée et sa base ;
- les validations exécutées ;
- le commit et la PR produits ;
- la branche cible ;
- les tags créés, le cas échéant ;
- la prochaine transition nécessitant une validation.

L'agent ne fusionne pas vers une branche protégée et ne publie pas une release lorsqu'une validation manque ou qu'un contrôle obligatoire échoue.
