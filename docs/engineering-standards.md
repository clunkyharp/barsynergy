# Engineering Standards

Rules derived from the BARSYNERGY code review (June 2026). Every rule has a reason and a concrete check.

---

## 1. Component Design

### Size Limits

| Type | Soft limit | Hard limit |
|------|-----------|------------|
| Server component (page.tsx) | 150 lines | 250 lines |
| Client component | 200 lines | 350 lines |
| UI primitive (src/components/ui/) | 80 lines | 150 lines |
| Server action file | 80 lines | 120 lines |

When you hit the soft limit, ask: can this component's responsibilities be split? When you hit the hard limit, split before merging.

### Single Responsibility

Each component does exactly one of these:
- Fetches data and passes it down (server component / page)
- Renders UI from props (leaf component)
- Manages a specific piece of client state (client component)

A component that fetches AND manages client state AND renders multiple layout variants is a god component. Extract.

### Variant Props Anti-Pattern

`rowVariant: 'default' | 'opportunity' | 'directory'` with branching logic in every helper function is a signal that you need separate components, not more variants.

**Rule:** if a prop drives structural layout differences (not just style), create a separate component.

**Good:**
```typescript
// Each content type has its own row renderer
<ArticleListRow item={item} />
<VacancyListRow item={item} />
<DirectoryListRow item={item} />
```

**Bad:**
```typescript
// One component with 7 internal functions each doing `if (rowVariant === 'opportunity')`
<ContentListRow item={item} rowVariant="opportunity" />
```

### Hero / Page Header Variants

`EditorialPublicPage` currently has 3 hero variants and 4 density modes. Before adding a new variant:
1. Check if an existing variant can be extended with a style-only prop
2. If structure changes — create a new named component (`EditorialHeroCover`, `EditorialHeroSplit`)
3. Never add a new `heroVariant` string to `EditorialPublicPage` without a corresponding dedicated render path in a named sub-component

---

## 2. Data Access

### `getCurrentUser` Must Use React `cache()`

```typescript
// src/lib/auth/current-user.ts
import { cache } from 'react';

export const getCurrentUser = cache(async () => {
  // ...
});
```

Without `cache()`, nested layouts calling `getCurrentUser()` independently generate N DB queries per SSR render. This is the single most impactful performance fix.

**Check:** `grep -r "getCurrentUser()" src/app` — every call in a render tree is fine because `cache()` deduplicates within one request. Without `cache()`, each call is a separate DB round-trip.

### No Direct `prisma` Calls in Page Components

Page components call lib functions. They do not call `prisma` directly.

```typescript
// Good — page calls lib function
const vacancy = await getPublishedVacancyDetail(slug);

// Bad — page calls prisma directly
const vacancy = await prisma.vacancy.findFirst({ where: { slug, status: 'PUBLISHED' } });
```

Reason: direct Prisma in pages couples pages to schema, makes queries untestable in isolation, and scatters data-access logic.

Exception: joining multiple queries in `Promise.all` for performance is acceptable in pages if each individual query is already a lib function.

### Server Actions — Use the Wrapper

All public-facing server actions must go through `withPublicAction`. All admin actions through `withAdminAction`. These wrappers (to be created — see architecture.md) provide:
- Consistent error format
- Same-origin check
- Logging of server-side errors
- Zod error normalization

Until the wrapper is implemented: at minimum, each action must call `validateServerActionOrigin()` and wrap logic in try/catch returning `{ type: 'error' | 'success', message: string }`.

---

## 3. Forms

### Required Fields Never Inside Optional Sections

`<details>` marked «по желанию» must not contain `required` fields. If a field is truly required, it belongs in the main form body. If the section is truly optional, all its fields are optional.

This is enforced by code review, not by a linter. Reviewers must check every `<details>` block.

### Form Components: One Topic Per Component

`ContactApplicationForm` currently has 12 topic-conditional field groups inline. **Rule:** when a form has conditional sections driven by a user-selected type (topic, category, role), each type's fields go in a dedicated sub-component:

```typescript
// Good
{topic === 'event' ? <EventTopicFields defaults={defaults} /> : null}
{topic === 'supplier' ? <SupplierTopicFields defaults={defaults} /> : null}

// Bad — 50 lines of conditional JSX inline in parent
{(topic === 'supplier' || topic === 'supplier-contact') ? (
  <>
    <FormField ...>
    <FormField ...>
  </>
) : null}
```

Adding a new topic means creating a new file, not extending an existing 400-line component.

### Consent Field Rules

- `ConsentField` is a wrapper around `CheckboxField`. Never inline a bare `<input type="checkbox">` for consent.
- `color-scheme: light` is set on `.checkbox-control` to prevent Safari dark-mode hit-test bugs. Do not remove it.
- All consent fields must have `required` and a matching consent text key from `lib/legal/`.

---

## 4. CSS Architecture

### Layer Order

`src/app/globals.css` imports must follow this order. Never change it:

```css
@import "tailwindcss";
@import "./styles/tokens.css";     /* CSS variables only */
@import "./styles/base.css";        /* reset, html/body, site shell */
@import "./styles/forms.css";       /* form shell, field-base, editorial-form-shell */
@import "./styles/calculator.css";
@import "./styles/ui-primitives.css"; /* checkbox, select, file-upload primitives */
@import "./styles/public.css";      /* public page components */
@import "./styles/admin.css";       /* admin shell, tables, admin-specific */
```

Later files override earlier ones. This is intentional: `ui-primitives.css` can override `forms.css`; `public.css` can override `ui-primitives.css`.

### Override Budget Per Class

Each CSS class should be overridden in at most **2 contexts**. More than 2 overrides is a sign the base rule is wrong.

Current violation: `.consent-field` is overridden in 4 places (`ui-primitives.css` base, `forms.css` base, `.public-form-shell .consent-field`, `:root[data-theme="dark"] .public-form-shell .consent-field`). This is acceptable for now. Any addition of a 5th override requires a refactor of the base rule instead.

### No Magic Colors — Use Tokens

Never use hardcoded hex colors in component class attributes.

```typescript
// Bad
<p className="text-[#a5a8b5]">...</p>

// Good
<p className="text-[var(--muted)]">...</p>
```

Exception: brand-specific editorial surfaces that intentionally do not follow the theme (e.g. `bg-[#161920]` as a named hardcoded brand dark — but only in editorial-dark sections, and only if there is no corresponding CSS token).

### New Token Rules

New CSS variables go in `tokens.css` under the correct section:
- Color semantics → `/* Semantics */` block
- Component-specific → suffix with component name (`--editorial-dark-label`, not just `--dark-label`)
- Dark mode overrides → inside `:root[data-theme="dark"]` block, same section

---

## 5. TypeScript

### No `any`

`any` is banned. Use `unknown` + type guards, or define a proper type. If you need to work with truly dynamic data, type it as `Record<string, unknown>` and narrow it.

**Check:** `grep -r ': any' src/` — should return zero results.

### Discriminated Unions for Multi-Type Data

When a data structure behaves differently based on a type field, use a discriminated union:

```typescript
// Good
type ApplicationPayload =
  | { type: 'VACANCY_SUBMISSION'; position: string; salary: string }
  | { type: 'CONTACT_MESSAGE'; topic: string; message: string }
  | { type: 'SUPPLIER_SUBMISSION'; category: string; serviceArea: string };

// Bad
type ApplicationPayload = {
  type: ApplicationType;
  position?: string;
  salary?: string;
  topic?: string;
  message?: string;
  category?: string;
  serviceArea?: string;
};
```

### Server Action Return Types

All server actions return `ActionResult<T>`:

```typescript
type ActionResult<T = void> =
  | { type: 'success'; data?: T }
  | { type: 'error'; message: string; fields?: Record<string, string> };
```

Until `ActionResult` is formally defined: actions must return objects with a `type` discriminant. Never return raw `undefined` or throw from an action without catching.

---

## 6. Error Handling

### Server Actions: Always Return, Never Throw Unhandled

```typescript
// Good
try {
  // ... business logic
  return { type: 'success' };
} catch (error) {
  if (error instanceof RedirectError) throw error; // allow Next.js redirects
  console.error('[action-name]', error);
  return { type: 'error', message: 'Не удалось выполнить действие.' };
}

// Bad — no catch, error surfaces as 500
async function myAction(formData: FormData) {
  await doSomething(formData);
  redirect('/success');
}
```

### DB Errors Must Not Leak to Client

Prisma error messages (`PrismaClientKnownRequestError`, unique constraint messages) contain schema information. Catch them and return a generic user-facing message.

### Notification Failures Are Silent

`lib/notifications/` dispatches via `after()`. If a notification fails, the user response is already sent. Failures must be logged with enough context to retry: application ID, notification channel, error type.

---

## 7. Authentication & Authorization

### Every Protected Route Gets `requireUser` / `requireAdmin`

When adding a new protected page:

1. Use `getCurrentUser()` (wrapped in `cache()`)
2. Check role: `if (!user || user.role !== 'ADMIN') redirect('/auth/login')`
3. This remains the per-page defense-in-depth layer alongside `src/proxy.ts`

**Note:** Next.js deprecated the `middleware` file convention in favour of `proxy`. The entry point is `src/proxy.ts` with an exported `proxy` function — do not rename it back to `middleware.ts` or `middleware`.

### Business Cabinet Access

```typescript
// Always use the helper — never inline the check
import { requireBusinessAccess } from '@/lib/auth/business-access';
const business = await requireBusinessAccess(user.id);
```

### Session Reads Are Cached Per Request

After wrapping `getCurrentUser` in `cache()`, multiple calls within one SSR render are free. Do not add manual caching, memo, or deduplication — React's `cache()` handles it.

---

## 8. Notifications

### Outbox Pattern Is Mandatory for User-Triggered Events

When an application is created or a status changes:
1. Write a `NotificationOutbox` record inside the transaction
2. Dispatch via `after()` callback (non-blocking)
3. Do NOT send email/Telegram directly inside a transaction

### Retry Requirements

Notification failures must be retryable. When implementing new notification triggers:
- Set `max_attempts = 3` on the outbox record
- `process-queue.ts` picks up records where `attempts < max_attempts AND next_retry_at <= now()`
- Increment `attempts` on each failure, set `next_retry_at = now() + exponential_backoff(attempts)`

---

## 9. Database

### Migrations Are Always Named

```bash
npm run prisma:migrate:dev -- --name <descriptive_name>
```

Good names: `add-notification-retry-fields`, `add-saved-vacancy`, `drop-deprecated-application-columns`  
Bad names: `update`, `fix`, `migration1`

### Schema Changes Require a Checklist

Before adding a new model or field:
- [ ] Does this need a corresponding `ContentStatus` enum? (if publishable)
- [ ] Does it need `ApplicationType`? (if it's a form submission)
- [ ] Does it need soft-delete (`deletedAt`) or hard-delete?
- [ ] Does it need audit fields (`createdAt`, `updatedAt`)?
- [ ] Is there a unique constraint that could produce `PrismaClientKnownRequestError P2002`?
- [ ] Are `String` fields capped with `@db.VarChar(n)` or left unbounded intentionally?

### No `prisma.$queryRaw` Unless Necessary

Raw queries bypass Prisma's type safety. Exceptions:
- Atomic throttle window operations (already in `lib/security/throttle-window.ts`)
- Queries that require DB-specific features unavailable in Prisma's query builder

Every `$queryRaw` call needs a comment explaining why Prisma's query builder is insufficient.

---

## 10. Dependency Management

### No New Libraries Without Justification

The stack is intentionally lean. Before adding a dependency:
1. Can the existing stack do it? (Zod, Prisma, Next.js built-ins cover 90% of cases)
2. Is it maintained and < 1 year since last release?
3. Does it introduce a sub-dependency that conflicts with existing security pinning?

Document the decision in the PR description.

### Audit On Every Install

`npm install` runs `npm audit` by default (configured in `.npmrc`). Do not use `--ignore-scripts` or `--no-audit` flags.
