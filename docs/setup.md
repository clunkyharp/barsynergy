# Setup

## Goal

Run the Phase 0 foundation locally with Next.js and PostgreSQL.

## Steps

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run prisma:migrate:deploy
npm run dev
```

Open:

```txt
http://localhost:3000
```

Docker exposes local PostgreSQL on `localhost:55432`.

## Notes

- Local uploads use `STORAGE_DRIVER=local` and `LOCAL_UPLOAD_DIR=./uploads`.
- Local public application forms are enabled with `APPLICATION_FORMS_ENABLED=true`.
- `uploads/` is ignored by git.
- New migration creation is a separate step during schema changes: `npm run prisma:migrate:dev -- --name <migration_name>`.
- Expired sessions can be cleaned with `npm run session:cleanup:expired`. In production, schedule it with cron, systemd timer or the hosting scheduler after `DATABASE_URL` is available in the app environment.
- Real user data, dumps and secrets must not be committed.

## Related Docs

- [Remediation plan](remediation-plan.md)
- [Project audit workflow](audit-workflow.md)
