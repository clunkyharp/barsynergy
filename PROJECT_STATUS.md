# BARSYNERGY Project Status

Last updated: 2026-06-19

## Current Branch

- Active branch: `prod` (ahead 3 of `origin/prod`)
- Dirty files before this docs batch: Pre-7.1 implementation and docs updates
- Work mode: `IMPLEMENTATION` Pre-7.1 public content discovery and data QA

## Current Phase

Phase 1-4 MVP foundation implemented:

- Phase 1 — public website MVP;
- Phase 2 — content/admin CMS for current MVP;
- Phase 3 — unified `Application` flows + public forms;
- Phase 4 — auth + business account cabinet;
- Phase 5 — service/specialist catalog, search, directory quality — not started.

Public personal-data forms remain disabled by default in production until `APPLICATION_FORMS_ENABLED=true`.

## Current Validation Snapshot

- `npm run lint` — pass;
- `npm run typecheck` — pass;
- `./node_modules/.bin/prisma validate` — pass;
- `npm run build` — pass (last batch);
- `npm test` — pass, 348/348;
- Pre-7.1 targeted tests — pass: article rubric/discovery, search/listing consistency, supplier inquiry/contact contract;
- Pre-7.1 browser smoke — pass on local dev server at desktop and mobile widths: `/articles`, `/events?city=makhachkala`, `/suppliers/hustle-brew`;
- T3 markdown quality source test — pass.

## Open Items / Backlog

- Completed 2026-06-19:
  - Pre-7.1 T1 articles rubric sub-grids and topic proposal empty-state CTA;
  - Pre-7.1 T2 event city tabs and city-specific empty state actions;
  - T3 espresso article markdown cleanup plus published-materials seed audit;
  - Pre-7.1 T4 supplier contact rows and supplier request CTA;
  - validation cleanup: `npm run lint` pass and `npm test` pass after import/seed/homepage lint cleanup and article featured-card aspect marker restoration;
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

1. Start Phase 5 only from a fresh implementation batch with its own mini-spec.
2. Before release work, create a clean checkpoint and keep `dev -> prod` flow explicit.

## Historical Notes

Detailed prior status logs archived to:

- `docs/archive/project-status-history-2026-05-22.md`
- `docs/archive/project-status-history-2026-06-18.md`

Those archives are historical context only, not the active task queue.
