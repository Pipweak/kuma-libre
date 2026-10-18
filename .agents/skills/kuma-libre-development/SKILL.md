---
name: kuma-libre-development
description: Implement or review Kuma Libre repository work involving the vocabulary corpus, React UI, quiz and mastery rules, Supabase persistence, speech features, or architecture documentation.
---

# Kuma Libre Development

Use this skill for implementation and review work in the Kuma Libre repository.

## Start with the repository guidance

Read the root `AGENTS.md`, then read only the references relevant to the task:

- product or domain decisions: `ARCHITECTURE.md`;
- React structure, components, state or backend boundaries: `docs/architecture/frontend-architecture.md`;
- corpus or translations: `reference/corpus-i18n-audit.md` and the affected files under `lessons/`;
- UX or navigation: `mockups/v1/flows.html` and `mockups/v1/REVIEW-NOTES.md`;
- historical rationale: `docs/reflexion/2026-10-17-fondations-v1.md`.
- quality and completion rules: `docs/quality/README.md`.
- Git branches, pull requests and releases: `docs/development/git-flow.md`.

Treat `ARCHITECTURE.md` and `mockups/v1/flows.html` as the current sources of truth. Treat dated reflection files and the V1/V2 `index.html` planches as archives.

## Preserve the architecture boundaries

- Keep quiz, answer validation and mastery transitions as pure TypeScript domain logic.
- Keep React pages focused on composition and route concerns.
- Put reusable domain-free controls in `shared/ui`; keep product-specific components inside their feature until reuse is demonstrated.
- Access Supabase and browser speech APIs through adapters or repositories.
- Keep UI translations separate from vocabulary meanings.

## Preserve product invariants

Do not reopen or silently change the closed decisions summarized in `AGENTS.md`. In particular, do not invent lesson metadata, merge progress between duplicate lesson entries, add a guest quiz, create a second local source of progress, or add a custom server without a demonstrated requirement.

## Complete changes coherently

For any new, changed, removed, renamed or fixed feature, apply the `kuma-libre-feature-sync` skill so all affected living sources remain aligned. Before declaring implementation complete, apply the `kuma-libre-quality-gate` skill.

Apply the `kuma-libre-git-flow` skill for branch creation, commits, pull requests, tags and releases. Never work directly on `develop` or `main`.

When a task changes a structural decision, update the living architecture and the current functional mockup in the same change. Add tests at the domain, component, SQL or end-to-end layer appropriate to the risk. Report any remaining corpus migration honestly instead of filling missing content with placeholder data.
