# Environment

## Required Local Variables

See `.env.example`.

## Required Production Variables

See `.env.production.example`.

Important production values:

```txt
NODE_ENV=production
APP_URL=https://barsynergy.ru
STORAGE_DRIVER=s3
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
```

## Storage Rule

Production with `STORAGE_DRIVER=local` is invalid and must fail at startup.

## Secret Hygiene

Do not commit real `.env`, tokens, passwords, private keys, production configs, dumps or user files.
