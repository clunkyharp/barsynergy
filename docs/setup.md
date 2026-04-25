# Setup

## Goal

Run the Phase 0 foundation locally with Next.js and PostgreSQL.

## Steps

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run prisma:migrate:dev -- --name init_foundation
npm run dev
```

Open:

```txt
http://localhost:3000
```

Docker exposes local PostgreSQL on `localhost:55432`.

## Notes

- Local uploads use `STORAGE_DRIVER=local` and `LOCAL_UPLOAD_DIR=./uploads`.
- `uploads/` is ignored by git.
- Real user data, dumps and secrets must not be committed.
