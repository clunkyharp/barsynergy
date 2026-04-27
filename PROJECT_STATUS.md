# BARSYNERGY Project Status

Last updated: 2026-04-27

## Current Branch

- Active branch: `dev`
- Production branch: `prod`
- Current work mode: `IMPLEMENTATION`

## Current Phase

Active phase: Phase 2 database and content admin implementation. Phase 1 public website MVP is complete for the current static public surface.

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

The current Prisma schema includes the foundation models:

- `User`;
- `Session`;
- `Profile`;
- `City`;
- `Category`;
- `Tag`;
- `UploadedFile`.

Phase 2 content models are now present in Prisma and backed by migration `20260427123417_phase2_content_models`:

- `Article`;
- `ArticleTag`;
- `Event`;
- `Course`;
- `Vacancy`;
- `Supplier`;
- `Partner`.

The `Application` model remains planned for Phase 3.

## Next Planned Work

1. Extend Phase 2 admin CRUD from articles/events to courses, vacancies, suppliers and partners.
2. Add public read queries for published content with pagination.
3. Prepare the Phase 3 mini-spec for applications, consent and notifications.
4. Keep production TLS, legal approval and production scheduler decisions as explicit blockers until owner input is available.

## Phase 2 Database Update

Completed on 2026-04-27:

- `ContentStatus` enum added with draft, review, published and archived states.
- Prisma models added for articles, events, courses, vacancies, suppliers and partners.
- Article tags use an explicit join table.
- Content models are related to existing city, category, tag, uploaded file and user records where applicable.
- Public-query indexes were added for status, publish date, city, category, sort order and key filters.

Validation:

- `./node_modules/.bin/prisma validate`;
- `./node_modules/.bin/prisma migrate status`;
- `npm run typecheck`.

## Phase 2 Admin Update

Completed on 2026-04-27:

- first article admin CRUD slice added at `/admin/articles`;
- first event admin CRUD slice added at `/admin/events`;
- admins and moderators can create articles and events;
- article and event lists show latest records with taxonomy, status and updater;
- publish and archive actions update publication status dates;
- deleting is limited to non-published articles and events.
- QA fixes keep existing `publishedAt` when archiving, validate article category/city references server-side and generate a unique slug when needed.
- shared admin content utilities now centralize status labels, slug handling and publication date transitions.

## Agent Workflow Update

Completed on 2026-04-27:

- project-local agent instructions now require a documentation and Kanban sync decision for every meaningful change;
- `docs/agent-workflow.md` and `docs/kanban-sync.md` now require either updating the relevant docs/board or explicitly stating why no update was needed.

Validation:

- `./node_modules/.bin/prisma validate`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`.

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
- Phase 2 database models are now implemented, so admin CRUD is the next implementation focus;
- admin section guards, storage boundary changes, upload size cap and session cleanup command are present in source and documented as completed safeguards;
- remaining blockers are unchanged: TLS ownership, production scheduler, legal review and future payment decision.

## Known Blockers

- Production TLS ownership is not confirmed.
- Production scheduler for expired session cleanup is not configured.
- Legal texts need owner/legal review before collecting personal data.
- Online payments are out of MVP scope and need a separate legal/accounting decision.
