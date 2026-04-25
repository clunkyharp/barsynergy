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
npm run prisma:migrate:deploy
```

Run migrations from the same network as the app and database.

## Restrictions

Do not use Vercel, Netlify, Render, Railway, Firebase, managed Supabase or foreign storage for production user data.

PostgreSQL must not expose `5432` publicly.
