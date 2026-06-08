# Backend Production Analysis And Remediation Plan

Date: 2026-06-08  
Project: BARSYNERGY  
Artifact type: backend technical audit + remediation plan  
Mode: QA (`discovery`)  
Scope: repository-level backend analysis based on local source code and project docs

## Context

- Product type: marketplace + education/community platform for the bar industry
- Backend stack: Node.js + TypeScript
- Framework: Next.js App Router with Server Actions
- Database: PostgreSQL + Prisma ORM
- Architecture: modular monolith on top of a fullstack Next.js app
- Target environment: self-hosted production on Russian VPS
- Infrastructure: Docker Compose and currently verified host-checkout + systemd runtime
- Storage: local in dev, S3-compatible object storage in production
- Auth model: database sessions with `httpOnly` cookies
- Main backend scenarios: registration, login, business access, public forms, vacancy responses, supplier/partner submissions, file uploads, notifications, admin processing
- Main business goals inferred from docs: stability, security, controlled personal-data handling, incremental scaling, fast delivery by a small team

Missing context:

- no real production RPS/DAU/MAU figures in repo docs;
- no explicit staging topology;
- no SLO/SLA definitions;
- no documented observability stack;
- no repo-local CI workflow files;
- no load/performance budget;
- no formal API contract document for external consumers.

Because of that, the analysis focuses on code structure, runtime model, security posture, operational readiness and likely scaling risks.

## 1. Executive Summary

### Overall state

The project is stronger than an average early-stage fullstack monolith in three areas:

- explicit architecture and security documentation exists;
- Prisma + Zod + env validation are used consistently in critical paths;
- personal-data flows, uploads, throttling and notification outbox are treated seriously.

As a production backend, the system is **promising but not yet operationally mature**. The codebase is still optimized for a small team shipping fast inside one repository and one runtime process. It is not yet fully hardened for growth, strict operational support, or multi-team backend development.

### Main architectural risks

- Backend logic is spread across `app/`, `lib/`, and route-specific action files, which weakens domain boundaries.
- The system is a modular monolith by intent, but some modules are already drifting toward fat facades and oversized workflow files.
- Server Actions are tightly coupled to UI surfaces, which makes future external API extraction harder.
- Two production deploy shapes are documented at once: Compose and host-checkout/systemd. This increases operational drift risk.

### Main security risks

- Vacancy response privacy flow is inconsistent with the documented rule "business sees candidate data only after admin forwarding".
- The generic `/contacts` funnel still mixes team contact and business-directed contact intents, which weakens data routing and privacy guarantees.
- Logging is mostly raw `console.error` without structured redaction policy or request correlation.
- There is no visible audit trail layer for privileged admin/business actions beyond database state changes.

### Main performance risks

- Single-process Next.js runtime handles page rendering, server actions, notifications, and business workflows in one place.
- Outbox exists, but dispatch is still in-process and best-effort, not a dedicated worker tier.
- Large page/action files and repeated orchestration logic increase accidental query inefficiency risk.
- No documented application health endpoints, no metrics pipeline, and no load evidence.

### Main scalability risks

- Current design is suitable for a small-to-medium regional product, not for high-throughput or multi-service growth.
- PostgreSQL sessions, application workflows, notifications, and content management all scale through one database and one app runtime.
- No visible queue worker, no read-replica pattern, no partitioning strategy, no caching layer, no background job platform.

### Main maintainability risks

- Some files already exceed local architectural limits and are becoming coordination hotspots.
- Backend behavior is partially encoded in UI route composition, which makes future refactors riskier.
- No repo-local CI pipeline means quality gates depend on manual discipline.
- Observability and production debugging ergonomics are still weak.

### Top-5 critical issues

1. Business-facing vacancy response access appears broader than the documented moderation/forwarding rule.
2. Generic `/contacts` flow still captures business-directed interactions that should be entity-specific.
3. No structured observability baseline: no request IDs, no metrics, no tracing, no health endpoint.
4. No repo-local CI/CD workflow definition, despite many checks and a growing backend surface.
5. Oversized files and mixed orchestration/domain logic are starting to erode modular-monolith boundaries.

### Top-5 quick improvements

1. Restrict business visibility of vacancy responses to `FORWARDED_TO_EMPLOYER` only.
2. Move supplier/business-directed contact flows off `/contacts` into dedicated entity-aware actions/forms.
3. Add a minimal `/health` or `/ready` endpoint plus structured request logging with request IDs.
4. Add repo-local CI for `lint`, `test`, `typecheck`, and `prisma validate`.
5. Split the largest backend workflow files that already exceed local standards.

### Top-5 strategic improvements

1. Extract a clearer application/service layer with stable backend workflow boundaries.
2. Introduce a dedicated worker process for notification and async jobs.
3. Normalize error contracts and audit logging across public, profile, business, and admin actions.
4. Converge on one production deploy model and formalize release/staging topology.
5. Define an externalizable backend API strategy before the product needs mobile apps or partner integrations.

### Technical maturity

Overall maturity: **6/10 as a production-capable backend for a small team**, with strong security intent and decent domain discipline, but still missing operational maturity, API isolation, and scaling-safe execution patterns.

---

## 2. Backend Architecture

### Assessment

Current architecture is a **modular monolith** built inside Next.js fullstack runtime. This is a valid choice for the product stage and team size. The repository documentation explicitly defines layers and forbidden imports, which is a major strength.

What is working:

- clear route segmentation: public, admin, business, profile, auth;
- Prisma access is intentionally kept out of page components by rule;
- auth, applications, notifications, public content, and admin content have recognizable module groups;
- `getCurrentUser()` is request-cached, reducing repeated auth lookups;
- outbox pattern exists for notifications, which is a good step toward durable side effects.

What is weakening:

- business workflows are still split between page composition, action files, and `lib/*` helpers rather than a stronger service layer;
- "modules" and "lib" boundaries are not yet sharp enough to prevent orchestration leakage;
- server actions function as transport + validation + workflow entrypoints, but not all domains are equally isolated behind service boundaries;
- UI-driven routing still shapes backend semantics too much in contact/application flows.

### Architecture table

| Area | What is good | Problem | Risk | Recommendation |
|---|---|---|---|---|
| Runtime model | One deployable monolith fits current team size | Rendering, form processing, auth, notifications, and business workflows share one runtime | Operational coupling and noisy failure domains | Keep modular monolith, but introduce worker separation for async jobs |
| Layering | `docs/architecture.md` defines call boundaries | Real code still has orchestration spread across `app/`, `lib/`, `modules/` | Boundaries become advisory, not enforceable | Move more workflow logic into domain/application services |
| Domain boundaries | Public/admin/business/profile routes are separated well | Contact/business-directed flows still cross boundaries semantically | Wrong data ownership and unclear lifecycle rules | Make entity-aware workflows first-class |
| Async side effects | Notification outbox exists | Dispatch still runs in-process via `after()` | Lost or delayed delivery during crashes/restarts | Add separate queue runner/worker and retry scheduling |
| Deployment architecture | Docs describe runtime clearly | Two active deploy shapes remain documented | Operational drift, env mismatch, rollback errors | Freeze one primary production shape and treat the second as fallback only |

### Main architectural conclusions

- The chosen architecture still matches the current product stage.
- The main risk is not "wrong architecture", but **erosion of boundaries inside the chosen architecture**.
- The backend should remain a modular monolith for now, but with stronger internal service boundaries and an explicit async execution layer.

---

## 3. Project Structure And Code Organization

### Findings

Strengths:

- Route groups are understandable.
- Docs explain intended structure before implementation.
- Infra, schema, runtime docs, and business specs are present.
- Tests cover many source-level contracts.

Weaknesses:

- `src/app` and `src/lib` are both large; workflow ownership is not always obvious.
- Several files exceed project-local limits and are now coordination hotspots.
- Some "utility" files carry business workflow logic, which makes them harder to reason about.
- No repo-local CI config means structure discipline depends on humans.

### Large file hotspots

Largest TypeScript files found:

- `src/lib/profile/actions.ts` — 570 lines
- `src/app/admin/page.tsx` — 540 lines
- `src/lib/admin/content-utils.ts` — 487 lines
- `src/app/(public)/consulting/page.tsx` — 444 lines
- `src/app/admin/applications/page.tsx` — 414 lines
- `src/lib/business/actions.ts` — 407 lines
- `src/lib/public/home.ts` — 401 lines

These sizes matter because the repository standards explicitly try to keep page and action files smaller.

### Structure conclusions

New developer onboarding is **possible but not fast**:

- good docs help;
- naming is mostly coherent;
- but runtime behavior still requires hopping between page, action, helper, schema, and query layers.

### Structural recommendations

- Split large files by workflow, not by arbitrary helpers.
- Push orchestration into application services:
  - `contact-message service`
  - `vacancy-response service`
  - `supplier-inquiry service`
  - `business-access lifecycle service`
  - `application processing service`
- Keep page files as composition and policy entrypoints, not workflow owners.

---

## 4. Code Quality

### General assessment

The code is generally readable and pragmatic. It is not "legacy spaghetti". However, it is entering the stage where growth without stricter decomposition will create accidental fragility.

### Positive signals

- Zod validation is used extensively.
- Env validation is mature.
- Prisma query usage is generally explicit.
- Security helpers are centralized in several important areas.
- Tests document behavioral contracts well.

### Main code quality issues

| Problem | Where | Why it is bad | How to fix | Priority |
|---|---|---|---|---|
| Oversized workflow files | `src/lib/profile/actions.ts`, `src/lib/business/actions.ts`, `src/app/admin/applications/page.tsx`, `src/lib/admin/content-utils.ts` | Harder review, higher regression risk, unclear ownership | Split by use case and write scope | High |
| Utility files carrying domain logic | `src/lib/admin/content-utils.ts` | "Utils" become hidden domain service buckets | Rename/extract into lifecycle, file cleanup, publish helpers | High |
| UI route composition still encoding backend flow semantics | contacts/suppliers/partners/events flows | Transport and domain semantics blur together | Create entity-aware services and form handlers | High |
| Raw console-based logging | multiple `console.error` paths | Poor observability, inconsistent redaction, weak production debugging | Introduce structured logger facade | High |
| Inconsistent orchestration depth per domain | some flows use wrappers, some custom action bodies | System becomes uneven and harder to extend safely | Standardize action entrypoints and service contracts | Medium |

### Code smell summary

- moderate risk of fat actions/services;
- emerging orchestration leakage;
- hidden operational side effects in app runtime;
- some under-engineering in observability and async processing;
- some overloading of the Next.js transport layer as the backend boundary.

---

## 5. API Design

### Current backend API shape

This repository is not exposing a classic public REST backend. The main backend interface is:

- Next.js Server Actions;
- route handlers for selected cases;
- page-driven workflows tightly coupled to frontend forms.

### Assessment

This is acceptable for a same-repo web product, but it has limitations:

- no explicit versioning model;
- no durable public contract for external consumers;
- error semantics vary by surface;
- entity workflows can become UI-coupled too early.

### Current strengths

- server-side validation exists;
- public submission wrapper exists for several application types;
- domain actions usually return safe user-facing errors;
- transport complexity is low for the current web-only product.

### Current weaknesses

- no unified external API layer;
- no request/response envelope standard across all action types;
- no idempotency-key strategy for critical repeated submissions;
- no formal pagination/contract standard beyond page-specific implementations;
- no contract-ready separation for future mobile app, partner integrations, or admin API reuse.

### API recommendations

Short term:

- treat Server Actions as internal API only;
- document the internal action contract style;
- normalize error/result semantics where possible.

Strategic:

- define whether future integration surface should be:
  - internal REST under `/api/*`, or
  - BFF-only with selective extraction later.

Do this before the first external consumer appears.

---

## 6. Authentication And Authorization

### Strengths

- session-based auth in PostgreSQL is appropriate for the product;
- session tokens are HMAC-hashed before persistence;
- cookies are `httpOnly`, `sameSite=strict`, and `secure` in production;
- request-cached current-user lookup is implemented;
- login/business registration throttling exists and uses persistent DB-backed slots;
- docs reflect privacy-sensitive rules for candidate/business data.

### Weaknesses

- authorization rules are not fully aligned with actual vacancy response visibility;
- business flows and team-mediated flows are not fully separated semantically;
- no visible central audit trail for privilege-sensitive transitions;
- no evidence of step-up auth or high-sensitivity action confirmation for admin operations.

### Auth risk table

| Risk | Where | Possible attack / failure | Consequences | Fix | Criticality |
|---|---|---|---|---|---|
| Premature business access to candidate data | business response queries and detail views | Business sees candidate data before admin forwarding | Privacy breach, policy violation, legal risk | Filter business-visible responses to `FORWARDED_TO_EMPLOYER` only | Critical |
| Mixed team-contact and business-contact flow | `/contacts` + contact topics | Wrong routing of personal data and weaker access semantics | Misdelivery, unclear consent scope | Separate entity-directed flows from team contact flow | High |
| No structured admin audit trail | admin mutation surfaces | Hard to prove who changed what and when | Investigation and compliance gaps | Add immutable audit log records for privileged actions | High |
| Session store in main DB only | auth/session | Heavy auth traffic and app traffic compete in same DB | Scaling and operational coupling | Keep for now, but plan optional cache/session offload if growth requires it | Medium |
| No explicit idempotency for critical submissions | public form submissions | Duplicate submissions on retries | Duplicate applications, noisy admin queue | Add optional duplicate suppression or idempotency tokens for selected flows | Medium |

---

## 7. Backend Security Review

### Strong security controls already present

- server-side validation with Zod;
- env validation with production-mode guards;
- DB-backed auth throttling;
- separate submission throttling;
- signature-aware upload validation;
- CSP nonce generation in proxy;
- secure production cookie policy;
- storage-mode restrictions for production;
- legal readiness gates for public personal-data forms;
- notification outbox avoids sending inside DB transaction.

### Main security concerns

1. **Authorization/data exposure mismatch**
   - Documented privacy rule and real business response visibility appear inconsistent.

2. **Contact workflow ambiguity**
   - Generic contact surface is still used for flows that should be entity-specific and role-aware.

3. **Weak operational security telemetry**
   - Errors are logged, but there is no structured audit/trace context.

4. **No explicit secrets management layer beyond env discipline**
   - Fine for current scale, but brittle for multi-env and multi-operator growth.

5. **In-process async delivery**
   - Notifications can be delayed or lost during restarts without a dedicated worker discipline.

### Security risk matrix

| Vulnerability / weakness | Probability | Impact | Criticality | Recommendation | Urgency |
|---|---|---|---|---|---|
| Candidate data exposed to business before forwarding | Medium | High | Critical | Enforce forwarding status gate in business queries and views | Immediate |
| Generic contact funnel for entity-directed flows | High | Medium | High | Separate supplier/partner/team contact workflows | Immediate |
| No structured audit log for privileged mutations | Medium | High | High | Add audit table/events for admin/business-sensitive operations | High |
| Console-only logging without correlation IDs | High | Medium | High | Introduce structured logger + request ID propagation | High |
| No durable worker process for outbox | Medium | Medium | Medium | Add worker/cron runner with clear retry contract | Medium |
| No repo-local CI enforcement | High | Medium | Medium | Add CI pipeline and protected checks | High |

### OWASP-oriented summary

- SQL injection: low apparent risk due to Prisma usage
- CSRF: mitigated partially through same-origin server-action checks and cookie policy
- Broken access control: **meaningful risk** in workflow visibility rules
- Sensitive data exposure: **meaningful risk** where privacy model and query filters diverge
- Insecure file upload: reasonably addressed for current scope
- Secrets leakage: moderate operational risk, not obvious code leak risk

---

## 8. Validation, Error Handling And Observability

### Validation quality

Good:

- env validation is strong;
- public form validation is explicit;
- city/content existence checks exist in important flows;
- upload constraints are enforced server-side.

Weak:

- error handling is mostly user-message oriented, not operator-observability oriented;
- there is no visible global request ID/correlation layer;
- logging is not structured;
- there is no standard machine-readable error envelope for API-like consumers;
- operational failures are harder to trace across request -> DB -> notification steps.

### Current error handling pattern

The repo has reusable server-action error helpers and public-form error normalization. That is a good foundation, but it is still optimized for UX copy, not backend operations.

### Recommended unified backend error envelope

For future route handlers and any reusable internal API:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email is invalid"
      }
    ],
    "requestId": "req_..."
  }
}
```

### Observability gaps

- no request ID propagation;
- no structured log schema;
- no trace/span integration;
- no metrics pipeline in repo;
- no app health/readiness endpoints found;
- no alerting contract in docs;
- no repository-defined error budget or SLOs.

### Recommendation

Introduce a minimal production observability baseline:

1. request ID middleware/header propagation;
2. structured logger facade;
3. app `/health` and `/ready`;
4. counters/timers for:
   - auth failures
   - public submissions
   - notification retries
   - file upload failures
   - business/admin authorization denials

---

## 9. Testing And Delivery Readiness

### What is good

- many repository tests exist;
- behavior contracts are documented in tests;
- Prisma schema and migrations are tracked;
- build/typecheck/lint/test commands are defined.

### What is missing

- no repo-local CI workflow files were found;
- no evidence of automatic gating on PR;
- no staging smoke pipeline in repo;
- no load/performance tests;
- limited evidence of integration tests with a real database lifecycle;
- no production canary or deployment automation contract in repo.

### Testing maturity

Testing is **strong at source-contract level**, but **weaker at system/integration/operations level**.

That means the team is relatively protected from local refactor regressions, but less protected from:

- deployment drift;
- env mismatches;
- auth/DB/runtime integration failures;
- worker/retry/runtime edge cases.

---

## 10. Remediation Roadmap

### Top priorities by horizon

#### Immediate: 1-7 days

1. Fix vacancy response visibility for business accounts:
   - only `FORWARDED_TO_EMPLOYER` should be visible in business queries and UI if policy remains unchanged.
2. Separate `/contacts` from business-directed communication:
   - `/contacts` => only team/platform contact
   - supplier contact => dedicated supplier inquiry flow
   - partner/sponsor-specific flows => dedicated scoped actions or strongly typed dedicated forms
3. Add repo-local CI:
   - `npm run lint`
   - `npm test`
   - `npm run typecheck`
   - `./node_modules/.bin/prisma validate`
4. Add minimal health endpoint and request ID support.

#### Short term: 1-3 weeks

1. Split oversized backend files by workflow ownership.
2. Add structured logging with redaction rules.
3. Add admin/business audit log records for sensitive transitions:
   - status changes
   - forwarding
   - invite generation
   - block/unblock
   - publish/archive
4. Convert supplier inquiry into a first-class public flow with guest-safe success path.
5. Standardize action/service layout for new workflows.

#### Medium term: 1-2 months

1. Introduce a dedicated worker process for outbox and cleanup jobs.
2. Freeze one primary production deployment shape and document staging separately.
3. Define explicit internal backend service boundaries:
   - auth
   - applications
   - messaging
   - notifications
   - business access
   - content lifecycle
4. Add integration tests around:
   - auth/session lifecycle
   - application creation + notification queue
   - forwarding/privacy rules
   - upload validation

#### Strategic: 2-6 months

1. Decide future backend API strategy for mobile/integration use cases.
2. Add metrics, alerting, dashboards, and error budgets.
3. Plan scaling path for:
   - async jobs
   - sessions
   - reporting/admin reads
   - storage-heavy workflows
4. Formalize staging and release promotion process.

---

## 11. Actionable Work Packages

### Package A. Contact And Interaction Flow Hardening

Goal:
Make user-to-business communication explicit, entity-aware, and privacy-safe.

Tasks:

- remove supplier contact CTA dependency on `/contacts`;
- connect supplier detail/list CTA to dedicated `SUPPLIER_INQUIRY`;
- make guest-safe success flow for supplier inquiry;
- review partner/sponsor/event contact routes for the same issue;
- reduce `/contacts` to team/platform-only semantics.

Priority: Critical

### Package B. Vacancy Response Privacy Enforcement

Goal:
Align code with documented moderation and forwarding rules.

Tasks:

- restrict business-visible vacancy responses to forwarded records only;
- review detail pages and message thread access rules;
- add regression tests for non-forwarded candidate data invisibility;
- document the final business response visibility policy in one canonical place.

Priority: Critical

### Package C. Observability Baseline

Goal:
Make production incidents diagnosable.

Tasks:

- add request ID generation/propagation;
- replace raw `console.*` usage in request paths with logger facade;
- define log fields: requestId, actorId, role, action, entityType, entityId, outcome;
- add `/health` and `/ready`;
- document monitoring bootstrap.

Priority: High

### Package D. Delivery And Quality Gates

Goal:
Move from manual quality discipline to enforced baseline.

Tasks:

- add CI workflow files;
- run lint/test/typecheck/prisma validate on PR;
- optionally add build on protected branches;
- document required checks for merge to `dev` and `prod`.

Priority: High

### Package E. Modularization Pass

Goal:
Preserve modular-monolith maintainability.

Tasks:

- split oversized files;
- extract application services from route/action orchestration;
- rename overloaded `*utils*` files into domain-specific modules;
- align file sizes back to documented standards.

Priority: High

---

## 12. Final Assessment

BARSYNERGY backend is not a fragile prototype. It already has real production-oriented thinking in:

- data validation,
- session handling,
- upload security,
- notification outbox,
- environment guards,
- legal/personal-data readiness gating.

The main problem is different: **the product has reached the point where architectural discipline and operational maturity must catch up with feature growth**.

If the current course continues without these fixes, the likely failures are:

- privacy rule regressions,
- operator confusion during incidents,
- slow backend onboarding,
- accidental coupling between UI and workflow semantics,
- scaling pain around async jobs and production support.

If the remediation plan above is executed, the project can stay on a modular monolith path safely for a much longer time without premature microservice complexity.
