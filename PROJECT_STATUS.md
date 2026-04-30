# BARSYNERGY Project Status

Last updated: 2026-04-30

## Current Branch

- Active branch: `dev`
- Production branch: `prod`
- Current work mode: `IMPLEMENTATION`

## Current Phase

Active phase: Phase 4 auth and first business account is implemented for the current MVP contract. Phase 1 public website MVP is complete. Phase 2 content/admin work is implemented and runtime-verified for admin create flows, published-only public reads, upload boundaries, pagination and publish/archive behavior. Phase 3 covers the unified `Application` model, public forms, admin review, guarded employer-forwarding metadata, draft vacancy creation, private resume upload/download and optional SMTP/Telegram notifications when approved env config is present. Phase 4 covers email/password login, logout, approved business accounts, admin approval/blocking, editable business profile, business request drafts/submission/tracking and business-visible admin comments. Public personal-data forms remain disabled by default in production until `APPLICATION_FORMS_ENABLED=true` is explicitly set after legal approval.

Current local follow-up completed on `dev`:

- the design-system stabilization batch is completed locally: runtime font drift is fixed, semantic foundation tokens are expanded, and shared UI primitives now cover fields, checkbox rows, consent blocks, notices, segmented selectors, helper panels, status badges, editorial/public links, reusable list rows and admin CRUD tables;
- article full editing has been moved from the `/admin/articles` table to a dedicated `/admin/articles/[articleId]` screen so long article bodies are not rendered inside the list view;
- public application throttling now has a dedicated cleanup command: `npm run application:cleanup:throttles`.
- Phase 4 business-account MVP is implemented at source level: email/password login, logout, business-access request, admin approval/blocking, guarded `/business` cabinet, editable company profile and business request drafts/submission/tracking.
- after every large code batch or cross-module remediation, a dedicated `QA` code review pass is now required before the slice is treated as stable; the rule is recorded in `AGENTS.md`, `docs/agent-workflow.md` and `docs/audit-workflow.md`;
- the current local build is green again after aligning `next/font/google` subsets with the actual Google font metadata used by `bodyFont` and `displayFont`;
- business cabinet request validation now uses request-type-specific server-side schemas and payload shaping instead of one weak shared schema for all request types;
- admin draft deletion for articles, events, courses, vacancies, suppliers and partners now fails closed when the target draft is missing or already unavailable, instead of returning a false success state;
- public UI polish from browser review is applied: homepage feature illustrations use generated vector compositions instead of framed raster images, education/event cards are wider and shorter, community stats and site-section navigation are denser, the global background uses a softer grain/ambient treatment, and form consent checkboxes/focus states are aligned and neutral.
- public homepage redesign batch is now applied locally: `/` has been rebuilt around live CMS-fed education/event/article/vacancy/supplier highlights, a new premium public shell, GSAP-driven narrative sections, a stronger B2B route for partners/sponsors and a shorter hero headline validated again on desktop/mobile after layout changes.
- public consistency batch is now applied locally across the main public screens: repeated public typography, section headers, filters, stat shells, content meta chips and form action rows are normalized around shared primitives, and the design-system docs/tokens now follow the runtime `Geist + Oswald + Outfit` contract instead of the older `Manrope` docs state.
- shared form UI is redesigned across public applications and auth screens: inputs, selects, textareas and checkboxes now use deeper editorial surfaces, stronger neutral focus states, explicit consent blocks and richer card shells with consistent action footers.
- auth, business and specialist-profile screens now sit closer to the same shared shell contract: `PageHeader`, action rows, panel usage, stat blocks and sidebar labels are normalized without changing the underlying account or application logic.
- focused Playwright smoke is now rerun for key public, auth, admin and business routes: route responses, `h1`, shell visibility and horizontal overflow are rechecked, the duplicated desktop `Кабинет` nav item is removed, and the low-contrast vacancies scenario card is fixed.
- admin consistency pass is now applied on the main workspace screens: the global admin header is calmer, key admin sections use one shared intro pattern, and placeholder taxonomy screens no longer fall back to an isolated header style.
- technical explanatory blocks were removed from admin and business screens where possible: phase/status helper paragraphs and service placeholders no longer render as pseudo-content, while forms and management actions remain unchanged.
- public pages and forms were reworded away from internal workflow language: copy no longer leans on admin-phase, moderation, publication-pipeline or placeholder explanations where those texts were not useful user content.
- demo content for client-facing screen review is now available through `npm run demo:seed:screens`, and the current local database is already populated with realistic mock vacancies, suppliers, applications, draft content and pending business-access examples for admin, vacancies, suppliers and general-sponsor review.
- auth, business-access and vacancy-request screens were cleaned further: `/auth/login`, `/auth/register`, `/business` and the business/public vacancy request forms now focus on the next user step instead of legal-process, moderation or queue-heavy explanations.
- security remediation batch is applied locally: login and business-access registration now use persistent per-email/per-IP throttling, unknown-email login performs a dummy bcrypt comparison, upload validation checks file signatures, S3 uploads request AES256 server-side encryption, Nginx overwrites inbound forwarding headers and emits a baseline CSP.
- public mobile/tunnel interaction hardening is applied locally: decorative homepage overlays no longer capture taps above the hero/header area, the public header sits on a stronger interaction layer, and external tunnel origins are now allowlisted for dev assets and Server Actions so menu/form checks are less likely to fail during ngrok-like mobile review.

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
- general sponsors;
- contacts;
- legal pages;
- shared header and footer;
- route-level loading, error and not-found states;
- responsive public-page layout patterns;
- editorial design-system foundation;
- separate `/general-sponsors` screen with visible homepage and navigation entry points.
- redesigned live-data homepage with GSAP motion and updated public shell.

Completed Phase 1 validation:

- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `./node_modules/.bin/prisma validate`;
- HTTP smoke for all public routes;
- desktop and mobile homepage screenshot spot check with Playwright;
- desktop/mobile shell safety check confirms the public header/footer stay hidden on `/auth/*`;
- mobile menu open and `Esc` close check.
- focused browser smoke for public, auth, admin and business key routes with updated screenshot review on `/vacancies` and `/admin/articles`.

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

Phase 4 business-account foundation is backed by migration `20260428153000_phase4_business_account_foundation`:

- `BusinessAccount`;
- `BusinessAccountStatus`;
- `UserRole.BUSINESS`;
- `ApplicationType.BUSINESS_ACCOUNT_REQUEST`;
- optional `Application.businessAccountId`.

Phase 4 business request management is backed by migration `20260428170000_phase4_business_request_management`:

- `ApplicationStatus.DRAFT`;
- `Application.businessNotes`.

Auth attempt throttling is backed by migration `20260430120000_auth_attempt_throttle`:

- `AuthAttemptThrottle`.

## Next Planned Work

1. Start Phase 5 filters/search/directory-quality work, including the separate service-specialist catalog, only after owner confirms the Phase 4 result is acceptable.
2. Keep legal approval as a blocker before enabling `APPLICATION_FORMS_ENABLED=true` in production.
3. Configure production scheduler tasks for expired-session cleanup and public application throttle cleanup when production access is available.
4. Keep production TLS as an explicit blocker until owner input is available.

## Phase 4 Business Account Implementation Update

Completed on 2026-04-28:

- `BusinessAccount` model and `BusinessAccountStatus` enum added.
- `UserRole.BUSINESS` added for approved business cabinet users.
- `ApplicationType.BUSINESS_ACCOUNT_REQUEST` added and linked to `BusinessAccount` through `Application.businessAccountId`.
- `/auth/login` now performs real email/password login with PostgreSQL sessions and httpOnly cookies.
- `/auth/register` now creates a pending business-access request, pending business user, pending business account and linked admin-review application when public personal-data forms are enabled.
- `/admin/users` now lists business users and lets admins open or block business access.
- `/business` is guarded for active business users and lets businesses edit company profile data.
- `/business/requests` lets active businesses create request drafts or submit requests for vacancy placement, supplier placement, partner application, corporate training and certificate order.
- `/business/requests/[applicationId]` lets businesses view only their own requests, edit drafts, submit drafts for admin review or archive drafts.
- admin application detail now has a business-visible comment field.
- `/auth/login` supports logout redirects and pending/blocked access messages.

Validation completed on 2026-04-29:

- `./node_modules/.bin/prisma format`;
- `./node_modules/.bin/prisma validate`;
- `./node_modules/.bin/prisma generate`;
- `npm run prisma:migrate:deploy`;
- `npm test`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`.

Remaining Phase 4 caveats:

- password reset and email invite acceptance are deferred until production email is configured;
- business users still cannot publish public content directly;
- candidate personal data remains hidden from business accounts unless a future admin-forwarding view is explicitly implemented after legal/product approval.

## Services Catalog Planning Update

Completed on 2026-04-28:

- owner direction captured: services are a separate module, not part of suppliers;
- public route is planned as `/services`;
- admin route is planned as `/admin/services`;
- new catalog entity is planned as `ServiceSpecialist`;
- public entry into the catalog must start as `Application(type = service_specialist_submission)`;
- publication stays admin-moderated;
- specialist personal cabinet is out of scope for the first version;
- implementation is placed in Phase 5 so it does not interrupt the Phase 4 business-account plan;
- implementation contract is documented in `docs/services-specialists-spec.md`.

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
- Vacancy placement creates `Application(type = vacancy_submission, status = new)` with consent, UTM capture and the fixed MVP position list: `Бариста`, `Управляющий`, `Менеджер`.
- Vacancy response creates `Application(type = vacancy_response, status = new)` linked only to a published vacancy and can store a private resume file or resume URL.
- Public response form is disabled when no published vacancies exist.
- Admin `/admin/applications` now shows a paginated, filterable queue without exposing full contact data in table rows.
- Admin `/admin/applications/[applicationId]` shows protected application detail, full private fields, payload, consent data, status controls, internal notes and an admin-only resume download endpoint.
- Marking an application as `forwarded_to_employer` is allowed only for consented vacancy responses and records `forwardedAt` and `forwardedById`; moving away from that status clears forwarding metadata.
- Admin can create a draft `Vacancy` from a `vacancy_submission` application; the application is linked to the draft and marked `approved`, while publication stays manual in `/admin/vacancies`.
- Additional public forms now write to `Application` from `/education`, `/events`, `/suppliers`, `/partners` and `/contacts`: `course_application`, `corporate_training_application`, `certificate_order`, `event_application`, `supplier_submission`, `partner_application` and `contact_message`.
- When `SMTP_*` is configured, user confirmation emails are sent after successful public submission. When `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` are configured, admins receive a short Telegram notification without full personal data.
- Public application throttles now have a cleanup command: `npm run application:cleanup:throttles`.
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
- production scheduler for application throttle cleanup is not configured yet;
- notification providers still require real production SMTP/Telegram credentials before they can send outside local testing;

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

Current local adjustment on 2026-04-28:

- article list rows now link to `/admin/articles/[articleId]` for full editing so long article bodies do not bloat the list table render;
- article body validation now caps input at `20_000` characters on create and update to match the admin form constraint.

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
