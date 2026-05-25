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

## Local Admin

Create or reset a local admin account:

```bash
npm run admin:upsert:local
```

The default email is `admin@barsynergy.local`. The script refuses non-local database hosts, resets the password hash, marks the account as `ACTIVE` and deletes existing sessions for that user.

If you want your own password without saving it in repository files:

```bash
printf '%s\n' 'YourStrongPassword123!' | npm run admin:upsert:local -- --email admin@barsynergy.local --password-stdin
```

## Notes

- Local uploads use `STORAGE_DRIVER=local` and `LOCAL_UPLOAD_DIR=./uploads`.
- Local public application forms are enabled with `APPLICATION_FORMS_ENABLED=true`.
- The public business-access request at `/auth/register` uses the same personal-data form gate.
- Production personal-data forms require the separate [Personal data launch checklist](personal-data-launch-checklist.md).
- `uploads/` is ignored by git.
- New migration creation is a separate step during schema changes: `npm run prisma:migrate:dev -- --name <migration_name>`.
- Production scheduler cleanup is documented in one place: [Scheduler runbook](scheduler-runbook.md).
- Local manual cleanup commands stay available: `npm run session:cleanup:expired`, `npm run auth:cleanup:throttles`, `npm run application:cleanup:throttles`, `npm run business-access:cleanup:invites`.
- Real user data, dumps and secrets must not be committed.

## Related Docs

- [Remediation plan](remediation-plan.md)
- [Project audit workflow](audit-workflow.md)
- [Scheduler runbook](scheduler-runbook.md)
