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
APPLICATION_FORMS_ENABLED=false
POSTGRES_DB=barsynergy
POSTGRES_USER=barsynergy
POSTGRES_PASSWORD=<password>
```

`DATABASE_URL` for production compose must use `postgres` host from Docker network, not `localhost`.

## Storage Rule

Production with `STORAGE_DRIVER=local` is invalid and must fail at startup.

## Public Application Forms

`APPLICATION_FORMS_ENABLED` controls public forms that collect personal data.

- Local development can use `APPLICATION_FORMS_ENABLED=true`.
- Production must keep `APPLICATION_FORMS_ENABLED=false` until owner/legal approval is complete.
- If the variable is omitted, production disables these forms by default and non-production keeps them enabled.

## Optional Notifications

Public application notifications are optional and env-driven.

- User confirmation emails are sent only when `SMTP_HOST`, `SMTP_PORT` and `SMTP_FROM` are configured. `SMTP_USER` and `SMTP_PASSWORD` are used when the SMTP server requires auth.
- Short Telegram admin notifications are sent only when both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` are configured.
- Missing notification env must not block public form submission.

## Secret Hygiene

Do not commit real `.env`, tokens, passwords, private keys, production configs, dumps or user files.

## Related Docs

- [Remediation plan](remediation-plan.md)
- [Project audit workflow](audit-workflow.md)
