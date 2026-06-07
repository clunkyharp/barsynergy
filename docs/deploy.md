# Deploy

## Target

Production target is a Russian VPS/cloud, with Timeweb Cloud VPS as the primary option.

## Access Note

The local source of truth for server access is the repo-root `ssh.md` file.
That file is gitignored on purpose and may contain the safe SSH command and runtime notes.
It must not contain passwords, private keys, tokens, env values or database URLs.

If `ssh.md` is missing or outdated, ask the owner for the current server access details before any deploy or production check. Do not reconstruct access from shell history, neighboring projects or old chat notes.

## Architecture

- Ubuntu Server
- Docker Compose
- Nginx
- Let's Encrypt
- PostgreSQL container or Russian managed PostgreSQL
- Next.js app
- Timeweb Cloud Object Storage for files

Single-node fallback for first launch when an external edge proxy is not ready:

- direct TLS on the same host;
- one public app host that serves the site;
- Timeweb Cloud Object Storage remains the production file storage backend.

## Production Flow

Before enabling public forms that collect personal data, complete [Personal data launch checklist](personal-data-launch-checklist.md).

The repository supports two deploy shapes:

- Docker Compose stack, useful for a container-managed production-like setup;
- current verified production host checkout, where the app is built in `/opt/barsynergy` and restarted through `systemd`.

Use only one shape for a release. Do not mix Compose app containers with the host `barsynergy.service` runtime.

### Docker Compose Path

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production -f docker-compose.production.yml exec app npm run prisma:migrate:deploy
```

Migration command must run inside the `app` container because production `DATABASE_URL` resolves `postgres` inside Docker network, not on the host.

If the app is deployed from a host checkout with `barsynergy.service` running `node .next/standalone/server.js`, the build step must also sync `public/` and `.next/static/` into `.next/standalone/`. The repository `npm run build` command now does this automatically through `scripts/sync-standalone-assets.mjs`.

### Current Verified Production Host-Checkout Path

Verified on `2026-05-07`:

- project checkout: `/opt/barsynergy`;
- branch: `prod`;
- app runtime: `barsynergy.service`;
- app command: `node .next/standalone/server.js`;
- runtime user/group: `barsynergy:barsynergy`;
- PostgreSQL runtime: host `postgresql.service`, listening locally;
- ingress: host `nginx`, proxying HTTPS traffic to `127.0.0.1:3000`;
- cleanup scheduler: `barsynergy-cleanup.timer`;
- Docker is installed, but no Compose app container is active for the current production runtime.

Deploy sequence for this mode:

```bash
ssh <server>
cd /opt/barsynergy

git status --short
git branch --show-current
git fetch origin --prune
git checkout prod
git pull --ff-only origin prod

npm ci
npm run build
```

Before restart, validate Prisma and apply migrations with production env values loaded. The Prisma CLI reads `.env` by default, not `.env.production`, so do not run a plain `./node_modules/.bin/prisma validate` on the host unless `DATABASE_URL` is already exported.

Safe pattern:

```bash
PRISMA_COMMAND=validate node <<'NODE'
const fs = require('fs');
const { spawnSync } = require('child_process');

function readEnv(path) {
  const env = { ...process.env };
  for (const raw of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index < 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = readEnv('/opt/barsynergy/.env.production');
const command = process.env.PRISMA_COMMAND ?? 'validate';
const args = command === 'migrate-deploy' ? ['migrate', 'deploy'] : ['validate'];
const result = spawnSync('./node_modules/.bin/prisma', args, {
  cwd: '/opt/barsynergy',
  env,
  stdio: 'inherit'
});
process.exit(result.status ?? 1);
NODE
```

For migrations, rerun the same heredoc with `PRISMA_COMMAND=migrate-deploy`, or save that helper as a temporary local server script and run it with this environment variable:

```bash
PRISMA_COMMAND=migrate-deploy node /tmp/run-prisma-production-env.mjs
```

Back up the database before `migrate deploy`. Load `DATABASE_URL` from `/opt/barsynergy/.env.production` without printing or pasting it into shell history.

```bash
DEPLOY_BACKUP_DIR="/var/backups/barsynergy/deploy-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$DEPLOY_BACKUP_DIR"

DEPLOY_BACKUP_FILE="$DEPLOY_BACKUP_DIR/db-before-migrate.dump" node <<'NODE'
const fs = require('fs');
const { spawnSync } = require('child_process');

function readEnv(path) {
  const env = { ...process.env };
  for (const raw of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index < 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = readEnv('/opt/barsynergy/.env.production');
const backupFile = process.env.DEPLOY_BACKUP_FILE;
const result = spawnSync('pg_dump', ['-Fc', '--file', backupFile, env.DATABASE_URL], {
  stdio: 'inherit'
});
process.exit(result.status ?? 1);
NODE

chmod 600 "$DEPLOY_BACKUP_DIR/db-before-migrate.dump"
```

After build, Prisma validation and migrations pass:

```bash
chown -R barsynergy:barsynergy /opt/barsynergy
systemctl restart barsynergy.service
systemctl is-active --quiet barsynergy.service
```

Post-deploy smoke:

```bash
curl -I https://<production-host>/
curl -I https://<production-host>/auth/login
curl -I https://<production-host>/admin/login
curl -I https://<production-host>/admin
journalctl -u barsynergy.service --since '10 minutes ago' --no-pager -p err..alert
```

Expected smoke behavior:

- `/` returns `200`;
- `/auth/login` returns `200`;
- `/admin/login` returns `200`;
- `/admin` redirects unauthenticated users to `/admin/login`;
- service logs have no fresh `err..alert` entries.

Host-checkout nuances:

- `npm run build` intentionally syncs `public/` and `.next/static/` into `.next/standalone/`;
- `next-env.d.ts` may change after local `next typegen` or build; do not commit or preserve that as a server-local patch;
- if `next.config.ts` or another tracked file is dirty on the server, inspect and save a patch before `git restore` or `git pull`;
- do not edit `.env.production` during deploy unless the owner explicitly approved the env change;
- stop the deploy before restart if `npm ci`, `npm run build`, Prisma validation or migrations fail.

### Clean Production Branch Rule

The VPS must deploy from `prod` only. Treat `prod` as the clean site branch:

- include application source, Prisma schema/migrations, required scripts, runtime config examples, Docker/Nginx files and the minimum operator docs needed to deploy the site;
- do not include local agent memory, generated QA screenshots, scratch output, browser artifacts, `.lazyweb/`, `.codex/`, `.agents/`, `.mempalace/`, `test-results/`, `.playwright-cli/`, `output/` or local-only secret notes;
- keep `ssh.md`, `.env*` with real values, database dumps, backups, uploads, private keys and tokens out of git;
- merge or cherry-pick into `prod` only after validation and owner confirmation;
- on the VPS, confirm `git branch --show-current` returns `prod` before pulling and restarting.

Rollback plan for this mode:

```bash
cd /opt/barsynergy
git reset --hard <previous-prod-commit>
npm ci
npm run build
systemctl restart barsynergy.service
```

If migrations changed production data or schema, restore the pre-migration dump only after a separate owner confirmation:

```bash
pg_restore --clean --if-exists --dbname "$DATABASE_URL" /var/backups/barsynergy/<deploy-folder>/db-before-migrate.dump
```

## Supported Ingress Contract (Current Repository State)

Current repository state supports the single-node ingress mode in two variants.

Compose-managed variant:

- `docker-compose.production.yml` publishes `80` and `443`;
- `docker/nginx/nginx.conf` terminates TLS on the app host;
- app-side Nginx sets `X-Real-IP` and `X-Forwarded-For` to `$remote_addr`;
- inbound client-supplied forwarding chains are overwritten before they reach Next.js;
- Next.js and server actions prefer `X-Real-IP` for throttling and request identity, then fall back to `X-Forwarded-For`.

Current host-checkout production variant:

- host Nginx listens on `80` and `443`;
- TLS certificates are managed by Let's Encrypt on the host;
- Nginx proxies app traffic to `127.0.0.1:3000`;
- app runtime is `barsynergy.service`, not a Compose app container.

Unsupported production mode for the current repo without a separate ingress review:

- putting a trusted external edge in front of this compose Nginx and expecting the current Nginx config to preserve the original client IP;
- trusting `CF-Connecting-IP` or another provider-specific header without locking traffic to that provider.

Status note, 2026-05-05: this single-node Nginx/TLS contract is the current launch-readiness target. Older notes about a trusted external edge are historical unless the owner explicitly reopens that architecture.

The canonical public domain is `https://barsynergy.ru`. Keep `APP_URL`, Nginx `server_name`, certificate paths and smoke-check URLs aligned to that domain. `www.barsynergy.ru` and the temporary `72.56.1.69.sslip.io` host must return `301` to `https://barsynergy.ru$request_uri`; apply the same redirect in the real host Nginx when production runs from the host checkout.

## Single-Node Fallback Contract

For a temporary one-server launch, the repository supports this narrower fallback:

- Nginx listens on `80` and `443` directly on the app host;
- Let's Encrypt terminates on the same host;
- production files are stored in Timeweb Cloud Object Storage with `STORAGE_DRIVER=s3`;
- public file URLs are generated from `S3_ENDPOINT`, `S3_BUCKET_PUBLIC` and the stored file key;
- `docker-compose.production.yml` does not run local MinIO, and `docker/nginx/nginx.conf` does not proxy `/storage/*`.

This fallback keeps the app compatible with `STORAGE_DRIVER=s3`, but it is less isolated than the preferred external edge + external object storage production shape because Nginx and the app run on the same host.

If S3-compatible storage is still unavailable, the last-resort launch path is:

- `STORAGE_DRIVER=local`;
- `ALLOW_LOCAL_STORAGE_IN_PRODUCTION=true`;
- one server with local uploads on disk and regular host-level backups.

Before production sign-off, verify on the real host that:

- public HTTP redirects to HTTPS;
- application logs and throttling see the real client IP from `X-Real-IP`;
- spoofed inbound `X-Forwarded-For` and `CF-Connecting-IP` headers do not change the throttling identity.

## Future Multi-Server And HA Plan

The first production deploy can run on one server:

- one VPS/cloud server;
- Docker Compose;
- `app`, `postgres` and `nginx` containers;
- Timeweb Cloud Object Storage for production files;
- scheduled PostgreSQL backups.

This is enough for the first launch, but it is not true high availability. If the server fails, the app, database and Nginx fail together.

For a later fault-tolerant setup, split the system into separate roles:

- one trusted Load Balancer or external edge proxy in front of the app servers;
- at least two `app` servers in different zones or on different cloud nodes;
- PostgreSQL outside the local app server Docker Compose stack;
- Timeweb Cloud Object Storage or another Russia-compatible S3 storage as the persistent file layer;
- monitoring for HTTP 5xx, latency, CPU, RAM, disk usage, database health and backup status.

Recommended larger-start shape:

```txt
Load Balancer
  -> app-server-1: Next.js app, private HTTP
  -> app-server-2: Next.js app, private HTTP

Shared services:
  -> managed PostgreSQL or separate PostgreSQL HA cluster
  -> S3-compatible object storage
  -> monitoring and backups
```

Recommended hardware for this shape:

- `app-server-1`: 2 vCPU, 4 GB RAM;
- `app-server-2`: 2 vCPU, 4 GB RAM;
- PostgreSQL: 4 vCPU, 16 GB RAM, 100+ GB SSD/NVMe;
- Load Balancer: managed cloud load balancer or a small dedicated reverse-proxy node.

Operational rules for multi-server mode:

- all app servers must use the same production env values for public app settings, auth/session secrets and storage configuration;
- public traffic must enter through the Load Balancer, not directly through individual app servers;
- Load Balancer health checks should remove unhealthy app servers from rotation;
- PostgreSQL must stay private and must not expose `5432` to the public internet;
- production files must not depend on local app-server disks;
- Prisma migrations must run once per release from a controlled migration step, not independently on every app server;
- scheduled cleanup jobs must run in one controlled place only, following [Scheduler runbook](scheduler-runbook.md);
- database backups must be automated and restore must be tested before public launch.

Connection pooling should be reviewed before running many app instances. Each Next.js app process can open PostgreSQL connections through Prisma; with multiple app servers and traffic spikes, this can exhaust the database connection limit. Use managed pooling or PgBouncer when app instance count, request volume or Prisma connection count starts approaching the PostgreSQL limit.

## Related Docs

- [Remediation plan](remediation-plan.md)
- [Project audit workflow](audit-workflow.md)
- [Scheduler runbook](scheduler-runbook.md)

## Restrictions

Do not use Vercel, Netlify, Render, Railway, Firebase, managed Supabase or foreign storage for production user data.

PostgreSQL must not expose `5432` publicly.
