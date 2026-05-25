# Backup

## PostgreSQL

Minimum MVP policy:

- daily `pg_dump`;
- keep several latest copies;
- store backups outside the running database volume;
- document restore steps before public launch.

Compose-managed production example:

```bash
mkdir -p backups
docker compose --env-file .env.production -f docker-compose.production.yml exec -T postgres sh -lc 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "backups/barsynergy-$(date +%F).sql"
```

Host-checkout production mode must use the safe production env-loading backup pattern from [Deploy](deploy.md). Do not paste `DATABASE_URL` into shell history and do not rely on host shell variables that only exist inside the Compose container.

## Files

Production files live in Timeweb Cloud Object Storage.

MVP policy:

- public bucket for safe public images only;
- private bucket for user files;
- separate object storage backup/regulation plan before launch.
