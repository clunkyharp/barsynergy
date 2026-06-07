# PR / Merge Checklist

Use this checklist before merging any branch into `dev`, and before merging `dev` into `prod`.

---

## Pre-Merge into `dev`

### Code Quality

- [ ] No `any` TypeScript types introduced (`grep -r ': any' src/`)
- [ ] No hardcoded hex colors in component files (use CSS tokens)
- [ ] No direct `prisma` calls in `page.tsx` or `layout.tsx` files
- [ ] No new `rowVariant` values added to `PublishedContentSection` without a dedicated sub-component
- [ ] No `required` fields inside `<details>` blocks marked «по желанию»
- [ ] All new server actions return `{ type: 'error' | 'success' }` objects with try/catch
- [ ] All new server actions call `validateServerActionOrigin()`

### Components

- [ ] No single component file exceeds 350 lines
- [ ] No new server-only logic inside client components (`'use client'` files)
- [ ] New UI primitives added to `src/components/ui/` are used in ≥ 2 contexts, or justified otherwise
- [ ] Forms: consent field uses `<ConsentField>`, not a bare `<input type="checkbox">`

### CSS

- [ ] No new global CSS files created
- [ ] No hardcoded colors (hex, rgba) in component `className` strings
- [ ] New CSS variables added to `tokens.css` in the correct section
- [ ] `globals.css` import order unchanged

### Auth & Security

- [ ] New protected pages check user role before data fetching
- [ ] New file upload paths validate MIME type, extension, and file signature
- [ ] Rate limiting applied to new high-frequency public endpoints (forms, auth)
- [ ] No secrets, passwords, or env values added to source files
- [ ] No unauthenticated flow reveals whether an email, account, or pending request exists
- [ ] Password rules are identical across register / change / reset / activation flows
- [ ] Password change and password reset revoke existing sessions
- [ ] User/profile/business mutations do not write by naked primary key from `FormData` or params; ownership is enforced in the write query
- [ ] User-facing actions that accept content ids re-check published/active visibility server-side
- [ ] `.docx` / `.odt` validation checks real container structure, not just ZIP magic bytes
- [ ] No personal data is sent to Telegram or other non-approved channels beyond the approved minimum

### Database

- [ ] Migration file has a descriptive name (not `update` or `fix`)
- [ ] New `String` fields have a max length (`@db.VarChar(n)`) or unbounded use is justified
- [ ] `prisma.$queryRaw` calls have a comment explaining why the query builder is insufficient

### Notifications

- [ ] New notification triggers use the outbox pattern (write inside transaction, dispatch via `after()`)
- [ ] New notification types handle send failure gracefully (log + mark for retry)

---

## Pre-Merge into `prod`

All items from the `dev` checklist, plus:

- [ ] Production build passes: `npm run build`
- [ ] TypeScript: `npm run typecheck` — zero errors
- [ ] Lint: `npm run lint` — zero errors
- [ ] Tests pass: `npm test`
- [ ] Prisma schema valid: `./node_modules/.bin/prisma validate`
- [ ] Migrations applied and tested against a clean DB
- [ ] No local-only docs (`ssh.md`, `.env`, QA screenshots) in the diff
- [ ] No memory files, agent artifacts, or scratch output in the diff
- [ ] All new env variables documented in `.env.production.example` and `docs/env.md`
- [ ] `docs/` updated for any architecture, routing, or schema changes
- [ ] `PROJECT_STATUS.md` reflects the current state
- [ ] Owner has confirmed the merge

---

## Feature-Specific Checks

### New Content Type

Follow the full checklist in `docs/architecture.md` → "Checklist: Adding a New Content Type".

Additionally:
- [ ] JSON-LD schema added in `lib/public/structured-data.ts`
- [ ] `generateMetadata` uses `buildPublicPageMetadata`
- [ ] Content type added to footer nav and site header nav
- [ ] Admin sidebar link added
- [ ] `loading.tsx` skeleton exists for the public listing page

### New Public Form

- [ ] `ApplicationType` added to Prisma enum
- [ ] Payload schema defined in `lib/applications/application-payloads.ts`
- [ ] Zod schema validates all fields server-side
- [ ] Honeypot field present
- [ ] Rate limiting applied via `ApplicationSubmissionThrottle`
- [ ] Consent field present with correct consent text from `lib/legal/`
- [ ] Outbox record created inside the application transaction
- [ ] Form disabled state handled (shows fallback, not broken UI)

### New Auth Flow

- [ ] Rate limiting applied via `AuthAttemptThrottle`
- [ ] Timing-safe comparison used where applicable (see existing login action)
- [ ] Session cookie set with `httpOnly`, `secure` (prod), `sameSite: strict`
- [ ] No user-identifying info logged in plaintext

### Theme / Dark Mode

- [ ] New colors use CSS tokens (`var(--muted)`, `var(--accent)`, etc.)
- [ ] Dark mode override tested in both `data-theme="dark"` and `data-theme="light"`
- [ ] No custom interactive elements (checkboxes, radios) without `color-scheme: light` on the control
- [ ] No `document.documentElement.style.colorScheme` set outside `app/layout.tsx` inline script
