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

## Production Flow

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production -f docker-compose.production.yml exec app npm run prisma:migrate:deploy
```

Migration command must run inside the `app` container because production `DATABASE_URL` resolves `postgres` inside Docker network, not on the host.

## TLS Note (Current State)

Current repository state:

- `docker-compose.production.yml` publishes `80`;
- `docker/nginx/nginx.conf` listens only on `80`;
- TLS is expected to terminate on an external edge proxy or load balancer.

Treat this as `Needs verification` until the production host is configured: confirm the external TLS layer and keep the app-side Nginx private HTTP only, or add TLS listener/cert paths in Nginx config if TLS must terminate in this compose stack.

## Future Multi-Server And HA Plan

The first production deploy can run on one server:

- one VPS/cloud server;
- Docker Compose;
- `app`, `postgres` and `nginx` containers;
- Timeweb Cloud Object Storage for production files;
- scheduled PostgreSQL backups.

This is enough for the first launch, but it is not true high availability. If the server fails, the app, database and Nginx fail together.

For a later fault-tolerant setup, split the system into separate roles:

- Load Balancer or external edge proxy in front of the app servers;
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
- scheduled jobs, such as expired session cleanup, must run in one controlled place only;
- database backups must be automated and restore must be tested before public launch.

Connection pooling should be reviewed before running many app instances. Each Next.js app process can open PostgreSQL connections through Prisma; with multiple app servers and traffic spikes, this can exhaust the database connection limit. Use managed pooling or PgBouncer when app instance count, request volume or Prisma connection count starts approaching the PostgreSQL limit.

## Related Docs

- [Remediation plan](remediation-plan.md)
- [Project audit workflow](audit-workflow.md)

## Restrictions

Do not use Vercel, Netlify, Render, Railway, Firebase, managed Supabase or foreign storage for production user data.

PostgreSQL must not expose `5432` publicly.
