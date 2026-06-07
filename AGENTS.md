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

## Start Here

Before meaningful project work, read the smallest relevant set of docs:

1. `README.md`
2. `docs/project-plan.md`
3. `docs/agent-workflow.md`
4. `docs/phase-plan.md`
5. `PROJECT_STATUS.md`
6. `docs/kanban-sync.md`
7. phase-specific or task-specific docs under `docs/`
8. current `git status --short --branch`

Use `docs/project-plan.md` as the canonical product plan and `docs/phase-plan.md` as the implementation roadmap.

**Core engineering references (read before implementation):**
- `docs/engineering-standards.md` — component limits, CSS rules, TypeScript rules, form rules
- `docs/architecture.md` — layers, patterns, anti-patterns, pending decisions
- `docs/pr-checklist.md` — pre-merge checks for every branch
- `docs/scaling-playbook.md` — step-by-step guides for new content types, roles, notifications

## Documentation And Kanban Sync

Every meaningful change must include a documentation sync decision before closeout.

Always check whether the change affects:

- `PROJECT_STATUS.md`;
- `docs/phase-plan.md`;
- `docs/project-plan.md`;
- phase-specific docs under `docs/`;
- the Obsidian Kanban board described in `docs/kanban-sync.md`.

If code, schema, migration, UI, route behavior, validation results, active phase, next step, blocker or task status changed, update the relevant docs and the Kanban board in the same batch.

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
