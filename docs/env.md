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
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=<base64-aes-key>
STORAGE_DRIVER=s3
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
APPLICATION_FORMS_ENABLED=false
POSTGRES_DB=barsynergy
POSTGRES_USER=barsynergy
POSTGRES_PASSWORD=<password>
```

`DATABASE_URL` for production compose must use `postgres` host from Docker network, not `localhost`.

`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` must stay stable across production builds and app instances. Use a base64-encoded AES key with 16, 24 or 32 bytes.

`APP_DEPLOYMENT_ID` is optional but recommended for self-hosted deploys. Use a release-specific value such as a commit SHA or deploy tag so stale client pages are less likely to hit Server Action version skew after deploys.

## Storage Rule

Default production mode uses `STORAGE_DRIVER=s3`.

Single-server fallback is allowed only when `ALLOW_LOCAL_STORAGE_IN_PRODUCTION=true` is set explicitly together with `STORAGE_DRIVER=local`.
Use this only when the launch must run on one host without ready external object storage.

## Public Application Forms

`APPLICATION_FORMS_ENABLED` controls public forms that collect personal data, including the public business-access request at `/auth/register`.

- Local development can use `APPLICATION_FORMS_ENABLED=true`.
- Production must keep `APPLICATION_FORMS_ENABLED=false` until owner/legal approval is complete.
- If the variable is omitted, production disables these forms by default and non-production keeps them enabled.

## Legal Operator Fields

Public legal pages and personal-data collection need operator details in env:

- `LEGAL_OPERATOR_TYPE=legal_entity` or `individual_entrepreneur`
- `LEGAL_OPERATOR_NAME`
- `LEGAL_OPERATOR_EMAIL`
- `LEGAL_OPERATOR_ADDRESS`
- `LEGAL_OPERATOR_TAX_ID`
- `LEGAL_OPERATOR_REGISTRATION_ID`
- `LEGAL_OPERATOR_CONFIRMED`
- `PERSONAL_DATA_LEGAL_REVIEW_APPROVED`
- `PERSONAL_DATA_RKN_NOTIFICATION_CONFIRMED`
- `PERSONAL_DATA_PROCESSOR_AGREEMENTS_CONFIRMED`
- `PERSONAL_DATA_RETENTION_RULE_APPROVED`

Production rule:

- if `APPLICATION_FORMS_ENABLED=true`, then `LEGAL_OPERATOR_NAME`, `LEGAL_OPERATOR_EMAIL`, `LEGAL_OPERATOR_ADDRESS`, `LEGAL_OPERATOR_TAX_ID` and `LEGAL_OPERATOR_REGISTRATION_ID` become required at startup;
- the confirmation flags above must be set to `true` before production forms can start;
- this is meant to prevent enabling public personal-data forms before the operator, legal review, Roskomnadzor notification decision, processor agreements and retention rule are actually confirmed.

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
