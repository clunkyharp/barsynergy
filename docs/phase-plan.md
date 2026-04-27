# BARSYNERGY Phase Plan

This document is the implementation roadmap. It must be read together with `docs/project-plan.md` and `docs/agent-workflow.md`.

## Phase Rules

- Work phase by phase.
- Do not mix feature work, remediation, deployment, QA and documentation unless the owner explicitly asks for one combined batch.
- Each large feature needs a mini-spec before implementation.
- Small changes can be done directly on `dev`.
- Production merge goes to `prod` only after owner confirmation.

## Phase 0: Project Foundation

Goal:

Build the technical foundation.

In scope:

- Next.js project;
- TypeScript;
- Tailwind CSS;
- Prisma;
- PostgreSQL;
- base layout;
- UI-kit foundation;
- env validation;
- Docker Compose;
- README and docs;
- `prod` and `dev` branches;
- git workflow.

Out of scope:

- personal cabinet;
- payments;
- complex catalogs;
- public profiles;
- Telegram bot;
- premium;
- LMS.

Done when:

- project runs locally;
- database connects;
- migrations work;
- home page opens;
- Docker Compose starts the environment;
- branches `prod` and `dev` exist;
- production branch is `prod`.

Current status:

- Phase 0 foundation is implemented and currently backed by one migration (`20260425160217_init_foundation`);
- public route structure for Phase 1 exists and the public surface is implemented at source level;
- current Prisma entities are foundation-only: `User`, `Session`, `Profile`, `City`, `Category`, `Tag`, `UploadedFile`;
- Phase 2+ entities (`Article`, `Event`, `Course`, `Vacancy`, `Supplier`, `Partner`, `Application`) are target scope, not current runtime schema yet.

## Phase 1: Public Website MVP

Goal:

Build the public platform surface.

In scope:

- home;
- about;
- education;
- events;
- articles/knowledge;
- vacancies;
- suppliers;
- partners;
- contacts;
- legal pages;
- base SEO structure;
- responsive layout;
- editorial visual system based on the supplied reference.

Done when:

- all public pages open;
- navigation works;
- footer works;
- pages are responsive;
- pages are ready for real data connection.

Current status:

- public routes and legal pages are implemented;
- shared header, footer and public page templates are implemented;
- route-level loading, error and not-found states are implemented;
- design-system foundation is documented in `DESIGN.md` and `design-tokens.json`;
- lint, typecheck, build, Prisma validate, public route smoke and desktop/mobile homepage spot checks pass;
- Phase 1 is complete for the current static public surface;
- legal text still needs owner/legal review before personal-data collection.

## Phase 2: Database Models And Content Admin

Goal:

Build the database and admin content management.

In scope:

- Prisma models for Article, Event, Course, Vacancy, Supplier, Partner, Category, City, Tag;
- admin CRUD;
- publication statuses;
- image upload through StorageService;
- publish/archive flows.

Done when:

- admin can create and publish an article;
- admin can create an event;
- admin can create a course;
- admin can create a vacancy;
- admin can create a supplier;
- public pages show only `published` content.

Implementation contract:

- [Phase 2 content/admin mini-spec](phase-2-content-admin-spec.md)

## Phase 3: Applications And Forms

Goal:

Build application submission flows.

In scope:

- Application model;
- public application forms;
- server validation;
- personal data consent checkbox;
- email notifications;
- Telegram admin notifications without full personal data;
- admin application list;
- status changes;
- UTM capture.

Done when:

- user can submit an application;
- application is saved;
- admin sees it;
- user receives confirmation;
- admin receives notification;
- application can be processed.

## Phase 4: Auth And User Profile

Goal:

Add registration and basic user cabinet.

In scope:

- registration;
- login;
- logout;
- PostgreSQL sessions;
- roles `user`, `moderator`, `admin`;
- user profile;
- "my applications" page;
- admin route protection.

Done when:

- user can register;
- user can log in;
- user can log out;
- user can edit profile;
- user can see own applications;
- admin pages are protected by roles.

## Phase 5: Filters, Search And Directory Quality

Goal:

Make catalogs useful.

In scope:

- filters by city;
- filters by category;
- filters by format;
- search;
- pagination;
- empty states;
- sorting;
- improved cards and rows.

Done when:

- user can find an event;
- user can find a course;
- user can find a vacancy;
- user can find a supplier;
- filters do not break SEO or UX.

## Phase 6: Monetization Without Online Payment

Goal:

Add commercial logic without online payments.

In scope:

- `payment_pending` and `paid_manually` application statuses;
- tariff descriptions in docs or admin;
- paid placement forms;
- corporate training form;
- certificate order form;
- partner applications;
- UTM tracking.

Out of scope:

- acquiring;
- online cash register;
- automatic receipts;
- premium subscription;
- payment webhooks.

Done when:

- commercial applications can be accepted;
- admin can process them manually;
- potentially paid applications are clear;
- MVP remains simple.

## Phase 7: Stabilization And Release 1.0

Goal:

Prepare stable MVP for launch.

In scope:

- bugfixes;
- mobile check;
- form check;
- admin check;
- security check;
- env check;
- backup check;
- deployment check;
- documentation;
- merge `dev` to `prod` after owner confirmation.

Done when:

- production build passes;
- migrations apply;
- forms work;
- admin works;
- applications are not lost;
- backup policy is documented;
- owner confirms merge to `prod`.

## Related Docs

- [Remediation plan](remediation-plan.md)
- [Project audit workflow](audit-workflow.md)
