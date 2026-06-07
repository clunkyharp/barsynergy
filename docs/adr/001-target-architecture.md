# ADR 001: Target Architecture — Module-Based Layer Separation

**Date:** 2026-06-06

**Status:** Accepted

## Context

The codebase has grown organically from a single-page prototype to ~330 source files.
The initial architecture (`app/` as composition + `lib/` as shared + `components/` as UI)
worked well at small scale, but at the current size several structural problems emerged:

- 65 files inside `src/app/` import Prisma directly, creating tight coupling to the DB schema
- 14 components import server actions from `src/app/*/actions`, coupling UI to route-layer entry points
- God files (960+ lines) emerge because there is no forced separation boundary
- Shared domain concepts (labels, mappers, types) live in `lib/admin/` but are needed by public and business code
- The `lib/` directory mixes domain logic, infra helpers, and shared utilities without internal structure

## Decision

Adopt a four-layer architecture with explicit import direction:

```
src/
  app/           — composition layer (entry points, page.tsx, layout.tsx, error.tsx, actions.ts)
  modules/       — domain layer (queries, commands, schemas, policies, mappers)
  components/    — UI layer (no data fetching, no server action imports)
  lib/           — infra shared (db, storage, security, validation, utils)
```

### Layer rules

| Layer | Owns | Imports from | Must NOT import |
|-------|------|-------------|-----------------|
| `app/` | Routes, page composition, thin action wrappers | `modules/`, `components/`, `lib/` | Prisma directly |
| `modules/` | Domain queries, commands, Zod schemas, policies, mappers | `lib/`, `prisma` | `app/`, `components/` |
| `components/` | UI rendering, form composition, client interactivity | `lib/` (utils only), `components/ui/` | `app/`, `prisma`, server actions |
| `lib/` | DB client, storage, security, validation, env, fonts | external packages | `app/`, `modules/`, `components/` |

### Module structure

```
modules/
  auth/            — queries, commands, schemas, policies, session, types
  content/
    shared/        — filters, labels, mappers, types (neutral, not admin-owned)
    articles/      — queries, commands, details, schemas
    events/
    courses/
    vacancies/
    suppliers/
    partners/
    taxonomy/
  applications/    — queries, commands, schemas, notifications, mappers
  homepage/        — queries, commands, schemas
  business/        — queries, commands, schemas
  profile/         — queries, commands, schemas
```

### File naming convention

Each module contains:
- `queries.ts` — read-side functions (select/findMany, always return plain objects)
- `commands.ts` — write-side functions (create/update/delete, may call prisma.$transaction)
- `schemas.ts` — Zod schemas for validation
- `policies.ts` — authorization rules (who can do what)
- `types.ts` — domain types and TypeScript interfaces
- `mappers.ts` — data transformation (Prisma shape → domain shape → presentation shape)
- `session.ts` — auth session helpers (auth only)

## Migration strategy

Migration is done in 4 sequential queues without big-bang:

1. **Queue A (guardrails + ADR):** ESLint `no-restricted-imports` + this ADR + doc sync
2. **Queue B (content read layer):** Move public content queries from `app/` to `lib/public/content/*.ts` listing modules and `modules/content/*/queries.ts` for domain-specific queries. Detail queries migrated from the old monolithic `lib/public/content-details.ts` (removed) to `lib/public/content/*.ts` alongside their listing counterparts.
3. **Queue C (actions/commands):** Extract business logic from `app/*/actions.ts` into `modules/*/commands.ts`; leave thin wrappers in app
4. **Queue D (UI decomposition + naming):** Split god files, rename ambiguous shared UI files, clean up backward-compat facades

## Consequences

**Positive:**
- Pages become thin composition shells — easy to test and refactor
- Domain logic is importable by any route group without duplication
- Schema changes affect only `modules/` queries, not 42+ page files
- New content types follow clear per-type module structure

**Negative:**
- Migration requires touching ~65 files with prisma imports and ~14 component-action imports
- `src/modules/*` coexists with legacy `src/lib/public/*` and `src/lib/admin/*` during migration — some code paths exist in two places temporarily
- Developers must learn the module convention during transition

## Enforcement

- ESLint `no-restricted-imports` in `eslint.config.mjs` enforces layer boundaries
- CI runs lint + typecheck + architecture smoke tests
- Architecture tests in `tests/architecture/` check file size limits and import direction
