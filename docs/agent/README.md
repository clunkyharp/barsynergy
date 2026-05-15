# Agent Ops Notes

## Production Access

- SSH connection source of truth is the repo-root `ssh.md` file.
- Read `ssh.md` directly before production work instead of searching old notes, shell history or neighboring projects.
- Do not copy SSH credentials into repo docs, wiki pages, status reports or chat closeouts.

## Verified Production Layout

Verified on `2026-05-07`:

- application checkout path: `/opt/barsynergy`;
- deployed branch: `prod`;
- runtime service: `barsynergy.service`;
- runtime command: `node .next/standalone/server.js`;
- runtime user/group: `barsynergy:barsynergy`;
- database runtime: host `postgresql.service`;
- ingress: host `nginx`, proxying to `127.0.0.1:3000`;
- scheduled cleanup timer: `barsynergy-cleanup.timer`.
- host-checkout runtime must keep `public/` and `.next/static/` synced into `.next/standalone/`; repo `npm run build` now performs that sync automatically.
- Docker is installed on the host, but the current production app is not running as a Docker Compose app container.
- Production deploy details, backup requirements and rollback commands live in `docs/deploy.md`.

If production access, host path or service model changes, update this note in the same batch.
