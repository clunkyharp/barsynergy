# Scaling Playbook

Practical guides for the most common growth operations in BARSYNERGY.
Each guide is a sequential checklist. Do them in order.

---

## Adding a New Platform Section (Content Type)

For example: adding a "Services" or "Marketplace" section.

### Phase 1: Schema (Day 1)

1. Add Prisma model in `schema.prisma`:
   ```prisma
   model Service {
     id          String        @id @default(cuid())
     slug        String        @unique
     status      ContentStatus @default(DRAFT)
     title       String
     summary     String?
     body        String?
     // ... domain-specific fields
     createdAt   DateTime      @default(now())
     updatedAt   DateTime      @updatedAt
   }
   ```

2. Add to enums if needed:
   - `CategoryType` if services have categories
   - `ApplicationType` if services have a submission form

3. Run migration: `npm run prisma:migrate:dev -- --name add-service-model`

4. Generate client: `npm run prisma:generate`

### Phase 2: Admin (Day 1–2)

5. Create `src/app/admin/services/` with:
   - `page.tsx` — list with search and pagination
   - `[serviceId]/page.tsx` — edit form
   - `create/page.tsx` — creation form
   - `actions.ts` — CRUD + lifecycle (publish, archive, delete)

6. Use `lib/admin/content-lifecycle.ts` for status transitions. Do not implement your own.

7. Add link in `src/components/layout/admin-sidebar.tsx`.

8. Verify admin route is protected: `getCurrentUser()` → check for ADMIN/MODERATOR role at the top of each page.

### Phase 3: Data Access (Day 2)

9. Create `src/lib/public/content/services.ts`:
   ```typescript
   export async function getPublishedServices(params: PublicContentSearchParams): Promise<PublishedContentList> { ... }
   export async function getPublishedServiceDetail(slug: string): Promise<ServiceDetail | null> { ... }
   ```

10. Export from `src/lib/public/content.ts` facade.

11. Add filter options to `src/lib/public/filter-options.ts` if the section is filterable.

### Phase 4: Public Pages (Day 2–3)

12. Create `src/app/(public)/services/` with:
    - `page.tsx` — listing page
    - `[slug]/page.tsx` — detail page
    - `loading.tsx` — skeleton fallback

13. `page.tsx` structure:
    ```typescript
    export const metadata = buildPublicPageMetadata({ title: 'Услуги', description: '...', path: '/services' });

    export default async function ServicesPage({ searchParams }) {
      const params = (await searchParams) ?? {};
      const content = await getPublishedServices(params);
      // ...
      return (
        <>
          <EditorialPublicPage density="compact" ... />
          <ServiceListSection content={content} ... />
        </>
      );
    }
    ```

14. **Create a dedicated list component** — `src/components/public/service-list-section.tsx`. Do NOT add `rowVariant="service"` to `PublishedContentSection`.

15. `[slug]/page.tsx` uses `PublicContentDetailPage` from `src/components/public/public-content-detail-page.tsx`.

### Phase 5: Navigation & SEO (Day 3)

16. Add to `src/components/layout/site-header.tsx` (desktop nav + mobile nav groups).

17. Add to `src/components/layout/site-footer.tsx` under the correct column.

18. Add to `src/components/layout/mobile-site-menu.tsx` under the correct group.

19. Add JSON-LD schema in `src/lib/public/structured-data.ts`.

### Phase 6: Filters (Day 3–4)

20. Add `<PublicFilters>` to the public listing page.

21. Pass category options, city options, and any domain-specific filters.

22. Implement server-side filtering in `getPublishedServices(params)`.

### Phase 7: Application Form (Day 4–5, if applicable)

23. Add form component: `src/components/public/service-application-form.tsx`

24. Create `src/app/(public)/services/actions.ts`:
    - Validate with Zod
    - Honeypot check
    - Rate limiting (`ApplicationSubmissionThrottle`)
    - Create application + outbox record in one transaction
    - Redirect with result params

25. Add `ApplicationType.SERVICE_APPLICATION` to Prisma enum, add payload schema to `lib/applications/application-payloads.ts`.

### Validation

After each phase: `npm run typecheck && npm run lint`
After Phase 7: `npm run build` (full production build check)

---

## Adding a New Form Field

For example: adding a "Budget range" field to the consulting form.

1. Add field to the Zod schema in `app/(public)/consulting/actions.ts`
2. Add field to the `ApplicationPayload` type in `lib/applications/application-payloads.ts`
3. Add the UI field in `src/components/public/consulting-request-form.tsx`
4. Update `prisma/schema.prisma` if the field needs to be stored separately (or store it in the existing JSON payload)
5. If stored in JSON: no migration needed — the JSON payload absorbs it
6. If stored as a column: migration required
7. Check admin view in `app/admin/applications/[applicationId]/_components/application-info.tsx` — does the new field display?

---

## Adding a New User Role

Currently: `USER`, `BUSINESS`, `MODERATOR`, `ADMIN`.

Before adding a new role, consider: can an existing role + a permission flag cover the use case?

If a new role is needed:

1. Add to `UserRole` enum in `schema.prisma`
2. Run migration: `npm run prisma:migrate:dev -- --name add-<role>-role`
3. Update `lib/auth/permissions.ts` — define what the role can access
4. Update `lib/auth/current-user.ts` — include role-specific profile joins if needed
5. Add route protection: `middleware.ts` for anonymous edge redirects, plus per-page checks for role/status enforcement
6. Update `src/components/layout/` — header, sidebar, mobile menu for the new role
7. Update `src/app/auth/register/` — if the role is self-registerable
8. Update `src/app/auth/login/` — role-based post-login redirect

---

## Scaling Notifications

When the current email+Telegram setup becomes insufficient (e.g., need push notifications, SMS, webhooks):

1. Add a new `ApplicationNotificationChannel` enum value in `schema.prisma`
2. Create a new dispatcher in `lib/notifications/` — it must implement the same interface as existing dispatchers
3. Register the new channel in `application-notification-dispatch.ts`
4. Do NOT change the outbox pattern — the outbox is channel-agnostic
5. The `process-queue.ts` script selects the correct dispatcher based on the channel value

### Web Push (Content Notifications)

Browser push notifications for published content use a separate outbox pattern:

- **Models**: `WebPushSubscription`, `UserNotificationPreference`, `ContentNotificationOutbox` in `schema.prisma`
- **Library**: `lib/notifications/web-push/`
- **Retry**: `npm run notifications:content:retry`
- **Service worker**: `public/sw.js`
- **Trigger**: `maybeNotifyFirstPublication()` in `lib/notifications/web-push/publish-trigger.ts` — called from admin action files for articles, events, vacancies, courses, suppliers

When adding a new content type with push notifications:

1. Add the content type to `CONTENT_TYPE_TOPIC` in `publish-trigger.ts`
2. Add the topic to `TOPICS` in `notification-settings.tsx`
3. Inject `maybeNotifyFirstPublication()` in the admin create/update actions for the new type
4. The outbox and queue are content-type-agnostic

---

## Scaling the Admin Panel

When the number of admin sections grows beyond 15:

1. Group sidebar links into collapsible sections by domain (Content, Applications, Users, Settings)
2. Each group maps to a `lib/admin/<domain>/` module
3. Do not add more top-level admin sections without grouping
4. Consider splitting `app/admin/` into domain route groups: `app/admin/(content)/`, `app/admin/(applications)/`

---

## Performance Checklist for High-Traffic Pages

Before a new public section goes live:

- [ ] Does the listing query use `take` + `skip` pagination? (never `findMany` without limits)
- [ ] Is `getCurrentUser` wrapped in `cache()`?
- [ ] Are large images served via Next.js `<Image>` with `sizes` prop?
- [ ] Does the page have a `loading.tsx` skeleton to prevent layout shift?
- [ ] Are expensive queries in `Promise.all` (parallel, not sequential)?
- [ ] Is the section's data mostly static? If yes, consider adding `revalidate` to the page.
- [ ] Are filter query params validated server-side before hitting the DB? (prevent injection of arbitrary filter values)
