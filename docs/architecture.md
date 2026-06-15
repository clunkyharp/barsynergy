# Architecture

Architecture rules, patterns, and anti-patterns for BARSYNERGY.

---

## Layers

```
Request
  └── middleware.ts          (edge route guard + CSP nonce)
        └── app/layout.tsx   (theme init, CSP nonce, root providers)
              └── page.tsx   (data fetch, auth check, render)
                    ├── lib/auth/          (getCurrentUser, permissions)
                    ├── lib/public/        (content queries — public)
                    ├── lib/admin/         (content lifecycle — admin)
                    ├── lib/applications/  (form handling)
                    ├── lib/notifications/ (outbox dispatch)
                    └── lib/db/prisma.ts   (singleton PrismaClient)
```

**Rules for each layer:**

| Layer | Allowed to call | Must NOT call |
|-------|----------------|---------------|
| `page.tsx` / layout | lib/* | prisma directly |
| `lib/public/`, `lib/admin/` | prisma, lib/db | app/, components/ |
| `lib/auth/` | prisma, lib/security | components/, app/ |
| `lib/applications/` | prisma, lib/security, lib/notifications | components/, app/ |
| `components/` | lib/utils, lib/fonts, other components | prisma directly |
| Server actions (`actions.ts`) | lib/* | components/ render logic |

---

## Routing and Route Groups

```
app/
├── (public)/         # Public pages — no auth required
├── (business-workspace)/  # Business cabinet — requires BUSINESS role
├── admin/            # Admin — requires ADMIN or MODERATOR role
├── profile/          # User profile — requires USER role
└── auth/             # Auth flows — unauthenticated
```

**Adding a new section:**
- Public section → goes under `(public)/`
- User-only section → goes under `profile/`
- Business-only section → goes under `(business-workspace)/`
- Admin section → goes under `admin/`

Never mix auth levels inside a route group. If a section serves both guests and authenticated users, use conditional rendering inside `(public)/`, not a new route group.

---

## Server Actions

### File Per Domain

Each public section has exactly one `actions.ts`. Admin sections have one `actions.ts`. No cross-section action imports.

```
(public)/vacancies/actions.ts   — vacancy submission + response
admin/vacancies/actions.ts       — admin publish, archive, delete
```

### Structure of an Action File

```typescript
'use server';

// 1. Imports
import { validateServerActionOrigin } from '@/lib/security/server-action-origin';
import { withPublicAction } from '@/lib/actions/action-helpers'; // when available

// 2. Zod schema (co-located with action that uses it)
const myFormSchema = z.object({ ... });

// 3. Action function
export async function myFormAction(prevState: unknown, formData: FormData) {
  validateServerActionOrigin();
  // parse → validate → guard → business logic → redirect or return result
}
```

### Never Import Actions Into Components

Actions are passed as `action={myAction}` props or called via `useActionState`. A component importing an action file creates coupling between UI and data layer.

---

## Content Types

The system has these content types (each has a `ContentStatus` lifecycle):
- Article, Event, Course, Vacancy, Supplier, Master, Partner

### Checklist: Adding a New Content Type

When adding a new content type (e.g., Services, Products, Jobs), follow this exact order:

**1. Schema**
- [ ] Add Prisma model with standard fields: `id`, `slug`, `status ContentStatus`, `createdAt`, `updatedAt`
- [ ] Add to `CategoryType` enum if it has categories
- [ ] Add migration: `npm run prisma:migrate:dev -- --name add-<type>-model`

**2. Admin**
- [ ] Create `app/admin/<type>/` with: `page.tsx` (list), `[id]/page.tsx` (edit), `create/page.tsx`, `actions.ts`
- [ ] Add content lifecycle via `lib/admin/content-lifecycle.ts` (publish, archive, draft transitions)
- [ ] Add to admin sidebar: `src/components/layout/admin-sidebar.tsx`

**3. Public Content Query**
- [ ] Create `src/lib/public/content/<type>.ts` with `getPublished<Type>(params)` and `getPublished<Type>Detail(slug)`
- [ ] Export from `src/lib/public/content.ts` facade
- [ ] Add to filter-options if filterable

**4. Public Page**
- [ ] Create `app/(public)/<type>/page.tsx` with `EditorialPublicPage` + list component
- [ ] Create `app/(public)/<type>/[slug]/page.tsx` with `PublicContentDetailPage`
- [ ] Add `loading.tsx` (skeleton fallback)
- [ ] Add `generateMetadata` with `buildPublicPageMetadata`
- [ ] Add JSON-LD schema in `lib/public/structured-data.ts`

**5. List Component**
- [ ] Create a dedicated `<Type>ListRow` component in `src/components/public/`
- [ ] Do NOT add a new `rowVariant` to `PublishedContentSection` — create a standalone section component

**6. Filters**
- [ ] Add filter options to `lib/public/filter-options.ts`
- [ ] Wire `PublicFilters` in the public page

**7. Navigation**
- [ ] Add to site header nav: `src/components/layout/site-header.tsx`
- [ ] Add to site footer: `src/components/layout/site-footer.tsx`
- [ ] Add to mobile menu groups: `src/components/layout/mobile-site-menu.tsx`

**8. Application Form (if submittable)**
- [ ] Add `ApplicationType` to Prisma enum
- [ ] Create payload schema in `lib/applications/application-payloads.ts`
- [ ] Create form component in `src/components/public/<type>-application-form.tsx`
- [ ] Create `app/(public)/<type>/actions.ts`
- [ ] Add to `PublicApplicationSection` on the public page

---

## Components

### Hierarchy

```
src/components/
├── ui/              # Stateless primitives. No domain knowledge.
│                    # Input, Button, Select, Panel, MetaChip, etc.
├── layout/          # App-wide chrome. Header, footer, sidebars.
│                    # Can read auth state. Cannot read content data.
├── public/          # Public-facing composites.
│                    # Can receive content data. No auth-specific UI.
├── admin/           # Admin-specific composites.
├── business/        # Business cabinet composites.
└── profile/         # User profile composites.
```

**Rules:**
- `ui/` components know nothing about routes, users, or content types
- `public/` components receive data as props; they do not fetch
- `admin/` components may receive server actions and form state

### When to Add to `ui/`

Only add to `ui/` if the component is:
- Used in at least 2 different section contexts (public + admin, or profile + business)
- Has no domain-specific logic (no vacancy, article, partner knowledge)
- Stateless or manages only its own micro-state (open/closed, focused/blurred)

Everything else starts in the section's own components directory.

---

## State Management

### URL Is the Source of Truth for Filters

Filter state lives in `searchParams` (URL query string). Client-side `useState` holds only the draft (debounced, not-yet-committed) value. On commit (enter key, select change), the state is written to the URL via `router.replace`.

Never store committed filter values in `useState` or `useReducer` — they go stale on navigation.

### Forms Use `useActionState`

```typescript
const [state, formAction, isPending] = useActionState(myServerAction, null);
```

Do not use `fetch` to call server actions. Do not manage loading state manually when `useActionState` provides `isPending`.

### Theme Is `document.documentElement.dataset.theme`

The theme token is the `data-theme` attribute on `<html>`. CSS reads it via `:root[data-theme="dark"]`. JavaScript reads and writes it via `document.documentElement.dataset.theme`.

`document.documentElement.style.colorScheme` is set once in the inline init script in `app/layout.tsx`. It is NOT set again in `ThemeToggle`. Setting it twice creates the checkbox dark-mode bug we fixed in June 2026.

---

## Notification Outbox

```
User submits form
  └── Server action
        └── prisma.$transaction([
              create Application,
              create NotificationOutbox record
            ])
        └── after(() => processNotificationQueue(applicationId))
              └── Send email + Telegram
              └── Mark outbox record as sent (or increment attempts)
```

**Rules:**
- The outbox record is created inside the application transaction — atomically
- `after()` fires the queue after the HTTP response is sent
- Failures are logged and retried (3 attempts, exponential backoff)
- Never await email/Telegram inside the DB transaction

---

## Anti-Patterns

### ❌ God Components

A component is a god object when it:
- Exceeds 350 lines
- Has 5+ internal helper functions
- Handles 3+ distinct content types via variant props
- Has `if (variant === 'x')` in 4+ places

**Fix:** split into named sub-components. The parent becomes a thin router.

### ❌ Inline Complex Conditions in JSX

```typescript
// Bad — unreadable, untestable
{!hasActiveFilters && content.page === 1 && content.items.length > 0 && !isPrelaunchEmpty
  ? <FeaturedContent ... />
  : null}

// Good — named variable explains intent
const showFeatured = !hasActiveFilters && content.page === 1 && content.items.length > 0 && !isPrelaunchEmpty;
{showFeatured ? <FeaturedContent ... /> : null}
```

### ❌ Scattered Auth Checks

With `middleware.ts` in place: auth checks still go at the top of page.tsx before any data fetching. Never rely on data-layer functions to enforce access control.

```typescript
// Good — auth check first, then data
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/auth/login');

  const data = await getAdminData();
  return <AdminUI data={data} />;
}
```

### ❌ `prisma` in Page Components

Pages call lib functions. Lib functions call prisma. This is the rule.

### ❌ New CSS Files

Do not create new CSS files. Add rules to the most specific existing file. If a component needs styles that do not fit any existing file, the component should use Tailwind utilities instead.

### ❌ Hardcoded Strings in Multiple Places

Contact info, legal entity details, consent texts, and support emails must come from `lib/contact-info.ts`, `lib/legal/`, or environment variables. Never hardcode `barsynergy@gmail.com` or similar in component files.

---

## Pending Architecture Decisions

These items are documented but not yet implemented:

| Item | Status | Risk of not doing it |
|------|--------|---------------------|
| `middleware.ts` route guard | Done | — |
| `withPublicAction` wrapper | Not done | 28 action files each implement error handling differently |
| `getCurrentUser` + `cache()` | Done | — |
| Notification retry (max_attempts + process-queue) | Done | — |

When implementing any of these, update this document to mark the item as done.
