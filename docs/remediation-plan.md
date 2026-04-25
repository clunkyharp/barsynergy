# Project Remediation Plan

## Purpose

This document consolidates the code review, security audit, memory/performance audit, UX/UI audit and documentation audit into one implementation plan.

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

The project is a clean Next.js fullstack foundation, but several surfaces look more production-ready than they are. The main risks are access control for `/admin`, incomplete deploy/TLS/migration contracts, storage path safety before uploads are exposed, unbounded session table growth, public copy that exposes internal phase language, and missing route-level UX states.

## Key Findings

### P0 - Admin Routes Are Not Protected

- Problem: `/admin` routes render without checking session or role.
- Impact: when CRUD or private data is added, this becomes broken access control.
- Recommendation: keep an early proxy redirect for anonymous `/admin` requests and a central server-side guard in `src/app/admin/layout.tsx` using `getCurrentUser()` and `canAccessAdmin()`.
- Dependencies: existing auth utilities.
- Verification: unauthenticated request to `/admin` returns a `307` redirect to `/auth/login`; non-admin roles cannot render admin shell.

### P0 - Production HTTPS/TLS Contract Is Incomplete

- Problem: production compose now exposes only `80`, and Nginx listens on `80`; TLS termination is expected outside this stack but the real host still needs confirmation.
- Impact: production HTTPS depends on an external edge proxy or load balancer being configured correctly.
- Recommendation: keep app-side Nginx private HTTP only when an external TLS layer exists; otherwise add explicit Nginx TLS configuration before launch.
- Dependencies: hosting decision and certificate management.
- Verification: deploy docs and Nginx/compose agree on where HTTPS is terminated; final host TLS check remains `Needs verification`.

### P1 - Production Migration Flow Is Ambiguous

- Problem: docs tell operators to run Prisma migrations from the host, while production DB host usually resolves only inside Docker network.
- Impact: migrations can fail or be skipped during deploy.
- Recommendation: document and/or add a containerized `prisma migrate deploy` path.
- Dependencies: production compose.
- Verification: deploy runbook has a command that works inside the production network.

### P1 - Session Lifecycle Is Incomplete

- Problem: expired sessions are checked at read time; a cleanup command exists, but production scheduling must be configured.
- Impact: `Session` grows forever, increasing DB size and auth query cost.
- Recommendation: run `npm run session:cleanup:expired` on a cron/systemd/hosting scheduler after `DATABASE_URL` is available.
- Dependencies: Prisma client and production scheduler/cron.
- Verification: cleanup command deletes expired sessions and `docs/setup.md` documents the scheduling path; runtime DB verification remains environment-dependent.

### P1 - Storage Local Path Handling Is Not Guarded

- Problem: local storage uses `path.join` with `folder` and `fileKey` inputs without a root containment check.
- Impact: future upload/delete endpoints could introduce path traversal if user-controlled values reach storage.
- Recommendation: normalize storage paths, reject absolute paths and `..`, and assert resolved paths stay under upload root.
- Dependencies: storage service.
- Verification: path helper prevents traversal for upload and delete paths.

### P1 - S3 Delete Does Not Use Stored Bucket

- Problem: S3 delete attempts deletion from both public and private buckets by `fileKey`.
- Impact: key collisions could delete the wrong object from the other bucket.
- Recommendation: update storage deletion contract to support exact `bucket + fileKey`, or add a safe method before exposing delete flows.
- Dependencies: storage type contract and future DB usage.
- Verification: delete flow targets only the persisted file bucket.

### P1 - `SESSION_SECRET` Is Required But Not Used For Session Token Hashing

- Problem: tokens must be hashed with a secret-backed HMAC so production session validation is tied to `SESSION_SECRET`.
- Impact: rotating `SESSION_SECRET` invalidates existing sessions, which is expected before real auth launch.
- Recommendation: keep HMAC-SHA256 with `SESSION_SECRET`; define key rotation only when real sessions are in use.
- Dependencies: auth implementation phase.
- Verification: session hash function reads the validated secret, with a development fallback only outside production.

### P2 - Public Copy Contains Internal Phase Language

- Problem: public pages mention `Phase`, `MVP`, placeholders and future implementation details.
- Impact: external users see project management language instead of clear product value.
- Recommendation: rewrite public copy in user-facing language while keeping honest MVP scope.
- Dependencies: public page content.
- Verification: no public route contains internal phase placeholders except admin/auth development placeholders.

### P2 - Mobile Menu Accessibility Is Incomplete

- Problem: mobile menu has no `aria-controls`, does not close on `Esc`, and does not close on outside click.
- Impact: keyboard and assistive-technology users get a weaker navigation experience.
- Recommendation: add stable menu id, `aria-controls`, `Esc` handling and outside-click handling.
- Dependencies: `MobileSiteMenu` client component.
- Verification: keyboard close works and menu state remains predictable.

### P2 - Public Heading Semantics Are Inconsistent

- Problem: major section titles use `p` elements instead of semantic headings.
- Impact: screen reader navigation and document outline are weaker.
- Recommendation: use `h2`/`h3` where sections and cards introduce content groups.
- Dependencies: public page templates.
- Verification: semantic headings exist for major page sections.

### P2 - Route-Level UX States Are Missing

- Problem: no shared `loading`, `error` or `not-found` UI exists for the App Router.
- Impact: data-driven pages added later will fall back to default or inconsistent states.
- Recommendation: add basic route-level `loading.tsx`, `error.tsx` and `not-found.tsx`.
- Dependencies: UI primitives.
- Verification: routes have consistent fallback/error/not-found UI.

### P2 - Documentation Does Not Fully Match Runtime Reality

- Problem: docs disagree with actual Prisma schema, phase status, deploy commands and env examples.
- Impact: future agents or developers may follow stale instructions.
- Recommendation: update docs after code fixes, with runtime configs as source of truth.
- Dependencies: completed remediation changes.
- Verification: README/docs/env/deploy/phase-plan describe current behavior.

## Remediation Order

### Phase 1 - Critical Fixes

1. Protect `/admin` routes.
2. Clarify production TLS ownership.
3. Fix production migration instructions.
4. Guard local storage paths.

### Phase 2 - Structural Fixes

1. Add expired-session cleanup command.
2. Tighten session hashing contract or mark compatibility decision before auth launch.
3. Adjust S3 delete contract to exact bucket deletion.
4. Add route-level fallback states.

### Phase 3 - UX/UI And Maintainability

1. Rewrite public copy that exposes internal implementation phases.
2. Improve mobile menu accessibility.
3. Improve semantic heading structure.
4. Remove or replace suspicious unsupported utility classes.

### Phase 4 - Documentation Alignment

1. Update deploy/env/setup docs.
2. Update phase status and current entity reality.
3. Add README links to remediation/audit docs.
4. Re-run lint, typecheck, build and targeted audit.

## Step-By-Step Implementation Plan

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

## Quick Wins

- Add `aria-controls`, `Esc` close and outside-click close to mobile menu.
- Use Prisma `UserRole` instead of a duplicated string union.
- Add `src/app/loading.tsx`, `src/app/error.tsx` and `src/app/not-found.tsx`.
- Replace public placeholder copy with visitor-facing copy.
- Add a session cleanup script.

## Risks And Assumptions

- Auth implementation is still incomplete, so admin guard can only redirect to the existing login placeholder.
- TLS setup may depend on external hosting not represented in this repo.
- Upload APIs are not exposed yet, so storage fixes are preventive.
- UX visual conclusions still need live viewport verification.

## Final Recommendation

Close Phase 1 first before adding any CRUD or personal-data flows. Then complete Phase 2 and Phase 3 as a single stabilization batch, followed by documentation alignment and a control audit.
