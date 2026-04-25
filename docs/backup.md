# Backup

## PostgreSQL

Minimum MVP policy:

- daily `pg_dump`;
- keep several latest copies;
- store backups outside the running database volume;
- document restore steps before public launch.

Example command:

```bash
docker compose -f docker-compose.production.yml exec postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backups/barsynergy-$(date +%F).sql
```

## Files

Production files live in Timeweb Cloud Object Storage.

MVP policy:

- public bucket for safe public images only;
- private bucket for user files;
- separate object storage backup/regulation plan before launch.
