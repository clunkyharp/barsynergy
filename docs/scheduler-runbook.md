# Scheduler Runbook

## Purpose

This runbook defines one production maintenance path for cleanup jobs that must run on a schedule.

Use one controlled scheduler only. Do not split these cleanup commands across multiple hosts, random cron entries or ad-hoc manual runs.

## In Scope

This runbook covers:

- expired session cleanup;
- stale auth attempt throttle cleanup;
- stale public application throttle cleanup;
- stale business-access invite cleanup.
- notification queue processing (email-content, application, web-push-content) via `/api/cron/notify`.

Out of scope:

- deploy flow;
- database backups;
- Prisma migrations;

## Commands

Application-level commands:

```bash
npm run session:cleanup:expired
npm run auth:cleanup:throttles
npm run application:cleanup:throttles
npm run business-access:cleanup:invites
```

Notification queue processing is handled by the HTTP cron endpoint `/api/cron/notify`, which processes all three queues (email-content, application, web-push-content) in a single request. It requires `CRON_SECRET` in the environment. See the Notification Cron section below.

Production host command pattern for a Compose-managed app container:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run <command>
```

Use `-T` so the command is safe for cron, systemd timers and other non-interactive schedulers.

Verified current production host mode on `2026-05-07`:

- checkout path: `/opt/barsynergy`;
- app runtime: `barsynergy.service`;
- scheduler runtime: host-level `systemd`, not `docker compose exec`;
- production env file: `/opt/barsynergy/.env.production`.

Host-checkout command pattern for this mode:

```bash
cd /opt/barsynergy
npm run session:cleanup:expired
npm run auth:cleanup:throttles
npm run application:cleanup:throttles
npm run business-access:cleanup:invites
npm run notifications:retry
```

If the deployed revision does not yet contain one of these scripts, the scheduler must log that fact explicitly instead of pretending the full batch ran.

## Recommended Single Scheduler Job

Recommended production shape:

- one scheduler entry;
- one host;
- app container already running;
- all cleanup and notification retry commands executed sequentially.

Example host-side shell block for a Compose-managed host:

```bash
set -euo pipefail

cd /opt/barsynergy

docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run session:cleanup:expired
docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run auth:cleanup:throttles
docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run application:cleanup:throttles
docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run business-access:cleanup:invites
```

Example host-side shell block for the current verified `systemd` checkout mode:

```bash
set -euo pipefail

cd /opt/barsynergy

npm run session:cleanup:expired
npm run auth:cleanup:throttles
npm run application:cleanup:throttles

if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['business-access:cleanup:invites'] ? 0 : 1)"; then
  npm run business-access:cleanup:invites
else
  echo "Skipping business-access:cleanup:invites: script is not present in the deployed revision"
fi
```

## Notification Cron

Notification queue processing (email-content, application, web-push-content) runs as a separate HTTP cron, not as part of the cleanup batch. The endpoint `/api/cron/notify` processes all three queues in a single request and requires `CRON_SECRET` in `.env.production`.

Host-checkout crontab example (every 10 minutes):

```cron
*/10 * * * * /usr/bin/curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://barsynergy.ru/api/cron/notify >> /var/log/barsynergy-notify.log 2>&1
```

The `$CRON_SECRET` value must be loaded from `.env.production` or a root-only secrets file. Do not hardcode it in the crontab.

Alternatively, a systemd timer can call the same endpoint via a oneshot service that reads `CRON_SECRET` from the environment file.

## Recommended Frequency

Default recommendation:

- run the combined cleanup job every hour.

Reasoning:

- expired sessions are harmless after expiry but should not accumulate for long;
- throttle cleanup has a long retention window, but is cheap to run together with session cleanup;
- business-access invite cleanup should remove expired or long-used tokens without relying on manual maintenance.

Notification queue processing runs on a separate schedule (every 10 minutes) via the HTTP cron endpoint, not as part of the hourly cleanup batch.

If the first production host has very limited resources, every 6 hours is an acceptable fallback for cleanup. Do not go lower than daily only after explicit owner approval.

## Systemd Timer Example

Recommended on a self-managed VPS:

Service unit example for a self-managed VPS in Compose mode:

```ini
[Unit]
Description=BARSYNERGY scheduled cleanup

[Service]
Type=oneshot
WorkingDirectory=/opt/barsynergy
ExecStart=/bin/bash -lc 'set -euo pipefail; docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run session:cleanup:expired && docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run auth:cleanup:throttles && docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run application:cleanup:throttles && docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run business-access:cleanup:invites'
```

Timer unit example:

```ini
[Unit]
Description=Run BARSYNERGY scheduled cleanup hourly

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
```

Service unit example for the current verified host-checkout mode:

```ini
[Unit]
Description=BARSYNERGY cleanup batch
After=network.target barsynergy.service
Wants=barsynergy.service

[Service]
Type=oneshot
User=barsynergy
Group=barsynergy
WorkingDirectory=/opt/barsynergy
EnvironmentFile=/opt/barsynergy/.env.production
Environment=PATH=/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/local/bin/barsynergy-cleanup.sh
```

## Cron Example

Fallback if systemd timers are not available:

```cron
0 * * * * cd /opt/barsynergy && docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run session:cleanup:expired && docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run auth:cleanup:throttles && docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run application:cleanup:throttles && docker compose --env-file .env.production -f docker-compose.production.yml exec -T app npm run business-access:cleanup:invites >> /var/log/barsynergy-cleanup.log 2>&1
```

## Preconditions

Before enabling the scheduler:

- `.env.production` exists on the host;
- `DATABASE_URL` points to the production database inside the app environment;
- the target runtime model is known up front: either Compose-managed app container or host checkout with `barsynergy.service`;
- Prisma migrations for the current release are already applied;
- the scheduler runs on one trusted host only.

## Verification

After enabling the scheduler:

1. run the combined command manually once;
2. confirm each command exits with code `0`;
3. confirm logs show deleted record counts or `0`;
4. confirm the scheduler can run without an interactive TTY;
5. confirm the same cleanup job is not duplicated on another node or another scheduler.

## Failure Handling

If one command fails:

- stop the sequence with a non-zero exit;
- inspect app logs and the current runtime model;
- verify `DATABASE_URL`, execution path and current release state;
- rerun manually before re-enabling the schedule.

Do not silently ignore failures in the scheduler command.

## Related Docs

- [Setup](setup.md)
- [Deploy](deploy.md)
- [Project status](../PROJECT_STATUS.md)
