# Git Workflow

## Branches

- `prod`: stable production branch.
- `dev`: main development branch.
- `feature/*`: large coherent features only.
- `fix/*`: critical production fixes only.

`prod` is also the VPS deploy branch. Keep it as the clean site branch: only code and files required to build, run, migrate and operate the site should reach it.

Do not merge local agent work materials into `prod`, including:

- memory or assistant state folders;
- generated QA screenshots and browser artifacts;
- scratch output folders;
- local-only access notes such as `ssh.md`;
- real env files, database dumps, backups, uploads, private keys, tokens or passwords.

## Flow

```txt
feature/* -> dev -> validation -> prod
```

Small tasks can go directly to `dev`.

## Production Merge Rules

Before merging to `prod`:

- production build passes;
- migrations are checked;
- forms are checked;
- admin is checked;
- diff is checked for local-only docs, QA artifacts, memory files and secrets;
- no critical errors remain;
- owner confirms merge.

On the VPS, pull and restart only from `prod`. If a narrow production fix is needed while `dev` contains unrelated work, create a small fix branch or cherry-pick only the required commits into `prod`.
