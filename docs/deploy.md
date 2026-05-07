# Deploy

## Target

Production target is a Russian VPS/cloud, with Timeweb Cloud VPS as the primary option.

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

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production -f docker-compose.production.yml exec app npm run prisma:migrate:deploy
```

Migration command must run inside the `app` container because production `DATABASE_URL` resolves `postgres` inside Docker network, not on the host.

If the app is deployed from a host checkout with `barsynergy.service` running `node .next/standalone/server.js`, the build step must also sync `public/` and `.next/static/` into `.next/standalone/`. The repository `npm run build` command now does this automatically through `scripts/sync-standalone-assets.mjs`.

## Supported Ingress Contract (Current Repository State)

Current repository state supports the single-node ingress mode:

- `docker-compose.production.yml` publishes `80` and `443`;
- `docker/nginx/nginx.conf` terminates TLS on the app host;
- app-side Nginx sets `X-Real-IP` and `X-Forwarded-For` to `$remote_addr`;
- inbound client-supplied forwarding chains are overwritten before they reach Next.js;
- Next.js and server actions prefer `X-Real-IP` for throttling and request identity, then fall back to `X-Forwarded-For`.

Unsupported production mode for the current repo without a separate ingress review:

- putting a trusted external edge in front of this compose Nginx and expecting the current Nginx config to preserve the original client IP;
- trusting `CF-Connecting-IP` or another provider-specific header without locking traffic to that provider.

Status note, 2026-05-05: this single-node Nginx/TLS contract is the current launch-readiness target. Older notes about a trusted external edge are historical unless the owner explicitly reopens that architecture.

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
