# Environment

## Required Local Variables

See `.env.example`.

`THROTTLE_SECRET` is an optional production HMAC key for rate-limiting hashes. A development fallback is used when both `THROTTLE_SECRET` and `SESSION_SECRET` are unset.

## Required Production Variables

See `.env.production.example`.

Important production values:

```txt
NODE_ENV=production
APP_URL=https://<production-host>
DATABASE_URL=postgresql://barsynergy:<password>@postgres:5432/barsynergy
SESSION_SECRET=<long-random-secret>
THROTTLE_SECRET=<long-random-secret>
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=<base64-aes-key>
STORAGE_DRIVER=s3
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
S3_BUCKET_PUBLIC=<public-bucket>
S3_BUCKET_PRIVATE=<private-bucket>
S3_ACCESS_KEY_ID=<access-key>
S3_SECRET_ACCESS_KEY=<secret-key>
APPLICATION_FORMS_ENABLED=false
ADMIN_NOTIFICATION_EMAIL=<team-inbox>
POSTGRES_DB=barsynergy
POSTGRES_USER=barsynergy
POSTGRES_PASSWORD=<password>
```

`DATABASE_URL` for production compose must use `postgres` host from Docker network, not `localhost`.

`APP_URL` must match the canonical production host used for the release. The canonical public domain is `https://barsynergy.ru`; `www.barsynergy.ru` and the temporary `72.56.1.69.sslip.io` host must redirect to it before public launch.

`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` must stay stable across production builds and app instances. Use a base64-encoded AES key with 16, 24 or 32 bytes.

`APP_DEPLOYMENT_ID` is optional but recommended for self-hosted deploys. Use a release-specific value such as a commit SHA or deploy tag so stale client pages are less likely to hit Server Action version skew after deploys.

## Production Runtime Validation

Runtime validation is defined in `src/lib/validation/env.ts`.

For `NODE_ENV=production`, the app validates different required variables by storage mode:

- `STORAGE_DRIVER=s3`: `DATABASE_URL`, `SESSION_SECRET`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET_PUBLIC`, `S3_BUCKET_PRIVATE`, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` are required.
- `STORAGE_DRIVER=local`: `DATABASE_URL`, `SESSION_SECRET` and `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` are required, and this mode is allowed only when `ALLOW_LOCAL_STORAGE_IN_PRODUCTION=true`.
- `APPLICATION_FORMS_ENABLED=true`: legal operator details and readiness flags become required at startup unless `ALLOW_PUBLIC_FORMS_WITH_PENDING_LEGAL_REVIEW=true` is set for temporary owner-approved intake. See "Legal Operator Fields" below.

Keep `.env.production.example` aligned with this list whenever env validation changes.

## Storage Rule

Default production mode uses `STORAGE_DRIVER=s3`.

Single-server fallback is allowed only when `ALLOW_LOCAL_STORAGE_IN_PRODUCTION=true` is set explicitly together with `STORAGE_DRIVER=local`.
Use this only when the launch must run on one host without ready external object storage.

## Public Application Forms

`APPLICATION_FORMS_ENABLED` controls public forms that collect personal data, including the public business-access request at `/auth/register`.

- Local development can use `APPLICATION_FORMS_ENABLED=true`.
- Production must keep `APPLICATION_FORMS_ENABLED=false` until owner/legal approval is complete.
- If the variable is omitted, production disables these forms by default and non-production keeps them enabled.
- Temporary owner-approved production intake can use `ALLOW_PUBLIC_FORMS_WITH_PENDING_LEGAL_REVIEW=true` together with `APPLICATION_FORMS_ENABLED=true`. This keeps forms open for admin moderation while legal operator fields remain a tracked follow-up.

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
- `ALLOW_PUBLIC_FORMS_WITH_PENDING_LEGAL_REVIEW=true` is a temporary override for owner-approved intake before final operator details are filled;
- this is meant to prevent enabling public personal-data forms before the operator, legal review, Roskomnadzor notification decision, processor agreements and retention rule are actually confirmed.

## Web Push Notifications

Web Push (browser push notifications) is optional and env-driven.

- `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` — VAPID public key exposed to the browser for `PushManager.subscribe()`. Must be a base64-encoded URL-safe key.
- `WEB_PUSH_PRIVATE_KEY` — VAPID private key used server-side to sign push messages. Keep secret.
- `WEB_PUSH_SUBJECT` — Contact URI (typically `mailto:`), sent to the push service as identification.

Generate VAPID keys with:

```bash
npx web-push generate-vapid-keys
```

Missing Web Push env vars must not block publishing content. Push notifications are dispatched from `ContentNotificationOutbox` and retried on failure.

## Optional Notifications

Public application notifications are optional and env-driven.

- User confirmation emails are sent only when `SMTP_HOST`, `SMTP_PORT` and `SMTP_FROM` are configured. `SMTP_USER` and `SMTP_PASSWORD` are used when the SMTP server requires auth.
- Admin email notifications for new public applications are sent to `ADMIN_NOTIFICATION_EMAIL` only when SMTP is configured.
- Short Telegram admin notifications are sent only when both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` are configured.
- Missing notification env must not block public form submission.
- Cloudflare Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`) is optional. When both are set, the Turnstile challenge is rendered on sensitive public forms (business registration, participant registration, vacancy response, vacancy submission) and verified server-side. When absent, the forms work without the challenge layer.

## Secret Hygiene

Do not commit real `.env`, tokens, passwords, private keys, production configs, dumps or user files.

## Related Docs

- [Remediation plan](remediation-plan.md)
- [Project audit workflow](audit-workflow.md)
