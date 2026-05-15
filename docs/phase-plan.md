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
- current Prisma entities include foundation models plus Phase 2 content models: `Article`, `ArticleTag`, `Event`, `Course`, `Vacancy`, `Supplier`, `Partner`, `GeneralSponsor`, `HomepageHero`, `HomepageAudienceCard`, `HomepageSocialBlock`, `HomepageCtaBlock`, `HomepageCalculatorTeaser`;
- `Application`, auth throttles, business accounts and business-access invites are implemented in later migrations;
- `ServiceSpecialist` remains planned Phase 5 scope and is not present in the current schema or routes.

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
- business solutions;
- consulting;
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

- public routes are implemented, and legal pages now have project-specific working texts for the current MVP flows;
- public `/business` and `/consulting` are implemented as public request pages and stay separate from the private business cabinet at `/business/cabinet`;
- personal-data launch checklist is documented in `docs/personal-data-launch-checklist.md`;
- shared header, footer and public page templates are implemented;
- `/general-sponsors` is implemented as a separate visible public screen with homepage and navigation entry points;
- route-level loading, error and not-found states are implemented;
- design-system foundation is documented in `DESIGN.md` and `design-tokens.json`;
- lint, typecheck, build, Prisma validate, public route smoke and desktop/mobile homepage spot checks pass;
- the homepage has been rebuilt as a live CMS-fed front page with a new public shell, GSAP-driven narrative sections, stronger B2B routing and renewed desktop/mobile screenshot checks;
- public UI polish for the requested blocks is applied locally on the current preview branch: compact brand-aware `ContactActionRow` cards/rows now cover social and contact links, homepage route/task/calculator blocks are less stretched, `/education` format/request cards and `/general-sponsors` benefit/package cards share steadier internal zones, `/suppliers` removes the `Индекс поставщиков` label and starts the supplier form from a compact intro plus fields, and calculator copy no longer mentions registration or data saving; routes, data model and form logic were kept; the obsolete `output/playwright/public-ui-polish-2026-05-06` artifact set was removed during release-prep cleanup after owner approval;
- release-readiness artifact note, 2026-05-07: stale local QA artifacts under `output/`, `docs/output/` and `/tmp/barsynergy-final-qa` were removed after owner approval. Release sign-off should use fresh validation output or newly generated screenshots, not historical artifact paths.
- targeted public card composition polish is applied locally on the current preview branch: `/events` cards are now one coherent date/content/action structure, filters are compact, the event proposal CTA is a short editorial note, `/education` format/request cards share one internal grid rhythm, homepage social channels are compact structured rows, and sponsor/contact methods are text-first rows; routes, data and form logic were kept; Playwright fallback covers `/events`, `/education`, `/`, `/general-sponsors` and `/contacts` in desktop/mobile light/dark with no horizontal overflow or console/page errors;
- public forms/filter follow-up is applied locally on the current preview branch: public application forms on vacancies, suppliers, partners, education, events and contacts stay closed until a CTA/hash opens them, and `/events` now treats active-filter zero results as a filtered empty state with toolbar/reset instead of the true prelaunch state; routes, backend actions, Prisma schema and submission logic were kept;
- sponsor contact follow-up is applied locally on the current preview branch: public general-sponsor cards now render contact people/phones as separate rows and expose Telegram, WhatsApp, email, website and Instagram as separate channel rows when data exists; the admin sponsor form only received clearer hints for slash/newline multi-contact input, with no database or action changes;
- sponsor contact card fix is applied locally on the current preview branch: `/general-sponsors` keeps WhatsApp and Instagram URLs only in `href`, hides link addresses, handles and duplicated channel titles in the card, and renders only a fixed channel icon plus CTA link; phone cards keep separate visible contacts with `tel:` links; no schema, action or route behavior was changed;
- final content/UI polish follow-up is applied locally on the current preview branch: admin homepage CMS helper text is now user-facing instead of batch-facing, sponsor text avoids abstract integration wording, and public featured/related/vacancy-response dividers use theme tokens rather than raw black borders; no route, data, schema or action behavior was changed;
- targeted UI refinement add-on is applied locally on the current preview branch: `/general-sponsors` package cards show `Стоимость — по запросу` in the bottom meta slot instead of bottom action links, shared form controls use neutral focus/active states with separate error states, and `/auth/login` shows role cards plus a top `Вернуться на сайт` action; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback coverage for `/general-sponsors`, `/auth/login` and `/contacts` in desktop/mobile light/dark with no horizontal overflow or page errors;
- final public UI consistency polish is applied locally on the current preview branch: repeated public role/task, feature/prelaunch/auth and contact/social rows now reuse shared card/row patterns; `/general-sponsors` package cards keep `Стоимость — по запросу` as quiet meta; public listing surfaces and file upload focus states use neutral tokenized surfaces; routes, server actions, Prisma, data and field names were kept; the historical Playwright screenshot folder for this pass was removed during release-prep cleanup; `git diff --check`, `npm run lint`, `npm run typecheck` and `npm run build` pass;
- homepage action-card rhythm follow-up is applied locally on the current preview branch: the `/` `Что нужно сделать` cards now share one stretched grid row on desktop, use equal internal slots for header/title/body/quick links/audience/CTA, keep quick links to one line in the checked widths and keep mobile readable without horizontal overflow;
- targeted homepage UI refinement is applied locally on the current preview branch: `/` uses `Актуальное` for the current-materials section, `Куда перейти` is now grouped task cards, the calculator teaser is one integrated hero-card, `Что нужно сделать` has stronger role/task cards, and shared one-line `ContactActionRow` rows are used for homepage channels, sponsor contact/social links and the contacts page; Playwright fallback covers the affected homepage/contact sections in desktop/mobile light/dark with no horizontal overflow;
- homepage browser-comment content follow-up is applied locally on the current preview branch: the hero project explanation is now one `Что такое BARSYNERGY` block, featured material metadata sits beside the top tag, and the route index uses Russian labels instead of English codes; routes, data sources and form logic were kept; Playwright fallback covers `/` at `1440x900`, `390x844` and the mobile route-index anchor with no horizontal overflow;
- homepage browser-comment follow-up is applied locally: the `О проекте` section is simplified, explanation cards now have direct CTA buttons, audience cards have aligned action rows, the general sponsor block no longer duplicates social buttons or the extra lineup photo, and social promo cards now use integrated icon backgrounds;
- homepage social promo cards are refined locally again: the three channel cards now share one `SocialCard` component and use dedicated local SVG Telegram/WhatsApp/Instagram logos as separate right-side background layers instead of pseudo-icons;
- editorial UI consistency follow-up is applied locally for the requested blocks: `/education` pre-launch cards now expose format/audience/status details, homepage social cards use shared editorial surfaces with small platform accents, the dark community CTA and dark-theme actions use the burgundy token stack, and vacancy CTA buttons are width-limited through the shared `Button`; Playwright fallback screenshots cover `/`, `/education` and `/vacancies` at desktop/tablet/mobile widths in light/dark with no horizontal overflow;
- editorial background follow-up is applied locally: the public base background now uses warm ivory/deep graphite layers, subtle paper grain, no square grid layers and burgundy/graphite radial accents; homepage sections now have explicit hero, ivory, beige, warm gray, graphite tool, sponsor, social and CTA zones with Playwright fallback screenshots across mobile/tablet/desktop in light/dark and no horizontal overflow;
- branded form system follow-up is applied locally: public, auth, business and admin field surfaces now share custom BARSYNERGY form primitives for input, textarea, select, checkbox, radio, upload, search, labels, hints, errors, sections and actions; the vacancy response form is the reference implementation, and existing form names/actions/validation remain unchanged;
- dark graphite editorial theme polish is applied locally: dark mode now uses explicit graphite page/panel/elevated tokens, warm low-opacity borders, ivory and muted-clay text, calmer burgundy accents, reduced heavy shadows/glows and flat graphite form fields; Playwright fallback screenshots/checks cover the requested public/auth routes at desktop/mobile widths with no runtime errors or horizontal overflow;
- homepage browser-comment cleanup is applied locally: the hero text now uses `партнёрские предложения`, the first-screen audience action panel is removed, the featured knowledge card has a bitmap fallback image, and social cards no longer repeat platform names in uppercase labels plus titles; Playwright fallback checks cover `/` at `1175x813` and `822x813` with no horizontal overflow;
- sponsor data is now shared between the homepage and `/general-sponsors`, so the separate sponsors page renders the same real entries and no longer keeps a separate test showcase list;
- partner/sponsor follow-up is applied locally: `/partners` now leads with clearer plain-Russian copy, shows the current general sponsor directly on the page, the `Hustle Brew` block now reads as an editorial partner profile instead of a promo slab, social promo cards no longer let their oversized logos collide with the right-side divider treatment, and the public header no longer overflows or shifts its desktop nav/actions on medium desktop widths;
- the main public routes now share normalized public primitives for typography, section headers, stat shells, filters, content meta chips and form action rows, while keeping demo/test data and section-specific information structure;
- current photo-reference redesign is applied locally on `codex/photo-reference-ui-redesign`: public routes, auth, calculator, profile, business and admin surfaces now share the supplied warm serif/burgundy UI direction while preserving current data sources, routes, forms and permissions;
- focused browser smoke is rerun for the photo-reference branch: public routes across mobile/tablet/desktop/wide viewports, plus authenticated profile, business and admin routes, mobile menu, active nav, visible focus, calculator interaction and contact form state;
- dark-theme UI consistency follow-up is applied locally on the same branch: separate light/dark logo assets, compact header theme toggle, retokenized dark contrast states, denser homepage/sponsor/education/event surfaces, conditional education/event forms and Playwright screenshots across the requested public/auth routes and viewports;
- `/events` AI-ish cleanup is applied locally on the same branch: the hero proposal CTA is an operational submission note, missing event covers render a date/place/format metadata block instead of a gray media placeholder, filters use event-specific labels/context, and desktop/mobile light/dark Playwright fallback checks pass with no horizontal overflow;
- homepage AI-ish card cleanup is applied locally on the same branch: the `/` route block now renders as a grouped route index, audience entries render as role/use-case rows, and social/community entries render as channel rows with purpose, content type and rhythm/moderation notes while keeping the hero, current-content section, calculator band, sponsor profile block, header and footer;
- homepage current-content layout follow-up is applied locally on the same branch: the `/` `Что уже доступно` section now places supporting vacancy/material/supplier cards in a lower row under the featured knowledge block instead of leaving the left side empty while the right column continues downward; routes, data and visible copy were kept; Playwright fallback covers dark desktop/mobile screenshots at `1440x813` and `390x844` with no horizontal overflow;
- structured public content card cleanup is applied locally on the same branch: the homepage `Что нужно сделать` block is now a three-card action block, articles starter/rubric blocks, education formats, partner formats and sponsor offers use structured content cards, and event/vacancy rows show fewer key facts instead of table-like columns and chip-heavy metadata; routes, API, Prisma, server actions, validation and data model were kept; Playwright fallback covers `/`, `/articles`, `/education`, `/partners`, `/general-sponsors`, `/events` and `/vacancies` in desktop/mobile light/dark with no horizontal overflow or console/page errors;
- cost calculator worksheet polish is applied locally on the same branch: `/tools/cost-calculator` now uses a compact costing sheet with ingredient rows, subtotal strip and result rail, mobile shows calculation results before the sheet, dark worksheet fields are flat, and the existing calculation logic is unchanged; Playwright fallback confirms the demo calculation values and desktop/mobile light/dark layout with no horizontal overflow;
- mobile density cleanup is applied locally on the same branch: the requested public routes now avoid list-like mobile stacks of large cards by using compact rows, dividers, grouped panels, short metadata lines and collapsed formula details where appropriate; Playwright fallback covers `/`, `/articles`, `/education`, `/partners`, `/general-sponsors`, `/vacancies`, `/events`, `/suppliers` and `/tools/cost-calculator` at `390x844` in light/dark with no horizontal overflow or console errors;
- Phase 1 is complete for the current static public surface;
- legal text and operator/Roskomnadzor readiness still need owner/legal review before personal-data collection.

## Phase 2: Database Models And Content Admin

Goal:

Build the database and admin content management.

In scope:

- Prisma models for Article, Event, Course, Vacancy, Supplier, Partner, GeneralSponsor, homepage CMS blocks, Category, City, Tag;
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
- the CMS-first sponsor/taxonomy/homepage follow-up is backed by migrations `20260505103000_cms_admin_sponsors_taxonomy` and `20260505123000_homepage_cms_blocks`;
- that follow-up adds `GeneralSponsor`, `/admin/general-sponsors`, `/admin/homepage`, real category/city/tag admin screens, canonical `/admin/tags`, active article tags, broader admin list filters and homepage source audit `docs/homepage-data-source-audit.md`;
- `/admin/homepage` uses a section overview with collapsed homepage editors, returns to the edited section after saving, keeps repeatable homepage records as compact rows and exposes derived navigation/general-sponsor homepage sections without changing the public homepage or the database schema;
- public read queries are connected to articles, events, education, vacancies, suppliers and partners and return only `published` records with pagination that preserves active filters;
- public content image upload route is implemented at `/admin/uploads/content-image`;
- Phase 2 admin UX follow-up is implemented: edit forms, cover image upload slots, admin list pagination and admin action success/error states;
- key admin screens now share a calmer global header and a unified intro pattern across dashboard-adjacent list and placeholder pages;
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
- public `/education`, `/events`, `/suppliers`, `/partners`, `/business`, `/consulting` and `/contacts` now write the remaining MVP request types into `Application`;
- `ApplicationType.BUSINESS_SOLUTION` and `ApplicationType.CONSULTING_REQUEST` are backed by migration `20260515120000_business_consulting_application_types`;
- production public forms are disabled by default through `APPLICATION_FORMS_ENABLED`;
- public forms include a honeypot and per-client rate limit;
- admin `/admin/applications` supports queue-style list/detail review, readable payload labels, private resume download, related-record cards, unified status/business-note/internal-note processing and manual `forwarded_to_employer` metadata;
- employer-forwarding status is guarded so only consented vacancy responses can be marked as forwarded;
- admins can create a draft `Vacancy` from a `vacancy_submission` application and keep publication manual;
- admin-only private resume download is available at `/admin/applications/[applicationId]/resume`;
- user confirmation emails are sent when `SMTP_*` is configured, and short Telegram admin notifications are sent when Telegram env config is present;
- Phase 3 is complete at source level for the current MVP applications contract;
- legal text and operator/Roskomnadzor readiness still need owner/legal review before personal-data forms are enabled in production.

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
- `/admin/applications/[applicationId]` can prepare a one-time activation link for a reviewed business-access request;
- `/auth/activate` lets the business owner set a password and finish the first activation from that one-time link;
- `/admin/users` can block business access and reopen already prepared accounts;
- `/business/cabinet` is guarded for active business users and supports company profile editing;
- `/business/cabinet/requests` supports business-owned drafts and submissions for vacancy placement, supplier placement, partner application, corporate training and certificate order;
- `/business/cabinet/requests/[applicationId]` lets businesses view only their own requests, edit drafts, submit drafts for review and archive drafts;
- auth, business and specialist-profile screens have an additional shared-UI consistency pass: page headers, action rows, stat blocks, sidebars and helper panels are normalized around the internal UI kit without changing the Phase 4 business logic;
- focused browser smoke is rerun for `/business/cabinet` and `/business/cabinet/requests` after activating local demo access for QA only;
- admin application detail can store business-visible notes inside the unified processing block;
- email-based password reset is deferred until production email is configured, but one-time admin-prepared activation links are implemented for the current Phase 4 flow.

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
- current schema has `CategoryType.SERVICE` as taxonomy preparation, but it does not yet have `ServiceSpecialist`, `ApplicationType.SERVICE_SPECIALIST_SUBMISSION`, `/services` or `/admin/services`;
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
