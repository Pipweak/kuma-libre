---
name: kuma-libre-feature-sync
description: Synchronize every new, changed, removed, renamed, or fixed Kuma Libre feature across implementation, tests, FR/EN/ES translations, product and technical documentation, README files, corpus documentation, and the current functional mockup. Use whenever a request changes observable behavior or a feature contract.
---

# Kuma Libre Feature Sync

Use this skill whenever work adds, changes, removes, renames or fixes a Kuma Libre feature. A feature change is not complete while an affected source of truth remains stale.

## Establish the current contract

Read the root `AGENTS.md` and the repository skill `kuma-libre-development`. Then inspect only the sources relevant to the change:

- product rules: `ARCHITECTURE.md`;
- technical boundaries: `docs/architecture/frontend-architecture.md`;
- current UX: `mockups/v1/flows.html`, `mockups/v1/flows.js`, `mockups/v1/flows.css` and `mockups/v1/REVIEW-NOTES.md`;
- corpus and translations: `lessons/` and `reference/corpus-i18n-audit.md`;
- setup and entry points: root `README.md` and `docs/README.md`;
- quality requirements: `docs/quality/README.md`.
- Git and release workflow: `docs/development/git-flow.md`.

Treat dated reflection documents and the V1/V2 `index.html` planches as historical archives, not as living specifications.

## Build an impact map before editing

Determine whether the request affects each of these areas:

1. product behavior and acceptance rules;
2. routes, pages, components or interaction states;
3. domain contracts and progress rules;
4. Supabase schema, RPC, RLS or repositories;
5. corpus schema, lesson data or stable identifiers;
6. interface translations or vocabulary meanings;
7. unit, component, integration, SQL or end-to-end tests;
8. accessibility, performance or security;
9. setup instructions, commands or contributor guidance.

Do not create artificial documentation changes. Update every affected document, and leave unrelated documents untouched.

## Synchronize the living sources

Use this routing table:

| Change | Living source to update |
| --- | --- |
| Behavior, business rule or V1 scope | `ARCHITECTURE.md` |
| Component boundaries, contracts, state or dependencies | `docs/architecture/frontend-architecture.md` |
| Setup, scripts, local development or project overview | root `README.md` |
| Documentation navigation | `docs/README.md` |
| Screen, state, navigation or interaction | current files under `mockups/v1/` |
| Corpus structure, coverage or translation status | `reference/corpus-i18n-audit.md` |
| Quality policy | `docs/quality/` |
| Git, pull request, versioning or release process | `docs/development/git-flow.md` |
| Durable agent behavior | `AGENTS.md` or the relevant local skill |

Create a new dated file under `docs/reflexion/` only when preserving the rationale of a major decision is useful. Never rewrite a historical file merely to make it agree with a later decision.

## Keep implementation surfaces aligned

- Add or update FR, EN and ES interface keys together.
- Add vocabulary meanings in `fr`, `en` and `es` when corpus data changes; never invent lesson content.
- Update tests according to `docs/quality/testing-policy.md`.
- Update mockup states as well as the happy path when the interaction changes.
- Preserve stable corpus identifiers and existing user changes whenever possible.

## Close the change explicitly

Before reporting completion:

1. review the diff against the impact map;
2. run the applicable quality gate;
3. confirm that no living source still describes the previous behavior;
4. list the documentation and mockup files updated;
5. if none changed, state why the implementation did not alter a documented contract.
