# Git Workflow

## Branches

- `prod`: stable production branch.
- `dev`: main development branch.
- `feature/*`: large coherent features only.
- `fix/*`: critical production fixes only.

`prod` is also the VPS deploy branch. Keep it as the clean site branch: only code and files required to build, run, migrate and operate the site should reach it.

Do not merge local agent work materials into `prod`, including:

- memory or assistant state folders;
- generated QA screenshots and browser artifacts;
- scratch output folders;
- local-only access notes such as `ssh.md`;
- real env files, database dumps, backups, uploads, private keys, tokens or passwords.

## Flow

```txt
feature/* -> dev -> validation -> prod
```

Small tasks can go directly to `dev`.

## Pre-Merge Checklist

Full checklist: `docs/pr-checklist.md`.

Summary for every merge into `dev`:

- [ ] No `any` TypeScript types (`grep -r ': any' src/`)
- [ ] No direct `prisma` calls in `page.tsx`
- [ ] No `required` fields inside «по желанию» `<details>` blocks
- [ ] All new server actions have try/catch + `validateServerActionOrigin()`
- [ ] No hardcoded colors in component `className` strings
- [ ] New protected pages check user role before data fetching

## Production Merge Rules

Before merging to `prod`:

- [ ] All `dev` checklist items pass
- [ ] Production build passes: `npm run build`
- [ ] TypeScript: `npm run typecheck` — zero errors
- [ ] Lint: `npm run lint` — zero errors
- [ ] Tests pass: `npm test`
- [ ] Prisma schema valid: `./node_modules/.bin/prisma validate`
- [ ] No local-only docs, QA artifacts, memory files or secrets in the diff
- [ ] All new env variables documented in `.env.production.example` and `docs/env.md`
- [ ] `PROJECT_STATUS.md` and relevant `docs/` updated
- [ ] Owner confirms merge

On the VPS, pull and restart only from `prod`. If a narrow production fix is needed while `dev` contains unrelated work, create a small fix branch or cherry-pick only the required commits into `prod`.

## Commit Message Format

```
<type>(<scope>): <short description>

Types: feat, fix, refactor, style, docs, test, chore
Scope: public, admin, auth, profile, business, lib, schema, css, config

Examples:
feat(public): add services listing page and filter
fix(auth): wrap getCurrentUser in React cache
refactor(components): split PublishedContentSection into dedicated row components
docs: add engineering standards and architecture guide
schema: add Service model and migration
```
