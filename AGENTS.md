# AGENTS.md

Project-local instructions for AI coding agents working in this repository.

## Project

BARSYNERGY is a fullstack Next.js App Router project for a bar-industry education and community platform.

Primary stack:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Zod
- bcrypt
- Docker Compose
- Nginx
- S3-compatible Timeweb Cloud Object Storage for production files

## Start Here — Minimal Reading Per Task

Не читать всё подряд. Читать минимальный набор под задачу.

### 1. Всегда перед работой

- `.agents/skills/project-code-map/SKILL.md` — если навык недоступен, прочитать вручную
- `docs/agent-project-map.md` — найти кратчайший путь к коду
- `AGENTS.md` — этот файл
- `git status --short --branch`

### 2. Перед значимой разработкой

- `README.md`
- `docs/project-plan.md` — продуктовый план
- `docs/phase-plan.md` — дорожная карта реализации
- `PROJECT_STATUS.md`
- `docs/agent-workflow.md`

### 3. Перед кодом

- `docs/engineering-standards.md` — лимиты компонентов, CSS, TypeScript, формы
- `docs/architecture.md` — слои, паттерны, анти-паттерны
- `docs/pr-checklist.md` — пред-мерж проверки
- `docs/scaling-playbook.md` — новые типы контента, роли, уведомления

### 4. По типу задачи

| Тип задачи | Куда смотреть |
|------------|--------------|
| Публичные страницы | `src/app/(public)/...`, `src/components/public/`, `src/lib/public/`, `src/app/styles/public.css` |
| Админка | `src/app/admin/...`, `src/components/admin/`, `src/lib/admin/` |
| Формы и заявки | `src/app/(public)/.../actions.ts`, `src/components/public/*form*`, `src/lib/applications/`, `src/lib/security/` |
| Auth/session | `src/app/auth/`, `src/lib/auth/`, `src/lib/security/`, `src/middleware.ts` |
| Бизнес/профиль | `src/app/profile/`, `src/app/(business-workspace)/business/`, `src/lib/profile/`, `src/lib/business/` |
| Prisma/schema | `prisma/schema.prisma`, `prisma/migrations/`, затронутые `src/lib/**` queries |
| Деплой/env | `docs/deploy.md`, `docs/env.md`, `.env.example`, `.env.production.example`, `docker-compose*.yml` |

Use `docs/project-plan.md` as the canonical product plan and `docs/phase-plan.md` as the implementation roadmap.
Use `docs/agent-project-map.md` to find the smallest relevant code surface before opening broad folders.
If the map is missing, stale for the task area, or not discoverable from a new session, stop implementation and fix the onboarding/map setup first.

## Research When Uncertain

When unsure about any library, framework, API, tool, service, dependency, configuration, syntax, version behavior, or best practice — do not rely on training data. Go to the relevant official docs, package pages, primary sources, or run targeted terminal commands to get accurate up-to-date information.

## Documentation And Kanban Sync

Every meaningful change must include a documentation sync decision before closeout.

После работы при необходимости обновлять:

- `PROJECT_STATUS.md` — если изменился статус, готовность, блокер, проверка или следующий шаг
- `docs/phase-plan.md` — если закрыт/изменён этап, чекпоинт или план реализации
- `docs/project-plan.md` — если изменилось продуктовое поведение, scope или долгосрочный план
- `docs/agent-project-map.md` — если изменились маршруты, владельцы модулей, структура, валидация или onboarding для агентов
- `docs/kanban-sync.md` + Obsidian Kanban — если изменился статус задачи, фазы, блокера или next step
- Таск-специфичные docs под `docs/` — если изменение затрагивает конкретную функцию, фазу, деплой, env, безопасность или QA
- `/Users/amir/llm-wiki-template/system/workflows/improve.md` — только если появился долговечный, обезличенный и проектно-нейтральный урок (не писать туда названия проекта, пути, домены, секреты, локальные детали)

If no docs or Kanban update is needed, state that explicitly in the closeout with the reason.

## Working Mode

Lock one mode before non-trivial work:

- `DECISION` for comparing options or choosing direction.
- `IMPLEMENTATION` for scoped code or documentation changes.
- `QA` for verification, review, audit, or release readiness.

For implementation batches, define goal, scope, out of scope, ownership, done criteria, and validation before editing.
Treat a bare `continue by plan` / `продолжай по плану` request as under-specified. Before coding, restate the current phase or checkpoint, what is already done, exact in-scope work for this batch, out of scope, done condition, and validation path.
After any large multi-file code change or structurally meaningful remediation batch, run a separate `QA` code review pass before considering the batch stable. That review must check architecture, reliability, maintainability, DX and predictable further development.
For `QA` review work, label the intent explicitly: `discovery`, `control audit`, or `sign-off`.
For broad screenshot, photo, or visual-reference redesign requests, first freeze a short visual contract: target screens, reusable tokens/components, source assets, out of scope, and validation viewports. Implement one coherent screen group per batch.
For orchestrated project reviews, stop after ranked synthesis unless remediation was explicitly requested. Do not turn parallel reviewer output into implementation work before deduplication and prioritization.

Keep changes minimal. Preserve existing architecture, naming, routing, styling, and file organization unless the task explicitly asks for refactoring.

## Spec-Driven And Test-Driven Default

Development in this repository uses a mixed spec-driven and test-driven process.

Before implementation work, freeze the smallest useful mini-spec:

- goal and user/system behavior;
- in scope and out of scope;
- affected files, routes, data contracts or UI states;
- acceptance criteria;
- validation path.

For new features, bug fixes, refactors and behavior changes, the default order is mandatory when the behavior is testable: write or update the smallest meaningful failing test first, run or record that failing check when practical, and only then change production code. Then implement the minimum code needed to pass, rerun the targeted test, and broaden validation only as risk requires.

If the changed code path already has automated tests, those tests must be reviewed and synchronized in the same batch. Do not leave old expectations asserting removed UI, copy, flows or contracts after changing the implementation. A code change in a covered area is not done until the relevant tests either pass with updated expectations or an explicit exception is recorded before closeout.

If a failing automated test is not practical, state why before implementation and define the substitute proof before editing production code: source test, type/lint check, browser smoke, visual QA, manual reproduction, or an explicit verification gap.

Documentation-only, configuration-only and owner-approved exploratory work may use the mini-spec plus targeted validation without a failing code test, but the exception must be explicit in the closeout.

## Git Rules

- Main development branch: `dev`.
- Stable production branch: `prod`.
- VPS deploy branch: `prod`, kept as the clean site branch.
- Use `feature/*` only for large coherent features.
- Use `fix/*` only for critical production fixes.
- Small tasks can be done directly on `dev`.
- Do not combine commit/checkpoint work with further implementation in the same batch. First classify the dirty tree and create the checkpoint, then open a separate implementation batch if more work is needed.
- Do not push, deploy, merge to `prod`, delete broadly, or run destructive commands without explicit owner approval.
- Do not merge local agent memory, generated QA/browser artifacts, scratch output, local-only access notes, real env files, backups, uploads, private keys, tokens or passwords into `prod`.
- Always run `git status --short --branch` before file-changing work.
- Do not revert unrelated user changes.
- If the worktree is dirty, identify whether changes are related before editing.

Production flow:

```txt
feature/* -> dev -> validation -> prod
```

Merges to `prod` require owner confirmation and the checks listed in `docs/git-workflow.md`.

## Commands

Local setup:

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run prisma:migrate:deploy
npm run dev
```

Local app URL:

```txt
http://localhost:3000
```

Validation:

```bash
npm run lint
npm test
npm run typecheck
./node_modules/.bin/prisma validate
```

`npm run build` is mandatory only before creating a commit. For ordinary implementation checks, run it only when the task explicitly needs production-build, deploy or standalone-runtime validation.

Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate:dev -- --name <migration_name>
npm run prisma:migrate:deploy
```

When both build and typecheck are required, run them sequentially. Next.js type generation can make parallel build/typecheck runs flaky.

## Environment And Data Safety

- Required local variables are documented in `.env.example`.
- Required production variables are documented in `.env.production.example` and `docs/env.md`.
- Local production server access notes belong in gitignored `ssh.md`; keep only safe connection/runtime notes there and never store passwords, private keys, tokens, env values or database URLs.
- Local PostgreSQL is exposed on `localhost:55432`.
- Local uploads use `STORAGE_DRIVER=local` and `LOCAL_UPLOAD_DIR=./uploads`.
- Production must use `STORAGE_DRIVER=s3`.
- The only documented production local-storage exception is an owner-approved single-server fallback with `STORAGE_DRIVER=local` and `ALLOW_LOCAL_STORAGE_IN_PRODUCTION=true`.
- Production `DATABASE_URL` in Docker Compose must use host `postgres`, not `localhost`.
- Do not commit real `.env` files, secrets, tokens, passwords, private keys, production configs, database dumps, uploads, or user data.
- Treat auth, live deploys, production data, migrations, object storage, and environment changes as readiness-first work. Stop and report missing access or missing success criteria before acting.

## Code Guidelines

Full standards are in `docs/engineering-standards.md`. Key rules enforced inline:

**Architecture:**
- Keep server data access, route handlers, and client components clearly separated. See layer table in `docs/architecture.md`.
- Pages call lib functions. Lib functions call prisma. Pages never call prisma directly.
- New content types follow the 7-phase checklist in `docs/architecture.md`.
- `getCurrentUser()` must be wrapped in React `cache()` — see `docs/engineering-standards.md` §2.
- `src/middleware.ts` is the edge-safe route guard + CSP injector. Keep auth cookie constants in `src/lib/auth/session-constants.ts` and do not import `src/lib/auth/session.ts` into middleware.
- Any user-, profile-, or business-scoped mutation that accepts an object id from params or `FormData` must enforce ownership in the write query itself. Never update or delete by a naked `id` after a separate ownership read.
- User-facing lists, detail pages and actions must re-check content visibility server-side. Do not expose unpublished, archived, blocked or private related records just because the caller knows an internal id.

**Components:**
- Prefer existing components in `src/components/ui`, `src/components/layout`, and `src/components/public`.
- Hard limit: no component file exceeds 350 lines. Split before merging.
- Variant props that drive structural layout (not just style) require separate components, not new variant values.
- Do not add `rowVariant` values to `PublishedContentSection` — create a dedicated section component.

**Forms:**
- `required` fields must not be inside `<details>` blocks marked «по желанию».
- All consent checkboxes use `<ConsentField>`, never a bare `<input type="checkbox">`.
- New public forms follow the checklist in `docs/pr-checklist.md` → "New Public Form".
- Public auth, registration, activation and recovery flows must not reveal whether an email, account, or pending request exists unless the actor is already authenticated and authorized to know it.
- Password policy must stay consistent across register, change, reset and activation flows. Password change and password reset must revoke existing sessions.
- Office-document uploads (`.docx`, `.odt`) need container-aware validation, not just extension plus ZIP magic bytes.

**CSS:**
- No new CSS files. Add rules to the most specific existing file.
- No hardcoded hex colors in component `className` strings — use CSS tokens.
- New CSS variables go in `tokens.css`. The import order in `globals.css` must not change.
- Dark mode: do not set `document.documentElement.style.colorScheme` outside `app/layout.tsx` inline script.

**TypeScript:**
- No `any`. Use `unknown` + type guards or a proper type.
- All server actions return `{ type: 'error' | 'success', message: string }`. Never throw unhandled from an action.

**Public copy:**
- Keep public and user-facing Russian copy simple, literal and easy to scan. Avoid vague promo wording, internal workflow jargon and text that sounds machine-generated.
- When editing or rewriting connected Russian user-facing prose, apply the `humanizer-ru` cleanup principle by default. Do not apply it to code, logs, commands, schemas or exact quotations.

**QA:**
- For small visible UI fixes, prefer concrete browser diff evidence, screenshot notes, page URL, and target element over a generic `поправь дизайн` prompt.
- For visual QA, state which tool actually verified the screen: built-in browser, Playwright screenshot, HTML/source smoke, or an explicit unverified visual gap.
- After visual QA, delete generated screenshots, browser dumps, JSON result files and other temporary QA artifacts from the project before closeout unless the owner explicitly asks to preserve them.
- For auth, file-upload, profile, business-cabinet, or admin-access changes, run a dedicated security pass: IDOR/object ownership, enumeration, rate limiting, unpublished/private data exposure, session revocation, and token lifecycle.

**Schema:**
- Use Prisma migrations for schema changes. Do not edit generated Prisma client files.
- Migration names must be descriptive. See naming rules in `docs/engineering-standards.md` §9.

**Dependencies:**
- Do not introduce new libraries unless they are necessary and consistent with the stack.
- Keep validation close to boundaries using existing Zod/env patterns.

## Project Map (Self-Instruction)

### Route groups

| Group | Path | Content |
|-------|------|---------|
| Public | `(public)/` | Main site — articles, vacancies, suppliers, courses, events, partners, education, about, contacts, business, consulting, tools/cost-calculator |
| Admin | `admin/` | CMS — CRUD for all content types + applications, categories, cities, tags, skills, homepage |
| Auth | `auth/` | Login, register, password-reset, verify-email, activate |
| Admin auth | `(admin-auth)/admin/login` | Separate admin login |
| Profile | `profile/` | User profile, inquiries, saved vacancies |
| Business | `(business-workspace)/business/` | Business cabinet, applications |

### Component layers

- `components/ui/` — Generic primitives (Button, Input, Select, Dialog, Badge, Table, Card, etc.)
- `components/admin/` — Admin CMS shell, forms, filters, markdown editor, cover image input
- `components/public/` — Public page components (article grid, filters, detail page, application forms, modals, cost calculator)
- `components/layout/` — Header, footer, admin sidebar, business sidebar, mobile menu
- `components/messaging/` — Conversation thread, compose, supplier inquiry form

### Data flow

```
Page (server component) → lib function → Prisma query → DB
Page (server component) → <form action={serverAction}> → action.ts → lib → Prisma
```

- **Server actions** live at `app/*/actions.ts` per route group
- **Admin CRUD actions** in `src/app/admin/{section}/actions.ts`
- **Public form submissions** go through `submitPublicApplicationAction()` in `src/lib/applications/submit-public-application-action.ts`
- **Lead forms** (vacancies, suppliers, education) in their respective `(public)/*/actions.ts` — must include all 5 guards manually

### Security guards (always include in public server actions)

```ts
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { assertTurnstilePassed } from '@/lib/security/turnstile';
import { assertPublicApplicationFormsEnabled, assertPublicApplicationSubmissionAllowed, hasHoneypotValue } from '@/lib/applications/public-submission-guards';

await assertSameOriginServerAction();
assertPublicApplicationFormsEnabled();
if (hasHoneypotValue(getString(formData, 'website'))) return successEarly;
const token = getString(formData, 'turnstileToken');
if (token) await assertTurnstilePassed(token);   // conditional — not all forms have Turnstile
await assertPublicApplicationSubmissionAllowed(type);
```

### Key module locations

| Concern | Location |
|---------|----------|
| Prisma client | `src/lib/db/prisma.ts` |
| Auth session | `src/lib/auth/session.ts` |
| Current user | `src/lib/auth/current-user.ts` (wrapped in `cache()`) |
| Permissions | `src/lib/auth/permissions.ts` |
| Admin form shell | `src/components/admin/admin-cms-form.tsx` |
| Content admin panels | `src/components/admin/content-admin-controls-panels.tsx` |
| Markdown editor | `src/components/admin/markdown-editor.tsx` |
| Public form validation | `src/components/public/public-form-validation.tsx` |
| Form field primitives | `src/components/ui/form-field.tsx` |
| Application transitions | `src/lib/admin/application-transitions.ts` |
| Application labels/utils | `src/lib/admin/application-utils.ts` |
| Public form guards | `src/lib/applications/public-submission-guards.ts` |
| Public form helpers | `src/lib/applications/public-form-helpers.ts` |
| Content labels | `src/lib/admin/content-utils.ts` |
| Admin action wrapper | `src/lib/server-action-wrappers.ts` |
| CSS design tokens | `src/app/styles/tokens.css` |
| Public CSS | `src/app/styles/public.css` |
| Admin CSS | `src/app/styles/admin.css` |
| Form CSS | `src/app/styles/forms.css` |
| UI primitives CSS | `src/app/styles/ui-primitives.css` |
| Lead modal | `src/components/public/modals/lead-modal.tsx` |

### Key patterns

- **Edit pages** (`admin/{section}/[id]/page.tsx`): import `AdminCmsForm`, `AdminCmsSection`, `AdminCmsAdvancedSection`, `AdminCmsActions`, `AdminCmsGrid`, `AdminCmsSummary` from `admin-cms-form.tsx`. Use `AdminContentVisibilityPanel` as single status control.
- **Create pages** (`admin/{section}/create/page.tsx`): same shell but no status field (defaults to DRAFT server-side), no slug field (server-generated).
- **Application detail** (`admin/applications/[id]/page.tsx`): uses `ApplicationInfo`, `ProcessingForm`, type-specific publication forms.
- **Status filtering** in admin lists: `AdminStatusTabs` with `href` builder that preserves `type` param.
- **Slug in edit forms**: always inside `AdminCmsAdvancedSection` as `<Input readOnly>`.
- **CoverImageField alt**: always visible input, never defaults to file name — use `currentAlt ?? ''`.

### Quick reference: Admin form changes

When editing an admin CMS form page, touch these files:
1. Edit form: `admin/{section}/[id]/page.tsx`
2. Create form: `admin/{section}/create/page.tsx`
3. Actions: `admin/{section}/actions.ts`
4. Shared panels: `components/admin/content-admin-controls-panels.tsx`

When editing a public application form, touch:
1. Action file: `(public)/{section}/actions.ts`
2. Form component: `components/public/{form-name}.tsx`
3. Modal (if lead form): `components/public/modals/lead-modal.tsx`

---

## Verification And Closeout

Use the smallest meaningful check first, then broaden only when risk requires it.

For meaningful batches, close with:

- what changed;
- files changed;
- validation run or exact validation gap;
- current git status;
- risks or blockers;
- out of scope;
- next recommended step.

If task status, blocker, owner decision, or active phase changed, update the Obsidian Kanban status according to `docs/kanban-sync.md`.

## Small-Agent Safe Mode

Some tasks in this repository may be delegated to smaller or less capable AI coding models. These models must work under stricter constraints than the default agent workflow.

Use this mode when the task is small, local, repetitive, visual, copy-related, or clearly bounded.

Examples:

* fix a small UI alignment issue;
* replace copy in one component;
* adjust spacing, icon alignment, button consistency;
* inspect one page/component for a known bug;
* slice or register static assets;
* update a small mapping or config;
* run a narrow QA check.

Do **not** use small-agent mode for:

* authentication;
* authorization;
* sessions;
* middleware;
* database schema changes;
* Prisma migrations;
* production deployment;
* payment or billing logic;
* file upload security;
* admin permissions;
* broad refactors;
* routing architecture;
* cross-feature state management;
* unknown bugs with unclear cause;
* tasks requiring product decisions.

If a small agent encounters one of these areas, it must stop and report instead of continuing.

---

### Small-Agent Task Contract

Before editing, the small agent must write a short task contract:

```txt
MODE: IMPLEMENTATION or QA
TASK TYPE: small-agent
GOAL:
FILES I EXPECT TO TOUCH:
FILES I WILL NOT TOUCH:
OUT OF SCOPE:
VALIDATION:
STOP CONDITIONS:
```

The agent may proceed only if the task can be completed by touching a small, predictable set of files.

If the affected files cannot be identified quickly, stop and ask for a stronger model or owner clarification.

---

### Small-Agent Scope Limits

Small agents must follow these limits by default:

* Touch at most 1–3 files unless explicitly allowed.
* Prefer editing existing components over creating new abstractions.
* Do not introduce new libraries.
* Do not change data models.
* Do not change route structure.
* Do not change server actions unless the task explicitly requires it.
* Do not rename files, components, routes, types, or public APIs unless explicitly requested.
* Do not perform "cleanup" outside the requested area.
* Do not reformat unrelated code.
* Do not fix unrelated issues found nearby unless asked.
* Do not make visual redesign decisions beyond the provided reference or instruction.

If the task appears to require more than these limits, stop and report the reason.

---

### Small-Agent File Discovery Rules

Small agents should avoid broad exploration.

Allowed discovery:

* search exact visible text from the screenshot or task;
* search exact component names if provided;
* inspect the nearest component and its direct children;
* inspect existing UI components before creating new ones.

Avoid:

* reading the whole repository;
* opening unrelated pages;
* changing shared components without checking where they are used;
* guessing component ownership from filename only.

Before editing a shared component, check at least where it is imported or used.

---

### Small-Agent UI Fix Rules

For small visible UI fixes:

1. Identify the exact page, section, component and target element.
2. State the current visual bug in one sentence.
3. Make the smallest styling/layout change that fixes the bug.
4. Preserve existing tokens, spacing scale, colors and component patterns.
5. Do not hardcode hex colors in component className strings.
6. Do not add new CSS files.
7. Do not add decorative effects unless requested.
8. Do not change copy unless the task asks for copy changes.
9. Validate at the target viewport and one nearby responsive viewport when practical.

For screenshot-based tasks, the small agent must not invent a broader redesign. It should match the provided correction only.

---

### Small-Agent Visual Consistency Checklist

For UI edits, check these before closeout:

* alignment;
* spacing;
* vertical rhythm;
* icon/text baseline;
* hover state;
* focus-visible state if interactive;
* mobile behavior if the component is responsive;
* dark theme contrast;
* overflow/truncation;
* no accidental layout shift;
* no unrelated visual changes.

If visual verification was not run, say exactly why and mark it as a validation gap.

---

### Small-Agent Form And Modal Rules

Small agents may adjust styling of existing forms or modals, but must not create production form behavior unless explicitly scoped.

Allowed:

* improve spacing;
* align labels/icons;
* adjust existing input/dropdown styles;
* fix z-index/overflow for existing dropdowns;
* improve existing modal layout.

Not allowed without stronger review:

* create new server actions;
* change validation schema;
* change submit endpoints;
* change auth-related behavior;
* fake successful submission in production;
* store user data differently;
* weaken required fields or consent behavior.

If a form change touches validation, server actions, storage, or user data, escalate to a stronger model.

---

### Small-Agent Escalation Triggers

Stop and escalate if any of these happen:

* more than 3 files need edits;
* the fix requires architectural changes;
* the issue involves auth, sessions, roles, ownership, or private data;
* the issue involves Prisma schema or migrations;
* the issue involves production environment or deployment;
* the issue involves security-sensitive form behavior;
* the existing code is unclear after 10–15 minutes of inspection;
* the first attempted fix causes unrelated changes;
* tests fail for reasons not directly related to the task;
* the task requires choosing between multiple product/UX directions;
* the agent is not sure whether a change is safe.

When escalating, report:

* what was inspected;
* what was found;
* why the task is unsafe or unclear;
* suggested next step.

---

### Small-Agent Output Format

Every small-agent closeout must be short and structured:

```txt
Done:
- ...

Files changed:
- ...

Validation:
- ...

Not changed:
- ...

Risks / gaps:
- ...

Next step:
- ...
```

Do not write long narrative summaries.

If no files were changed, say so explicitly.

---

### Small-Agent Patch Discipline

Small agents must prefer small patches.

Before editing:

* identify the exact line/block/component to change;
* avoid moving large blocks of code;
* avoid broad formatting changes;
* avoid changing import order unless needed;
* avoid changing public component APIs unless explicitly scoped.

After editing:

* review the diff;
* remove accidental whitespace-only changes;
* make sure no unrelated file changed.

---

### Small-Agent Design-System Guardrails

Small agents working on UI must use existing project patterns.

Required:

* use existing CSS tokens;
* use existing Tailwind patterns;
* prefer existing `src/components/ui`, `src/components/layout`, and `src/components/public`;
* preserve dark editorial style;
* keep yellow as an accent, not a default fill everywhere;
* avoid SaaS-like generic UI unless already used in that component.

Not allowed:

* new color palette;
* random shadows/glows;
* hardcoded one-off spacing values without reason;
* mixing icon styles;
* changing typography hierarchy globally;
* adding new animations without request.

---

### Small-Agent Copy Rules

For public Russian copy edits:

* keep text simple and literal;
* avoid marketing fluff;
* avoid machine-like phrasing;
* avoid changing meaning;
* do not rewrite entire sections unless requested;
* keep terminology consistent with nearby pages.

If the task only asks for layout, do not edit copy.

---

### Small-Agent Validation Levels

Use the smallest useful validation.

For copy-only:

* inspect changed file;
* run typecheck only if the file is TypeScript/TSX and risk justifies it.

For small UI-only:

* run lint or targeted typecheck when practical;
* perform browser smoke or screenshot check if available;
* otherwise state visual validation gap.

For component logic:

* run targeted test if one exists;
* otherwise run typecheck and a browser smoke.

For shared component changes:

* check at least two usages or affected routes.

Do not run expensive broad validation unless the task risk requires it.

---

### Small-Agent Forbidden Phrases

Small agents should not close with vague claims like:

* "should work";
* "probably fixed";
* "improved the design";
* "made it better";
* "everything is done" without validation.

Use concrete statements:

* "Aligned icon and label with `items-center` in `TrainingFormatCard`."
* "Checked `/education` at desktop width."
* "Did not run browser QA because local dev server was not started."
