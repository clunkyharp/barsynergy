# BARSYNERGY

BARSYNERGY is a fullstack web platform foundation for a professional bar-industry education and community product in the North Caucasus Federal District.

The project uses a Russia-ready VPS architecture: Next.js, PostgreSQL, Prisma, Docker Compose, Nginx and S3-compatible Timeweb Cloud Object Storage for production files.

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

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npx prisma validate
```

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

Production must use:

```txt
STORAGE_DRIVER=s3
```

If production starts with `STORAGE_DRIVER=local`, env validation fails by design.

## Prisma

```bash
npm run prisma:generate
npm run prisma:migrate:dev -- --name <migration_name>
npm run prisma:migrate:deploy
```

## Branches

- `prod` — stable production branch.
- `dev` — main development branch.
- `feature/*` — only for large coherent features.

Production releases go `dev -> validation -> prod` only after owner confirmation.

## Documentation

- [Project plan](docs/project-plan.md)
- [AI agent workflow](docs/agent-workflow.md)
- [Project audit workflow](docs/audit-workflow.md)
- [Remediation plan](docs/remediation-plan.md)
- [Phase plan](docs/phase-plan.md)
- [Setup](docs/setup.md)
- [Deploy](docs/deploy.md)
- [Environment](docs/env.md)
- [Backup](docs/backup.md)
- [Security](docs/security.md)
- [Features](docs/features.md)
- [Monetization](docs/monetization.md)
- [Git workflow](docs/git-workflow.md)
- [Legal notes](docs/legal-notes.md)
