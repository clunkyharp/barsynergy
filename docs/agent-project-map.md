# Agent Project Map

Last reviewed: 2026-06-15.

Use this map before reading broad folders. It is an entry index for agents: find the likely owner files first, then open only the task-specific code and docs.

## How To Use This Map

1. Read `AGENTS.md` for operating rules.
2. Read this file to choose the route group, domain module, component family and validation path.
3. Read only the linked task-specific docs or files.
4. If a change moves code ownership, adds a route group, adds a data model, or changes validation commands, update this map in the same batch.

This map does not replace `docs/project-plan.md`, `docs/phase-plan.md`, `docs/architecture.md` or `docs/engineering-standards.md`; it points agents to the smallest useful code surface.

## New Session Bootstrap

Every agent starting a new session in this repository must set up the session in this order:

1. Trigger `$project-code-map` when the client exposes local skills.
2. If the skill is not visible, read `.agents/skills/project-code-map/SKILL.md` manually.
3. Read this map before any broad `src/`, `docs/`, `tests/` or `prisma/` exploration.
4. Pick the closest row in "Fast Task Lookup" and open only the listed owner files first.
5. Run `git status --short --branch` before file-changing work and classify unrelated dirty changes.
6. If the skill or this map is missing, ignored by git, or stale for the requested area, fix the onboarding/map setup before implementation.

Project configuration keeps only `.agents/skills/project-code-map/**` unignored; other `.agents/` contents stay local and must not be added accidentally.

## Required Change Summary

For every implementation, remediation, QA-fix or skill/script update, the agent must close with a concrete change summary:

- what changed in behavior, structure or documentation;
- which files were changed and what each file owns;
- validation that was run, or the exact validation gap;
- files intentionally not changed when they were nearby or risky;
- current risks, blockers or dirty-tree caveats.

Do not close with only a generic phrase like "updated the project" or "fixed the issue". The summary must let the next agent understand the touched files without rereading the full diff.

## Core Flow

```txt
HTTP request
  -> src/middleware.ts
  -> src/app/layout.tsx
  -> src/app/**/page.tsx or src/app/**/actions.ts
  -> src/lib/** or src/modules/**
  -> src/lib/db/prisma.ts
  -> prisma/schema.prisma
```

Layer rule: pages compose, actions validate and call domain code, domain code owns Prisma access, components render props.

## Fast Task Lookup

| Task | Start here | Then inspect | Usual validation |
| --- | --- | --- | --- |
| Public page UI/copy | `src/app/(public)/<route>/page.tsx` | `src/components/public/`, `src/components/layout/`, `src/app/styles/public.css` | Source check, browser smoke if visible |
| Public content data | `src/lib/public/content.ts` | `src/lib/public/content/*.ts`, `src/lib/public/filter-options.ts` | `npm run typecheck`, targeted source test |
| Admin CMS list/edit | `src/app/admin/<section>/` | `src/components/admin/`, `src/lib/admin/admin-queries.ts`, `src/lib/admin/content-lifecycle.ts` | `npm run lint`, `npm run typecheck` |
| Homepage CMS | `src/app/admin/homepage/page.tsx` | `src/components/admin/homepage-cms/`, `src/lib/admin/homepage-queries.ts`, `src/lib/public/home.ts` | Targeted source/browser check |
| Public forms/applications | `src/app/(public)/<route>/actions.ts` | `src/components/public/*application*.tsx`, `src/lib/applications/`, `src/lib/security/turnstile.ts` | Targeted tests, security pass |
| Auth/register/reset/login | `src/app/auth/` | `src/lib/auth/`, `src/modules/auth/shared/queries.ts`, `src/lib/security/` | Auth/security tests, typecheck |
| Profile cabinet | `src/app/profile/` | `src/components/profile/`, `src/lib/profile/`, `src/modules/profile/queries.ts` | Targeted profile tests, typecheck |
| Business cabinet | `src/app/(business-workspace)/business/cabinet/` | `src/components/business/`, `src/lib/business/`, `src/modules/business/queries.ts` | Targeted business tests, typecheck |
| Messaging | `src/components/messaging/` | `src/lib/messaging/`, profile/business detail pages | Messaging/source tests |
| Notifications/newsletter | `src/lib/notifications/` | `src/app/newsletter/`, `src/components/public/newsletter-modal/`, scripts retry commands | Notification/newsletter tests |
| Uploads/storage | `src/lib/storage/` | `src/app/uploads/[...fileKey]/`, `src/app/admin/uploads/content-image/`, file validators | Prisma validate, storage/security tests |
| Prisma schema/migration | `prisma/schema.prisma` | `prisma/migrations/`, affected `src/lib/**` queries | `prisma validate`, generate, targeted tests |
| Visual tokens/styles | `src/app/styles/tokens.css` | `globals.css`, route-specific CSS files, `design-tokens.json`, `DESIGN.md` | Browser/visual QA, diff cleanup |
| SEO/metadata | `src/lib/public/metadata.ts` | `src/lib/public/structured-data.ts`, route `generateMetadata`, sitemap/robots files | SEO source tests, route smoke |
| Deployment/env | `docs/deploy.md` | `docs/env.md`, `.env*.example`, `docker-compose*.yml`, `scripts/verify-standalone-runtime.mjs` | Readiness-first, build only if scoped |
| Agent map or skill update | `docs/agent-project-map.md` | `.agents/skills/project-code-map/SKILL.md`, `AGENTS.md`, `docs/agent-workflow.md` | Markdown/source review, skill validation |

## Route Groups

| Area | Path | Role | Main dependencies |
| --- | --- | --- | --- |
| Public site | `src/app/(public)/` | Guest-facing pages: home, articles, events, education, vacancies, suppliers, partners, sponsors, contacts, legal, search, calculator | `src/lib/public/`, `src/components/public/`, `src/components/layout/` |
| Admin auth | `src/app/(admin-auth)/admin/login` | Separate admin login screen | `src/lib/auth/`, `src/components/auth/` |
| Admin CMS | `src/app/admin/` | CMS, users, applications, homepage, uploads, taxonomy | `src/lib/admin/`, `src/components/admin/`, `src/modules/admin/queries.ts` |
| Auth | `src/app/auth/` | Login, registration, password reset, verification, activation | `src/lib/auth/`, `src/modules/auth/shared/queries.ts`, `src/lib/security/` |
| Profile | `src/app/profile/` | User profile, responses, inquiries, saved vacancies, settings | `src/lib/profile/`, `src/modules/profile/queries.ts`, `src/components/profile/` |
| Business workspace | `src/app/(business-workspace)/business/` | Business cabinet and compatibility redirects | `src/lib/business/`, `src/modules/business/queries.ts`, `src/components/business/` |
| Newsletter | `src/app/newsletter/` | Confirm/unsubscribe token routes | `src/lib/notifications/email-subscription/` |
| Runtime files | `src/app/uploads/[...fileKey]/` | Local upload serving path | `src/lib/storage/` |
| Health | `src/app/api/health`, `src/app/api/ready` | Runtime readiness endpoints | Env, DB readiness checks |

## Domain Dependencies

### Public Content

```txt
src/app/(public)/<content>/page.tsx
  -> src/lib/public/content/<type>.ts
  -> src/lib/public/content/shared.ts
  -> src/lib/db/prisma.ts
  -> prisma models: Article, Event, Course, Vacancy, Supplier, Master, Partner

detail pages
  -> getPublished<Type>Detail(slug)
  -> visibility check: status=PUBLISHED
  -> src/lib/public/structured-data.ts for JSON-LD when applicable
```

Public content facade: `src/lib/public/content.ts`.

Do not add a new content row variant to `PublishedContentSection`; create a dedicated row/section component in `src/components/public/`.

### Admin CMS

```txt
src/app/admin/<section>/page.tsx
src/app/admin/<section>/[id]/page.tsx
src/app/admin/<section>/create/page.tsx
src/app/admin/<section>/actions.ts
  -> src/components/admin/*
  -> src/lib/admin/admin-queries.ts
  -> src/lib/admin/content-lifecycle.ts
  -> src/lib/admin/public-content-revalidation.ts
  -> prisma models
```

Shared admin shells:

- `src/components/admin/admin-cms-form.tsx`
- `src/components/admin/content-admin-controls-panels.tsx`
- `src/components/layout/admin-sidebar.tsx`
- `src/components/layout/admin-shell-frame.tsx`

Homepage CMS is separate:

```txt
src/app/admin/homepage/page.tsx
  -> src/components/admin/homepage-cms/*
  -> src/lib/admin/homepage-queries.ts
  -> src/lib/public/home.ts
```

### Public Applications And Lead Forms

```txt
src/components/public/<form>.tsx
  -> src/app/(public)/<route>/actions.ts
  -> src/lib/applications/submit-public-application-action.ts
  -> src/lib/applications/create-public-application.ts
  -> src/lib/applications/public-submission-guards.ts
  -> src/lib/security/server-action-origin.ts
  -> src/lib/security/turnstile.ts
  -> src/lib/notifications/process-queue.ts
```

Payload contracts live in `src/lib/applications/application-payloads.ts`.

Private resume upload rules live in:

- `src/lib/applications/private-resume-file-rules.ts`
- `src/lib/applications/private-resume-files.ts`
- `src/lib/storage/file-signatures.ts`

Public actions must keep same-origin, forms-enabled, honeypot, Turnstile when present, submission throttle and visibility checks.

### Auth And Sessions

```txt
src/app/auth/**/page.tsx
src/app/auth/**/actions.ts
  -> src/lib/auth/*
  -> src/lib/security/*
  -> src/modules/auth/shared/queries.ts
  -> src/lib/auth/session.ts
  -> src/lib/auth/current-user.ts
```

Edge boundary:

```txt
src/middleware.ts
  -> src/lib/auth/session-constants.ts
  -> src/lib/security/csp.ts
```

`src/middleware.ts` must not import Node-only auth/session code. Password policy must stay aligned across register, reset, activate and profile password change.

### Profile And Business Cabinets

Profile:

```txt
src/app/profile/**
  -> src/components/profile/*
  -> src/lib/profile/*
  -> src/modules/profile/queries.ts
```

Business:

```txt
src/app/(business-workspace)/business/cabinet/**
  -> src/components/business/*
  -> src/lib/business/*
  -> src/modules/business/queries.ts
```

Mutations that accept object IDs must enforce ownership in the write query itself, usually with scoped `updateMany` or `deleteMany`.

### Messaging

```txt
profile/business inquiry pages
  -> src/components/messaging/*
  -> src/lib/messaging/get-conversation.ts
  -> src/lib/messaging/send-message.ts
  -> src/lib/messaging/mark-messages-read.ts
  -> src/lib/messaging/notifications/*
```

Conversation list ordering helper: `src/lib/messaging/sort-conversations-by-unread.ts`.

### Notifications

Application notifications:

```txt
application mutation
  -> NotificationOutbox row
  -> after(() => processNotificationQueue(...))
  -> src/lib/notifications/process-queue.ts
  -> email / Telegram formatting and dispatch
```

Newsletter:

```txt
src/components/public/newsletter-modal/*
  -> src/lib/notifications/email-subscription/*
  -> src/app/newsletter/confirm/[token]
  -> src/app/newsletter/unsubscribe/[token]
```

Web push:

```txt
src/lib/notifications/web-push/*
```

### Storage

```txt
src/lib/storage/index.ts
  -> local or S3 storage service by env
  -> src/lib/storage/public-url.ts
  -> src/app/uploads/[...fileKey]/route.ts for local runtime serving
```

Production must use S3 unless the owner explicitly approves the documented local-storage exception.

## Component Families

| Folder | Purpose | Do not put here |
| --- | --- | --- |
| `src/components/ui/` | Generic primitives: buttons, inputs, dialog, table, badges, cards | Domain-specific content, Prisma, server actions |
| `src/components/layout/` | Header, footer, sidebars, account/menu chrome | Route-owned data fetching, content queries |
| `src/components/public/` | Public page sections, lists, forms, calculator UI, newsletter modal | Direct Prisma access, admin-only logic |
| `src/components/admin/` | CMS shells, admin forms, markdown editor, homepage CMS | Public page rendering |
| `src/components/profile/` | User cabinet UI | Business-only UI |
| `src/components/business/` | Business cabinet UI | Profile-only UI |
| `src/components/messaging/` | Shared conversation UI | Data writes outside messaging actions |
| `src/components/seo/` | Structured SEO helpers | Page layout responsibilities |

Client components should own only local interaction state. Server components and pages fetch through `src/lib/**` or `src/modules/**`.

## Styling Map

```txt
src/app/globals.css
  -> imports style files in fixed order
src/app/styles/tokens.css
  -> design tokens
src/app/styles/public.css
  -> public route surfaces
src/app/styles/admin.css
  -> admin shell/forms
src/app/styles/forms.css
  -> shared form primitives
src/app/styles/ui-primitives.css
  -> Button/Input/Card/etc.
```

Rules:

- Add no new CSS files unless the architecture decision changes.
- Put new CSS variables in `tokens.css`.
- Use tokens, not hardcoded hex in component class strings.
- Keep visual QA artifacts out of the repo after verification unless the owner asks for an archive.

## Prisma And Migrations

Start with:

- `prisma/schema.prisma`
- latest relevant folder in `prisma/migrations/`
- query owner in `src/lib/**` or `src/modules/**`

Common model owners:

- Content: `src/lib/public/content/*`, `src/lib/admin/admin-queries.ts`
- Applications: `src/lib/applications/*`, `src/lib/admin/applications/*`
- Auth/session: `src/lib/auth/*`
- Profile/business: `src/modules/profile/queries.ts`, `src/modules/business/queries.ts`, `src/lib/profile/*`, `src/lib/business/*`
- Notifications: `src/lib/notifications/*`

Use Prisma migrations for schema changes. Do not edit generated Prisma client files.

## Tests And Validation

| Surface | Tests to search first |
| --- | --- |
| Auth/session/security | `tests/auth-*.test.mjs`, `tests/security-*.test.mjs`, `tests/server-action-origin-usage.test.mjs` |
| Applications/forms | `tests/application-*.test.mjs`, `tests/public-form-validation-contract.test.mjs`, `tests/vacancy-response-contract.test.mjs` |
| Public content/listing | `tests/public-*.test.mjs`, `tests/directory-filters-contract.test.mjs`, `tests/published-content-section-keys.test.mjs` |
| Admin/CMS | `tests/admin-*.test.mjs`, `tests/admin-content-lifecycle.test.mjs` |
| Profile/business | `tests/cabinets-ux-audit.test.mjs`, `tests/business-*.test.mjs` |
| Calculator | `tests/cost-calculator-*.test.mjs`, `tests/calculator-*.test.mjs` |
| Newsletter/notifications | `tests/newsletter-*.test.mjs`, `tests/application-notifications.test.mjs` |
| E2E/browser | `tests/e2e/*.spec.ts` |

Default commands:

```bash
npm run lint
npm test
npm run typecheck
./node_modules/.bin/prisma validate
```

Run `npm run build` before commits, deploys, production-runtime work, or when the scoped change needs build proof.

## Docs Ownership

| Doc | Purpose |
| --- | --- |
| `AGENTS.md` | Always-loaded project rules |
| `docs/agent-project-map.md` | Code navigation map for agents |
| `docs/project-plan.md` | Product scope and constraints |
| `docs/phase-plan.md` | Implementation roadmap |
| `PROJECT_STATUS.md` | Current project state and validation snapshots |
| `docs/agent-workflow.md` | Agent process and closeout rules |
| `docs/architecture.md` | Layering, route groups, anti-patterns |
| `docs/engineering-standards.md` | Concrete code standards |
| `docs/scaling-playbook.md` | Expansion checklists |
| `docs/kanban-sync.md` | Obsidian board sync rule |

Update docs and the Obsidian board when task status, phase, blocker, route behavior, schema, validation result or next step changes. If not needed, state why in closeout.

## Stop Gates

Stop and reframe before editing when:

- the change crosses auth, sessions, roles, middleware, production env, storage, DB migrations or deployment without readiness fields;
- more than one route group or domain owner becomes involved without a mini-spec;
- the worktree has unrelated dirty changes in the files you need to edit;
- the requested change depends on product/legal/owner decisions;
- browser, screenshot, Figma or visual-reference work lacks a frozen target inventory.
