# BARSYNERGY Project Status

Last updated: 2026-06-18

## Current Branch

- Active branch: `prod` (ahead 3 of `origin/prod`)
- Dirty files: `src/app/(public)/business/page.tsx`, `src/app/(public)/contacts/page.tsx`
- Work mode: branch not set in this session

## Current Phase

Phase 1-4 MVP foundation implemented:

- Phase 1 — public website MVP;
- Phase 2 — content/admin CMS for current MVP;
- Phase 3 — unified `Application` flows + public forms;
- Phase 4 — auth + business account cabinet;
- Phase 5 — service/specialist catalog, search, directory quality — not started.

Public personal-data forms remain disabled by default in production until `APPLICATION_FORMS_ENABLED=true`.

## Current Validation Snapshot

- `npm run lint` — pass (last batch);
- `npm run typecheck` — pass (last batch);
- `./node_modules/.bin/prisma validate` — pass;
- `npm run build` — pass (last batch);
- `npm test` — mix of pass/fail; stale source-contract tests remain.

## Open Items / Backlog

- Supplier content editorial policy;
- Ratings/reviews for suppliers;
- Contrast check on editorial-dark-muted (verify live);
- Glassmorphism vs design-system alignment;
- Confirmation that production scheduler is configured for session cleanup and notification retry;
- Owner decision on mobile admin read-only/actions;
- DB-backed public visual rechecks before release sign-off;
- Search Console / Метрика indexing confirmation.

## Active Blockers / Risks

- Owner/legal review required before production personal-data collection;
- Production SMTP/Telegram credentials needed for real notifications;
- Production ingress needs real-host sign-off (HTTP→HTTPS, X-Real-IP, header rejection);
- `references/` is gitignored moodboard material — not to be merged to `prod`;
- Production deploy needs a release checkpoint commit pushed to `dev` and fast-forwarded into `prod`.

## Next Recommended Steps

1. Triage remaining failing source-contract tests on `dev`.
2. Create checkpoint commit for current dirty tree, then prepare next stabilization or release slice.

## Historical Notes

Detailed prior status logs archived to:

- `docs/archive/project-status-history-2026-05-22.md`
- `docs/archive/project-status-history-2026-06-18.md`

Those archives are historical context only, not the active task queue.
