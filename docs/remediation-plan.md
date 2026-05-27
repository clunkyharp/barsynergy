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

### Still Open

- Extract the cost calculator into hook, calculation utilities and smaller UI parts without changing formulas or visible values.
- Split `src/lib/public/content.ts` by domain while preserving current exports.
- Add browser/axe Playwright scenarios specifically for custom Select and Dropdown keyboard/form flows.
- Add a shared admin content lifecycle helper for status update and draft delete across content entities.
- Confirm production scheduler setup before launch; code-level session cleanup remains unchanged by design.
- Decide separately whether a mobile admin read-only/actions layer is a product requirement.

### Current Validation Status

- `npm run lint`: passed.
- `npm test`: passed, 119/119.
- `./node_modules/.bin/prisma validate`: passed.
- `git diff --check`: passed.
- `npm run typecheck`: completed with the existing local Next/SWC code-signature warning during `next typegen`; direct `tsc --noEmit` passed earlier in this batch.
- `npm audit signatures`: passed.
- `npm audit --omit=dev`: passed.
- `npm audit --audit-level=low`: reports one existing moderate dev-only `brace-expansion` advisory under `typescript-eslint`; no automatic fix was applied because this dependency batch only pins current lockfile versions.
- `npm ls --depth=0`: completed; it still reports the pre-existing extraneous `@emnapi/runtime` in local `node_modules`.
- `npm run build`: blocked by the local Next/SWC darwin-arm64 code-signature Team ID mismatch after successful `prisma generate`.
- Browser QA is still pending for this stabilization branch.
- Commit/merge still requires a clean build in an environment without the SWC code-signature blocker and fresh browser QA.

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
