# Phase 2 Content And Admin Mini-Spec

Status: ready for implementation planning.

This document freezes the Phase 2 contract before database and CRUD work starts.

## Goal

Build content database models and admin CRUD for the public platform sections without adding applications, user cabinet, online payments, LMS or public profiles.

## Scope

In scope:

- `Article`;
- `Event`;
- `Course`;
- `Vacancy`;
- `Supplier`;
- `Partner`;
- publication workflow;
- admin CRUD;
- public read queries for published records;
- image upload through `StorageService`;
- pagination, filters and basic search.

Out of scope:

- public application forms;
- `Application` model;
- registration and user profile flows;
- payments;
- subscriptions;
- advanced full-text search;
- recommendation systems;
- public user-generated content.

## Common Model Contract

Every public content model should include:

- `id`;
- `title`;
- `slug`;
- `summary`;
- `status`;
- `coverImageId`;
- `cityId` when the entity has regional relevance;
- `categoryId` when the entity belongs to a content/category group;
- `sortOrder`;
- `publishedAt`;
- `archivedAt`;
- `createdById`;
- `updatedById`;
- `createdAt`;
- `updatedAt`.

Recommended status enum:

```txt
draft
review
published
archived
```

Rules:

- Public pages must read only `published` records.
- Admin can see all statuses.
- `slug` must be unique per model.
- Publish and archive actions must set `publishedAt` and `archivedAt` consistently.
- Deleting published content should be avoided in normal admin flows; archive first.

## Entity-Specific Fields

### Article

- `body`;
- `readingTimeMinutes`;
- `authorName`;
- `sourceLabel`;
- relation to `Tag`.

Public filters:

- category;
- tag;
- city only if the article is regional.

### Event

- `startsAt`;
- `endsAt`;
- `locationName`;
- `address`;
- `format`;
- `capacity`;
- `registrationMode`.

Public filters:

- city;
- category;
- format;
- upcoming/past.

### Course

- `format`;
- `durationLabel`;
- `level`;
- `priceLabel`;
- `instructorName`;
- `program`;

Public filters:

- city;
- category;
- format;
- level.

### Vacancy

- `companyName`;
- `position`;
- `employmentType`;
- `salaryLabel`;
- `experienceLabel`;
- `contactMode`;
- `description`.

Public filters:

- city;
- category;
- employment type.

### Supplier

- `companyName`;
- `description`;
- `websiteUrl`;
- `contactLabel`;
- `isVerified`;
- `serviceArea`;

Public filters:

- city;
- category;
- verified status.

### Partner

- `companyName`;
- `description`;
- `websiteUrl`;
- `partnerType`;
- `isFeatured`;

Public filters:

- partner type;
- featured status.

## Relations

Use the existing foundation models:

- `City`;
- `Category`;
- `Tag`;
- `UploadedFile`;
- `User`.

Recommended relation rules:

- `Category.type` must match the entity type.
- `Tag.type` must match the entity type.
- Use explicit join tables when an entity can have multiple tags.
- Keep uploaded public images in `UploadedFile` with `visibility = public`.
- Do not store private application files in Phase 2 models.

## Permissions

Admin section access is controlled by `AdminSection`.

Allowed in Phase 2:

- `ADMIN`: all admin sections, users and taxonomy.
- `MODERATOR`: content sections and applications list when Phase 3 starts.

Restricted to `ADMIN`:

- users;
- categories;
- cities;
- tags;
- future global settings.

Every admin page or mutation must check its section permission before reading or writing data.

## Storage Contract

Phase 2 uploads are public content images only.

Rules:

- Maximum file size: `MAX_UPLOAD_FILE_SIZE_BYTES`.
- Accepted MIME types must be allowlisted before upload routes are exposed.
- Uploaded public images must be saved as `UploadedFile.visibility = public`.
- Public URL generation must use a `PublicFileReference`.
- Private file access is reserved for Phase 3+ and must not reuse public image URLs.
- Runtime upload images should not be passed blindly through `next/image`; uploaded or external URLs need a resolver before image components are generalized.

## Public Query Contract

Every public list must:

- filter by `status = published`;
- use pagination;
- use stable ordering;
- cap page size;
- return empty states without throwing;
- avoid unbounded `findMany`.

Recommended default page size:

```txt
12
```

Recommended maximum page size:

```txt
24
```

## Search Contract

Phase 2 search should stay simple:

- title/summary `ILIKE`;
- category/city/filter indexes;
- no external search service;
- no advanced ranking until real content volume proves the need.

Search must be combined with pagination and published-only filters on public pages.

## Index Contract

Each public content table should include indexes for:

- `status, publishedAt`;
- `slug`;
- `cityId, status` where city is present;
- `categoryId, status` where category is present;
- `sortOrder`;
- relevant date field for events/courses.

Avoid adding unused indexes before real query patterns exist.

## Admin UX Contract

Each CRUD section needs:

- list view;
- create form;
- edit form;
- status controls;
- publish/archive actions;
- image upload slot when relevant;
- loading state;
- error state;
- empty state;
- validation messages;
- paginated table or dense row list.

Large editors should be split when one component starts owning form state, validation, upload state and mutation orchestration.

## Validation

Before Phase 2 is marked done:

```bash
npm run lint
npm run typecheck
npm run build
./node_modules/.bin/prisma validate
```

Additional expected checks:

- public pages show only published content;
- admin list pages are paginated;
- moderator cannot access users/taxonomy sections;
- archive flow removes records from public lists;
- image upload respects size and MIME limits.

