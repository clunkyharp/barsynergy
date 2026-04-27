# BARSYNERGY Project Status

Last updated: 2026-04-27

## Current Branch

- Active branch: `dev`
- Production branch: `prod`
- Current work mode: `QA`

## Current Phase

Active phase: Phase 2 implementation readiness. Phase 1 public website MVP is complete for the current static public surface.

Phase 0 is implemented as the technical foundation:

- Next.js App Router project;
- TypeScript and Tailwind CSS;
- Prisma with PostgreSQL foundation schema;
- Docker Compose setup;
- env validation;
- base auth and storage services;
- admin shell;
- public route structure;
- project documentation.

## Phase 1 Status

Phase 1 public surface is implemented and smoke-verified:

- home;
- about;
- education;
- events;
- articles;
- vacancies;
- suppliers;
- partners;
- contacts;
- legal pages;
- shared header and footer;
- route-level loading, error and not-found states;
- responsive public-page layout patterns;
- editorial design-system foundation.

Completed Phase 1 validation:

- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `./node_modules/.bin/prisma validate`;
- HTTP smoke for all public routes;
- desktop and mobile homepage screenshot spot check with Playwright;
- mobile menu open and `Esc` close check.

Phase 1 remaining caveat:

- legal text still needs owner/legal review before collecting personal data.

## Current Runtime Schema

The current Prisma schema is still foundation-only:

- `User`;
- `Session`;
- `Profile`;
- `City`;
- `Category`;
- `Tag`;
- `UploadedFile`.

Content and application models are planned for later phases.

## Next Planned Work

1. Implement Phase 2 Prisma models from `docs/phase-2-content-admin-spec.md`.
2. Build Phase 2 admin CRUD by section.
3. Prepare the Phase 3 mini-spec for applications, consent and notifications.
4. Keep production TLS, legal approval and production scheduler decisions as explicit blockers until owner input is available.

## Architecture Readiness Update

Completed on 2026-04-26:

- Phase 2 content/admin mini-spec added.
- Admin section permission map added.
- Admin pages now require section-level access.
- Storage public URL contract now accepts only public file references.
- Uploads have a fixed maximum file size before real upload routes are exposed.

Validation:

- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `./node_modules/.bin/prisma validate`;
- unauthenticated `/admin/users` redirect smoke.

## QA / Review Update

Completed on 2026-04-26:

- admin guard, section permissions, storage path safety and session cleanup were reviewed against `docs/remediation-plan.md`;
- public visual system was checked on production preview with desktop and mobile screenshots for home, about, education, events, articles, vacancies, suppliers, partners and contacts;
- README and docs were compared with `package.json`, Prisma schema, env examples, Docker Compose and Nginx config.

Validation:

- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `./node_modules/.bin/prisma validate`;
- `npm run session:cleanup:expired`;
- HTTP smoke for public routes;
- unauthenticated `/admin/users` redirect returned `307` to `/auth/login`;
- Playwright screenshot QA on `http://127.0.0.1:3002` with no horizontal overflow and no public `Phase` / `MVP` / `placeholder` text.

## Documentation / Kanban Sync Update

Completed on 2026-04-27:

- project docs, Phase 2 mini-spec, remediation plan and Obsidian Kanban were compared with current source files;
- current runtime schema is still foundation-only, so Phase 2 database models remain the next implementation focus;
- admin section guards, storage boundary changes, upload size cap and session cleanup command are present in source and documented as completed safeguards;
- remaining blockers are unchanged: TLS ownership, production scheduler, legal review and future payment decision.

## Known Blockers

- Production TLS ownership is not confirmed.
- Production scheduler for expired session cleanup is not configured.
- Legal texts need owner/legal review before collecting personal data.
- Online payments are out of MVP scope and need a separate legal/accounting decision.
