# Environment

## Required Local Variables

See `.env.example`.

## Required Production Variables

See `.env.production.example`.

Important production values:

```txt
NODE_ENV=production
APP_URL=https://barsynergy.ru
DATABASE_URL=postgresql://barsynergy:<password>@postgres:5432/barsynergy
STORAGE_DRIVER=s3
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
POSTGRES_DB=barsynergy
POSTGRES_USER=barsynergy
POSTGRES_PASSWORD=<password>
```

`DATABASE_URL` for production compose must use `postgres` host from Docker network, not `localhost`.

## Storage Rule

Production with `STORAGE_DRIVER=local` is invalid and must fail at startup.

## Secret Hygiene

Do not commit real `.env`, tokens, passwords, private keys, production configs, dumps or user files.

## Related Docs

- [Remediation plan](remediation-plan.md)
- [Project audit workflow](audit-workflow.md)
