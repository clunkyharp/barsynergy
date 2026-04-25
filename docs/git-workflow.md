# Git Workflow

## Branches

- `prod` — stable production branch.
- `dev` — main development branch.
- `feature/*` — large coherent features only.
- `fix/*` — critical production fixes only.

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
- no critical errors remain;
- owner confirms merge.
