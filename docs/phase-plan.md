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

- Phase 0 foundation is implemented and backed by migration `20260425160217_init_foundation`;
- public route structure for Phase 1 exists and the public surface is implemented at source level;
- current Prisma entities include foundation models plus Phase 2 content models: `Article`, `ArticleTag`, `Event`, `Course`, `Vacancy`, `Supplier`, `Partner`;
- `Application` remains target scope for Phase 3.

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
- general sponsors;
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
- `/general-sponsors` is implemented as a separate visible public screen with homepage and navigation entry points;
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

Current status:

- Phase 2 Prisma models are implemented and backed by migration `20260427123417_phase2_content_models`;
- the first admin CRUD slices are implemented for articles, events, courses, vacancies, suppliers and partners at `/admin/articles`, `/admin/events`, `/admin/courses`, `/admin/vacancies`, `/admin/suppliers` and `/admin/partners`;
- public read queries are connected to articles, events, education, vacancies, suppliers and partners and return only `published` records with pagination that preserves active filters;
- public content image upload route is implemented at `/admin/uploads/content-image`;
- Phase 2 admin UX follow-up is implemented: edit forms, cover image upload slots, admin list pagination and admin action success/error states;
- article full editing is implemented on a dedicated `/admin/articles/[articleId]` screen so the list page does not render long article bodies inline;
- final Phase 2 runtime/admin review passed on 2026-04-27 with authenticated Playwright create smoke for all content sections, cover-image upload smoke, public route smoke and article publish/archive public-visibility smoke;
- Phase 2 is complete for the current MVP content/admin contract.

## Phase 3: Applications And Forms

Goal:

Build application submission flows.

In scope:

- Application model;
- public application forms;
- vacancy submission request flow for businesses;
- vacancy response flow for candidates;
- private application/resume handling;
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
- business can submit a vacancy placement request for admin review;
- candidate can respond to a published vacancy;
- admin can forward a reviewed vacancy response to the employer;
- application can be processed.

Implementation contract:

- [Phase 3 applications and vacancy flows mini-spec](phase-3-applications-spec.md)

Current status:

- Phase 3 implementation is complete for the current MVP contract;
- `Application`, `ApplicationType` and `ApplicationStatus` are backed by migration `20260428102117_phase3_applications_foundation`;
- public application throttling is backed by migration `20260428123000_phase3_application_guards`;
- stale public application throttle records can be cleaned with `npm run application:cleanup:throttles`;
- public `/vacancies` supports `vacancy_submission` and `vacancy_response` forms with consent, UTM capture and private resume file upload;
- public `/education`, `/events`, `/suppliers`, `/partners` and `/contacts` now write the remaining MVP request types into `Application`;
- production public forms are disabled by default through `APPLICATION_FORMS_ENABLED`;
- public forms include a honeypot and per-client rate limit;
- admin `/admin/applications` supports list/detail review, status changes, internal notes and manual `forwarded_to_employer` metadata;
- employer-forwarding status is guarded so only consented vacancy responses can be marked as forwarded;
- admins can create a draft `Vacancy` from a `vacancy_submission` application and keep publication manual;
- admin-only private resume download is available at `/admin/applications/[applicationId]/resume`;
- user confirmation emails are sent when `SMTP_*` is configured, and short Telegram admin notifications are sent when Telegram env config is present;
- Phase 3 is complete at source level for the current MVP applications contract;
- legal text still needs owner/legal review before personal-data forms are enabled in production.

## Phase 4: Auth And Business Account First

Goal:

Add registration/login foundation and the first private cabinet for approved businesses.

In scope:

- registration;
- login;
- logout;
- PostgreSQL sessions;
- roles needed for business, moderator and admin access;
- business account approval flow;
- business company profile;
- business request tracking;
- business vacancy, supplier, partner and corporate-training request management;
- admin route protection.

First account decision:

- only business gets a private cabinet in the first account implementation;
- candidate, student, community-member and general user profiles are deferred;
- user profiles and "my applications" remain planned for a later phase and should not be removed from the docs.

Done when:

- approved business can receive or create account access;
- business can log in;
- business can log out;
- business can edit its company profile;
- business can see and manage its own placement/application requests;
- business cannot publish public content directly;
- business cannot see candidate personal data before admin forwarding and candidate consent;
- admin pages are protected by roles.

Implementation contract:

- [Business account mini-spec](business-account-spec.md)

Current status:

- Phase 4 is implemented at source level for the current MVP contract;
- `BusinessAccount`, `BusinessAccountStatus`, `UserRole.BUSINESS`, `ApplicationType.BUSINESS_ACCOUNT_REQUEST` and `Application.businessAccountId` are backed by migration `20260428153000_phase4_business_account_foundation`;
- `ApplicationStatus.DRAFT` and `Application.businessNotes` are backed by migration `20260428170000_phase4_business_request_management`;
- `/auth/login` performs email/password login through PostgreSQL sessions and httpOnly cookies;
- `/auth/register` creates a pending business-access request and linked application for admin review when public personal-data forms are enabled;
- `/admin/users` can open or block business access;
- `/business` is guarded for active business users and supports company profile editing;
- `/business/requests` supports business-owned drafts and submissions for vacancy placement, supplier placement, partner application, corporate training and certificate order;
- `/business/requests/[applicationId]` lets businesses view only their own requests, edit drafts, submit drafts for review and archive drafts;
- admin application detail can store business-visible notes;
- password reset and invite acceptance are deferred until production email is configured.

## Phase 5: Filters, Search And Directory Quality

Goal:

Make catalogs useful and add the separate services catalog without mixing it into suppliers.

In scope:

- ServiceSpecialist catalog extension according to [Services specialists mini-spec](services-specialists-spec.md);
- public `/services`;
- admin `/admin/services`;
- public service-specialist submission flow through `Application`;
- admin creation of a draft specialist card from a service-specialist application;
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
- user can find a published service specialist;
- service-specialist applications are moderated before publication;
- service specialists remain separate from suppliers;
- filters do not break SEO or UX.

Implementation contract:

- [Services specialists mini-spec](services-specialists-spec.md)

Current status:

- service-specialist module is planned as a Phase 5 catalog expansion;
- it must not interrupt Phase 4 auth and first business account work unless the owner explicitly records a roadmap reorder;
- first version has no specialist personal cabinet and no direct public publishing.

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
- [Phase 3 applications and vacancy flows mini-spec](phase-3-applications-spec.md)
- [Project audit workflow](audit-workflow.md)
