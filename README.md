# BARSYNERGY

BARSYNERGY is a fullstack Next.js project for bar-industry education, events, vacancies, suppliers and partnerships in the North Caucasus Federal District.

The production target is a Russian VPS with PostgreSQL, Docker Compose, Nginx and S3-compatible Timeweb Cloud Object Storage.

## Stack

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

## Local Setup

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

Local PostgreSQL from Docker is exposed on `localhost:55432` to avoid conflicts with existing local databases.

## Local Admin Access

Create or reset a local admin account:

```bash
npm run admin:upsert:local
```

Default email:

```txt
admin@barsynergy.local
```

The script only allows local database hosts, creates the admin if it does not exist, resets the password if it already exists, marks the account as `ACTIVE`, deletes existing sessions for that user and prints the password once.

Safer custom-password example without putting the password into the repo:

```bash
printf '%s\n' 'YourStrongPassword123!' | npm run admin:upsert:local -- --email admin@barsynergy.local --password-stdin
```

## Validation

```bash
npm run lint
npm test
npm run typecheck
./node_modules/.bin/prisma validate
```

`npm run build` is mandatory before creating a commit. During ordinary local checks, run it only for production-build, deployment or standalone-runtime changes.

## Production Build

```bash
npm run build
npm run start
```

## Docker

Local database only:

```bash
docker compose up -d postgres
```

Production-like stack:

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production -f docker-compose.production.yml exec app npm run prisma:migrate:deploy
```

Current production server uses the host-checkout path instead of the Compose app container:

- code checkout: `/opt/barsynergy`;
- branch: `prod`;
- runtime: `barsynergy.service`;
- ingress: host Nginx proxying to `127.0.0.1:3000`;
- database: host PostgreSQL service.

Use [Deploy](docs/deploy.md) for the full production runbook, including `.env.production` handling for Prisma, database backup, service restart, smoke checks and rollback.
Local server access details live in gitignored `ssh.md`. Keep only safe connection/runtime notes there; do not store passwords, private keys, tokens, env values or database URLs.

Production must use:

```txt
STORAGE_DRIVER=s3
```

If production starts with `STORAGE_DRIVER=local`, env validation fails by default.
The only supported exception is an explicit single-server fallback with `ALLOW_LOCAL_STORAGE_IN_PRODUCTION=true`.

## Prisma

```bash
npm run prisma:generate
npm run prisma:migrate:dev -- --name <migration_name>
npm run prisma:migrate:deploy
```

Current schema includes the Phase 4 business-account MVP and the public B2B request types. Apply migrations before testing `/auth/register`, `/auth/login`, `/admin/users`, `/business`, `/consulting` or `/business/cabinet/requests`.

## Branches

- `prod`: stable production branch.
- `dev`: main development branch.
- `feature/*`: only for large coherent features.

Production releases go `dev -> validation -> prod` only after owner confirmation.
The VPS deploys from `prod`; keep that branch clean from agent memory, generated QA artifacts, local access notes, real env files and other files that are not required to build, run or operate the site.

## Documentation

- [Design system](DESIGN.md)
- [Design tokens](design-tokens.json)
- [Design system status](docs/design-system-status.md)
- [Design system component matrix](docs/design-system-component-matrix.md)
- [Final design consistency audit](docs/design-system-consistency-audit-final-2026-04-29.md)
- [Project status](PROJECT_STATUS.md)
- [Project plan](docs/project-plan.md)
- [AI agent workflow](docs/agent-workflow.md)
- [Project audit workflow](docs/audit-workflow.md)
- [Homepage data-source audit](docs/homepage-data-source-audit.md)
- [Remediation plan](docs/remediation-plan.md)
- [Phase plan](docs/phase-plan.md)
- [Obsidian Kanban sync](docs/kanban-sync.md)
- [Phase 2 content/admin mini-spec](docs/phase-2-content-admin-spec.md)
- [Phase 3 applications and vacancy flows mini-spec](docs/phase-3-applications-spec.md)
- [Business account mini-spec](docs/business-account-spec.md)
- [Services specialists mini-spec](docs/services-specialists-spec.md)
- [Setup](docs/setup.md)
- [Deploy](docs/deploy.md)
- [Scheduler runbook](docs/scheduler-runbook.md)
- [Environment](docs/env.md)
- [Backup](docs/backup.md)
- [Security](docs/security.md)
- [Personal data launch checklist](docs/personal-data-launch-checklist.md)
- [Monetization](docs/monetization.md)
- [Git workflow](docs/git-workflow.md)
- [Legal notes](docs/legal-notes.md)
