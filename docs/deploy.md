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

## Related Docs

- [Remediation plan](remediation-plan.md)
- [Project audit workflow](audit-workflow.md)

## Restrictions

Do not use Vercel, Netlify, Render, Railway, Firebase, managed Supabase or foreign storage for production user data.

PostgreSQL must not expose `5432` publicly.
