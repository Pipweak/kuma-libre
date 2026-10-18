---
name: kuma-libre-git-flow
description: Apply the Kuma Libre Git Flow whenever repository work creates a branch, commit, pull request, release candidate, production release, tag, bugfix, or hotfix. Keep develop as the integration branch and main as the protected production branch.
---

# Kuma Libre Git Flow

Use this skill for every repository change and for all Git, pull request and release operations. Read `docs/development/git-flow.md` before acting; it is the detailed source of truth.

## Preserve the branch roles

- `develop` is the default integration branch and the base for ordinary work.
- `main` represents production and receives only validated release or hotfix pull requests.
- Never commit directly to `develop` or `main`.
- Never force-push a shared or protected branch.
- Preserve unrelated working-tree changes and never reset them destructively.

## Start work on a dedicated branch

Fetch the remote state, verify the current working tree, and branch from the correct remote base:

- `feature/<slug>` for a feature, from `origin/develop`;
- `bugfix/<slug>` for a non-production bug, from `origin/develop`;
- `docs/<slug>`, `refactor/<slug>`, `test/<slug>` or `chore/<slug>` for the corresponding work, from `origin/develop`;
- `release/<major.minor.patch>` for release stabilization, from `origin/develop`;
- `hotfix/<major.minor.patch>` for an urgent production correction, from `origin/main`.

Use lowercase kebab-case slugs. Do not mix unrelated work on one branch.

## Integrate ordinary work

1. Implement and synchronize code, tests, translations and documentation.
2. Apply `kuma-libre-quality-gate` and report unavailable checks honestly.
3. Commit with Conventional Commits and push the work branch.
4. Open a pull request targeting `develop`.
5. Give the user the exact validation commands, expected results and applicable manual or visual checklist defined by `kuma-libre-quality-gate`.
6. Merge only after the required checks succeed and the work has been validated.
7. Prefer squash merge for ordinary work, with a clean Conventional Commit PR title.
8. Delete the work branch after merge.

A completed feature does not automatically create a production release. Several validated changes may accumulate on `develop` before a release is cut.

## Prepare a release candidate

1. Choose the next Semantic Version.
2. Create `release/<version>` from the validated `origin/develop` commit.
3. Freeze the scope; accept only stabilization changes and release metadata.
4. Tag each candidate on this branch with an annotated tag such as `v0.1.0-rc.1`, then `v0.1.0-rc.2` if needed.
5. Push the release branch and RC tag and validate the deployable artifact.
6. Open the release pull request from `release/<version>` to `main`.
7. After validation, merge with a merge commit, tag the resulting `main` commit as `v<version>`, and create the GitHub Release.
8. Merge the released state back into `develop` through a pull request, then delete the release branch.

Use one release branch per target version; RC iterations are distinguished by annotated `-rc.N` tags rather than separate branches.

## Deliver a hotfix

1. Create `hotfix/<version>` from `origin/main`.
2. Add the regression test and apply the full quality gate.
3. Open a pull request to `main` and merge only after validation.
4. Create and push the annotated production tag `v<version>` and its GitHub Release.
5. Merge the hotfix state back into `develop` through a pull request, and into an active release branch when applicable.

## Stop at protected transitions

Do not merge a pull request, publish a production release or move a production tag when validation is missing, checks fail, the target is ambiguous, or the action exceeds the user's authorization. Report the exact pending transition instead.

At handoff, state the current branch, commit, pull request target, checks, tags and next protected transition. Always include the user validation procedure: exact commands, expected results, applicable manual or visual checks, and an explicit “no visual test required” when appropriate.
