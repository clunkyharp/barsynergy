# BARSYNERGY Project Status

Last updated: 2026-06-14 (Newsletter modal MVP — email double opt-in)

## Newsletter Modal MVP (2026-06-14)

Applied in this batch:

- email-only newsletter subscription model added with selected `NotificationTopic[]`, hashed confirm/unsubscribe tokens, optional `userId`, consent text, confirmation and unsubscribe timestamps;
- double opt-in flow added through `/newsletter/confirm/[token]`, with one-click unsubscribe route at `/newsletter/unsubscribe/[token]`;
- public newsletter modal added with topic checkboxes, email field for guests, hidden email for authenticated users, consent checkbox and in-modal success state;
- anti-annoy trigger added on public footer mount: 30s time-on-site or 50% scroll, no workspace/auth/profile/business-cabinet pages, no `?application=*` pages, one show per session, 7-day remind-later, 30/180-day dismiss cooldown and hard opt-out after 3 dismissals;
- authenticated users with an existing email subscription are excluded from the trigger server-side;
- SMTP confirmation email reuses the existing SMTP env contract; no new provider or dependency was added.

Validation snapshot:

- `node --test tests/newsletter-modal-contract.test.mjs` passes (5/5);
- `./node_modules/.bin/prisma validate` passes;
- `npm run prisma:generate` passes;
- `npm run lint` passes;
- `npm run typecheck` currently fails on pre-existing unrelated `src/app/profile/saved-vacancies/page.tsx` action return typing (`Promise<{ type; message }>` passed to a form action expecting `Promise<void>`). Newsletter-specific source checks are green.
- HTTP smoke for `http://localhost:3001/legal/privacy` returns 200 from the existing dev server; visual browser smoke was not completed because the in-app Browser was unavailable and Playwright Chromium launch is blocked by the local macOS sandbox (`MachPortRendezvousServer` permission error).

Out of scope:

- weekly digest scheduler and email template generation;
- analytics provider integration beyond temporary `console.info` events;
- web-push integration and profile settings for email/push channels;
- CTA A/B tests.

## Cabinets UX Audit Remediation (2026-06-12)

Source: `docs/ux-audit-2026-06-12-deep.md`.

Applied in this batch:

- profile overview no longer duplicates the sidebar avatar or the repeated responses/saved/settings/vacancies action row, and now shows KPI tiles for active responses, unread messages and saved vacancies;
- profile response list/detail pages no longer repeat the known `Отклик на вакансию` type chip;
- `ProfileProgressRing` now has an accessible label;
- business cabinet overview now shows a compact company profile summary instead of the full edit form;
- full business profile editing moved to `/business/cabinet/settings`, and save redirects back to that settings route;
- business request creation has a stable `/business/cabinet/requests#new-request` anchor;
- A5 — `updateBusinessProfile` converted to `useActionState`, no full-page redirect, no draft loss; flash-сообщения inline;
- P0-1 — profile settings forms now use `useActionState`, return inline save/error results and keep short-lived local drafts instead of redirecting through query flash messages;
- P0-4 — `/business` and `/about` anti-proof copy now avoids unsupported facts, fake counters and manual-review claims where no authoritative metric source is wired;
- S2 skills — `SkillsSelector` converted from preset checkboxes to tag-input with autocomplete, custom skill creation and `Skill.source = USER_GENERATED`;
- S2 skills moderation — `/admin/skills` now has a user-generated source filter and marks custom skills as `На модерации`;
- S2 settings accordion — profile settings sections now use persisted native `<details>` panels with `localStorage: profile-section-open`, reducing the seven-section scroll wall without changing form actions;
- S2 settings accordion follow-up — profile settings now uses the shared `DisclosurePanel`; tabs and URL hashes open collapsed sections, inline action errors reopen their section, and successful saves render through `FieldSuccess`;
- S2 notifications empty-state — notification settings now distinguish an unsubscribed browser from browser-denied notification permission and show a separate recovery state;
- S2 next action panel — business profile check now keeps the `готово` state briefly, then auto-hides after a 7-day grace period when the company profile remains complete;
- S2 design-system polish — local business dashboard welcome/KPI/archive surfaces now use the shared `Panel` primitive instead of one-off border/background shells, and business cabinet eyebrow labels now use the shared `Eyebrow` primitive;
- S2 design-system follow-up — the homepage hero overlay gradient now lives in `public.css` as `home-hero-gradient` instead of inline JSX background style;
- DS-7/UX-10 polish — profile KPI tiles are covered as `AppLink` surfaces, and the homepage secondary live block now has a distinct `Разделы для работы` angle instead of duplicating `Актуальное`;
- S1 conversation follow-up — profile/business conversation lists now promote unread items within the current page, and profile responses empty-state copy no longer warns about guest responses;
- S1/S2 conversation tabs — profile/business response and request lists now use `Активные / Закрытые / Архив` tabs backed by shared status groups instead of 7-status dropdowns;
- S3 password policy — register/reset/activate/profile password-setting flows now share 10-character minimum copy and run HIBP Pwned Passwords k-anonymity checks before hashing;
- S3 accessibility polish — profile and business cabinet action CTAs now use 44px targets, the profile progress panel stacks before `md`, and hidden active profiles can be opened from an inline one-click CTA;
- S4 copy cleanup — homepage hero/live section, business catalog copy, auth login/register, profile completion, contact form and business catalog form now use simpler literal Russian copy without duplicate «карточки» framing or generic SaaS phrases;
- S4 metrics — `docs/ux-audit-measurement.md` now defines provider-neutral formulas and DOM hooks for time to first profile save, profile completion before/after and supplier application drop-off without enabling analytics;
- UX-8 contact form refactor — topic-specific message labels, detail titles and hints now live in `contact-application-form-constants.ts` instead of JSX ternary ladders;
- S1 avatar cropper — profile avatar upload now uses a client cropper with circular preview and exports 512×512 JPEG before the existing `updateAvatar` action;
- source-level regression tests added in `tests/cabinets-ux-audit.test.mjs`.

Validation snapshot for this batch:

- `node --test tests/cabinets-ux-audit.test.mjs` passes (22/22);
- `node --test tests/cabinets-ux-audit.test.mjs tests/vacancy-response-contract.test.mjs tests/homepage-live-grid-contract.test.mjs` passes (32/32);
- `git diff --check` passes;
- `npm run lint` passes;
- targeted ESLint for the latest touched files passes;
- `./node_modules/.bin/prisma validate` passes;
- `npm run typecheck` passes.
- `npm test` still fails in broad, unrelated historical source-contract suites outside this UX-audit batch, including admin/auth/calculator/public-page contracts; targeted UX-audit validation above is green.

Remaining from the 2026-06-12 audit:

- Analytics provider integration, event storage, dashboards and target windows remain out of scope until an owner/legal/product decision is made.

## Architecture Audit Remediation (2026-06-11)

A structured audit identified 10 high/medium findings. This batch is working through the 5-step refactoring plan. Steps 1-3 applied; QA pass found remaining issues below.

**Applied so far:**

**Step 1 — Baseline fixes:**
- `published-content-row-directory.tsx` recreated
- `toggleSavedVacancy()` revalidatePath fixed to slug-based
- `removeSavedVacancyAction()` returns `{ type, message }` instead of swallowing errors
- `PROJECT_STATUS.md` corrected for auth lifecycle (PENDING+verification, not ACTIVE)

**Step 2 — Data layer closed:**
- `export { prisma }` removed from `modules/admin/queries.ts`
- `lib/admin/admin-queries.ts` created (~540 lines) with dashboard, common selectors, all entity CRUD queries — uses Prisma enums, not string literals
- All 30+ admin page.tsx/layout.tsx migrated from facade import to domain query functions

**Step 3 — Monoliths split:**
- `profile/actions.ts`: 570→16 lines. Split into `basic-profile-actions.ts`, `job-search-actions.ts`, `work-experience-actions.ts`, `avatar-actions.ts`, `skills-actions.ts`, `password-actions.ts`
- `business/actions.ts`: 407→18 lines. Split into `profile-actions.ts`, `application-actions.ts`
- `updateBusinessDraftApplication` changed from "scoped read + naked write" to scoped `updateMany` with ownership in where clause

**Step 4 — Runtime defects:**
- `toggleSavedVacancy` slug-based revalidation (was `/vacancies/${id}`)
- `removeSavedVacancyAction` structured `{ type, message }` result

**Step 5 — Typed DTOs:**
- `getUserResponses(where)` changed from `Record<string,unknown>` to `Prisma.ApplicationWhereInput`
- `as never` casts removed

**Post-QA fixes:**
- `PublishedContentSectionOpportunity` and `PublishedContentSectionCourse` now use dedicated row components (`OpportunityListRow`, `CourseListRow`) instead of inline `DirectoryCard`
- `admin-queries.ts` uses Prisma enums (`ApplicationStatus.NEW`, `ContentStatus.DRAFT`, etc.) instead of string literals
- `updateBusinessDraftApplication` uses scoped `updateMany` with `businessAccountId` in where
- Fixed test name: "creates ACTIVE user" → "creates PENDING user with verification"
- Fixed `admin-mobile-fallback` test to match current `AdminShellFrame` signature
- Fixed `ui-polish-sprint-a` test — `OpportunityListRow` now actually used by section

**Validation snapshot (current run):**
- `npm run lint` — 0 errors
- `npm run typecheck` — 0 errors
- `npm run build` — passes
- `npm test` — 197 pass / 47 fail (all auth-registration, admin-mobile, ui-sprint-a, server-action-origin tests pass)

## Current Branch

- Active branch: `dev`
- Production branch: `prod`
- Current work mode: `QA`
- Owner workflow decision: future implementation work uses a mixed spec-driven and test-driven process; for testable behavior changes, write or update the relevant failing test before production code. Exceptions must be stated before editing. See `AGENTS.md` and `docs/agent-workflow.md`.

## Current Phase

Phase 1-4 MVP foundation is implemented at source level:

- Phase 1 public website MVP is implemented;
- Phase 2 content/admin CMS work is implemented for the current MVP contract;
- Phase 3 unified `Application` flows and public form handling are implemented;
- Phase 4 auth and first business account cabinet are implemented;
- public `/business` and `/consulting` request pages are implemented;
- Phase 5 service-specialist catalog, filters/search/directory-quality work remains planned and should not start until the stabilization queue in `docs/remediation-plan.md` is closed or explicitly deferred by the owner.

Public personal-data forms remain disabled by default in production until `APPLICATION_FORMS_ENABLED=true` is explicitly approved after legal/operator readiness checks.

## Current Stabilization Batch

The current branch is a pre-Phase-5 stabilization branch. The previous dirty `dev` tree was checkpointed before this work as `5f42e91 Checkpoint UI QA remediation`; the already-open stabilization dirty state was separately checkpointed as `e134fd3 chore: checkpoint stabilization remediation` before the remaining remediation tasks started.

Current local validation snapshot on `dev` after the 2026-06-11 audit remediation batch:

- `npm run lint` passes;
- `npm run typecheck` passes;
- `./node_modules/.bin/prisma validate` passes;
- `npm run build` passes;
- `npm test` — 197 passing / 47 failing (all auth-registration, admin-mobile, ui-sprint-a and server-action-origin tests pass; 47 pre-existing source-level snapshot failures)
- root-level temporary `events-*.png` QA artifacts were removed from the repository root during cleanup.

Implemented in this branch so far:

- typed `Application.payload` contract with Zod parse/build helpers and migrated public/admin/business readers and writers;
- same-origin protection helper for server actions, applied to high-risk public, auth, admin and business mutations with a source test;
- notification outbox schema, migration, processor, immediate post-commit dispatch and `npm run notifications:retry`;
- admin application notification attempt status on the application detail page;
- split admin application server actions into status, notes, publication and business-access files while keeping `src/app/admin/applications/actions.ts` as the facade;
- common public application submission helper, migrated for suppliers, partners, events, education, business, consulting, contacts and vacancy placement; vacancy response stays specialized because it owns private resume upload cleanup;
- mechanical CSS split into `src/app/styles/*` with `src/app/globals.css` kept as the import facade;
- direct dependencies pinned to exact currently resolved versions;
- CSP `frame-ancestors` changed to `'none'`;
- scheduler runbook updated with notification retry;
- cost calculator split into a thin client shell plus state hook, formatting helpers, ingredient editor and result rail modules without changing formulas or visible values;
- public content service split into domain query modules behind the existing `src/lib/public/content.ts` facade;
- shared admin content lifecycle helper added for repeated status update and draft delete logic across content entities;
- Playwright/axe keyboard/form coverage added for the custom Select and admin Dropdown primitives;
- focused browser QA completed for public smoke, public accessibility sweep, authenticated admin routes, UI primitives and a screenshot sweep of the key public/admin surfaces;
- local `build` and `typecheck` scripts now route native Next/SWC and Prisma tooling through system/Homebrew Node when the command starts inside a bundled desktop-app Node on macOS;
- admin fallback now covers authenticated admin routes below 1024px, the calculator ingredient desktop grid has wider real input/select controls, and custom Select QA treats hidden native selects as expected false positives.
- React Doctor findings are triaged and remediated for the actionable scope: `PublicFilters` owns its Suspense boundary, missing page metadata is added for public/detail/private pages, custom admin/business auth guards and intentional public actions are recorded in `react-doctor.config.json`, and the contact-topic label cleanup no longer uses a module-scoped object.
- 2026-05-27 UI remediation brief is applied locally: public/about/profile/business surfaces were simplified, repeated fake/equal-height public cards were replaced with denser rows, article starter placeholders were removed, cookie/form hash/mobile states were tightened, lower homepage screenshots no longer rely on `content-visibility`, and admin application notifications now degrade cleanly when the local notification table is not migrated yet.
- SEO remediation slice is applied at code/docs level: public pages now use route-specific canonical metadata and OG URLs, private/auth/admin entry pages use noindex metadata, sitemap is async and includes published detail URLs only, rendered JSON-LD covers Organization/WebSite/BreadcrumbList/detail entities with CSP nonce handling that avoids the browser-masked nonce hydration warning, missing public detail records return HTTP 404, production examples/docs use `https://barsynergy.ru`, and tracked Nginx config redirects `www`/temporary `sslip.io` hosts to the canonical domain.
- root theme bootstrap nonce handling is aligned with React hydration: the early theme script keeps the CSP nonce and now suppresses the browser-masked nonce attribute mismatch on the actual script element.
- browser-comment vacancy detail micro-fix is applied locally: vacancy detail pages no longer render the bottom response form block or CTA anchor, vacancy list rows use `Смотреть вакансию`, the vacancy detail conditions section is titled `Условия`, the side chip block uses a contextual title such as `Ключевые параметры`, and vacancy detail sections use contact-mode text instead of form-on-page instructions; server actions, Prisma schema, routes outside vacancies and production env values were kept unchanged.
- cost calculator worksheet clarity batch is applied locally: `/tools/cost-calculator` now uses clearer pricing-mode labels with a high-contrast active state, plain grouped parameter fields, a compact mobile sticky result strip before ingredients, a collapsed `Формула расчёта` disclosure on all breakpoints, a less crowded result rail with secondary metrics in `Подробности`, and a more table-like ingredient layout with right-aligned numeric columns; formulas, routes, Prisma schema, storage, auth, dependencies and production env values were kept unchanged.
- owner-selected font pair follow-up is applied locally: runtime fonts are now `Manrope` for body/accent UI and `Cormorant Garamond` for the display role; Cormorant was removed from menu, auth, business, admin and filter/form-like surfaces, while routes, data model, forms, calculator logic, Prisma schema, dependencies and production env values were kept unchanged.
- public/auth visual stabilization is applied locally: `/general-sponsors` benefit and package sections now use editorial/table-like rows, sponsor contacts are compact links, `/business` and `/consulting` service lists use catalog rows with type/result columns, contact/register forms are sectioned with calmer focus/error/disabled states, and shared public label/card tokens use quieter neutral borders; routes, server actions, Prisma schema, dependencies and production env values were kept unchanged.
- catalog/sidebar alignment and service-card strip micro-patch is applied locally: `/suppliers`, `/events` and `/vacancies` now start sidebar filters and the right list/empty-state container on the same desktop Y line, while service cards on `/`, `/business` and `/consulting` no longer render the wide decorative middle strip; copy, routes, data contracts, Prisma schema, dependencies and production env values were kept unchanged.
- coffee-bar redesign Batch 1 foundation is applied locally: `design-tokens.json`, `DESIGN.md` and runtime tokens now use the warm graphite/amber coffee-bar system, the cookie notice is bottom-right with a six-month localStorage choice, homepage hero badges and the digital-services promo block are removed, homepage sponsors render as a compact logo strip, and `/about` no longer renders the redundant `Куда перейти дальше` table while its hero heading is shorter and steadier; routes, Prisma schema, server actions, dependencies and production env values were kept unchanged.
- coffee-bar redesign Batches 2-5 are applied locally at source/runtime level: homepage/header/footer were rebuilt around the coffee-bar hero, search, role cards, section cards, events strip and materials section; homepage social proof now appears as `Кто уже в платформе` before the calculator; public product pages now use more concrete coffee/barista copy and direct CTAs; `/business` is reframed as a direct coffee-bar catalog placement flow with an inline form; `/consulting` is separated as services/cases/prices plus an inline request form; restrained motion was added through viewport reveal, one-shot homepage stat counters and button pressed states; mobile hero/header/menu/calculator behavior was tightened; `/about`, `/contacts`, `/legal/*`, public auth and admin login received the requested secondary-page polish where real project data exists. Real team photos and public phone/WhatsApp for the BARSYNERGY team were not present in the repository or env, so those specific content slots remain data gaps instead of invented content.
- 2026-05-30 fix-plan v2 remediation is applied locally: public header now keeps the white logo on dark header states, separates desktop actions, moves the mobile theme switch into the open menu, adds global anchor scroll padding, canonicalizes legacy article `query` searches to `q`, hides starter/latest article blocks during filtered zero results, removes the duplicate empty-events status chip, improves education secondary empty state, strengthens auth role/error states, hides the unfinished profile settings link, adds the profile responses empty state, polishes the 404 page, adds admin disabled publication hints, switches checked custom checkboxes to amber, and records `brand`/`action` token roles. The reported floating `N`/issue badge was source-audited; no custom global avatar/debug component exists in the repository, and the issue badge matches development-only Next overlay behavior rather than production code. No Prisma schema, migrations, dependencies or production env values changed.
- 2026-05-31 fix-plan v3 remediation is applied locally: the desktop header now keeps fixed 1280px spacing between logo, nav, `Ещё` and theme controls; homepage search uses the amber action color; the homepage sponsor strip is replaced with named sponsor profile cards and anchors; the development `N` issue badge is suppressed through Next dev indicator config; cookie consent uses `barsynergy_cookie_consent` with legacy-key fallback; 404 quick cards are full links with visible CTA; custom select active options have amber left accent; mobile menu theme selection is a native segmented row; mobile calculator ingredient rows and mobile role routing use compact card/list layouts; business vacancy request employment type is a fixed select; events now have optional `registrationUrl` backed by migration `20260531120000_event_registration_url`; admin suppliers have a `filter=no-city` quick filter from the dashboard; and `npm run screenshots:public` captures full-page screenshots after hydration and lazy-section reveal. Production env values and dependencies were kept unchanged.
- 2026-05-31 post-v3 UI follow-up is applied locally from owner screenshots: the desktop header avoids overlap by moving consulting under `Ещё` and hiding the vacancy CTA until wider viewports; mobile menu keeps the theme button in the header and removes the internal theme switch; homepage sponsor cards use large logos without inner logo plates; mobile role cards no longer overlay text on backdrop images; auth login is shorter above the fold; article hero title density is reduced; and vacancy list rows split concrete role/pay/schedule facts on the left from company/about/description context on the right. Routes, data contracts, Prisma schema, migrations, dependencies and production env values were kept unchanged.
- 2026-05-31 `implement-this.md` public search/listing remediation is applied locally: homepage hero search now routes to `/search` instead of leaking broad queries into `/suppliers`; new `/search` aggregates vacancies, suppliers, articles, education and events; homepage stat fallbacks and sponsor description overrides were removed; vacancies and events use the shared `EditorialPublicPage`; education has a fuller header, toolbar filters and featured-content gating only without active filters; articles now use `PublishedContentSection` pagination and the legacy `query` to `q` redirect is removed; events keep the default upcoming period with a visible filter context. Routes, data contracts, Prisma schema, migrations, dependencies and production env values were kept unchanged.
- 2026-06-01 public UI stabilization from the owner plan is applied locally: public filters use clearer `Показать параметры` copy, repeated vague section labels were replaced, global search now hides empty result sections, vacancy and supplier rows use HH-like card structure with mobile full-width CTA layout, public header contrast/logo behavior was tightened, calculator inputs are grouped with accessible icon-action titles, and contact CTA routes now map to logical form topics for vacancy responses, vacancy placement, supplier contact, supplier listing, event proposals and event announcements. Routes, Prisma schema, migrations, dependencies and production env values were kept unchanged.
- 2026-06-01 Miro palette migration is applied locally: `--accent` is now the shared yellow interactive token stack (`#FFD02F` / `#FCB900`) across both themes, light surfaces moved to white and cool gray neutrals, dark surfaces moved to derived blue-gray neutrals, pastel support colors now drive decorative cards/glow layers, admin shells inherit the same accent contract, and public dark bands/forms/sponsor sections no longer use the previous coffee-bar red/amber stack. Routes, Prisma schema, migrations, dependencies and production env values were kept unchanged.
- 2026-06-01 UX/UI remediation P0-P3 plus additional P0-5/P0-6/P1-7 is applied locally: the homepage hero no longer duplicates search or role routing, login is a minimal credential form, registration is split into two UI steps, contact form is shorter with direct contacts below, listing filters start collapsed with active-chip/reset behavior, listing headers/cards are denser, calculator labels are clearer, main listing routes have `loading.tsx` skeletons, cookie/footer polish is applied, `EditorialPublicPage` heroes keep breadcrumb without duplicate eyebrow labels, dark public form shells and gray zones use opaque dark surfaces, and low-opacity inverse form text was raised. Routes, server action names, Prisma schema, migrations, dependencies and production env values were kept unchanged.
- 2026-06-01 `ui-fix.md` follow-up is applied locally: articles, events and education use the sidebar filter structure; filter toggle labels no longer wrap or squeeze search; the desktop `Ещё` menu opens by click only; auth/admin/register/activate forms use custom inline validation instead of native browser tooltips; `/business` gray-zone copy has stronger contrast; `/about` timeline and final CTA layout are cleaner; the calculator hero no longer self-links to the same section and its help block is labelled as an instruction; checkbox/radio base CSS was aligned to the requested property set. Routes, Prisma schema, migrations, dependencies and production env values were kept unchanged.
- 2026-06-01 browser-comment articles filter placement fix is applied locally: `/articles` no longer renders the filter panel as a standalone top band; the same `PublicFilters` instance is passed into `PublishedContentSection` with `embedded` so filters render in the left column of `section#articles-list` beside the latest publication rows. Routes, data fetching, Prisma schema, dependencies and production env values were kept unchanged.
- 2026-06-04 code-review remediation completed across 16 of 17 tasks: auth actions split into 5 domain modules (login, register, verify-email, password-reset, business-activation); `THROTTLE_SECRET` separated from `SESSION_SECRET` with env/docs updates; in-memory homepage cache with 30s TTL; unified notification outbox via `process-queue.ts` with the old `auth-notification-outbox.ts` deleted; admin application detail page split into `_components/` and `_forms/` fragments; sliding session expiration in `getCurrentUser()`; admin error boundary at `/admin/error.tsx`; business notes guard checks `EDITABLE_BUSINESS_NOTES_STATUSES`; sponsor anchor links use `sponsor.slug`; `console.warn` in `getString()` for non-string FormData in development; SMTP singleton removed in favour of fresh transporters per call; `Math.floor` replaces `Math.round` in `formatUpdatedLabel`; `barsynergy` typo fixed in 3 development fallback constants; `void dispatchApplicationNotificationQueue` replaced with `after(() => ...)` from `next/dist/server/after` plus `NEXT_RUNTIME` edge guard; UI copy regressions in auth modules (missing `assertSameOriginServerAction`) fixed. **Note: `src/proxy.ts` → `src/middleware.ts` rename is still pending — the file was not renamed in this batch.** Auth, notification, rate-limit, cache, admin and middleware tests pass. Pre-existing `public-cta-copy.test.mjs` and calculator source-level snapshot failures are unchanged and pre-date this batch.
- 2026-06-04 public user registration and auth UI normalisation completed: `registerUserAction` creates `PENDING` users with `sendUserVerificationEmail`; `/auth/register/user` created as a dedicated public registration page for `UserRole.USER` with `RegisterUserForm`; `/auth/login` now shows two explicit CTAs — "Зарегистрироваться как участник" and "Запросить бизнес-доступ"; old `RegisterRequestForm` renamed to `BusinessRequestForm` with role-selection removed and copy tightened to business-only; `/auth/register` page copy updated to "Заявка на бизнес-доступ". Routes, Prisma schema, migrations, dependencies and production env values were kept unchanged. Pre-existing `public-cta-copy.test.mjs` failures are unchanged and pre-date this batch.
- 2026-06-04 duplicate business-request false-success fix completed: `createBusinessAccountRequestAction` now tracks a `created` flag through the transaction; on duplicate (existing user or existing pending request) the action redirects with `?success=business-request-duplicate` with honest message "Заявка по этому email уже получена", instead of falsely claiming "Заявку получили"; login page renders the duplicate message inline and shows the AccessNotice in sent state; 10 additional source-level tests added covering business registration branches (disabled, invalid, duplicate, rate-limit), activate page error states (invalid/mismatch/blocked), activate consume route token validation and cookie behavior, PENDING-regression guard, and auth route file existence. Routes, Prisma schema, migrations, dependencies and production env values were kept unchanged. Pre-existing `public-cta-copy.test.mjs` failures are unchanged and pre-date this batch.
- 2026-06-04 header auth state and account menu implementation completed: `getCurrentUser()` now includes `profile.fullName` for display; `site-header-server.tsx` server wrapper fetches `currentUser` and passes serialized user to client `SiteHeader`; `SiteHeader` accepts optional `user` prop and shows `AccountMenu` (existing `DropdownMenu`-based component) when authenticated instead of static "Войти" link; `AccountMenu` has role-based items (USER: Профиль, Мои отклики, Выйти; BUSINESS: Кабинет компании, Заявки, Выйти; ADMIN/MODERATOR: Админ-панель, Выйти) with initials fallback, email display, and logout via `logoutAction`; `MobileSiteMenu` accepts `user` prop and shows auth block (user info, role-based links, logout) when authenticated; root layout imports `SiteHeaderServer` instead of `SiteHeader`. Pre-existing `public-cta-copy.test.mjs` failures are unchanged and pre-date this batch.
- 2026-06-04 business activation flow refinement completed: fixed broken "Заявки" link in `AccountMenu` and `MobileSiteMenu` from non-existent `/business/applications` to `/business/cabinet/requests`; added backwards-compatible redirect route at `/business/applications` → `/business/cabinet/requests` for old bookmarks. `npm run lint` and `npm run typecheck` pass.
- 2026-06-04 AccountMenu dropdown positioning bug fix: the `DropdownMenuContent` component now always applies `position: fixed` and off-screen coordinates during its initial render, preventing `updatePosition` from reading an inflated `offsetWidth` (caused by the element rendering as a full-viewport block child of `<body>` before positioning was applied). The dropdown no longer appears at `left: 12px` when the trigger is on the right side. `npm run lint` and `npm run typecheck` pass.
- 2026-06-04 Batch A: User Cabinet V1 completed:
  - Schema: `Application.userId` added with migration + backfill for existing records by email match; `AuthNotification`, `UserEmailVerificationToken`, `UserPasswordResetToken` models synced to schema (tables already existed in DB from previous uncommitted migrations)
  - Server action `src/lib/profile/actions.ts`: `updateProfile` (supports fullName, cityId, profession, company, bio, phone, telegram, website via Prisma upsert) and `changePassword` (validates current password, hashes new one)
  - Page `/profile/settings`: working form for profile editing + password change with city select, success/error alerts via search params
  - Page `/profile/responses/[applicationId]`: detail page with ownership guard (`userId = currentUser.id`), shows type, status, date, message, vacancy title, payload entries
  - Page `/profile/responses`: full filter set (status, type, search by text, sort by date), pagination, filtered empty states
  - Sidebar: Settings link added
  - Application creation: `userId` passed in business cabinet (`business/actions.ts`) and public forms (`create-public-application.ts`); anonymous submissions get null
  - `npm run lint`, `npm run typecheck`, `./node_modules/.bin/prisma validate` pass. Pre-existing `public-cta-copy.test.mjs` failures unchanged.

- 2026-06-04 Vacancy response flow fix (Bathes A-D of the remediation plan):
  - `[slug]/page.tsx`: replaced the `/contacts?topic=vacancy-response...` CTA with the real `VacancyApplicationForms` component using `mode="detail"` and `selectedVacancy`, so vacancy detail pages now send `VACANCY_RESPONSE` instead of `CONTACT_MESSAGE`
  - `vacancies/actions.ts`: `submitVacancyResponseApplication` now calls `getCurrentUser()` and passes `userId` to `createPublicApplication`, so logged-in responses appear in `/profile/responses`
  - `vacancy-application-forms.tsx`: added optional `profile` prop with automatic prefill of `candidateName`, `cityId`, `email`, `phone`, `telegram` from the user's profile when logged in
  - `application-form-section.tsx`: `ContactChannelFieldset` now accepts an optional `defaults` prop to prefill email/phone/telegram
  - `application-payloads.ts`: added `getApplicationPayloadDisplayEntries` with human-readable Russian labels for payload keys (e.g. `roleSummary` → `Опыт и текущая роль`)
  - `profile/responses/[applicationId]/page.tsx`: switched from raw `getApplicationPayloadEntries` to `getApplicationPayloadDisplayEntries` with label/value pairs instead of raw key strings
  - `tests/public-cta-copy.test.mjs`: updated tests to match the new flow — detail page now uses `VacancyApplicationForms` and no longer references `/contacts?topic=vacancy-response`
  - `npm run lint`, `npm run typecheck` pass. Both affected tests (`public contact CTAs map to form topics`, `vacancy detail page renders the real vacancy response form`) pass.

- 2026-06-04 Role contract normalization (P0-P2 of the role-guard plan):
  - `/profile/layout.tsx`: added `UserRole.USER` role guard — BUSINESS/ADMIN/MODERATOR redirected to `/`
  - `vacancies/actions.ts`: restricted `userId` to `currentUser.role === UserRole.USER` only — non-USER roles and guests get `null`
  - `profile/responses/page.tsx`: updated empty state to clarify guest responses may not appear in history
  - `tests/vacancy-response-contract.test.mjs`: 9 new source-level tests covering user-linked response, guest response, role restriction, ownership guard, account-menu role-based items (USER/BUSINESS/ADMIN paths)
  - `npm run lint`, `npm run typecheck` pass. All 11 affected tests pass (2 updated + 9 new).
- 2026-06-05 quality remediation slice is applied locally:
  - `src/components/public/homepage-client.tsx` is no longer a full client component; the FAQ accordion was isolated into `src/components/public/home-cta-faq-section.tsx`, so the homepage now ships less client-side React for static sections while keeping the same visible behavior
  - shared channel accent colors were moved from duplicated hardcoded values in `contact-action-row.tsx` and `social-card.tsx` into semantic runtime tokens in `src/app/styles/tokens.css` through `src/components/public/channel-accent.ts`
  - repeated filter field/chip/reset markup was split out of `src/components/public/public-filters.tsx` into `src/components/public/public-filters-fields.tsx`, reducing mixed concerns in the main filter container without changing routes, query params or copy
  - validation passed with `git diff --check`, targeted ESLint, `./node_modules/.bin/tsc --noEmit`, and Playwright smoke against the existing local server for `/` and `/suppliers` at desktop plus `/suppliers` at mobile; all returned HTTP 200 with zero console/page errors and zero horizontal overflow

- 2026-06-06 Auth fix batch (4 blocks) applied:
  - Back-кнопка в absolute на всех 4 auth-страницах (login, password-reset, reset-confirm, register-user), удалён неиспользуемый `Button` импорт
  - Subtitle очищен от инлайн-ссылки «Запросить доступ →»; обе нижних CTA — `text-[var(--accent)]` (была серая)
  - «Не можете войти?» → «Забыли пароль?»; добавлена микроссылка «Проблемы с доступом? Написать команде» под кнопкой «Войти»
  - `sendPasswordResetEmail` (Nodemailer, HTML-письмо с жёлтой кнопкой) вызван после создания токена; graceful skip без SMTP; SMTP_FROM добавлен во все `.env.*.example`

- 2026-06-06 Queue A (architecture groundwork) applied:
  - `docs/adr/001-target-architecture.md` — зафиксирована целевая 4-слойная архитектура (app/modules/components/lib) с правилами импортов
  - `eslint.config.mjs` — добавлены 2 guardrails: запрет `@prisma/client` и `@/lib/db/prisma` в `page.tsx`/`layout.tsx` (81 нарушение); запрет `@/app/**/actions` в `src/components/**` (14 нарушений)
  - `docs/architecture.md` — обновлены pending decisions (`getCurrentUser + cache()` Done, notification retry Done)
  - Оба guardrail-правила работают и ловят целевые нарушения

- 2026-06-06 Queue B (content read-layer migration) applied:
  - **Pilot — vacancies**: `src/modules/content/vacancies/queries.ts` с `getPublishedVacancies`, `getPublishedVacancyDetail`, `getVacancyApplicationFormOptions`, `getVacancyUserPrefill`; `src/modules/content/shared/types.ts` с реэкспортами `CategoryType`, `ContentStatus`, `FileVisibility`; 6 публичных listing-страниц переведены с `@prisma/client` на модульные типы; `[slug]/page.tsx` — 3 inline prisma-запроса заменены на `getVacancyUserPrefill`; `lib/public/content/vacancies.ts` очищен до backward-compat фасада
  - **Profile pages** (4 страницы): `src/modules/profile/queries.ts` с `getFullUser`, `getProfileSettingsData`, `getSavedVacancies`, `getUserApplication`; реэкспорты `UserRole`, `EmploymentType`, `JobSearchStatus`, `ApplicationStatus`, `ApplicationType`; layout, page, saved-vacancies, settings, responses/[applicationId] — все prisma-запросы и enum-импорты вынесены в модуль
  - **Business cabinet** (6 страниц): `src/modules/business/queries.ts` со всеми запросами дашборда, откликов и заявок; реэкспорты `ApplicationStatus`, `ApplicationType`; layout, page, responses/*, requests/* — все prisma-запросы и enum-импорты вынесены в модуль
  - **Admin CRUD** (30 файлов): `src/modules/admin/queries.ts` с реэкспортами `prisma` и всех используемых Prisma enums; 30 admin-страниц переведены на модульный импорт
  - **Auth pages** (2 страницы): `src/modules/auth/shared/queries.ts` с `getActiveCities`; auth/register и auth/register/user страницы исправлены
  - **Итог**: все 81 violation `no-restricted-imports` для prisma в page.tsx/layout.tsx устранены.

- 2026-06-06 Queue C (pass actions as props from pages) applied:
  - **Layout components (4)**: account-menu, business-sidebar, mobile-site-menu, profile-sidebar — `logoutAction` passed as prop from parent layout/page (`app/layout.tsx`, `profile/layout.tsx`, `business/cabinet/layout.tsx`) instead of direct `@/app/auth/actions` import
  - **Public form components (10)**: business-request-form, business-solution-form, consulting-request-form, contact-application-form, education-application-forms, event-application-form, partner-application-form, register-user-form, supplier-application-form, vacancy-application-forms — server actions passed as props from parent pages instead of direct `@/app/*/actions` imports
  - **Итог**: все 14 violations `no-restricted-imports` для action-imports в компонентах устранены.
  - `npm run lint` и `npm run typecheck` проходят.

- 2026-06-06 Queue D (UI decomposition + naming) applied — 12 god files split to &lt;350 lines:
  - `public-filters.tsx` (760→19) → 7 files: types, content, fallback, variant-toolbar, variant-sidebar, variant-stacked, variants
  - `homepage-client.tsx` (574→101) → 5 files: hero, section-cards, current, community, sponsors
  - `editorial-display-primitives.tsx` (564→4) → 3 files: types, internal, panels
  - `content-admin-controls.tsx` (556→3) → 5 files: types, utils, filters, panels, actions
  - `platform-ui.tsx` (541→170) → 4 files: logo-grid, date-block, tool-teaser, event-agenda
  - `published-content-section.tsx` (512→217) → builders extracted to separate file
  - `select.tsx` (486→347) → 3 files: utils, position, menu
  - `article-grid-section.tsx` (417→130) → 4 files: utils, card, category-pill, search-field
  - `public-content-detail-page.tsx` (405→233) → helpers extracted
  - `vacancy-application-forms.tsx` (391→114) → internal components extracted
  - `contact-application-form.tsx` (391→306) → constants extracted
  - `ingredient-editor.tsx` (379→111) → internal components extracted
  - Всего создано ~32 новых файла. Все exports сохранены через реэкспорты. `npm run lint` и `npm run typecheck` проходят.

- 2026-06-07 Code-review remediation (3 items) applied:
  - **Detail-layer migration fixed (High):** `getPublishedArticleDetail`, `getPublishedEventDetail`, `getPublishedCourseDetail`, `getPublishedSupplierDetail`, `getPublishedPartnerDetail` moved from the old monolithic `src/lib/public/content-details.ts` into their respective `src/lib/public/content/{articles,events,education,suppliers,partners}.ts` modules. The old file was removed. Imports updated in all 5 detail page files and `public-content-detail-page-helpers.ts`. Vacancy detail was already migrated in Queue B — now all 6 content types have domain-specific detail queries.
  - **Admin homepage page split (Medium):** `src/app/admin/homepage/page.tsx` reduced from 349→119 lines. Data fetching extracted to `src/lib/admin/homepage-queries.ts`. Five section components (Hero, Audience, CTA, Social, Calculator) created in `src/components/admin/homepage-cms/homepage-cms-sections.tsx` with actions passed as props (fixing the `no-restricted-imports` lint violation). Well under the 250-line hard limit for page.tsx.
  - **rowVariant anti-pattern eliminated (Medium):** `PublishedContentSectionInner` no longer accepts a `rowVariant` prop. Three dedicated row component files created (`src/components/public/published-content-row-default.tsx`, `published-content-row-opportunity.tsx`, `published-content-row-directory.tsx`), plus `published-content-row-course.tsx`. The four public exports (`PublishedContentSectionDefault`, `PublishedContentSectionOpportunity`, `PublishedContentSectionDirectory`, `PublishedContentSectionCourse`) now use dedicated row components without branching. The old `PublishedContentSection` export with `rowVariant` prop is kept as a deprecated backward-compat wrapper.
  - `npm run lint` and `npm run typecheck` pass.

- 2026-06-07 Search remediation batch applied:
  - **Domain-specific search fields (High):** each public content entity now searches its own domain fields: events search `locationName`, `address`, `city.name`; vacancies search `companyName`, `position`, `city.name`; suppliers search `companyName`, `serviceArea`, `contactLabel`, `city.name`; partners search `companyName`. The shared `textSearch()` helper is kept for backward compat but all entity queries now use typed per-entity search predicates with no `unknown` casts.
  - **Relevance ranking (High):** `listResultWithRelevance()` helper in `shared.ts` scores results by `exact title match > prefix match > contains match > no title match`, breaking ties with editorial sort. All 6 content types (events, vacancies, suppliers, articles, education, partners) use this two-phase ID-first approach when `q` is present, no-relevance default order when not.
  - **Partners in global /search (Medium-High):** `getPublishedPartners` is now queried and rendered in `/search` as a 6th section; search metadata/descriptions updated.
  - **Normalized hasActiveSearch (Medium):** `/events` page replaced raw `Boolean(contentParams.q || ...)` with `hasActivePublicContentParams()` which properly trims and normalises query-param values before deciding active-filter state.
  - **Filter canonicalization (Medium):** `public-filters-content.tsx` no longer hides active filter chips for values not found in current option sets — invalid/removed `category`, `city` and extra-filter values now always show as active chips with the raw value as label.
  - **Admin application search (Medium):** admin `/applications` search now covers `businessAccount.companyName`, `payload.companyName`, `payload.projectName` and `payload.employerCompanyName` via Prisma JSON path queries in addition to existing subject/name/email/phone/telegram fields.
  - Routes, page layouts, data contracts, Prisma schema, migrations, dependencies and production env values unchanged.

- 2026-06-07 UI Polish Pass — Sprint A applied locally on `fix/code-review-remediation` (Phase Pre-7):
  - **Phase + tracking:** new `Phase Pre-7: UI Polish Pass` section added to `docs/phase-plan.md` with explicit in/out of scope and sprint sequencing rules; Obsidian Kanban received a dedicated `Sprint A` in-progress card.
  - **Sprint A scope:** 6 source-level UI fixes from the 2026-06-07 owner audit — hero stats density, vacancy salary prefix, vacancy CTA wiring, profile salary/employment/visibility panel merge, articles aspect ratio, supplier logo mobile visibility.
  - **[2] Hero stats** (`src/components/public/homepage-hero.tsx`): stat values raised from `text-[1.55rem]` to `text-[2.4rem] md:text-[3rem]`, vertical `border-r` separators replaced with `gap-x-8 md:gap-x-12`, value color switched from `--accent` to `--editorial-dark-text` for stronger hero presence with units kept smaller and uppercase.
  - **[6] Vacancy salary** (`src/components/public/published-content-row-opportunity.tsx`): removed the `Зарплата` uppercase prefix label inside `vacancyLead`; the salary now renders as a single bold `text-[var(--text)]` value inheriting the parent lead size.
  - **[5 partial] Vacancy CTA** (`published-content-row-opportunity.tsx` + `published-content-section.tsx`): `OpportunityListRow` now accepts an `actionLabel?: string` prop with default `Смотреть вакансию` and adds an inline `ArrowUpRight` icon on the primary action; `PublishedContentSectionOpportunity` forwards `rowActionLabel` to the row (previously the page-level prop was ignored and the button hard-coded `Подробнее`).
  - **[4] Profile conditions panel** (`src/app/profile/page.tsx`): three `Panel md:grid-cols-3` blocks (Желаемая зарплата / Формат работы / Профиль) collapsed into one `Panel` labelled `Условия поиска` with a single horizontal `<dl>` row using dot-separator rhythm.
  - **[8] Article cover aspect ratio** (`src/components/public/article-grid-card.tsx`): default card cover uses `aspect-[16/9]`, featured card uses `aspect-[16/9] sm:aspect-[21/9]`; old `aspect-[3/1] sm:aspect-[4/1]` and `aspect-[4/1] sm:aspect-[6/1]` strip-style ratios removed.
  - **[7 partial] Supplier logo on mobile** (`src/components/public/published-content-row-directory.tsx`): removed `hidden sm:block` wrappers from the media block; logo container is now visible on every breakpoint with `h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16` sizing and the surrounding company grid uses `grid-cols-[3.25rem_minmax(0,1fr)] sm:grid-cols-[4rem_minmax(0,1fr)]` so the logo stays inline with the company name on mobile.
  - **Validation:** new source-level snapshot tests in `tests/ui-polish-sprint-a.test.mjs` (6/6 pass). Full suite: 152 pass / 75 fail / 227 total — same 76 unique pre-existing failures as before Sprint A (Queue B/C/D stale snapshots), zero new regressions. `npm run lint` keeps the same 3 pre-existing errors (`TurnstileError`, two `idsOnly` in `tests/public-search-semantics.test.mjs`). `npm run typecheck` clean. Browser smoke on `/`, `/suppliers`, `/articles` at 1280×900 and `/suppliers` at 390×800 confirmed visible hero stats, inline supplier logo on mobile and no horizontal overflow.
  - **Out of scope:** no Prisma schema, no server actions, no migrations, no dependencies, no routes added; remaining audit items (Sprint B/C/D, items 1/3/9/10/11/12/13/14) deferred to subsequent batches.

Still open in this stabilization queue:

- confirmation that the production scheduler is configured for session cleanup and notification retry before launch;
- owner decision on whether mobile admin read-only/actions is required as a separate product task;
- broader DB-backed public visual rechecks beyond the fix-plan v3 smoke still need a dedicated QA batch before release sign-off;
- after deploy, apply/check the same canonical-domain redirects in the real host Nginx runtime and run live SEO smoke for `robots.txt`, `sitemap.xml`, key public pages, detail 404 and the temporary host redirect;
- Search Console/Метрика indexing confirmation remains out of scope until those panels are connected.

### Owner Decision: `/search` Route

`/search` remains a future-facing public route. By owner decision, it is **not** part of the primary public navigation in the current stabilization scope. Current discovery relies on section-level listings and filters (vacancies, suppliers, articles, events, education). This must not be treated as an active UX bug until Phase 5 search/discovery work starts.

## Previous Local Batch (Historical)

Code/browser QA remediation has been run locally on `dev` and is ready for the requested release checkpoint:

- Figma admin UI-only transfer follow-up is applied locally: the admin shell now uses the recorded 272px dark sidebar, 56px flat topbar, light content background and compact page intro; sidebar now has separate expanded/collapsed desktop states with an edge toggle, icon navigation and persisted local preference; admin form fields, sticky actions, inline edit rows, confirm dialogs, toast shell and table empty/no-results states follow the recorded `13 — Admin Screens` component contract, while admin data, queries, roles, auth, routes, server actions, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment homepage digital-solutions heading copy micro-fix is applied locally: the headline now says `Сайты, боты и автоматизация для бизнеса` instead of `для барных проектов`, while surrounding copy, links, routes, data, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment homepage current-list typography micro-fix is applied locally: support-card titles in the `Актуальное` block now use a safer serif line-height and balanced wrapping to prevent stacked lines from touching on mobile, while links, copy, data, routes, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment homepage role-router arrow micro-fix is applied locally: role-router rows on mobile now keep the arrow affordance as a trailing right-side control instead of dropping it below the text, while links, routes, copy, data, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment cost calculator mobile row-summary micro-fix is applied locally: mobile ingredient cards now show the row number as plain accent text without a square badge and make the row cost more prominent, while ingredient inputs, row actions, formulas, validation, routes, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment cost calculator ingredient-list micro-fix is applied locally: the mobile ingredient list no longer paints the outer list/card as a highlighted surface, while individual controls, row actions, formulas, validation, routes, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment mobile header theme-toggle micro-fix is applied locally: public mobile header now exposes the existing compact theme switch next to the menu button, keeping the current theme persistence, navigation behavior, routes, Prisma schema, dependencies and production env values unchanged;
- browser-comment cost calculator dark contrast micro-fix is applied locally: the selected pricing-mode card in `/tools/cost-calculator` now uses a high-contrast dark-theme text pair while keeping accent meaning on border/state surfaces; calculator formulas, inputs, route behavior, Prisma schema, dependencies and production env values were kept unchanged;
- browser-comment cost calculator target-share micro-fix is applied locally: `/tools/cost-calculator` now keeps one editable control for `Доля себестоимости` by removing the duplicate target-share range slider; calculator formulas, validation, route behavior, Prisma schema, dependencies and production env values were kept unchanged;
- browser-comment cost calculator formula alignment micro-fix was superseded by the formula deduplication micro-fix: the separate result formula row is no longer part of `/tools/cost-calculator`;
- browser-comment cost calculator copy-button contrast micro-fix is applied locally: the result copy CTA in `/tools/cost-calculator` now uses a local dark-theme contrast pair inside the calculator sheet, keeping the button role, copy action, formulas, validation, route behavior, Prisma schema, dependencies and production env values unchanged;
- browser-comment cost calculator formula deduplication micro-fix is applied locally: the result card in `/tools/cost-calculator` no longer repeats the formula row, while the existing formula-help section and copy action remain available; calculator formulas, validation, route behavior, Prisma schema, dependencies and production env values were kept unchanged;
- modern-web-guidance UI hardening batch is applied locally: shared form feedback now exposes structured live error/success announcements, public filters use the native `<search>` landmark, live filter status, explicit labels and mobile search keyboard hints, touch devices get 48px/16px filter controls, and lower homepage sections now keep containment without progressive `content-visibility` so full-page screenshots render the lower content; routes, data fetching, server actions, Prisma schema, dependencies and production env values were kept unchanged;
- homepage hero search focus micro-fix is applied locally: clicking the first-screen search input no longer shows the global red focus outline, while the form keeps a calmer focused bottom border; search action, copy, route behavior, data fetching, Prisma schema and production env values were kept unchanged;
- owner-selected visual direction follow-up was applied in that earlier batch with the then-current `Noto Serif Display + Noto Sans` pair; that font note is now superseded by the current `Cormorant Garamond + Manrope` contract, while the homepage hero, quick links and local high-resolution coffee-bar asset from that batch remain part of the visual direction;
- owner-selected contact form follow-up is applied locally: `/contacts` now uses the selected two-column contact pattern with channel cards on the left and the existing public contact form opened on the right; server action, field names, consent, UTM, honeypot, Prisma schema, routes outside `/contacts` and production env values were kept unchanged;
- owner-selected detail page follow-up is applied locally: the shared article/event/course/vacancy/supplier/partner detail shell now follows the selected split dark hero, media panel, facts/content/action layout and controlled hero title wrapping while reusing existing `Panel`, `MetaChip`, `Button`, typography and route components; data fetching, slugs, forms, server actions, Prisma schema and production env values were kept unchanged;
- owner-selected catalog/filter follow-up is applied locally: `/events`, suppliers and vacancies now use the selected sidebar-filter plus right-list-toolbar structure, while keeping existing event cards and `EditorialListRow`-based supplier/vacancy cards; data fetching, filters, routes, server actions, Prisma schema, admin behavior and production env values were kept unchanged;
- motion smoothing follow-up is applied locally: shared motion tokens now drive common durations/easing, and buttons, cards, filters, header/nav, mobile menu, dropdown/dialog shells, public list rows, media hover states, contact/sponsor rows, tabs, toggles and admin action menu controls use smoother tokenized transitions with reduced-motion fallbacks; routes, data fetching, server actions, Prisma schema, dependencies and production env values were kept unchanged;
- audit-plan follow-up batch is applied at code/test/docs level: `/` now uses a product-purpose H1, keeps `BARSYNERGY` as the brand label, adds direct first-screen actions and a real bar-industry image; `/events` separates true upcoming-empty, archive-empty and filtered-zero states with next-step actions; supplier rows show contact method metadata and a smaller no-logo fallback; supplier application copy says logo/photo is needed before publication; shared field error styling no longer adds a red outer glow; routes, server actions, Prisma schema and production env values were kept unchanged;
- audit-plan form/supplier stabilization follow-up is applied at code/docs level: public forms using `public-form-shell` now add adjacent validation text after blur or submit without showing error on focus, required contact/message/consent errors are visible next to the field, checkbox/radio invalid states no longer use red glow, and supplier detail facts use the explicit `География` / `Контакты` labels above the main profile text; routes, server actions, Prisma schema and production env values were kept unchanged;
- UX/UI audit remediation batch is applied locally: `/tools/cost-calculator` no longer mixes a light worksheet panel with dark-theme text tokens, calculator result badges/metric cards use semantic theme tokens, calculator mode controls/range input/ingredient action buttons and footer links now meet the 40-44px interaction target used in this batch, homepage role routing now uses editorial rows instead of a card grid, education format cards use theme-safe surface/accent tokens, and business/consulting/partner navigation-choice blocks can use the shared row presentation instead of repeated card tiles; formulas, routes, server actions, Prisma schema, auth, admin permissions and production env values were kept unchanged;
- accessibility QA tooling dependency is added: `axe-core@4.11.4` is pinned as an exact dev dependency for future Playwright/browser accessibility smoke scripts, installed with npm and `--ignore-scripts`; `lighthouse` and `@axe-core/playwright` were not added because they are not required for the current remediation checks and would add broader dependency/runtime surface;
- direct Playwright project workflow is configured: `@playwright/test@1.60.0` is pinned as an exact dev dependency, Chromium for Playwright `1.60.0` is installed in the local Playwright cache, `playwright.config.ts` starts Next dev through `webServer` on `127.0.0.1:3100` and runs with `workers: 1` for stable Next dev route compilation in this workspace, npm scripts now expose `npm run qa:browser`, `npm run playwright`, `npm run playwright:ui`, `npm run playwright:install` and `npm run playwright:report`, and `tests/e2e/public-smoke.spec.ts` verifies `/tools/cost-calculator` render plus critical axe violations without custom Chrome executable fallbacks;
- admin mobile fallback batch is applied at layout level: protected admin routes now show a clear `Нужен широкий экран` state below `md`, the working admin shell is available from 768px upward, and a static regression test keeps the mobile unsupported contract in place;
- shared Dropdown/Menu primitive batch is applied at code level: `src/components/ui/dropdown-menu.tsx` now owns portal rendering, overlay positioning, outside-click dismissal, Escape handling and first-item focus for menu overlays, while `AdminActionMenu` keeps its existing public API and admin-specific item/confirm styling by composing the shared primitive;
- UI remediation closeout batch is applied at code/docs level: `AdminActionMenuButton` now composes the shared `Dialog` confirm primitive, `ToastProvider` is installed in the root app shell, `FileUpload` supports adjacent error text with `aria-invalid`/`aria-describedby` and no glow styling, and status docs no longer list already-closed remediation work as open;
- live Figma upload states slice is applied at code level: shared `FileUpload` now supports private/public notice text, selected-file success, adjacent error, submit-pending upload visuals and state icons; admin cover image upload and public vacancy resume upload consume those states while routes, actions, storage API, authenticated upload flow, CMS data, Prisma and seed remain unchanged;
- live Figma auth/cabinet login slice is applied at code level: public `/auth/login` keeps only participant/business role cards, adds explicit role-card state hooks, hardens 320px layout, submit loading, invalid/role-mismatch feedback and request-sent notice, while auth actions, cookies, redirects, admin/service roles, Prisma, seed and business cabinet data remain unchanged;
- live Figma public detail hardening slice is applied at code level: shared article/event/course/vacancy/supplier/partner detail shell now exposes `data-detail-kind`, type-specific body labels, type-specific section cards, and 320px overflow hardening; article/course/vacancy/supplier/partner routes now pass existing `sections` into the shared template while queries, slugs, data fetching, CTA targets, Prisma and seed remain unchanged;
- live Figma general sponsor card hardening slice is applied at code level: `GeneralSponsorCard` now exposes `data-sponsor-variant` and `data-sponsor-state`, has hover/focus states, long-content wrapping, compact mobile behavior and source-level archived styling, while sponsor data, public queries, routes, CMS logic, Prisma and seed remain unchanged;
- public route-by-route accessibility sweep is added to project Playwright: `tests/e2e/public-accessibility-sweep.spec.ts` covers 14 unauthenticated public routes at `1280x900` and `390x844`, checks successful render, no horizontal overflow, visible keyboard focus movement across Tab stops, no page errors, no critical `axe-core` violations, and no serious `color-contrast` violations on every covered public route;
- authenticated admin route/upload QA is added to project Playwright: `tests/e2e/admin-authenticated-qa.spec.ts` creates a temporary local admin session, checks 21 admin routes at `1280x900` for authenticated render, desktop shell, no horizontal overflow and visible Tab focus movement, verifies the mobile admin wide-screen fallback at `390x844`, and covers both successful image upload and rejected invalid upload with cleanup of temporary uploaded records/files;
- release-checkpoint QA cleanup is applied locally: stale source-level expectations in `tests/home-feature-card-density.test.mjs` and `tests/public-cta-copy.test.mjs` were refreshed for the current event empty-state, public filter and contact form contracts; public contact-channel fieldsets no longer use invalid `aria-required` on `fieldset`; light-theme placeholder contrast was raised for public select controls;
- Figma consistency F6 no-logo fallback is applied at code level: sponsor, supplier and partner public cards no longer use random large initials as the main missing-logo state; sponsor fallback now shows entity type, `Без логотипа` and sponsor status, while directory supplier/partner fallback keeps the shared type/no-logo/status pattern; admin publication warnings remain out of scope for a separate admin batch; no Prisma schema, migrations, package changes or production env values were changed;
- Figma consistency F5 calculator CTA sync is closed through the product/runtime contract: `/tools/cost-calculator` keeps the copy-only result action `Скопировать результат`, docs now state that `Сохранить расчёт` must not be used until a real save/export flow exists, and Playwright verified the empty disabled state, copy success label and clipboard text; no runtime calculator formula, Prisma schema, migrations, package changes or production env values were changed;
- Figma consistency F4 mobile-menu modal contract is applied at code level: the mobile public menu now uses the shared focus-trap helper, moves initial keyboard focus into the dialog, keeps `Tab` and `Shift+Tab` inside the menu, closes with `Escape`, returns focus to the menu trigger, and labels the modal dialog with a hidden heading; no Prisma schema, migrations, package changes or production env values were changed;
- independent UI/UX remediation Batch 4 is applied at code level: public request disclosures and public form shell headers now support explicit `h2`/`h3` levels, `/contacts?topic=...#contact-form` opens the contact form with an `h2` before section `h3` headings, mobile/header/filter controls were normalized to 44px targets where this batch found smaller controls, and the accessibility smoke now covers heading order, hash focus, visible control names, keyboard interaction for custom selects, target sizes and spot contrast checks; no Prisma schema, migrations, package changes or production env values were changed;
- independent UI/UX remediation Batch 3 is applied at code level: `/education` format selection now uses the shared program matrix instead of image-heavy equal cards, supplier prelaunch categories render as directory-like rows rather than generic cards, the cookie notice is lighter with `role="region"`, compact copy and 44px controls, public footer/legal copy no longer uses `ПДн`, contact disclosure uses `Написать команде`, and B2B/consulting/partner disclosure CTAs use `Открыть форму заявки`; no Prisma schema, migrations, package changes or production env values were changed;
- independent UI/UX remediation Batch 2 is applied at code level: desktop public navigation now uses the approved primary set without `/about`, the `Ещё` dropdown shows the active business/contact section label and exposes `aria-current`, mobile navigation is grouped into `Найти`, `Разместить / обсудить` and `Команда` with a separate `Написать команде` action and active states, directory rows no longer show the secondary `Контакты внутри` CTA, and supplier/partner rows share the neutral `Без логотипа` fallback plus status/date metadata; no Prisma schema, migrations, package changes or production env values were changed;
- independent UI/UX remediation Batch 1 is applied at code level: `/events` now defaults to upcoming events, `period=past` renders archived events without a signup CTA, event detail pages hide registration for past events, public catalog/form heroes are shorter on events, suppliers, vacancies, education, contacts and sponsorship pages, and `/contacts?topic=...#contact-form` opens the contact form directly with the topic selected; no Prisma schema, migrations, package changes or production env values were changed;
- Figma-only remediation is no longer used as proof for runtime behavior;
- FDR-P1-22 remains verified and must not be reopened without new evidence;
- FDR-P2-06 is closed through the code path: admin status UI uses the shared `StatusBadge` component and static tests verify admin usage;
- `/auth/login` is aligned toward the clean auth v1 Figma state board for public users: participant/business remain the only public role cards, staff access stays on `/admin/login`, anonymous `/admin` redirects there, and mobile 320px/state smoke is now covered;
- calculator formula logic is extracted and covered by unit tests;
- calculator Figma transfer has started: `CostCalculatorClient` is split into internal worksheet/result components, and the state/token contract is documented in `docs/cost-calculator-figma-contract.md`;
- Figma-to-development transfer rules are documented in `docs/figma-to-development-plan.md`: design language can move into code, but data, routes, header, footer, logo and Figma icons stay out of scope unless separately approved;
- live Figma runtime transfer map is documented in `docs/figma-runtime-transfer-map.md`; the current first slice uses live Figma Console MCP node `40:13464` for surface/card/chip taxonomy and does not use local Figma exports as the source;
- cookie notice has a real settings interaction;
- mobile public menu has a focused Figma-alignment follow-up: the open state now uses grouped text navigation with thin dividers and a compact contact action while preserving the existing mobile nav item data;
- admin action menu and local confirm dialogs have targeted keyboard/focus fixes;
- code-side design-system primitive gap is closed for the current runtime scope: `Dialog`, `DropdownMenu`, `ToastProvider`/`useToast`, `Tabs`, `Toggle`, `Switch`, radio/checkbox fields and `FileUpload` exist as shared UI primitives on existing runtime tokens; `Dialog size="confirm"` is wired into admin action confirms, `ToastProvider` is available from root layout, `FileUpload` covers the recorded Figma upload states, and `Tabs`/`Toggle`/`Switch` have no matching source components in live Figma search;
- Figma UI/layout transfer batch is applied at code level: shared public card/list surfaces, public label/meta/action chips and admin table/action-menu shells now use tokenized Figma-style surface roles while keeping header, footer, login, forms, routes, data, API and Prisma schema unchanged;
- live Figma Surface/Card Taxonomy slice is applied at code level: `Card`, `Panel`, `public-card-shell`, public list-row shell and `MetaChip` now use the Figma radius/border/no-random-shadow/pill metadata pattern from node `40:13464` while keeping header, footer, logo, icons, routes, data, API and Prisma schema unchanged;
- live Figma calculator component slice is applied at code level: `/tools/cost-calculator` now uses the live Figma Console MCP calculator panel/input/radio/slider/result-card sizing and state roles from nodes `1:6266`, `1:6302`, `1:6330`, `1:6391` and `1:6445`, while keeping calculator formulas, current fields, route, data, header, footer, logo, icons, Prisma and API unchanged;
- live Figma public forms/filter slice is applied at code level: public application/contact forms now use scoped `public-form-shell` field cards from node `1:6116`, `PublicFilters` uses filter panel/control roles from node `1:3112`, and shared list empty states use the adjacent missing-state pattern from `25:6740`; form actions, input names, validation, routes, data, header, footer, logo, icons, Prisma and API were kept;
- live Figma public contact feedback slice is applied at code level: public form result states now use `PublicSubmissionFeedback` from node `20:10595`, and public/contact form shells are refined against node `20:10670` with 14px outer radius, no shadow, 10px field cards and graphite focus; form actions, input names, validation, routes, data, header, footer, logo, icons, Prisma and API were kept;
- live Figma education card slice is applied at code level: `/education` format/service cards now use live Figma `Component / Card` node `1:6190` and `Badge / Label` node `13:8123` geometry with local education images; current `educationFormats`, routes, contact-form links, filters, CMS content, header, footer, logo, Figma icons, Prisma and API were kept;
- live Figma home sponsor card slice is applied at code level: homepage sponsor cards now use `GeneralSponsorCard variant="home"` from live Figma node `55:1042`, with home-only dark shell/logo-safe-area/benefit/chip/CTA roles and no full phone/social contact blocks; `/general-sponsors` keeps the full contact variant, and current sponsor data, logoSrc from DB, routes, header, footer, Figma logos/icons, Prisma and API were kept; hover/focus, long content, archived-state hooks and compact mobile hardening are now covered;
- live Figma admin table/status slice is applied at code level: shared admin table shells now use the live Figma data-table density from component `22:11416`, and shared admin status badges use the Figma pill geometry/color groups from component `22:11281`; real row content, actions, routes, data, header, footer, logo, icons, Prisma and API were kept;
- homepage CTA/FAQ adaptation is applied at code level: `/` now has a lower two-column CTA plus FAQ accordion using the existing BARSYNERGY typography, surfaces, burgundy/graphite tokens and `lucide-react` chevrons; the standalone Inter/Vite/Tailwind prompt was adapted to the current Next.js project instead of adding a new font or changing the global style direction;
- P0 product-clarity batch is applied at code level: `/` now starts with a platform value proposition, two primary actions, a visual metric card and four role-router cards; desktop navigation uses the approved primary set plus `Ещё` dropdown, mobile navigation uses grouped sections, contact errors render inside the form panel, and `/consulting` no longer exposes service/handoff wording;
- public visible copy humanization batch is applied at code level: key public hero texts, route cards, empty states, form intros, form hints, auth role copy and success messages were rewritten toward short direct Russian copy using `humanizer-ru` and BaristaSchool as tone reference; legal consent text, field names, route/data contracts, admin UI and business logic were kept out of scope;
- `/about` content rebuild is applied at code level: the page now has the requested hero, project story, pilot metrics, directions, audience roles, team functions, expert areas, work process, partner categories, regional context and final CTA; no schema, routes outside `/about`, forms or business logic were changed;
- public detail templates are aligned with the Figma `25:5692` detail board at code level: article, event, education, vacancy, supplier and partner detail routes use the shared split hero, media panel, fact card, content column, action/sidebar structure and type-specific section blocks;
- the `references/**` lint gap is fixed through a global ESLint ignore because `references/` is design/moodboard material, not production code.
- 2026-05-31 UX/UI implementation plan from `implement-this.md` is applied at code/test level: shared public heroes no longer render the duplicated `Коротко` sidebar by default and now support `minimal`/`split`/`cover` variants; featured materials render as one integrated card with two useful meta chips; `/events` uses a desktop toolbar and collapsed mobile filters without the duplicate `Афиша` display title; `/education` formats are filtered accordion cards; `/partners` formats are visual cards; `/auth/login` is a centered one-column form without the photo block; action tokens use muted burnished gold with white button text; vacancy/supplier mobile rows are denser and avoid duplicated role/company filler; `/about` has quote/facts/media/timeline structure; `/consulting` combines cases and prices into tabs; the header `Ещё` dropdown closes on outside pointer interaction. Routes, server actions, Prisma schema, migrations, package dependencies and production env values were kept unchanged.
- 2026-05-31 UI/UX audit remediation from the attached quick-fix plan is applied at code/test level: Dialog and Toast close controls now use 44px targets, Dialog widths are clamped on mobile, custom Select selected/success/disabled-chevron states use tokens, reduced-motion disables relevant loading animations, public login copy no longer implies a password-reset flow, support email lives in `src/lib/contact-info.ts`, admin login/header/footer/admin form surfaces were moved from listed hardcoded values toward semantic tokens, dark `--muted` contrast was raised, unfinished profile settings navigation remains hidden, the sponsor empty state is actionable, and the public login/admin-login source expectations were updated. Routes, server actions, Prisma schema, migrations, package dependencies and production env values were kept unchanged.
- 2026-06-01 browser-comment contrast fix is applied at code/test level: the selected `/business` benefits section and `/consulting` direction section now use a dedicated graphite contrast zone instead of the shared gray service-section background, improving dark-theme readability for headings, eyebrow text and adjacent body copy while keeping routes, forms, cards, data contracts and Prisma unchanged.
- 2026-06-01 browser-comment `/consulting` composition fix is applied at code/test level: the expert-picking block is now the first content section after the hero, and its intro column no longer uses sticky positioning, so the left intro and right expert rows start on the same line. Routes, forms, cards, data contracts and Prisma were kept unchanged.
- 2026-06-01 browser-comment `/consulting` expert-row spacing fix is applied at code/test level: expert row numbers and category labels now stack with a fixed desktop gap instead of visually merging. Routes, forms, cards, data contracts and Prisma were kept unchanged.
- 2026-06-01 browser-comment `/consulting` dark-form fix is applied at code/test level: the consulting request form intro panel now uses the same fixed dark shell color as the working public business form instead of the page-sensitive `--graphite` token, restoring readable inverse text in dark theme. Routes, form fields, validation, server actions, data contracts and Prisma were kept unchanged.
- 2026-06-01 browser-comment `/contacts` form alignment fix is applied at code/test level: the primary name/contact fields now use a scoped alignment rule so inputs with and without helper text start on the same line. Routes, form fields, validation, server actions, data contracts and Prisma were kept unchanged.
- 2026-06-01 browser-comment detail related-list separator fix is applied at code/test level: the shared related-content section used on article, event, education, vacancy, supplier and partner detail pages no longer draws outer top/bottom list borders, leaving only separators between rows. Routes, content data, cards and Prisma were kept unchanged.
- 2026-06-01 browser-comment detail hero back-link separator fix is applied at code/test level: the shared public detail hero no longer draws a divider under the “Ко всем …” back link, while keeping the spacing before the hero card. Routes, content data, cards and Prisma were kept unchanged.
- 2026-06-02 admin/business shell polish from the attached implementation plan is applied locally at code/test level: the admin sidebar now uses a flat highlight navigation pattern, the admin topbar shows the current section plus operator context and `На сайт`, shared admin list pages now use status tabs with a compact inline filter toolbar, admin table rows/header density is tighter, success/danger status pills are saturated solid variants, the dashboard section-health block is reduced to a compact strip, and the business cabinet sidebar now has a stronger company identity block with active-request context. Routes, server actions, Prisma schema, migrations, dependencies and production env values were kept unchanged.

No Prisma schema, migrations or production env values are in scope for this batch.

Validation completed for this QA/code batch:

- `git diff --check` passed for the 2026-06-02 admin/business shell polish batch.
- targeted source tests passed with `node --experimental-strip-types --test tests/admin-mobile-fallback.test.mjs tests/admin-ui-shell-polish.test.mjs`.
- `npm run lint` passed.
- `npm run typecheck` passed.
- full `npm test` is still red because of pre-existing unrelated failures in public calculator/public CTA suites; the new admin/business shell tests are green and no new failure was introduced inside the targeted scope.
- `git diff --check` passed after the UX/UI implementation plan.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm test` passed with 142/142 tests after refreshing source-level expectations to the new UX contract.
- `git diff --check`, `npm run lint`, `npm run typecheck` and `npm test` passed after the attached UI/UX audit remediation quick-fix plan; targeted grep checks confirmed no `BARSENERGY` UI text in `src`, no old Dialog/Toast `min-h-8/min-w-8` or `min-h-10/min-w-10` close-target classes, no old `Забыли пароль?` login copy, no `focus-visible:outline-none` in `src/app/admin/suppliers/page.tsx`, no support-email literals outside the new source-of-truth constant, and no `#C8902A`/selected amber rgba in the custom Select selected option.
- Playwright smoke against the existing local `http://localhost:3000` dev server passed for `/auth/login`, `/admin/login` and `/general-sponsors` at `390x844`: HTTP 200, no console warnings/errors, zero horizontal overflow, public/admin login email inputs keep `name="email"`, and the public login help link renders as `Не можете войти? Напишите нам`.
- Playwright browser smoke against `http://127.0.0.1:3100` covered `/auth/login`, `/events`, `/education`, `/partners`, `/consulting`, `/vacancies`, `/suppliers` and `/about` at desktop/mobile target widths with HTTP 200, zero horizontal overflow and no console/page errors. Interaction smoke confirmed mobile event filters expand, supplier desktop sidebar filters collapse/reopen, consulting tabs switch to prices, and the desktop `Ещё` dropdown opens and closes after moving/clicking outside. Screenshots were taken in memory only and not saved.
- `git diff --check` passed after the current docs, calculator UI fixes and admin UI-only shell alignment.
- `npm run lint` passed with Homebrew `npm`.
- `npm test` passed with 116/116 tests after refreshing the admin mobile-shell source expectation.
- `npm run typecheck` still hits the local Next/SWC code-signature blocker during `next typegen`; direct `tsc --noEmit` passed after the admin UI patch.
- Browser QA used Playwright without saving screenshots. The existing `127.0.0.1:3001` server confirmed the current admin sidebar CSS: expanded width `272px`, collapsed width `84px`, edge toggle crossing the sidebar border, hidden collapsed labels and no horizontal overflow at `1280x900` and `768x900`. A fresh dev server on `127.0.0.1:3010` still could not be used because Next failed on the same SWC code-signature error.
- Playwright DOM/metric checks covered `/tools/cost-calculator#calculator` at `582x814` in dark theme through `next dev --webpack -p 3001`: the result card no longer repeats the formula row, the copy CTA remains visible, and the copy-button text/background contrast measured `9.49:1`.
- Browser QA used Playwright against the existing `http://127.0.0.1:3000` server for the 2026-06-01 `/business` and `/consulting` contrast fix at `1440x696` in dark theme: HTTP 200, no console errors, zero horizontal overflow, the selected sections render `public-contrast-services-section background-zone-graphite`, and screenshots were captured in memory only.
- Browser QA used Playwright against the existing `http://127.0.0.1:3000` server for the 2026-06-01 `/consulting` expert-block alignment fix at `1440x696`: HTTP 200, no console errors, zero horizontal overflow, the expert section appears before the direction section, and the left/right column top delta measured `0`.
- Browser QA used Playwright against the existing `http://127.0.0.1:3000` server for the 2026-06-01 `/consulting` expert-row spacing fix at `1440x696`: HTTP 200, no console errors, zero horizontal overflow, first expert row number/category render as a column with `12px` gap and no overlap.
- Browser QA used Playwright against the existing `http://127.0.0.1:3000` server for the 2026-06-01 `/consulting` dark-form fix at `1440x696`: HTTP 200, no console errors, zero horizontal overflow, and the request form intro panel computed background is `rgb(23, 19, 17)` with white heading text.
- Browser QA used Playwright against the existing `http://127.0.0.1:3000` server for the 2026-06-01 `/contacts` form alignment fix at `1440x696`: HTTP 200, no console errors, zero horizontal overflow, and the primary input top delta measured `0`.
- Browser QA used Playwright against the existing `http://127.0.0.1:3000` server for the 2026-06-01 related-list separator fix on `/articles/what-to-include-in-vacancy` at `1440x696`: HTTP 200, no console errors, zero horizontal overflow, list top/bottom borders measured `0px`, first row top border `0px`, last row bottom border `0px`, and row separators between items remain.
- Browser QA used Playwright against the existing `http://127.0.0.1:3000` server for the 2026-06-01 detail hero back-link separator fix on `/articles/what-to-include-in-vacancy` at `1440x696`: HTTP 200, no console errors, zero horizontal overflow, back-link row bottom border `0px`, bottom padding `0px`, and a 24px gap to the hero card remains.

Validation gap:

- Fresh `next dev` on a new port is blocked by the Next/SWC code-signature error, but the already-running `127.0.0.1:3001` server was usable for current authenticated admin sidebar QA.
- Figma app connector/Desktop Bridge currently requires reauthentication, so the admin UI-only patch used the already recorded live Figma inventory for admin nodes `22:10907`, `22:11416`, `22:11442`, `22:11451`, `22:11460`, `22:11483`, `39:13203` plus the user-provided sidebar toggle reference for node `24:1875`.
- The latest admin sidebar slice grouped the runtime sidebar by the recorded Figma sections, kept demo counters out of scope, and passed targeted ESLint, direct `tsc --noEmit`, focused `git diff --check`, plus a Playwright runtime-CSS fixture for expanded/collapsed widths and contrast. Fresh authenticated QA is currently blocked inside Codex Node by the Prisma native engine code-signature Team ID mismatch.
- MemPalace project refresh remains blocked because `.npmrc` looks sensitive and is not ignored.
- Built-in browser/browser-use was unavailable in the latest remediation batch, so browser verification used Playwright fallback.
- DB-backed public route visual rechecks remain environment-dependent when local PostgreSQL at `localhost:55432` is unavailable and Docker Desktop is not running.
- the original external audit file path `/Users/amir/Downloads/barsynergy-uiux-audit.md` became available again on 2026-05-30 and is being used for the final requirement-by-requirement closeout audit.

- 2026-06-07 Security audit remediation (9/9 tasks) completed:
  - **IDOR fix** (8/10): `updateWorkExperiences` now uses `updateMany` with `profileId` owner-scoped check, rejects foreign ids
  - **Enumeration fix** (7/10): business registration always returns same success code (`business-request-created`), user registration hides `email-used` → generic `invalid`, duplicate message removed from login page
  - **Self-register lifecycle** (7/10): users created as `PENDING` with verification token + email sent via `sendVerificationEmail` (nodemailer), no session issued until email verified; `verifyUserEmailAction` uses atomic CTE to consume token + set `emailVerifiedAt` + activate user; `resendUserVerificationAction` now actually sends the email
  - **Password hygiene** (6/10): shared `PASSWORD_MIN_LENGTH = 8` in `password-policy.ts`, change password invalidates all existing sessions (`Session.deleteMany`)
  - **Reset token atomicity** (6/10): `resetPasswordAction` uses single atomic CTE consuming token → updating password → deleting sessions in one operation
  - **Resume validation** (6/10): `.docx`/`.odt` now checked for required internal ZIP entries (`word/document.xml`, `content.xml`) via central directory parser — arbitrary ZIP masquerading blocked
  - **Telegram PII removed** (6/10): Telegram notifications now only include type, subject and admin link (no name/email/city)
  - **Saved vacancies** (5/10): `toggleSavedVacancy` checks `vacancy.status === PUBLISHED`; both `getSavedVacancies` queries filter to `PUBLISHED` only
  - **Anti-abuse** (4/10): Cloudflare Turnstile added to business registration, participant registration, vacancy response and vacancy submission forms with server-side `verifyTurnstileToken`; falls back gracefully when env vars absent
  - New files: `src/lib/auth/password-policy.ts`, `src/lib/security/turnstile.ts`, `src/components/ui/turnstile.tsx`
  - Validation: `tsc --noEmit`, `eslint`, `prisma validate` pass clean

## Recent Verified State

- `dev` and `prod` currently point to `f4f49a5 Fix public header navigation spacing` locally before the 2026-05-26 release checkpoint commit.
- Production deployment for merge `da182de` was completed on 2026-05-17.
- Previous final public/admin maturity QA reported green validation with `git diff --check`, `npm run lint`, `./node_modules/.bin/prisma validate`, `npm run typecheck` and `npm run build`.
- The `npx` Prisma validation wrapper is intentionally not used in this workspace because the local path contains `:`, which breaks wrapper resolution.

- 2026-06-08 Admin panel audit fix batch applied locally:
  - **P0** StatCard now accepts `href` prop — dashboard cards link to relevant admin sections (applications, users, articles/events/vacancies);
  - **P0** `AdminCmsActions` now reads `isDirty` from `UnsavedChangesProvider` — unsaved-changes indicator shows in sticky footer after first field change;
  - **P0** `UnsavedChangesProvider` added to admin shell — provides beforeunload guard and `useFormDirtyDetection`/`useCmdSubmit` hooks for dirty-form navigation protection;
  - **P0** AdminPagination now shows page info with cleaner text and ← → buttons when `totalPages > 1`;
  - **P1** Logout button added to admin topbar via `logoutAction` passed as prop from layout;
  - **P1** «Навыки» added to `adminHeaderSections` — topbar no longer shows «Админка» on skills page;
  - **P1** Dashboard «Черновики» StatCard href now points to the section with the most drafts (articles > events > vacancies);
  - **P1** Search/filter added to `/admin/users` — search by email or company name;
  - **P1** Homepage CMS «Обзор секций» simplified — removed duplicate link cards, kept section summary strip;
  - **P2** `DataTable` now has `role="grid"` and `aria-label` for a11y;
  - **P2** `CoverImageField` alt-text placeholder replaced with hint explaining SEO purpose;
  - **P2** Supplier form hints added for «Сайт» (not required) and «Зона работы» (example);
  - **P2** `useCmdSubmit` hook available for Cmd+S quick-save in forms.
  - Resolved pre-existing issues (no code change needed): sidebar collapsed state persisted to localStorage (NAV-1), «Снять с сайта» already uses confirm dialog (SUPP-1), pagination already has prev/next buttons when `totalPages > 1` (LIST-2).
  - Validation: `npm run lint` passes (same 5 pre-existing errors), `npm run typecheck` passes clean.
- 2026-06-10 admin CMS form cleanup (8-step план исправлений) applied across all 6 content types:
  - **Slug** moved from «Публикация» into `AdminCmsAdvancedSection` with `readOnly` + warning about broken links; create forms omit slug entirely (server-generated).
  - **title/companyName** deduplicated for suppliers and partners: `title = companyName` auto-filled in actions; vacancies keep title but label renamed to «Название вакансии».
  - **Status** select removed from all publication/status sections; `AdminContentVisibilityPanel` is now the single status control point.
  - **Alt text** renamed to «Описание фото», wrapped in `AdminCmsAdvancedSection` inside `CoverImageField`, default value falls back to current file name.
  - **Labels** improved: «Краткое описание» → «Описание для карточки» + hint; «Описание» → «Текст страницы» + hint; «Программа» (courses) gets hint.
  - **Markdown editor** height increased from `min-h-64`/`min-h-80` to `min-h-[480px]` across all forms.
  - **Supplier «Проверка»** section removed; `isVerified` moved as `CheckboxField` into «Компания».
  - **«Отмена»** buttons removed from all `AdminCmsActions` (nav link in header already covers back navigation).
  - Validation: `npm run lint` clean, `npm run typecheck` clean.
- 2026-06-08 8 confirmed audit candidates fixed:
  - **🔴 register/actions.ts:31** — `confirmPassword` added to Zod schema with `.refine()` server-side validation, matching client check;
  - **🔴 contacts/actions.ts + supplier-inquiry-form.tsx:60** — `'supplier'` restored to `contactTopicValues` enum with label, fallback URL no longer coerces to `'other'`;
  - **🟡 verify-email/actions.ts:118** — bare `catch` replaced with `instanceof AuthRateLimitError` guard; real DB errors return `'failed'` instead of false `'rate-limited'`;
  - **🟢 admin/suppliers/[id]/page.tsx** — status field removed in 2026-06-10 cleanup; `AdminContentVisibilityPanel` is now the single status control point;
  - **🟡 admin-cms-form.tsx:51** — `AdminCmsActions` converted to `'use client'`, reads `isDirty` from context; unsaved-changes indicator now appears after first field change and disappears on submit;
  - **🟡 supplier-inquiry-form.tsx:80** — client-side Turnstile guard: submit blocked with inline error if token empty; `onVerify` clears error state;
  - **🟢 admin-shell-frame.tsx:20** — sidebar collapse uses lazy `useState` initializer (reads `localStorage` directly), no `useEffect` flash on reload;
  - **🟢 admin/page.tsx:305** — `contentWarningCount` StatCard gets `href` pointing to `/admin/suppliers?filter=no-city` when count > 0.

## Active Blockers / Risks

- Owner/legal review is still required before production personal-data collection.
- Production SMTP/Telegram credentials are required before real external notifications can be relied on.
- Production ingress still needs real-host sign-off for HTTP-to-HTTPS redirect, `X-Real-IP` identity and spoofed forwarding-header rejection.
- `references/` contains local moodboard/reference files and is ignored; it should not be merged to `prod` unless explicitly approved as source material.
- Production deploy still needs the release checkpoint commit to be pushed to `dev` and fast-forwarded into `prod`.

## Next Recommended Steps

1. Finish triage of the remaining `79` failing source-contract tests on `dev` and decide which failures are real regressions versus stale assertions.
2. After validation is acceptable, create one shared checkpoint commit for the current dirty tree, then prepare the next stabilization or release slice.

## Historical Notes

Detailed prior status logs were archived to:

- `docs/archive/project-status-history-2026-05-22.md`

That archive is historical context only. It is not the active task queue.
