# Agent Ops Notes

## Production Access

- SSH connection source of truth is the repo-root `ssh.md` file.
- Read `ssh.md` directly before production work instead of searching old notes, shell history or neighboring projects.
- Do not copy SSH credentials into repo docs, wiki pages, status reports or chat closeouts.

## Verified Production Layout

Verified on `2026-05-02`:

- application checkout path: `/opt/barsynergy`;
- runtime service: `barsynergy.service`;
- scheduled cleanup timer: `barsynergy-cleanup.timer`.
- host-checkout runtime must keep `public/` and `.next/static/` synced into `.next/standalone/`; repo `npm run build` now performs that sync automatically.

If production access, host path or service model changes, update this note in the same batch.
