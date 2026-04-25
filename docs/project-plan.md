# BARSYNERGY Project Plan

This document is the canonical project brief for development. All future phases, mini-specs and implementation batches must follow it unless the project owner explicitly changes the direction.

## Product

BARSYNERGY is an industry online platform and educational community for bar-industry professionals in the North Caucasus Federal District.

The product connects:

- bartenders;
- bar managers;
- venue owners;
- suppliers;
- makers and service providers;
- experts and teachers;
- HoReCa specialists;
- employers and partners.

Core formula:

```txt
Education + community + industry opportunities + regional connection = BARSYNERGY
```

## Operating Mode

Development is phased and MVP-first.

The platform must be realistic for one developer working with AI agents. Do not build enterprise architecture, microservices, Kubernetes, complex roles, online payments, LMS, subscriptions or public profiles before the planned phase.

Every non-trivial task must lock one mode:

- `DECISION` for architecture, scope or product choices.
- `IMPLEMENTATION` for code changes.
- `QA` for audit, verification, review and release readiness.

## Fixed Tech Stack

Frontend:

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- Server Components by default;
- Client Components only for interactive elements;
- internal UI kit;
- shadcn/ui only as a source for basic component patterns.

Backend:

- Next.js fullstack;
- Node.js runtime;
- Server Actions by default;
- API Routes only when needed;
- Zod validation;
- centralized error handling.

Database:

- PostgreSQL;
- Prisma ORM;
- Prisma migrations;
- PostgreSQL on Russian VPS/cloud;
- database must not be publicly reachable.

Auth:

- own email/password auth;
- password hashes only;
- bcrypt or argon2;
- PostgreSQL sessions;
- httpOnly cookies;
- secure cookies in production;
- no JWT for the main user session;
- roles: `user`, `moderator`, `admin`.

## Russia And Personal Data Constraints

Production user data must be stored on Russia-compatible infrastructure.

Production must not use:

- Vercel;
- Netlify;
- Render;
- Railway;
- managed Supabase;
- Firebase;
- Typeform or Tally;
- foreign CRM for applications;
- Airtable or Notion as an application database;
- Google Sheets as the main application storage;
- foreign file storage;
- foreign email services for user notifications.

Google Forms rule:

- allowed only for anonymous surveys, polls and research forms without personal data;
- forbidden for applications, contacts, files, registration, vacancy responses, partners, suppliers or any personal-data collection.

Never commit:

- `.env`;
- real personal data;
- database dumps;
- application exports;
- private keys;
- tokens;
- production configs;
- user files.

## Hosting And Storage

Production target:

- Timeweb Cloud VPS;
- Ubuntu Server;
- Docker Compose;
- Nginx;
- Let's Encrypt;
- PostgreSQL;
- Next.js app;
- scheduled PostgreSQL backups.

Production file storage:

- Timeweb Cloud Object Storage;
- S3-compatible API;
- endpoint: `https://s3.twcstorage.ru`;
- region: `ru-1`;
- private bucket for user files;
- public bucket only for safe public images.

Storage abstraction:

```ts
interface StorageService {
  uploadFile(input): Promise<UploadedFile>
  deleteFile(input: string | { fileKey: string; bucket?: string }): Promise<void>
  getPublicUrl(fileKey: string): string
}
```

Local storage must keep resolved paths inside `LOCAL_UPLOAD_DIR`.
S3 deletion must use the persisted `bucket + fileKey` pair when a bucket is known.

Production must use `STORAGE_DRIVER=s3`.

If production starts with `STORAGE_DRIVER=local`, the app must fail at startup with a clear error.

## MVP Public Sections

MVP public routes:

- home;
- about;
- education;
- events;
- articles/knowledge;
- vacancies;
- suppliers;
- partners;
- contacts;
- legal pages.

Legal routes:

- `/legal/privacy`;
- `/legal/personal-data-consent`;
- `/legal/terms`;
- `/legal/cookies`.

Future payment routes:

- `/legal/offer`;
- `/legal/refund-policy`.

## Visual Direction

Primary design reference: the editorial BARSYNERGY reference image supplied by the project owner.

Design language:

- warm ivory/cream background;
- dark graphite text;
- muted burgundy accents;
- strict editorial composition;
- condensed display typography;
- thin divider lines;
- modular grids;
- route labels;
- city chips;
- directory rows;
- event rows;
- compact cards;
- black editorial bands;
- collage-like image blocks.

Avoid:

- neon;
- nightclub visual language;
- cocktail cliches;
- decorative 3D;
- WebGL;
- heavy animation;
- fake dashboards;
- generic startup landing style.

## Core Database Entities

Current runtime schema (Phase 0 foundation):

- `User`;
- `Session`;
- `Profile`;
- `City`;
- `Category`;
- `Tag`;
- `UploadedFile`.

Target MVP entities by later phases:

- `Article`;
- `Event`;
- `Course`;
- `Vacancy`;
- `Supplier`;
- `Partner`;
- `Application`.

Future monetization entities are documentation-only until the payment phase:

- `Tariff`;
- `Order`;
- `Payment`;
- `Invoice`;
- `Subscription`;
- `PromoCode`;
- `PremiumAccess`.

## Applications

Target contract for Phase 3+:

All public forms create records in the unified `Application` table.

MVP forms:

- course application;
- event application;
- vacancy response;
- vacancy submission;
- supplier submission;
- partner application;
- contact message;
- corporate training application;
- certificate order.

Every public form must include personal data consent and must not submit without it.

Application statuses:

```txt
new
in_review
contacted
payment_pending
paid_manually
approved
rejected
completed
archived
```

## Monetization

No online payments in MVP.

Monetization order:

1. Applications without online payment.
2. Manual paid educational products.
3. Manual paid placements.
4. Partner packages.
5. Online payments after legal/accounting review.
6. Premium/subscription after regular audience appears.
7. B2B cabinets after stable MVP.

Online payments require a separate mini-spec and legal review before implementation.

## Related Docs

- [Remediation plan](remediation-plan.md)
- [Project audit workflow](audit-workflow.md)

## Roadmap

Phase 0: project foundation.

Phase 1: public website MVP.

Phase 2: database models and content admin.

Phase 3: applications and forms.

Phase 4: auth and user profile.

Phase 5: filters, search and directory quality.

Phase 6: monetization without online payment.

Phase 7: stabilization and release 1.0.

## Feature Rule

Any large feature needs a separate mini-spec before implementation.

A feature is large if it adds:

- a new database entity;
- a new role;
- a new admin area;
- a new permission system;
- payments;
- an external integration;
- a new personal cabinet;
- a complex workflow;
- user-generated content;
- moderation;
- public profiles;
- Telegram bot;
- premium access;
- subscription.

## Git Workflow

Branches:

- `prod` is the stable production branch;
- `dev` is the main development branch;
- `feature/*` only for large coherent features;
- `fix/*` only for critical production fixes.

Flow:

```txt
feature/* -> dev -> manual validation -> prod
```

Small tasks can be done directly in `dev`.

Merge to `prod` only after owner confirmation.

## Stop Polishing Rule

MVP priority:

1. Working user scenario.
2. Data safety.
3. Legal correctness.
4. Admin management.
5. Mobile usability.
6. Basic design quality.
7. Polish.

After a block reaches Good Enough, stop polishing and move to the next feature.
