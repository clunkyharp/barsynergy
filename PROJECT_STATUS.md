# BARSYNERGY Project Status

Last updated: 2026-05-04

## Current Branch

- Active branch: `codex/photo-reference-ui-redesign`
- Production branch: `prod`
- Current work mode: `IMPLEMENTATION`

## Current Phase

Active phase: Phase 4 auth and first business account is implemented for the current MVP contract. Phase 1 public website MVP is complete. Phase 2 content/admin work is implemented and runtime-verified for admin create flows, published-only public reads, upload boundaries, pagination and publish/archive behavior. Phase 3 covers the unified `Application` model, public forms, admin review, guarded employer-forwarding metadata, draft vacancy creation, private resume upload/download and optional SMTP/Telegram notifications when approved env config is present. Phase 4 covers email/password login, logout, reviewed business-access requests, admin-prepared one-time activation links, approved business accounts, blocking/reopening, editable business profile, business request drafts/submission/tracking and business-visible admin comments. Public personal-data forms remain disabled by default in production until `APPLICATION_FORMS_ENABLED=true` is explicitly set after legal approval.

Current local follow-up completed on the current preview branch:

- dark-theme UI consistency follow-up is applied locally on `codex/photo-reference-ui-redesign`: the header now uses separate light/dark logo assets instead of filter inversion, theme toggle/header spacing are tightened for `1280`, `1366` and `1440` widths, dark accent/button/chip/field/card surfaces are retokenized, homepage/sponsor/education/events/contacts/calculator/cookie notice issues from the UI audit are fixed, and forms on `/education` and `/events` now appear only after a selected course/event/proposal action; validation is green with `npm run lint`, `npm run typecheck` and a Playwright pass across `/`, `/education`, `/events`, `/general-sponsors`, `/tools/cost-calculator`, `/contacts`, `/auth/login` at `390x844`, `1280x900`, `1366x768`, `1440x813` in light/dark with reload persistence, no horizontal scroll and screenshots under `output/playwright/theme-audit-2026-05-04/final-pass`;
- homepage social cards are restored to the `prod` style on `/`, visible Russian copy received a focused `humanizer-ru` cleanup pass across public/legal/profile/admin-facing surfaces, and a persistent light/dark theme toggle is now available in the desktop header and mobile menu; validation is green locally: `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build`, and Playwright checks for social links, dark theme, mobile menu theme control and no horizontal overflow;
- photo-reference redesign branch is active after checkpoint commit `7e56434 chore: checkpoint current ui preview state` on `codex/barsynergy-ui-preview`; no push or deploy has been performed;
- photo-reference UI redesign is applied locally across public pages, auth, calculator, profile, business cabinet and admin shell/list/form surfaces: runtime keeps current routes, CMS/public queries, `GENERAL_SPONSORS` / Hustle Brew data, application actions, auth/session logic, storage, notifications and admin permissions;
- visual system is now synced around `Playfair Display + Manrope`, warm off-white backgrounds, burgundy actions/focus, soft beige surfaces, thin dividers, smaller card/button radii and subtle shadows in `src/app/globals.css`, shared UI primitives, `DESIGN.md` and `design-tokens.json`;
- public mockup-structure implementation is applied locally across `/`, `/events`, `/articles`, `/vacancies`, `/suppliers`, `/education`, `/partners`, `/general-sponsors`, `/tools/cost-calculator` and `/contacts`: the pages now follow the supplied layout hierarchy while keeping existing routes, public data flows, form actions and the current UI foundation;
- validation for the photo-reference redesign is green locally: secret scan, `git diff --check`, `npm run lint`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run typecheck`, `npm run build` and Playwright QA passed; Browser Use was unavailable in this session, so Playwright was used as the browser fallback;
- Playwright QA covered `/`, `/education`, `/events`, `/articles`, `/vacancies`, `/suppliers`, `/partners`, `/general-sponsors`, `/contacts`, `/tools/cost-calculator`, `/auth/login`, `/auth/register` at `390x844`, `768x1024`, `1280x900`, `1448x1086`, plus authenticated `/profile`, `/business`, `/business/requests`, `/admin`, `/admin/applications` and `/admin/articles` with local QA accounts;
- public UI-flow implementation from `docs/agent/ui-flow-research-qa-2026-05-03.md` is applied locally: event list registration now opens the selected event detail form with event title context, supplier and partner detail CTAs pass company/context into contacts, education and partner format cards prefill their request forms, sponsorship packages link to sponsor-specific contact context, the empty knowledge state now keeps two editorial CTAs, and the calculator has clearer zero/partial-input/result hints; Browser Use and Playwright QA confirmed context prefill and no horizontal overflow on the checked public routes;
- legal pages are now filled with project-specific working texts instead of short draft placeholders: `/legal/privacy`, `/legal/personal-data-consent`, `/legal/terms` and `/legal/cookies` describe the current contact, application, auth and business-access flows and still remain pending owner/legal review before production personal-data collection;
- legal operator data is now centralized in env-backed runtime fields so the public legal pages can switch from a legal entity to an individual entrepreneur without another route rewrite; production startup now blocks enabling public personal-data forms until operator name, email, address, INN and registration ID are filled;
- personal-data and confidentiality follow-up is applied locally: legal pages now spell out subjects, data categories, purposes, legal bases, processing actions, retention, employer transfer, processor/hosting caveats and RKN-readiness notes; production startup also requires operator address and explicit readiness flags before public forms can be enabled, public consent checkbox text links to both policy and consent, and a public technical-cookie notice is shown on non-workspace pages;
- personal-data launch checklist is now documented in `docs/personal-data-launch-checklist.md`, and the owner-facing action list is copied into the Obsidian BARSYNERGY folder;
- the design-system stabilization batch is completed locally: runtime font drift is fixed, semantic foundation tokens are expanded, and shared UI primitives now cover fields, checkbox rows, consent blocks, notices, segmented selectors, helper panels, status badges, editorial/public links, reusable list rows and admin CRUD tables;
- article full editing has been moved from the `/admin/articles` table to a dedicated `/admin/articles/[articleId]` screen so long article bodies are not rendered inside the list view;
- public application throttling now has a dedicated cleanup command: `npm run application:cleanup:throttles`.
- Phase 4 business-account MVP is implemented at source level: email/password login, logout, business-access request, admin approval/blocking, guarded `/business` cabinet, editable company profile and business request drafts/submission/tracking.
- after every large code batch or cross-module remediation, a dedicated `QA` code review pass is now required before the slice is treated as stable; the rule is recorded in `AGENTS.md`, `docs/agent-workflow.md` and `docs/audit-workflow.md`;
- the current local build is green again after aligning `next/font/google` subsets with the actual Google font metadata used by `bodyFont` and `displayFont`;
- business cabinet request validation now uses request-type-specific server-side schemas and payload shaping instead of one weak shared schema for all request types;
- admin draft deletion for articles, events, courses, vacancies, suppliers and partners now fails closed when the target draft is missing or already unavailable, instead of returning a false success state;
- public UI polish from browser review is applied: homepage feature illustrations use generated vector compositions instead of framed raster images, education/event cards are wider and shorter, community stats and site-section navigation are denser, the global background uses a softer grain/ambient treatment, and form consent checkboxes/focus states are aligned and neutral.
- homepage social entry cards are now added on `/`: Telegram, WhatsApp and Instagram each have their own promo surface with live external links and responsive layout.
- the homepage now includes the first named general sponsor block: Hustle Brew is presented with a local logo asset, concise supply profile, direct Instagram/WhatsApp links and a reusable data structure for future sponsor additions.
- homepage follow-up polish is applied locally: sponsor branding now uses the owner-provided Hustle Brew image instead of a generated placeholder, social CTA buttons now use `Перейти в ...` copy, social promo cards are denser on medium widths, and the public header switches to desktop navigation from `lg` instead of waiting for `xl`.
- homepage micro-copy follow-up is applied locally: mobile spotlight buttons now use shorter route-specific labels, the sponsor contacts heading is clearer, and sponsor social buttons have looser letter spacing for better readability on small screens.
- browser-tab branding is adjusted locally: the favicon and App Router icon now use the light BARSYNERGY mark so the tab icon stays legible against dark browser chrome.
- public follow-up consistency pass is applied locally across homepage/about/education/events/articles/suppliers: the homepage hero no longer keeps redundant section tags, medium-width social promos are denser, the Hustle Brew block uses a cleaner uncropped image treatment with calmer action spacing, repeated `Перейти к ...` CTA wording is aligned across public entry buttons, education fallback demo cards are removed, and shared public list rows now use one card-style surface without doubled divider lines near pagination.
- homepage spotlight cards are tightened into a denser editorial pattern: desaturated/grain-treated media, controlled featured-material typography, integrated metadata rows, calmer footer CTA blocks and a direct featured-article link replace the looser promo-style card structure.
- the `/general-sponsors` profile showcase is refined into a directory-style partner block: the left column now explains the catalog purpose, while sponsor cards expose city, role, specialization, metadata chips and a clearer partner-profile CTA instead of placeholder-style text panels.
- public homepage redesign batch is now applied locally: `/` has been rebuilt around live CMS-fed education/event/article/vacancy/supplier highlights, a new premium public shell, GSAP-driven narrative sections, a stronger B2B route for partners/sponsors and a shorter hero headline validated again on desktop/mobile after layout changes.
- public consistency batch is now applied locally across the main public screens: repeated public typography, section headers, filters, stat shells, content meta chips and form action rows are normalized around shared primitives, and the design-system docs/tokens now follow the runtime `Geist + Oswald + Outfit` contract instead of the older `Manrope` docs state.
- public listing sections that use the shared filter/list pattern are refined locally: the left filter rail is denser and sticky on desktop, embedded filters now support active chips/reset/mobile toggle, shared rows have calmer editorial hover states, and `/vacancies` now renders as a clearer opportunity board with company, format, pay and freshness metadata that can be scanned quickly.
- focused browser-comment stabilization is applied locally on `/vacancies`, `/general-sponsors` and `/`: the top vacancy stat panel is removed, page-position metadata now sits under the list, vacancy rows have a clearer surface against the page background, sponsor showcase cards no longer show the red top stripe or hover motion, homepage audience counters are removed, and the spotlight section heading is shortened to `Актуальное`.
- shared form UI is redesigned across public applications and auth screens: inputs, selects, textareas and checkboxes now use deeper editorial surfaces, stronger neutral focus states, explicit consent blocks and richer card shells with consistent action footers.
- auth, business and specialist-profile screens now sit closer to the same shared shell contract: `PageHeader`, action rows, panel usage, stat blocks and sidebar labels are normalized without changing the underlying account or application logic.
- focused Playwright smoke is now rerun for key public, auth, admin and business routes: route responses, `h1`, shell visibility and horizontal overflow are rechecked, the duplicated desktop `Кабинет` nav item is removed, and the low-contrast vacancies scenario card is fixed.
- admin consistency pass is now applied on the main workspace screens: the global admin header is calmer, key admin sections use one shared intro pattern, and placeholder taxonomy screens no longer fall back to an isolated header style.
- technical explanatory blocks were removed from admin and business screens where possible: phase/status helper paragraphs and service placeholders no longer render as pseudo-content, while forms and management actions remain unchanged.
- public pages and forms were reworded away from internal workflow language: copy no longer leans on admin-phase, moderation, publication-pipeline or placeholder explanations where those texts were not useful user content.
- public public-facing helper sections are trimmed further: featured/related content blocks no longer explain their own layout, while `/auth/login`, `/business/requests` and `/general-sponsors` now show action-oriented content without meta-descriptions of the page itself.
- demo content for client-facing screen review is now available through `npm run demo:seed:screens`, and the current local database is already populated with realistic mock vacancies, suppliers, applications, draft content and pending business-access examples for admin, vacancies, suppliers and general-sponsor review.
- auth, business-access and vacancy-request screens were cleaned further: `/auth/login`, `/auth/register`, `/business` and the business/public vacancy request forms now focus on the next user step instead of legal-process, moderation or queue-heavy explanations.
- homepage and auth polish follow-up is now applied locally: the homepage has a fixed scroll-to-top button, a new on-page `О проекте` block linked from the footer, calmer first-screen link hovers, denser one-row social cards, a rebuilt general sponsor card with copyable contacts, and `/auth/login` now has a direct way back to the homepage plus a separate right-side info panel.
- homepage browser-comment follow-up is now applied locally: the `О проекте` block no longer uses decorative chips or metric counters, the right-hand explanation cards now have direct CTA buttons, the `Для кого` section is explicitly titled and its action rows are vertically aligned, the sponsor block no longer duplicates Instagram/WhatsApp buttons or the extra lineup photo, and social cards now use integrated background icons instead of cropped square artwork.
- homepage social cards are refined locally again: Telegram, WhatsApp and Instagram now use dedicated local SVG brand marks as separate right-side background objects inside a shared `SocialCard` component, with calmer gradients, equal card height and safer text/logo separation on desktop and mobile.
- sponsor data is now unified between `/` and `/general-sponsors`: the separate sponsors page no longer shows test showcase entries and instead renders the same real `GENERAL_SPONSORS` records as the homepage.
- security remediation batch is applied locally: login and business-access registration now use persistent per-email/per-IP throttling, unknown-email login performs a dummy bcrypt comparison, upload validation checks file signatures, S3 uploads request AES256 server-side encryption, Nginx overwrites inbound forwarding headers and emits a baseline CSP.
- business-access activation remediation is applied locally: `/auth/register` stays request-only, admin application review can now prepare a one-time `/auth/activate` link, and the business owner sets the first password directly instead of receiving a pre-created password-bearing account.
- trusted ingress remediation is applied locally: production docs and Nginx now use one supported external-edge contract, and request identity resolves the first forwarded client IP instead of depending on an overwritten proxy hop.
- follow-up resilience batch is applied locally: admin content writes now retry cleanly on raced slug conflicts, and business-access invites now have a dedicated cleanup command for expired or old used tokens.
- scheduler maintenance runbook is now documented locally: expired sessions, public application throttles and business-access invites are described as one combined production cleanup job instead of separate scattered notes.
- production scheduler proof is now completed on the real host: `ssh.md` is confirmed as the repo source of truth for access, the app runs from `/opt/barsynergy` under `barsynergy.service`, and `barsynergy-cleanup.timer` now runs hourly with a verified manual pass for session/application cleanup on the current production revision.
- production runtime hotfix is now applied on the real host: `.next/standalone/.next` is rebuilt under the `barsynergy` user so Next can create its runtime cache again, and the deploy contract now includes a stable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` plus a release-specific deployment ID to reduce stale-client Server Action mismatches after deploys.
- production style/runtime hotfix is now applied on the real host: the standalone service was missing copied `public/` and `/_next/static` assets after host-side builds, so CSS and fonts returned `404`; the live host is fixed and repo `npm run build` now syncs those assets into `.next/standalone` automatically.
- standalone deploy guard is now part of the local build gate: after `next build`, the repo now syncs standalone assets and then boots `.next/standalone/server.js` in a smoke check that must return `200` for the homepage, one CSS asset, one font asset and one public asset before the build is considered green.
- public mobile/tunnel interaction hardening is applied locally: decorative homepage overlays no longer capture taps above the hero/header area, the public header sits on a stronger interaction layer, and external tunnel origins are now allowlisted for dev assets and Server Actions so menu/form checks are less likely to fail during ngrok-like mobile review.
- public trust cleanup is applied locally: the root loading screen no longer exposes a visible technical message, public filter fallbacks now use visual skeletons, education and partners got controlled empty states with clearer CTA paths, the homepage hero now routes into broader platform actions instead of a dead education-first CTA, and the contacts form uses a fixed topic selector instead of a free-text field.
- public UX pre-launch follow-up is now applied locally: empty education/articles/partners states are rebuilt as action-led pre-launch screens, shared filters now speak in section-specific language, homepage CTAs and availability proof are more concrete, vacancies now expose separate candidate/employer entry points plus the previously unused public application forms, suppliers and partners have direct company/application paths, sponsors now show tiered entry packages, and the contacts form switches to topic-specific fields instead of one generic message flow.
- separate public UI QA hardening is now applied locally after that follow-up: filter controls have explicit accessible labels and keep their route-specific guidance while active, desktop/mobile navigation and footer links expose visible keyboard focus states, internal pre-launch and package cards use calmer product-facing typography, the oversized footer CTA no longer competes with pages that already end in their own local form, suppliers now keep a visible `Добавить компанию` path even when the catalog is populated, and the vacancy application sidebar uses shorter copy that no longer breaks awkwardly in the narrow supporting column.
- local review/demo content is cleaned for public screens: the garbage published vacancy is removed from the current database, the event demo summaries are normalized, and city options are now taken from the same active database list across public filters and the contact form instead of diverging hardcoded values.
- public detail pages now follow a stronger shared editorial article pattern: articles, events, education, vacancies, suppliers and partners use a centered reference-style header, larger hero image, narrower reading column, utility sidebar and a calmer `read next` block instead of the older promo-like split hero.
- partner/sponsor copy cleanup and browser-comment follow-up are now applied locally: homepage CTA hover states keep readable light text, the public header grid no longer pushes nav/actions out of alignment on medium desktop widths, `/partners` now shows the current general sponsor block directly on the page, the `Hustle Brew` card is rebuilt as a calmer editorial partner profile with compact contact rows, social promo cards no longer let the large logo collide with the right-side divider treatment, and project-local agent rules explicitly fix simple human Russian plus the `humanizer-ru` cleanup principle for user-facing prose.
- mobile menu header follow-up is now applied locally: the burger/close control is one stable `MenuToggle` without a second overlay button, the open menu keeps the same mobile header shell for the logo and toggle, body scroll lock compensates scrollbar width to avoid header shift, and `Escape` plus `aria-expanded`/`aria-controls` continue to work on the shared control.
- UX audit remediation follow-up is now applied locally: Next dev allows `127.0.0.1` for in-app browser HMR, the mobile menu keeps closed links out of focus order, public/internal copy no longer exposes `MVP`/`food cost`/download promises where the action is a request, public forms show one explicit contact-channel group before submit, and business requests show type-specific preparation hints before the user writes details.
- cost calculator UX follow-up is now applied locally: ingredient rows use explicit package size and recipe amount labels, unit selectors for `мл`/`л`/`г`/`кг`/`шт`, unit compatibility validation, `л`→`мл` and `кг`→`г` normalization, correct visible division formulas, compact formula/example help, demo fill, clearer result states, mobile ingredient cards without horizontal overflow and a non-overlapping cookie notice on the calculator page.
- public/login style-alignment follow-up is now applied locally: the repeated footer contact CTA is removed, loaded public/auth routes no longer expose the loading fallback or old partner/sponsor labels in visible text or the browser accessibility tree, homepage now has `Сейчас в BARSYNERGY`, a stronger platform-entry card and a separate cost-calculator teaser, filtered-zero states are separated from true pre-launch empty states, article cards include publication date/read metadata, and mobile login prioritizes the form after the short brand intro.

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

Business-access invite activation is backed by migration `20260430225454_phase4_business_access_invites`:

- `BusinessAccessInvite`.

## Next Planned Work

1. Start Phase 5 filters/search/directory-quality work, including the separate service-specialist catalog, only after owner confirms the Phase 4 result is acceptable.
2. Keep owner/legal approval and Roskomnadzor/operator-readiness confirmation as blockers before enabling `APPLICATION_FORMS_ENABLED=true` in production.
3. Ship the current remediation release to `prod` so the deployed revision includes `business-access:cleanup:invites`; the live hourly timer already skips that step explicitly when the script is absent.
4. Verify the trusted external edge on the real production host before security sign-off.
5. Watch production logs after the next user-traffic window and confirm no new `EACCES` cache errors or fresh Server Action mismatch spikes appear after the hotfix.

## Phase 4 Business Account Implementation Update

Completed on 2026-04-28:

- `BusinessAccount` model and `BusinessAccountStatus` enum added.
- `UserRole.BUSINESS` added for approved business cabinet users.
- `ApplicationType.BUSINESS_ACCOUNT_REQUEST` added and linked to `BusinessAccount` through `Application.businessAccountId`.
- `/auth/login` now performs real email/password login with PostgreSQL sessions and httpOnly cookies.
- `/auth/register` now creates only a pending business-access request and linked admin-review application when public personal-data forms are enabled.
- `/admin/applications/[applicationId]` now lets admins prepare a one-time activation link for a reviewed business-access request.
- `/auth/activate` now lets the business owner set the first password and finish activation from that one-time link.
- `/admin/users` now lists business users and lets admins block access or reopen already prepared accounts.
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

- email-based password reset is deferred until production email is configured;
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
- the live host now runs one hourly cleanup timer, but the current production revision still lacks the business-access invite cleanup script from the newer local remediation batch;
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
- remaining blockers are now narrowed to trusted edge verification, legal review and future payment decision; the production cleanup timer is configured on the live host.

## Known Blockers

- Production TLS ownership is not confirmed.
- The live host timer is configured, but the current production revision still needs the next release before business-access invite cleanup can run there.
- Legal texts need owner/legal review before collecting personal data.
- Online payments are out of MVP scope and need a separate legal/accounting decision.
