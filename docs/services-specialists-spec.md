# Services Specialists Mini-Spec

Status: planned; owner direction captured on 2026-04-28.

This document records the service-specialist catalog direction before implementation. It does not start code work.

## Roadmap Placement

This module is a Phase 5 catalog expansion, not a Phase 1-4 prerequisite.

Implementation must not interrupt:

- Phase 4 auth and first business account work;
- existing supplier catalog behavior;
- existing Phase 3 public application processing.

If the owner explicitly decides to prioritize services before Phase 4, that decision must be recorded in `PROJECT_STATUS.md`, `docs/phase-plan.md` and the Obsidian Kanban board before code work starts.

## Goal

Add a separate public and admin catalog for private service specialists in the bar industry.

Services must not be mixed into suppliers. Suppliers stay a company and vendor catalog. Service specialists are individual or small-team specialists who can provide repair, setup, training or technical support.

## Routes

Public route:

```txt
/services
```

Admin route:

```txt
/admin/services
```

## MVP Flow

```txt
Specialist submits "Add specialist"
-> Application(type = service_specialist_submission, status = new)
-> admin reviews the application
-> admin creates a ServiceSpecialist card from the application or manually
-> card stays draft/review until admin publishes it
-> published card appears in /services
```

Rules:

- public entry into the catalog is only through an application;
- specialists do not get a personal cabinet in the first version;
- public publication is manual and admin-moderated;
- no submitted application creates a public card automatically;
- service contacts can be published only after explicit consent to publish the selected public contact fields.

## Scope

In scope:

- Prisma `ServiceSpecialist` model;
- `CategoryType.SERVICE`;
- `ApplicationType.SERVICE_SPECIALIST_SUBMISSION`;
- public `/services` list;
- filters by city, category and verified flag;
- public "Add specialist" form saved to `Application`;
- admin `/admin/services` list and create/edit/publish/archive actions;
- `isVerified` flag;
- relation from specialist card to the source application;
- admin shortcut to create a draft specialist card from a service-specialist application;
- documentation and Kanban sync.

Out of scope:

- service-specialist personal cabinet;
- self-service editing by specialists;
- direct public publishing;
- online payments;
- reviews, ratings or comments;
- booking calendar;
- chat or messaging;
- reusable public user profiles.

## First Categories

Use shared `Category` records with `type = service` for the first version:

- ремонт кофемашин;
- ремонт льдогенераторов;
- сервис барного оборудования;
- монтаж и настройка;
- обучение персонала по технике;
- расходники и запчасти.

Do not add a separate service-category table in MVP unless shared categories become a blocker.

## Data Model Direction

Recommended `ServiceSpecialist` fields:

- `id`;
- `name`;
- `slug`;
- `title`;
- `summary`;
- `description`;
- `status`;
- `coverImageId`;
- `cityId`;
- `categoryId`;
- `serviceArea`;
- `contactLabel`;
- `phone`;
- `telegram`;
- `websiteUrl`;
- `isVerified`;
- `sortOrder`;
- `sourceApplicationId`;
- `createdById`;
- `updatedById`;
- `publishedAt`;
- `archivedAt`;
- `createdAt`;
- `updatedAt`.

Recommended relations:

- `coverImage` -> `UploadedFile`;
- `city` -> `City`;
- `category` -> `Category(type = service)`;
- `sourceApplication` -> `Application`, unique when present;
- `createdBy` and `updatedBy` -> `User`.

Recommended indexes:

- `[status, publishedAt]`;
- `[cityId, status]`;
- `[categoryId, status]`;
- `[isVerified, status]`;
- `[sortOrder]`;
- `[sourceApplicationId]`.

Use `Application.payload` for submission-only fields that do not need filtering in the first version.

## Public Form Contract

The public form should collect only review data needed for moderation:

- specialist name;
- contact person if different;
- city;
- category;
- service area;
- short service summary;
- longer description or notes;
- phone, Telegram and/or website;
- consent to personal-data processing;
- explicit consent to publish selected public contact fields if the specialist is approved.

The form must use existing public application protections:

- `APPLICATION_FORMS_ENABLED` production gate;
- unchecked consent checkbox;
- honeypot;
- per-client rate limit;
- UTM capture;
- optional user confirmation notification;
- short admin notification without full personal data.

## Admin Contract

Admin `/admin/services` needs:

- paginated list;
- create and edit form;
- status changes: draft, review, published, archived;
- publish and archive actions;
- verified flag;
- city and service-category selectors;
- cover image upload through existing public-content upload flow;
- source application link when the card came from an application;
- no delete for published cards.

Admin applications need:

- `service_specialist_submission` label and filter support;
- application detail display of payload fields;
- button to create a draft `ServiceSpecialist` from a service-specialist application;
- guard against creating more than one specialist card from the same application.

## Public Catalog Contract

Public `/services` needs:

- published-only list;
- filters by city, category and verified flag;
- search by name, title and summary if shared catalog search is available in the slice;
- service area and contact display;
- empty state;
- pagination that preserves active filters.

## Implementation Order

1. Documentation and planning sync.
2. Prisma schema and migration.
3. Admin service catalog CRUD.
4. Public `/services` list and filters.
5. Public "Add specialist" form that writes to `Application`.
6. Admin application shortcut to create a draft specialist card.
7. Validation, docs update and Kanban sync.

## Validation Expectations

Before this module is marked done:

```bash
./node_modules/.bin/prisma validate
npm run typecheck
npm run lint
npm run build
```

Additional checks:

- public service-specialist submissions require consent;
- honeypot submissions do not create `Application` records;
- repeated public submissions are rate-limited;
- service cards are not public until `status = published`;
- `/services` shows only published records;
- filters preserve active query parameters;
- admin cannot create duplicate service cards from one source application;
- contact fields are published only after explicit publication consent;
- existing `/suppliers` behavior is unchanged.
