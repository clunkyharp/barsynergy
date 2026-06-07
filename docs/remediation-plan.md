# Project Remediation Plan

## Purpose

This document turns the code, security, performance, UX/UI and documentation audits into one implementation plan.

## Active Stabilization Queue - 2026-05-27

This section is the active remediation queue before Phase 5. The historical 2026-04-26 remediation plan below is preserved for audit trail only.

Mode: `IMPLEMENTATION` on `feature/stabilization-remediation`, after a separate checkpoint of the previous dirty `dev` tree.

### Completed In Current Batch

- Checkpointed the previous dirty `dev` batch before starting stabilization.
- Added typed `Application.payload` Zod schemas and parse/build helpers in `src/lib/applications/application-payloads.ts`.
- Replaced manual payload reads/writes in public form actions, admin publication/drafts, business access and cabinet/admin application views.
- Added `assertSameOriginServerAction()` and applied it to public, auth, admin and business mutation actions.
- Added a source test that tracks high-risk server action files and requires same-origin protection.
- Added `ApplicationNotification` outbox schema, migration, queue processor and `npm run notifications:retry`.
- Public application creation now stores the application and queued notification attempts in one transaction, then dispatches an immediate attempt after commit.
- Admin application detail now shows notification attempts and status.
- Split admin application actions into status, notes, publication and business-access action files, with `actions.ts` kept as the import facade.
- Moved admin application transaction/business rules into `src/lib/admin/applications/*`.
- Added `submitPublicApplicationAction()` and migrated supplier, partner, event, education, business, consulting, contact and vacancy-placement submissions to the common public-form flow. Vacancy response remains specialized because it owns private resume upload and cleanup.
- Mechanically split `src/app/globals.css` into `src/app/styles/{tokens,base,forms,calculator,ui-primitives,public,admin}.css` and kept `globals.css` as the import facade.
- Pinned direct dependencies in `package.json` and the lockfile root to the currently resolved exact versions without updating to latest.
- Changed CSP `frame-ancestors` from `'self'` to `'none'`.
- Updated the scheduler runbook with the notification retry job.
- Split the cost calculator into a thin composition shell plus `use-cost-calculator-state`, formatting helpers, ingredient editor and result rail modules without changing formulas, CSS classes or visible copy.
- Split public content list queries into `src/lib/public/content/*` domain modules while preserving the public `src/lib/public/content.ts` exports.
- Added `src/lib/admin/content-lifecycle.ts` for shared admin content status updates and draft deletes across articles, events, courses, vacancies, suppliers, partners and general sponsors.
- Added Playwright/axe coverage for custom Select and Dropdown keyboard/form flows in `tests/e2e/ui-primitives.spec.ts`.
- Completed browser QA for public smoke, public accessibility sweep, authenticated admin QA, UI primitives and a focused screenshot sweep of home, suppliers, contacts form, calculator desktop/mobile, admin applications desktop and admin mobile fallback.
- Added local native-tool runners for `npm run build` and `npm run typecheck`; when launched from a bundled desktop-app Node on macOS, they re-exec through system/Homebrew Node so native Next/SWC and Prisma modules can load.
- Added the 1024px admin fallback contract, widened the desktop calculator ingredient grid and added QA coverage that ignores hidden native custom-select elements while checking visible triggers.
- Triaged and remediated the actionable React Doctor findings: `PublicFilters` now wraps its `useSearchParams()` implementation in an owned Suspense boundary, page metadata/detail metadata/noindex private metadata is present for the reported routes, custom admin/business guards and intentional public actions are recorded in `react-doctor.config.json`, and contacts topic labels no longer use a module-scoped object.
- Applied the SEO remediation slice: route-specific public canonical metadata and OG URLs, noindex metadata for private/auth/admin entry pages, async sitemap with published detail URLs, rendered JSON-LD for site/breadcrumb/detail entities, hard 404 for missing public detail records, canonical `APP_URL=https://barsynergy.ru` examples/docs, and tracked Nginx redirects from `www`/temporary `sslip.io` hosts to the canonical domain.
- Applied the 2026-05-27 UI remediation brief: simplified `/about`, profile states and public card systems, replaced repeated equal-height public tiles with comparison rows, removed hardcoded article starter placeholders, tightened mobile cookie/hash/form behavior, removed progressive `content-visibility` from deferred screenshot sections, and made admin application notification history optional when the local notification migration has not been applied.
- Applied the public/auth visual stabilization slice: `/general-sponsors` benefit/package blocks use editorial rows instead of nested cards, sponsor contacts are compact links, `/business` and `/consulting` use service rows with type/result columns, contact/register forms are sectioned, and shared public card/label/form states use quieter neutral borders without hover-lift or glow.
- Applied the coffee-bar redesign Batch 1 foundation slice: runtime/design tokens now use warm graphite plus amber, cookie notice is bottom-right with a six-month localStorage choice, homepage hero badges and the digital-services promo block are removed, homepage sponsors are a compact logo strip, and `/about` no longer renders the redundant next-links table.
- Applied the 2026-05-30 fix-plan v2 remediation slice: public header white-logo/action spacing/mobile-menu theme fixes, global anchor scroll padding, article query/empty-state behavior, events and education empty-state cleanup, auth/profile/404/admin/business form polish, custom checkbox checked color, brand/action token documentation, and source audit for the reported floating `N`/issue badge.
- Applied the 2026-06-05 quality remediation slice: homepage FAQ state now lives in a separate `home-cta-faq-section.tsx` client island so `homepage-client.tsx` no longer hydrates the whole homepage; shared Telegram/WhatsApp/Instagram/email/phone/site accent colors were moved from duplicated component literals into semantic tokens plus `channel-accent.ts`; repeated public filter field/chip/reset markup was extracted from `public-filters.tsx` into `public-filters-fields.tsx` to reduce mixed concerns without changing query-param behavior or copy.

### Still Open

- Confirm production scheduler setup before launch; code-level session cleanup remains unchanged by design.
- Decide separately whether a mobile admin read-only/actions layer is a product requirement.
- Re-run DB-backed public visual checks after local PostgreSQL is available at `localhost:55432` or another approved database connection is configured.
- Apply/check the canonical-domain redirect rule in the real host Nginx runtime after deploy, then run live SEO smoke.
- Search Console/Метрика indexing confirmation remains outside this batch.

### Current Validation Status

- `npm run lint`: passed.
- CSS parse for `src/app/**/*.css`: passed, 8 files.
- `npm test`: passed, 130/130.
- `./node_modules/.bin/prisma validate`: passed.
- `git diff --check`: passed.
- `npm run typecheck`: passed after the native-tool runner fix.
- React Doctor full offline scan: passed the current remediation gate with 0 errors; targeted rules `nextjs-no-use-search-params-without-suspense`, `nextjs-missing-metadata`, `server-auth-actions` and `server-no-mutable-module-state` report 0 findings.
- `npm audit signatures`: passed.
- `npm audit --omit=dev`: passed.
- `npm audit --audit-level=low`: reports one existing moderate dev-only `brace-expansion` advisory under `typescript-eslint`; no automatic fix was applied because this dependency batch only pins current lockfile versions.
- `npm ls --depth=0`: completed; it still reports the pre-existing extraneous `@emnapi/runtime` in local `node_modules`.
- `npm run build`: passed after the SEO remediation slice; the latest rerun now compiles and typechecks, then blocks in the standalone runtime smoke because local PostgreSQL at `localhost:55432` is unavailable and Docker Desktop is not running.
- Public/auth visual stabilization targeted tests: `node --test tests/public-cta-copy.test.mjs tests/general-sponsor-card-states.test.mjs` passed, 29/29.
- Public/auth visual stabilization lint: `npm run lint` passed.
- Direct `next build` with temporary local validation env overrides passed after the latest public/auth visual patch.
- Playwright rendered SEO smoke against the standalone build: passed for 9 public index routes, 3 private/noindex routes, `/sitemap.xml`, `/suppliers/linea-service-equipment-demo`, `/articles/skfo-bar-industry-map` and a missing article 404.
- Playwright public smoke: passed, 2/2, including calculator control geometry across 390, 1280, 1366 and 1440px.
- Playwright public accessibility sweep: passed, 28/28.
- Playwright authenticated admin QA: passed, 24/24, including admin fallback at 390, 768 and 1023px and desktop shell at 1024 and 1280px.
- Playwright UI primitives: passed, 2/2.
- Focused Playwright screenshot sweep: passed for home, about, articles, education, partners, contacts form, profile, business cabinet, business requests and admin application detail at `1280x900` and `390x844` where applicable; temporary screenshots were removed after validation.
- Focused Playwright visual QA for the public/auth visual stabilization passed for `/tools/cost-calculator`, `/business` and `/consulting` at `390`, `768` and `1440` with zero horizontal overflow; `/contacts` and `/auth/register` passed in standalone with public forms disabled. `/general-sponsors` and enabled-form states are blocked until local PostgreSQL is available.
- Coffee-bar redesign Batch 1 foundation passed `git diff --check`, targeted `node --test tests/cookie-notice.test.mjs tests/home-feature-card-density.test.mjs tests/public-cta-copy.test.mjs`, targeted ESLint, `npm run lint`, `npm run typecheck`, and Playwright DOM/console smoke for `/` and `/about` at desktop/mobile in light/dark mode with zero horizontal overflow.
- Fix-plan v2 remediation passed `git diff --check`, targeted `node --test tests/site-header-navigation.test.mjs tests/home-feature-card-density.test.mjs tests/public-cta-copy.test.mjs tests/cost-calculator-formula.test.mjs`, full `npm test` with 141/141 tests, `npm run lint`, `npm run typecheck`, `./node_modules/.bin/prisma validate`, and Playwright DOM smoke on `http://127.0.0.1:3100` for header, mobile menu, auth error/role state, calculator copy error, 404 and legacy article query behavior.
- Focused standalone runtime check: passed for admin application detail on the current build; notification-history fallback no longer logs the missing local notification table as a page failure.
- Browser QA is current for this branch as of 2026-05-27.
- 2026-06-05 focused runtime smoke passed against the existing local `http://127.0.0.1:3000` dev server: `/` and `/suppliers` at desktop, plus `/suppliers` at mobile, all returned HTTP 200 with zero console/page errors and zero horizontal overflow after the homepage/client-island and public-filter refactor.

## Current Use

This is a historical remediation plan from the 2026-04-26 audit cycle. Keep it for audit trail and context, but do not use the open/closed labels below as the current launch queue.

Current operational sources supersede this file when they conflict with it:

- `PROJECT_STATUS.md`;
- `docs/phase-plan.md`;
- `docs/deploy.md`;
- `docs/scheduler-runbook.md`;
- `docs/security.md`;
- `docs/personal-data-launch-checklist.md`.

Known superseded areas: Phase 2 content/admin implementation is complete for the current MVP contract, auth pages are no longer placeholders, production cleanup is documented in the scheduler runbook, and deploy/ingress instructions now live in the deploy runbook.

## Scope

In scope:

- admin route protection;
- auth/session hardening;
- deploy and infrastructure readiness;
- storage path safety;
- session cleanup;
- public UX copy and accessibility fixes;
- documentation alignment for setup, deploy, env, phases and audit workflow.

Out of scope:

- full CRUD implementation;
- production data migration;
- payment, LMS, subscriptions or public profiles;
- active penetration testing;
- full visual redesign.

### Product Deferral: `/search` Not In Primary Navigation

`/search` remains a future-facing public route. By owner decision, it is not part of the primary public navigation in the current stabilization scope. Current discovery should rely on section-level listings and filters. This must not be treated as an active UX bug until Phase 5 search/discovery work starts.

## Current State Summary

The project has a clean Next.js foundation, but some areas look more finished than they are. The main risks are `/admin` access control, incomplete deploy/TLS/migration instructions, storage path safety before uploads are exposed, unbounded session table growth, public copy with internal phase language, and missing route-level UX states.

Update on 2026-04-26:

- admin pages now use section-level permission checks;
- storage public URL generation now requires a public file reference;
- upload size is capped before real upload routes are exposed;
- Phase 2 content/admin mini-spec exists at `docs/phase-2-content-admin-spec.md`;
- TLS ownership, production session cleanup scheduling and legal review remain blocked on owner/environment decisions.

## Key Findings And Current Status

### Closed - Admin Routes Were Not Protected

- Problem: `/admin` routes render without checking session or role.
- Impact: when CRUD or private data is added, this becomes broken access control.
- Recommendation: keep an early proxy redirect for anonymous `/admin` requests and a central server-side guard in `src/app/admin/layout.tsx` using `getCurrentUser()` and `canAccessAdmin()`.
- Dependencies: existing auth utilities.
- Verification: unauthenticated request to `/admin` returns a `307` redirect to `/auth/login`; non-admin roles cannot render admin shell.

### Open - Production HTTPS/TLS Contract Is Incomplete

- Problem: production compose now exposes only `80`, and Nginx listens on `80`; TLS termination is expected outside this stack but the real host still needs confirmation.
- Impact: production HTTPS depends on an external edge proxy or load balancer being configured correctly.
- Recommendation: keep app-side Nginx private HTTP only when an external TLS layer exists; otherwise add explicit Nginx TLS configuration before launch.
- Dependencies: hosting decision and certificate management.
- Verification: deploy docs and Nginx/compose agree on where HTTPS is terminated; final host TLS check remains `Needs verification`.

### Closed - Production Migration Flow Was Ambiguous

- Problem: docs tell operators to run Prisma migrations from the host, while production DB host usually resolves only inside Docker network.
- Impact: migrations can fail or be skipped during deploy.
- Recommendation: document and/or add a containerized `prisma migrate deploy` path.
- Dependencies: production compose.
- Verification: deploy runbook has a command that works inside the production network.

### Partially closed - Session Lifecycle Needs Production Scheduling

- Problem: expired sessions are checked at read time; a cleanup command exists, but production scheduling must be configured.
- Impact: `Session` grows forever, increasing DB size and auth query cost.
- Recommendation: run `npm run session:cleanup:expired` on a cron/systemd/hosting scheduler after `DATABASE_URL` is available.
- Dependencies: Prisma client and production scheduler/cron.
- Verification: cleanup command deletes expired sessions and `docs/setup.md` documents the scheduling path; runtime DB verification remains environment-dependent.

### Closed - Storage Local Path Handling Was Not Guarded

- Problem: local storage uses `path.join` with `folder` and `fileKey` inputs without a root containment check.
- Impact: future upload/delete endpoints could introduce path traversal if user-controlled values reach storage.
- Recommendation: normalize storage paths, reject absolute paths and `..`, and assert resolved paths stay under upload root.
- Dependencies: storage service.
- Verification: path helper prevents traversal for upload and delete paths.

### Closed - S3 Delete Did Not Use Stored Bucket

- Problem: S3 delete attempts deletion from both public and private buckets by `fileKey`.
- Impact: key collisions could delete the wrong object from the other bucket.
- Recommendation: update storage deletion contract to support exact `bucket + fileKey`, or add a safe method before exposing delete flows.
- Dependencies: storage type contract and future DB usage.
- Verification: delete flow targets only the persisted file bucket.

### Closed - `SESSION_SECRET` Was Required But Not Used For Session Token Hashing

- Problem: tokens must be hashed with a secret-backed HMAC so production session validation is tied to `SESSION_SECRET`.
- Impact: rotating `SESSION_SECRET` invalidates existing sessions, which is expected before real auth launch.
- Recommendation: keep HMAC-SHA256 with `SESSION_SECRET`; define key rotation only when real sessions are in use.
- Dependencies: auth implementation phase.
- Verification: session hash function reads the validated secret, with a development fallback only outside production.

### Closed - Public Copy Contained Internal Phase Language

- Problem: public pages mention `Phase`, `MVP`, placeholders and future implementation details.
- Impact: external users see project management language instead of clear product value.
- Recommendation: rewrite public copy in user-facing language while keeping honest MVP scope.
- Dependencies: public page content.
- Verification: no public route contains internal phase placeholders except admin/auth development placeholders.

### Closed - Mobile Menu Accessibility Was Incomplete

- Problem: mobile menu has no `aria-controls`, does not close on `Esc`, and does not close on outside click.
- Impact: keyboard and assistive-technology users get a weaker navigation experience.
- Recommendation: add stable menu id, `aria-controls`, `Esc` handling and outside-click handling.
- Dependencies: `MobileSiteMenu` client component.
- Verification: keyboard close works and menu state remains predictable.

### Closed - Public Heading Semantics Were Inconsistent

- Problem: major section titles use `p` elements instead of semantic headings.
- Impact: screen reader navigation and document outline are weaker.
- Recommendation: use `h2`/`h3` where sections and cards introduce content groups.
- Dependencies: public page templates.
- Verification: semantic headings exist for major page sections.

### Closed - Route-Level UX States Were Missing

- Problem: no shared `loading`, `error` or `not-found` UI exists for the App Router.
- Impact: data-driven pages added later will fall back to default or inconsistent states.
- Recommendation: add basic route-level `loading.tsx`, `error.tsx` and `not-found.tsx`.
- Dependencies: UI primitives.
- Verification: routes have consistent fallback/error/not-found UI.

### Closed with ongoing maintenance - Documentation Did Not Fully Match Runtime Reality

- Problem: docs disagree with actual Prisma schema, phase status, deploy commands and env examples.
- Impact: future agents or developers may follow stale instructions.
- Recommendation: update docs after code fixes, with runtime configs as source of truth.
- Dependencies: completed remediation changes.
- Verification: README/docs/env/deploy/phase-plan describe current behavior.

## Historical Remaining Remediation Order

The order below belongs to the 2026-04-26 audit cycle. It is preserved for traceability only and must not be treated as the active release queue.

### Phase 1 - Launch Blockers

1. Clarify production TLS ownership.
2. Configure one production scheduler for `npm run session:cleanup:expired`.
3. Get owner/legal approval for legal texts before collecting personal data.

### Phase 2 - Content/Admin Implementation (superseded)

1. Add Phase 2 Prisma models from `docs/phase-2-content-admin-spec.md`.
2. Add migrations and indexes for published content queries.
3. Build admin CRUD one section at a time.
4. Keep public queries published-only, paginated and bounded.

### Phase 3 - Documentation Maintenance

1. Update `PROJECT_STATUS.md`, `docs/phase-plan.md` and Obsidian Kanban after each meaningful batch.
2. Re-run lint, typecheck, build and Prisma validate after code changes.
3. Re-run public screenshot QA after real content data is connected.

## Historical Step-By-Step Implementation Plan

The steps below are not current instructions. Use the operational docs listed in "Current Use" for active work.

### Step 1 - Admin Guard

- Goal: prevent anonymous admin access.
- Changes: add early proxy redirect and server-side guard in `src/app/admin/layout.tsx`.
- Files/modules likely affected: `src/proxy.ts`, `src/app/admin/layout.tsx`, `src/lib/auth/permissions.ts`.
- Risk: current auth pages are placeholders, so redirect target must be clear.
- Verification: admin renders only when `getCurrentUser()` returns moderator/admin.
- Done when: `/admin` redirects unauthenticated visitors to `/auth/login` before admin content renders.

### Step 2 - Storage Safety

- Goal: prevent path traversal before upload APIs are exposed.
- Changes: add safe path helper and use it for upload/delete.
- Files/modules likely affected: `src/lib/storage/local-storage.service.ts`, `src/lib/storage/storage.types.ts`, `src/lib/storage/s3-storage.service.ts`.
- Risk: changing delete signature can affect future callers; current code has no callers beyond service.
- Verification: typecheck and targeted code review.
- Done when: local storage paths cannot escape upload root.

### Step 3 - Session Cleanup

- Goal: stop unbounded session table growth.
- Changes: add Prisma cleanup script and package command.
- Files/modules likely affected: `scripts/*`, `package.json`, docs.
- Risk: command requires `DATABASE_URL`.
- Verification: command can run safely against configured DB.
- Done when: expired session cleanup has a documented command.

### Step 4 - Public UX Fixes

- Goal: improve public clarity and accessibility without a redesign.
- Changes: remove internal phase copy from public pages, improve mobile menu, add semantic headings and route-level states.
- Files/modules likely affected: `src/app/(public)/**`, `src/components/layout/mobile-site-menu.tsx`, `src/components/public/**`, `src/app/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`.
- Risk: visual regressions on mobile need live check.
- Verification: lint/typecheck/build and browser smoke when available.
- Done when: public routes no longer expose internal phase language and mobile menu is keyboard-closable.

### Step 5 - Deploy And Docs Alignment

- Goal: make docs match runtime behavior and production constraints.
- Changes: update deploy/env/setup/phase docs and README links.
- Files/modules likely affected: `README.md`, `docs/deploy.md`, `docs/env.md`, `docs/setup.md`, `docs/phase-plan.md`, `docs/project-plan.md`.
- Risk: TLS decision may remain `Needs verification` without production host details.
- Verification: docs commands match package scripts and compose files.
- Done when: docs no longer contain known contradictory deploy/setup instructions.

## Completed Quick Wins

- Added `aria-controls`, `Esc` close and outside-click close to mobile menu.
- Used Prisma `UserRole` for admin permission checks.
- Added `src/app/loading.tsx`, `src/app/error.tsx` and `src/app/not-found.tsx`.
- Replaced public placeholder copy with visitor-facing copy.
- Added a session cleanup script.

## Risks And Assumptions

- Auth implementation is still incomplete, so admin guard can only redirect to the existing login placeholder.
- TLS setup may depend on external hosting not represented in this repo.
- Upload APIs are not exposed yet, so storage fixes are preventive.
- UX visual conclusions still need live viewport verification.

## Final Recommendation

Continue with Phase 2 database models and content/admin CRUD from the mini-spec. Do not add public personal-data forms, payments, LMS, subscriptions or public profiles until their planned phases and legal decisions are ready.
