# BARSYNERGY Project Status

Last updated: 2026-04-28

## Current Branch

- Active branch: `dev`
- Production branch: `prod`
- Current work mode: `IMPLEMENTATION`

## Current Phase

Active phase: Phase 3 implementation has started. Phase 1 public website MVP is complete. Phase 2 content/admin scope is implemented and runtime-verified for admin create flows, public published-only reads, upload boundary, pagination and publish/archive behavior. The first Phase 3 vacancy application slice is implemented: `Application` schema foundation, `vacancy_submission`, `vacancy_response`, public vacancy forms, admin application list/detail, status processing, guarded manual employer-forwarding status metadata and draft vacancy creation from vacancy placement requests. Public personal-data forms are disabled by default in production until `APPLICATION_FORMS_ENABLED=true` is explicitly set. Business-account direction is captured in `docs/business-account-spec.md`.

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

Phase 3 application models are now present in Prisma and backed by migration `20260428102117_phase3_applications_foundation`:

- `Application`;
- `ApplicationType`;
- `ApplicationStatus`.

Phase 3 public submission throttling is backed by migration `20260428123000_phase3_application_guards`:

- `ApplicationSubmissionThrottle`.

## Next Planned Work

1. Continue Phase 3 with the next bounded applications slice: remaining public forms, notifications or private resume handling should be separate batches.
2. Keep the first account/cabinet implementation business-only according to `docs/business-account-spec.md`.
3. Keep legal approval as a blocker before enabling `APPLICATION_FORMS_ENABLED=true` in production.
4. Keep production TLS and production scheduler decisions as explicit blockers until owner input is available.

## Business Account Planning Update

Completed on 2026-04-28:

- owner decision captured: the first private cabinet is for businesses only;
- candidate, student, community-member and general user profiles are deferred, but remain documented as a later product direction;
- business registration direction is request/application first, admin approval second, login access third;
- business cabinet capabilities are documented separately in `docs/business-account-spec.md`.

## Phase 3 Applications Planning Update

Completed on 2026-04-27:

- Phase 3 mini-spec drafted for the unified `Application` model and public application forms;
- vacancy placement is planned as `vacancy_submission`, where a business sends a request and admin publishes the final `Vacancy`;
- vacancy responses are planned as `vacancy_response`, linked to a published vacancy and reviewed by admin before employer transfer;
- candidate resume data remains private application data in MVP, not a reusable public profile;
- employer forwarding is an admin action and must not happen automatically before review and explicit candidate consent.

## Phase 3 Vacancy Applications Implementation Update

Completed on 2026-04-28:

- `ApplicationType` and `ApplicationStatus` enums added.
- `Application` model added with subject, message, contact fields, city/vacancy/resume relations, consent timestamp/text, UTM fields, forwarding metadata, internal notes and indexes.
- Public `/vacancies` now includes two Phase 3 forms: vacancy placement request and vacancy response to a published vacancy.
- Production rendering of these forms is gated by `APPLICATION_FORMS_ENABLED`; omitted production value disables them by default.
- Public form actions include a honeypot and per-client rate limit backed by `ApplicationSubmissionThrottle`.
- Vacancy placement creates `Application(type = vacancy_submission, status = new)` with consent and UTM capture.
- Vacancy response creates `Application(type = vacancy_response, status = new)` linked only to a published vacancy.
- Public response form is disabled when no published vacancies exist.
- Admin `/admin/applications` now shows a paginated, filterable queue without exposing full contact data in table rows.
- Admin `/admin/applications/[applicationId]` shows protected application detail, full private fields, payload, consent data, status controls and internal notes.
- Marking an application as `forwarded_to_employer` is allowed only for consented vacancy responses and records `forwardedAt` and `forwardedById`; moving away from that status clears forwarding metadata.
- Admin can create a draft `Vacancy` from a `vacancy_submission` application; the application is linked to the draft and marked `approved`, while publication stays manual in `/admin/vacancies`.
- Local public uploads under `STORAGE_DRIVER=local` are served through `/uploads/...` only when an `UploadedFile` record is public.
- Replaced or failed admin cover uploads are cleaned up when no content record references the uploaded file.
- Temporary browser-smoke data was created and cleaned up.

Validation:

- `./node_modules/.bin/prisma validate`;
- `./node_modules/.bin/prisma migrate deploy`;
- `npm test`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- authenticated HTTP smoke for `/admin/applications`;
- Playwright browser smoke: public vacancy placement form created an application, public vacancy response form created an application, admin detail opened, status changed to `forwarded_to_employer` with forwarding metadata.

Remaining Phase 3 gaps:

- legal text still needs owner/legal review before `APPLICATION_FORMS_ENABLED=true` is allowed in production;
- remaining application forms are not implemented yet;
- private resume file upload is not implemented yet;
- user confirmation notifications and Telegram/admin notifications are not implemented yet;

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
- first course admin CRUD slice added at `/admin/courses`;
- first vacancy admin CRUD slice added at `/admin/vacancies`;
- first supplier admin CRUD slice added at `/admin/suppliers`;
- first partner admin CRUD slice added at `/admin/partners`;
- admins and moderators can create articles, events, courses, vacancies, suppliers and partners;
- article, event, course, vacancy, supplier and partner lists show latest records with taxonomy, status and updater;
- publish and archive actions update publication status dates;
- deleting is limited to non-published articles, events, courses, vacancies, suppliers and partners.
- QA fixes keep existing `publishedAt` when archiving, validate article category/city references server-side and generate a unique slug when needed.
- shared admin content utilities now centralize status labels, slug handling and publication date transitions.

## Phase 2 Admin UX Follow-up Update

Completed on 2026-04-27:

- admin article, event, course, vacancy, supplier and partner lists now use page-based pagination instead of fixed `take: 50` lists;
- each Phase 2 content section now has an inline edit form for existing records;
- create and edit forms now include a public cover image upload slot wired through `StorageService` and `UploadedFile.visibility = public`;
- admin actions now redirect back with success/error messages instead of surfacing raw validation exceptions;
- upload handling is shared between the form actions and `/admin/uploads/content-image`;
- `.gitignore` now ignores only root runtime `/uploads`, so `src/app/admin/uploads/content-image/route.ts` can be tracked.

Validation:

- `./node_modules/.bin/prisma validate`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- HTTP smoke: unauthenticated `POST /admin/uploads/content-image` returned JSON `401`.

## Phase 2 Public Read / Upload Update

Completed on 2026-04-27:

- public pages for articles, events, education, vacancies, suppliers and partners now read only `published` records;
- public lists use pagination with a default page size of 12 and maximum page size of 24;
- public read helpers support basic query/filter parameters for search, taxonomy and entity-specific fields;
- public list pagination preserves active query/filter parameters;
- empty public lists render without throwing;
- public content images are resolved only from `UploadedFile.visibility = public`;
- `/admin/uploads/content-image` accepts authenticated admin/moderator public image uploads through `StorageService`;
- upload route allowlists JPEG, PNG, WebP and AVIF and enforces `MAX_UPLOAD_FILE_SIZE_BYTES`.
- unauthenticated upload requests return JSON `401`, and forbidden roles return JSON `403`.

## Phase 2 Review Update

Completed on 2026-04-27:

- schema, admin CRUD slices, public reads, upload boundary, docs and Kanban were reviewed against `docs/phase-2-content-admin-spec.md`;
- public read pagination now preserves active query/filter parameters;
- upload API auth boundary now returns JSON `401/403` instead of an HTML redirect for the upload endpoint;
- follow-up gaps were implemented at source level: edit forms, image upload slots, admin list pagination and admin action validation/error states.

Validation:

- `./node_modules/.bin/prisma validate`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- HTTP smoke: `/articles`, `/events`, `/education`, `/vacancies`, `/suppliers`, `/partners`, `/articles?q=test&page=2` returned `200`;
- HTTP smoke: unauthenticated `POST /admin/uploads/content-image` returned JSON `401`.

## Phase 2 Final QA Update

Completed on 2026-04-27:

- removed runtime warnings from Phase 2 admin forms by letting React Server Actions control form encoding automatically;
- added the Next.js `data-scroll-behavior="smooth"` root attribute required by the existing global smooth-scroll CSS;
- authenticated admin browser smoke created and cleaned up one article, event, course, vacancy, supplier and partner through real admin forms;
- article cover upload through the admin form created a public `UploadedFile` and was cleaned up after verification;
- publish/archive smoke confirmed a published article appears on `/articles` and disappears from the public list after archiving;
- temporary smoke users, sessions, content records and upload files were cleaned up.

Validation:

- `./node_modules/.bin/prisma validate`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- HTTP smoke: `/`, `/articles`, `/events`, `/education`, `/vacancies`, `/suppliers`, `/partners`, `/articles?q=test&page=2` returned `200`;
- unauthenticated `POST /admin/uploads/content-image` returned JSON `401`;
- authenticated admin pages `/admin`, `/admin/articles`, `/admin/events`, `/admin/courses`, `/admin/vacancies`, `/admin/suppliers`, `/admin/partners` returned `200`;
- authenticated `POST /admin/uploads/content-image` accepted PNG and returned a public file reference;
- Playwright admin form smoke passed for all Phase 2 content sections;
- Playwright publish/archive smoke passed for public article visibility.

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
