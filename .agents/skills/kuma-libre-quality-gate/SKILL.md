---
name: kuma-libre-quality-gate
description: Apply Kuma Libre naming, TypeScript, documentation, testing, accessibility, performance, security, and completion standards after feature or fix implementation, before a commit or pull request, or during code review and quality audits.
---

# Kuma Libre Quality Gate

Use this skill after implementing a feature or correction, before declaring repository work complete, and for code reviews or quality audits.

## Load the standards

Read:

- root `AGENTS.md`;
- `docs/quality/quality-standards.md`;
- `docs/quality/testing-policy.md`;
- `docs/quality/performance-accessibility.md`;
- `docs/quality/definition-of-done.md`.
- `docs/development/git-flow.md` when the change will be committed, pushed, reviewed or released.

For a feature change, also apply the `kuma-libre-feature-sync` skill.

## Inspect the actual change

Review the working tree and diff. Separate user changes from the current task and preserve unrelated work. Identify affected domain rules, UI states, adapters, data, translations and documentation before selecting checks.

## Enforce the code contract

- Keep domain logic pure and independent of React and Supabase.
- Respect the naming and TypeScript rules in the quality standards.
- Prefer small cohesive units and explicit contracts over speculative abstractions.
- Add TSDoc to public or non-obvious contracts where it explains behavior, constraints or side effects; do not narrate trivial code.
- Ensure failures and unavailable browser APIs keep a usable keyboard path.

## Select and run proportionate checks

Use the test matrix rather than duplicating every behavior at every layer. When the scaffold exposes the commands, run all applicable checks, normally:

```text
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
npm run test:a11y
npm run performance:check
```

Do not invent missing commands. If the project is not yet initialized or a check is unavailable, report it as not executable rather than as passed.

## Review non-functional quality

- Verify accessible names, keyboard operation, focus, errors, contrast and reduced motion for affected UI.
- Check mobile-first behavior at the relevant viewports.
- Check bundle, rendering, network and image consequences for performance-sensitive changes.
- Review RLS, authorization, secret handling and input validation for data or authentication changes.
- Ensure FR, EN and ES coverage for changed UI labels.

## Report honestly

Do not claim completion while a mandatory check fails. Report:

- checks executed and their results;
- tests added or updated;
- documentation synchronized;
- checks that could not run and why;
- remaining risks or follow-up work.

Also report the current work branch and intended pull request target. Do not approve a direct commit to `develop` or `main`.

## Prepare the user validation handoff

Before asking the user to validate or merge a pull request, provide a concrete, copy-pasteable validation procedure tailored to the actual change. Include:

- any required checkout, pull or installation command;
- the exact automated commands to run and the success output or condition to expect;
- known expected failures or warnings, clearly separated from regressions;
- manual and visual checks with the route, action and expected result when UI or navigation changed;
- relevant desktop, mobile, keyboard or accessibility checks when they are affected;
- an explicit statement that no visual test is required when the change has no visible effect.

Do not use vague instructions such as “test the feature”. Keep the checklist proportionate to the PR. When the user reports a failure, diagnose and correct it in the same PR when appropriate, rerun the quality gate, and provide the updated validation procedure before requesting approval again.
