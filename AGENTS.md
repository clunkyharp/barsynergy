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

Keep changes minimal. Preserve existing architecture, naming, routing, styling, and file organization unless the task explicitly asks for refactoring.

## Git Rules

- Main development branch: `dev`.
- Stable production branch: `prod`.
- Use `feature/*` only for large coherent features.
- Use `fix/*` only for critical production fixes.
- Small tasks can be done directly on `dev`.
- Do not combine commit/checkpoint work with further implementation in the same batch. First classify the dirty tree and create the checkpoint, then open a separate implementation batch if more work is needed.
- Do not push, deploy, merge to `prod`, delete broadly, or run destructive commands without explicit owner approval.
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
npm run typecheck
npm run build
npx prisma validate
```

Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate:dev -- --name <migration_name>
npm run prisma:migrate:deploy
```

Run build and typecheck sequentially. Next.js type generation can make parallel build/typecheck runs flaky.

## Environment And Data Safety

- Required local variables are documented in `.env.example`.
- Required production variables are documented in `.env.production.example` and `docs/env.md`.
- Local PostgreSQL is exposed on `localhost:55432`.
- Local uploads use `STORAGE_DRIVER=local` and `LOCAL_UPLOAD_DIR=./uploads`.
- Production must use `STORAGE_DRIVER=s3`.
- Production `DATABASE_URL` in Docker Compose must use host `postgres`, not `localhost`.
- Do not commit real `.env` files, secrets, tokens, passwords, private keys, production configs, database dumps, uploads, or user data.
- Treat auth, live deploys, production data, migrations, object storage, and environment changes as readiness-first work. Stop and report missing access or missing success criteria before acting.

## Code Guidelines

- Keep server data access, route handlers, and client components clearly separated.
- Prefer existing components in `src/components/ui`, `src/components/layout`, and `src/components/public`.
- Keep public UI responsive and check mobile behavior for visible page changes.
- For small visible UI fixes, prefer concrete browser diff evidence, screenshot notes, page URL, and target element over a generic `поправь дизайн` prompt.
- Use Prisma migrations for schema changes. Do not edit generated Prisma client files.
- Keep validation close to boundaries using existing Zod/env patterns.
- Do not introduce new libraries unless they are necessary and consistent with the stack.

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
