# BARSYNERGY Project Status

Last updated: 2026-05-17

## Current Branch

- Active branch: `prod`
- Production branch: `prod`
- Current work mode: `IMPLEMENTATION`

## Current Phase

Active phase: Phase 4 auth and first business account is implemented for the current MVP contract, with the first scoped B2B public pages now added. Phase 1 public website MVP is complete. Phase 2 content/admin work is implemented and runtime-verified for admin create flows, published-only public reads, upload boundaries, pagination and publish/archive behavior. Phase 3 covers the unified `Application` model, public forms, admin review, guarded employer-forwarding metadata, draft vacancy creation, private resume upload/download and optional SMTP/Telegram notifications when approved env config is present. Phase 4 covers email/password login, logout, reviewed business-access requests, admin-prepared one-time activation links, approved business accounts, blocking/reopening, editable business profile, business request drafts/submission/tracking and business-visible admin comments. Public personal-data forms remain disabled by default in production until `APPLICATION_FORMS_ENABLED=true` is explicitly set after legal approval.

Release-readiness documentation notes, 2026-05-06:

- Release-blocker remediation loop is complete for the current local branch: migration drift was closed with a new copy-update migration, business-access activation links now use a token-consuming redirect route and short scoped `httpOnly` cookie, public-form/admin-upload throttling and dependency audit are clean, homepage/public content/form accessibility issues are fixed, production storage/docs now match external Timeweb S3 without local MinIO, and independent security, UI and deploy re-reviews returned `PASS`; validation is green with `git diff --check`, `npm test`, `./node_modules/.bin/prisma validate`, local `npm run prisma:migrate:deploy`, `npm audit --omit=dev`, `npm run lint`, `npm run typecheck` and `npm run build`.
- Release-prep cleanup on 2026-05-07 removed stale local QA artifacts after owner approval: `output/`, `docs/output/`, `/tmp/barsynergy-final-qa`, `.DS_Store` files and the untracked historical AI-ish audit draft. Release sign-off must use fresh validation output or newly generated QA artifacts, not the removed screenshot folders.

Current local follow-up completed on the current branch:

- homepage service-block restore is applied locally on `prod`: the block about sites, Telegram bots, Mini Apps and process automation is present on `/` directly after the hero, with four numbered service cards and one `Обсудить задачу` CTA to `/contacts?topic=other#contact-form`; the mobile cookie notice is shorter and respects safe-area spacing, the unused legacy `SocialCard` promo surface is removed, shared touch handling is enabled for interactive controls and the scroll-to-top button respects mobile safe-area; CMS data, public routes, forms, Prisma schema, auth, admin and dependencies were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `./node_modules/.bin/prisma validate`, `npm test`, `npm run build` and Playwright fallback checks for `/` at `390x844` and `1440x900` with the service block present, four service cards, CTA present, no horizontal overflow and no console errors;
- scoped product improvements are applied locally: `/tools/cost-calculator` now has explicit automatic/manual pricing, manual sale price input, recommended price, profit, margin, markup and cost-share metrics; public `/business` and `/consulting` pages now explain concrete B2B/consulting tasks and submit into the existing `Application` model; the private business cabinet moved from `/business` to `/business/cabinet`; `ApplicationType.BUSINESS_SOLUTION` and `ApplicationType.CONSULTING_REQUEST` are backed by migration `20260515120000_business_consulting_application_types`; admin application list/detail can filter and read the new request types with existing status and internal-note handling;
- review remediation follow-up is applied locally: admin application processing now hides and server-guards business-visible comments unless an application is linked to a business account, status options no longer offer employer forwarding when transition rules reject it, calculator numeric input rejects partial values such as `100abc`, public `/business` and `/consulting` copy no longer exposes internal English costing terms, the public design-system preview matches the current font contract, and production Nginx CSP no longer allows `unsafe-eval`; validation is green with `git diff --check`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run lint`, `npm run typecheck`, `npm run build` and standalone HTTP smoke for `/business`, `/consulting` and `/tools/cost-calculator`;
- calculator manual sale price batch is applied locally: `/tools/cost-calculator` now lets the user set sale price manually; when the field is filled, the result panel uses that price for food-cost share, gross profit, margin, markup and copied result text, while the old target-food-cost calculation remains as the fallback recommendation; validation passed with lint, type checks, diff check and Playwright CLI desktop/mobile smoke;
- public header breakpoint fix is applied locally on `prod`: the full desktop navigation now starts at the `xl` breakpoint, the mobile menu remains available below it, and the header no longer lets long Russian navigation labels overlap the right-side theme/login/contact controls; `/business` and `/consulting` remain public header/footer routes, while the private business cabinet stays under `/business/cabinet`;
- filter navigation follow-up is applied locally on `prod`: shared internal button/nav/chip/action-menu links now use Next.js client navigation, admin GET filter bars submit through `router.push` instead of a document reload, and remaining plain internal anchors in header, footer, auth entry pages, breadcrumbs, article cards, fallback pages and shared public/admin row components now use the shared `AppLink`, while `mailto:`, `tel:`, external URLs and the `AppLink` fallback stay as native anchors;
- admin application publication follow-up is applied locally on `prod`: `vacancy_submission`, `supplier_submission` and `partner_application` detail pages now have explicit publish actions that create a published `Vacancy`, `Supplier` or `Partner`, link it back to the source `Application`, keep the application approved, and leave private applicant contacts out of public supplier cards by default; `Application.supplierId` and `Application.partnerId` are backed by migration `20260517120000_application_publication_links`;
- TDD coverage hardening is applied locally on `prod`: demo seed guard checks were split into `scripts/demo-seed-guard.mjs`, security helper coverage covers CSP nonce/policy/path decisions, same-origin checks, request identity fallback and atomic throttle helpers, storage signature tests cover public image and private document formats, and business request payload tests cover every request type;
- production deployment for merge `da182de` is complete on 2026-05-17: `dev` and `prod` were pushed, the production checkout was updated to `da182de`, `npm ci` completed, production `npm run prisma:migrate:deploy` applied migration `20260517120000_application_publication_links`, production `npm run build` completed with standalone asset/runtime verification, `barsynergy.service` restarted and stayed active, and smoke checks for `/`, `/business`, `/consulting`, `/suppliers`, `/admin` and `/business/cabinet` returned successful responses with protected routes redirecting to `/auth/login` before following redirects;
- final public/admin maturity QA pass is complete locally: Playwright fallback checked public routes `/`, `/articles`, `/education`, `/events`, `/vacancies`, `/suppliers`, `/partners`, `/general-sponsors`, `/contacts`, `/tools/cost-calculator` in light desktop and dark mobile, plus key public routes on tablet; authenticated admin routes `/admin`, `/admin/applications`, `/admin/articles`, `/admin/courses`, `/admin/events`, `/admin/vacancies`, `/admin/suppliers`, `/admin/partners`, `/admin/general-sponsors`, `/admin/homepage`, `/admin/users`, `/admin/categories`, `/admin/cities`, `/admin/tags` in light desktop and dark mobile, plus key admin routes on dark tablet; public filter select, admin form select, admin row action menu, confirmation dialog, public disclosure forms and sponsor `tel:` links passed targeted interaction checks; validation is green with `git diff --check`, `npm run lint`, `./node_modules/.bin/prisma validate`, `npm run typecheck` and `npm run build`; the generated screenshot folder was removed during release-prep cleanup on 2026-05-07; `npx prisma validate` is intentionally not used here because the local workspace path contains `:`, which makes `npx` wrapper resolution fail in this environment; no deploy, push or commit was performed; remaining release risks are owner review, the dirty worktree and the production/legal/deploy blockers tracked below;
- public content/text cleanup batch is applied locally: visible public copy on homepage route navigation, education formats, supplier intro, partners start/format copy, sponsorship benefits/packages, vacancy publication steps and shared filtered-empty states was tightened toward concrete user actions and away from vague platform/presence wording; legal/admin/business/auth copy, routes, server actions, Prisma schema and submission logic were kept; validation is green with marker `rg` checks, `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback checks for `/`, `/education`, `/suppliers`, `/partners`, `/general-sponsors` and `/vacancies` in light desktop and dark mobile with no forbidden visible phrases, no horizontal overflow and no console/page errors;
- public forms/filters batch is applied locally: public application forms on vacancies, suppliers, partners, education, events and contacts stay closed until a route-specific CTA/hash opens them, shared public `Select` menus were rechecked as fixed overlays that do not change surrounding layout height, `/events` now keeps the filter toolbar and reset action for active-filter empty results instead of showing the prelaunch state, sponsor phone numbers remain visible with `tel:` links in light/dark and mobile states, and the partners start-step block now uses the shared navigation-card pattern instead of table-like divider rows; backend/API, Prisma schema and form submission logic were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback checks for public disclosure flows, public filter selects, sponsor phone links and screenshots for `/partners`, `/vacancies` and `/general-sponsors`;
- sponsor contacts batch is applied locally: public general-sponsor cards now split slash/newline contact names and phone numbers into separate contact rows, keep the phone number visible with normalized `tel:` links, and show Telegram, WhatsApp, email, website and Instagram as separate channel rows when those fields exist; admin sponsor contact hints now explain the supported multi-contact format; no Prisma schema, sponsor CRUD action or public contact-form logic was changed;
- sponsor contact card fix is applied locally: WhatsApp and Instagram cards on `/general-sponsors` keep URLs only in `href`, no longer show link addresses, handles or duplicated channel titles as visible text, and render only a fixed channel icon plus CTA link so the action cannot overlap text; phone contacts remain separate `tel:` cards without the old `Контактное лицо` label; no data model, sponsor actions or other public sections were changed;
- final content/UI polish batch is applied locally: admin homepage CMS copy no longer exposes agent/batch wording, sponsor copy uses simpler concrete labels, and shared public featured/related/vacancy-response surfaces use theme tokens instead of raw black borders so divider and dark-theme states stay consistent; routes, server actions, Prisma schema and submission logic were kept;
- admin homepage CMS batch is applied locally: `/admin/homepage` now starts with a compact section overview, opens the selected section from the overview or after saving, keeps CMS areas collapsed by default with status/order/update summary, compact record rows, nested edit state and section-level save actions, and exposes homepage navigation/general-sponsor sections without adding a new DB model; public homepage rendering, Prisma schema and homepage server actions were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and authenticated Playwright checks for `/admin/homepage`, section save, validation error, public-homepage smoke, light/dark and mobile states;
- admin applications and business-access queue batch is applied locally: `/admin/applications` now reads as a processing queue with type, applicant/company, city, status, files/consents, date, next step and open action; application detail shows readable payload labels, a separate related-record card, a resume file card with explicit missing-file state, and one processing form for status, visible comment and internal note; `/admin/users` now presents the section as `Бизнес-доступы`, the sidebar label matches the screen, access filters separate all/pending/active/blocked states, pending/active/blocked cards show state-specific primary actions, blocking is moved into a shared danger action menu with confirmation, and the next-step block is shown only when a related business request exists; validation is green with `npm run lint`, `npm run typecheck`, `npm run build` and authenticated Playwright checks for applications/business-access flows;
- admin dictionaries batch is applied locally: `/admin/categories`, `/admin/cities` and `/admin/tags` render compact read-only rows by default, open only the selected inline edit row, keep create forms shorter, move optional category/tag descriptions into collapsed advanced sections, show status through badges instead of always-visible edit checkboxes, and use `/admin/tags` as the single tag page; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and authenticated Playwright fallback checks for categories/cities/tags in light/dark plus mobile smoke;
- admin long-forms batch is applied locally: shared admin CMS forms now have sticky bottom actions, edit screens for articles, courses, events, vacancies, suppliers, partners and general sponsors show a compact record summary, article editorial metadata is collapsed as advanced content, vacancy forms separate work conditions from response contacts, supplier/sponsor contact inputs give structured non-migration fallbacks, and event date helpers no longer imply browser-native Russian input formatting; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and authenticated Playwright fallback checks for representative admin create/edit forms in light/dark plus mobile smoke;
- admin table labels/raw-enum batch is applied locally: shared admin table sizing now keeps the column before sticky actions readable instead of visually collapsing `Обновлено`, event/course/partner option labels render through readable Russian labels including `Офлайн`, `Базовый` and `Бренд`, supplier verification is always shown as a badge, and application vacancy slugs are secondary text under the vacancy title; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and authenticated Playwright fallback checks for `/admin/suppliers`, `/admin/applications`, `/admin/events`, `/admin/courses` and `/admin/partners` in light/dark plus mobile smoke;
- admin color/action hierarchy batch is applied locally: admin-scoped button styling now separates primary page actions from secondary/workflow actions, active sidebar rows use a soft selected state instead of primary fill, admin filter/table accent lines are calmer, row action buttons and action-menu triggers are neutral, published archive confirmation no longer uses primary red, and danger confirmation remains destructive; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and authenticated Playwright fallback checks for `/admin/articles`, `/admin/vacancies` and `/admin/applications` in light/dark plus mobile smoke;
- admin row action menu maturity batch is applied locally: shared admin row actions now expose status-specific options for draft, published and archived records across content tables; published archive and delete actions open confirmations; the article list uses the shared row action component; row menus and confirmation overlays stay portaled/fixed without changing table row height; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and authenticated Playwright fallback checks for `/admin/vacancies` and `/admin/articles` across desktop/mobile and light/dark checks;
- Gelabo/Agrobar sponsor content follow-up is applied locally: the Gelabo sponsor block now uses the owner-provided Gelabo/Agrobar copy, shows the Agrobar logo under the Gelabo logo, keeps Zagir and office phone contacts visible and updates the local database record for the current preview; routes, admin, backend/API and DB schema were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback checks for `/` and `/general-sponsors` at `1440x813` and `390x844` with no horizontal overflow;
- public copy maturity pass is applied locally: public route/page/form/CTA copy was tightened away from generic AI-style wording and toward concrete user actions for education, events, articles, vacancies, suppliers, partners, sponsorship and contacts; runtime routes, admin, backend/API and DB schema were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback checks for `/`, `/education`, `/events`, `/articles`, `/vacancies`, `/suppliers`, `/partners`, `/general-sponsors`, `/contacts` plus available event/vacancy/supplier detail pages at desktop and mobile sizes;
- public maturity sequential follow-up is applied locally: topic CTAs from articles, education and suppliers now open `/contacts#contact-form` with the selected topic, event-list `Записаться` now opens the selected event detail request form, public application sections allow visible select/dropdown menus outside their wrappers, partner format cards use the shared labeled detail stack including `Кому подходит`, and sponsorship package cards now expose `Запросить условия` with the package prefilled in the contact form; routes, admin, backend/API and DB schema were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build`, `./node_modules/.bin/prisma validate`, focused Playwright checks for each batch and an overall Playwright fallback pass for `/`, `/education`, `/events`, `/articles`, `/vacancies`, `/suppliers`, `/partners`, `/general-sponsors` and `/contacts` at `390x844`, `768x900`, `1440x900` and `1728x980` in light/dark plus key disclosure, focus and prefill checks;
- contacts topic-selection follow-up is applied locally: `/contacts` now shows direct contact channels first, then eight topic cards for education, events, vacancies, suppliers, partnerships, sponsorship, materials/interviews and other requests; topic cards open `#contact-form` with the selected topic prefilled, the contact form remains hidden by default, and direct contact values stay readable on desktop and mobile; routes, admin, backend/API and DB schema were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback checks for `/contacts` at `390x844`, `768x900`, `1440x900` and `1728x980` in light/dark plus hash, focus and selected-topic checks;
- public maturity shared-primitives pass is applied locally: repeated editorial detail stacks in shared public format/package cards now render as one soft detail area instead of separate table-like bordered rows, sponsor phone cards keep readable phone numbers visible on mobile and desktop, and sponsor phone hrefs use the shared Russian phone normalization helper; routes, admin, backend/API and DB schema were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback checks for `/`, `/education`, `/partners`, `/general-sponsors` and `/contacts` at `390x844` and `1440x900` in light/dark plus disclosure focus and sponsor phone `tel:+7...` checks;
- public request-disclosure UI batch is applied locally: public application forms on vacancies, suppliers, partners, education, events and contacts are hidden by default and open from route-specific CTAs or stable hashes; vacancy/detail and event/detail forms remain tied to their selected item; partner format card divider/footer spacing is separated; homepage route cards use a less table-like editorial card pattern; sponsor phone cards now show readable phone numbers and normalized `tel:+...` links; the dark calculator benefit card uses semantic warm inverse tokens; form shells allow select/dropdown content without clipping; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build`, `./node_modules/.bin/prisma validate` and Playwright fallback checks for requested public routes across mobile/tablet/desktop/wide light/dark viewports plus interaction checks for disclosure, focus, select menus and sponsor phone links;
- sponsor/supplier content update is applied locally: Gelabo is added as the second published general sponsor with the owner-provided blue-background logo, Zagir/office phone contacts and plain product descriptions for Gelabo and Agrobar; Agrobar is also added as a published supplier entry through Gelabo with terms, assortment and geography marked for direct clarification; schema and public components were kept;
- public UI polish for the requested blocks is applied locally: `ContactActionRow` now supports compact brand-aware cards/rows for Telegram, WhatsApp, Instagram, phone, email and website links; homepage `Куда перейти`, `Что нужно сделать` and calculator teaser are cleaner and less stretched; `/education` format/request cards, `/general-sponsors` benefit/package cards and repeated contextual intro cards share steadier internal rhythm; `/suppliers` no longer shows `Индекс поставщиков` and its supplier form starts with the fields after a compact intro; visible calculator copy no longer mentions registration or data saving; routes, server actions, Prisma models and form names were kept; the obsolete `output/playwright/public-ui-polish-2026-05-06` artifact set was removed during release-prep cleanup after owner approval;
- final public UI consistency polish is applied locally: homepage route/task cards, auth access roles, article rubric fallbacks and prelaunch cards now reuse shared `RoleTaskCard`/`FeatureCard` patterns; `ContactActionRow` is the shared contact/social row with calmer desktop proportions; `/general-sponsors` package cards keep the bottom `Стоимость — по запросу` meta row; listing surfaces use tokenized card/list colors; file-upload focus no longer carries a pink decorative wash; routes, server actions, Prisma, data and form field names were kept; the historical Playwright screenshot folder for this pass was removed during release-prep cleanup; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck` and `npm run build`;
- targeted UI refinement add-on is applied locally: `/general-sponsors` package cards now use a calm bottom meta row with `Стоимость — по запросу` instead of bottom action links, shared form focus tokens now use neutral focus/active states while keeping error states distinct, `/auth/login` shows access roles as role cards instead of a table-like list, and `Вернуться на сайт` is moved to the top action area; backend, routes, DB, form names/actions and validation logic were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback checks/screenshots for `/general-sponsors`, `/auth/login` and `/contacts` in desktop/mobile light/dark with no horizontal overflow or page errors;
- targeted public card composition polish is applied locally: `/events` event cards now read as one date/content/action card, event filters are compact and secondary, the event proposal CTA is a shorter editorial note, `/education` format/request cards share a consistent internal rhythm, homepage social channels are compact structured rows, and sponsor/contact methods are text-first contact rows; routes, API, Prisma, server actions, auth, forms logic, data, header and footer were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback screenshots/checks for `/events`, `/education`, `/`, `/general-sponsors` and `/contacts` in desktop/mobile light/dark with no horizontal overflow or console/page errors;
- targeted homepage UI refinement is applied locally: `/` now uses the shorter `Актуальное` heading for current materials, `Куда перейти` is rebuilt as grouped task cards, the calculator teaser is one hero-card with a compact step strip and bottom CTA, `Что нужно сделать` uses stronger role/task cards with consistent quick links, audience notes and CTA rhythm, and shared `ContactActionRow` rows now cover homepage channels, sponsor contact/social links and the contacts page contact list; backend, routes, CMS data sources and global theme tokens were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback screenshots/checks for `/` and `/contacts` in desktop/mobile light/dark with no horizontal overflow;
- homepage action-card rhythm follow-up is applied locally: the `/` block `Что нужно сделать` now uses a stretched grid, flex-column cards, reserved desktop/tablet slots for header, title, body, quick links, audience and CTA, and one-line quick-link chips; routes, links, data sources, header/footer and other homepage blocks were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback checks/screenshots for the target block at desktop/tablet/mobile in light/dark with no horizontal overflow;
- homepage browser-comment content follow-up is applied locally: the `/` hero now replaces the three project-detail rows with one `Что такое BARSYNERGY` description block in Russian, the featured material metadata chips moved up next to the `Знания` tag, and the route index codes now use Russian labels instead of `EDU/JRN/CAL/EVT/JOB/SUP/PRT/SPN`; routes, data sources and form logic were kept; validation is green with `git diff --check -- src/components/public/homepage-client.tsx`, `npm run lint`, `npm run typecheck`, local HTTP `200` smoke for `/` and Playwright fallback checks/screenshots at `1440x900` and `390x844` with no horizontal overflow;
- homepage browser-comment layout follow-up is applied locally: the `/` `Что уже доступно` section now keeps the featured knowledge block on the left, gives the event block the neighboring top slot and places vacancy/material/supplier cards in a full-width lower row, so the left side no longer leaves a large empty area under the featured block; routes, data and visible copy were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback dark desktop/mobile screenshots at `1440x813` and `390x844` with no horizontal overflow;
- public browser-comment follow-up is applied locally: `/` hero now uses dot separators and project-details text instead of the previous status track, the featured knowledge block no longer stretches to the neighboring column height, the sponsor zone uses graphite-safe elevated tokens in light and dark themes, `/about` now renders its metrics/rows before the footer, `PublicPrelaunchSection` shows education/events/suppliers prelaunch cards in one desktop row, `/events` hero aligns both columns at the top and no longer shows the extra subtitle, directory filter search aligns with select controls, and shared contact-channel fieldsets show the same required cue as other mandatory fields while preserving existing server validation; routes, data and submission logic were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback screenshots/smoke for `/`, `/about`, `/education`, `/events` and `/suppliers` at desktop/mobile in light/dark with no console/page errors;
- structured public content card cleanup is applied locally: `/` now has a clear three-card `Что нужно сделать` action block for specialists, venues and brands/suppliers; `/articles`, `/education`, `/partners` and `/general-sponsors` use structured editorial/format/offer cards instead of overly table-like blocks; `/events` keeps only date, place, format and audience as visible facts; `/vacancies` keeps role, company/city, schedule, experience, pay, short summary and one action; routes, API, Prisma, server actions, validation and data model were kept; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback desktop/mobile light/dark checks for `/`, `/articles`, `/education`, `/partners`, `/general-sponsors`, `/events` and `/vacancies` with no horizontal overflow or console/page errors;
- public detail dark hero fix is applied locally: shared `PublicContentDetailPage` now uses token-based `--surface-wash`, `--line`, `--border-default` and `--shadow-panel` surfaces instead of hardcoded light radial/white blob, `border-black/*`, white color-mix and fixed light shadow treatment; event, vacancy, supplier, article, education and partner detail routes keep the same routes, data, content structure and body logic; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback screenshots/checks for `/events/demo-regional-guest-shift`, `/vacancies/senior-barista-aster-roasters-demo` and `/suppliers/aroma-trade-south-demo` at desktop/mobile in light/dark with no horizontal overflow, no console/page errors and no hero `background-image`;
- business cabinet cleanup is applied locally: `/business/cabinet` now uses `BusinessProfileSheet`, `RequestStatusRail`, `NextActionPanel` and `RequestLedger` instead of the previous generic dashboard/card/stat layout; `/business/cabinet/requests` shares the ledger pattern while keeping the existing request form fields, segmented type selector, submit actions and validation; request detail uses the same next-action treatment for draft submit/archive and return actions; business auth, roles, server actions, API and Prisma logic were kept; validation is green with `git diff --check`, `npm run lint`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run typecheck`, `npm run build` and authenticated Playwright fallback checks for `/business/cabinet`, `/business/cabinet/requests` and a request detail page at desktop/mobile in light/dark with no horizontal overflow or console/page errors;
- admin create/edit form cleanup is applied locally: shared `AdminCmsForm`, `AdminCmsSection`, `AdminCmsPanel` and `AdminCmsRecordForm` now give article, event, course, vacancy, supplier, partner, general sponsor, taxonomy and homepage CMS forms a compact editorial CMS structure with publication, classification, media, content and settings-style groups where relevant; field names, ids, server actions, schemas, routes and permission guards were kept; validation is green with `git diff --check`, `npm run lint`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run typecheck`, `npm run build`, final `tsc --noEmit` after restoring generated `next-env.d.ts`, and authenticated Playwright fallback checks across 16 admin form/CMS routes plus desktop/mobile light/dark screenshots for representative forms with no horizontal overflow or console/page errors;
- admin list pattern cleanup is applied locally: shared `AdminFilterBar`, `AdminDataTable`, `AdminStatusChip`, `AdminActionRow` and `ContextualEmptyState` now define the branded admin list/filter/table/status/action/empty-state contract; articles, events, vacancies, suppliers, partners, general sponsors and applications use the shared filter/table/action/status patterns, and taxonomy/users screens use the contextual empty/status/action treatment where relevant; data columns, actions, routes, server actions and permission guards were kept; validation is green with `git diff --check`, `npm run lint`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run typecheck`, `npm run build` and authenticated Playwright fallback checks across 12 admin routes in desktop light/dark plus key mobile light/dark screens with no horizontal document overflow or console/page errors;
- admin dashboard work-queue cleanup is applied locally: `/admin` now replaces the generic card/stat dashboard with `AdminWorkQueue`, `ContentHealthTable`, `PublishingStatusRail` and `ModerationActionLane`; `StatCard` is now a flat compact metric with label, value, status/delta and a thin divider, without gradient/blur/orb treatment; current counts, application data and admin permission guards were kept; validation is green with `git diff --check`, `npm run lint`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run typecheck`, `npm run build` and Playwright fallback authenticated `/admin` desktop/mobile light/dark screenshots/checks with no horizontal overflow or console/page errors;
- mobile density cleanup is applied locally on the public preview branch: `/`, `/articles`, `/education`, `/partners`, `/general-sponsors`, `/vacancies`, `/events`, `/suppliers` and `/tools/cost-calculator` now use shorter mobile rows, grouped panels, dividers, compact metadata lines and collapsed calculator formula details instead of long stacks of large cards where the content is list-like; desktop grids, routes and business logic were kept; validation is green with Playwright fallback mobile light/dark screenshots/checks for all requested routes at `390x844` with no horizontal overflow or console errors, `git diff --check`, `npm run lint`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run typecheck` and `npm run build`;
- auth pages generic-SaaS cleanup is applied locally: `/auth/login` now uses an `AccessRoleList` for participant, business, editorial/team and admin access instead of feature icons, the lock mark is secondary, and access copy reads as a role-gated institutional process; `/auth/register` is framed as a professional-community connection request without changing fields, submit action or validation; `/auth/activate` stays compact with a dark-safe header surface; validation is green with `git diff --check`, `npm run lint`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run typecheck`, `npm run build` and Playwright fallback screenshots/checks for `/auth/login`, `/auth/register`, `/auth/activate` at desktop/mobile in light/dark with no horizontal overflow;
- `/events` AI-ish cleanup is applied locally: the hero side CTA is now an operational submission note with criteria, eligible proposers, review status and action; event rows keep the date-led structure but replace missing image placeholders with a date/place/format metadata block; filters now use event-specific city/type/format/date labels, audience context and active-summary chips without changing filter logic or event data/detail routes; validation is green with `npm run lint`, `npm test`, `npm run typecheck`, `npm run build`, `./node_modules/.bin/prisma validate` and Playwright fallback screenshots/report for `/events` desktop/mobile light/dark plus active-filter state with no horizontal overflow;
- cost calculator worksheet polish is applied locally: `/tools/cost-calculator` now uses a compact costing sheet with ingredient rows, divider/table rhythm, subtotal strip and a separate result rail that appears before the sheet on mobile; calculation logic, formulas, storage and export behavior are unchanged; Playwright fallback confirms the demo recipe still returns `57,45 ₽` cost, `191,50 ₽` price, `134,05 ₽` gross profit, `70 %` margin and `3,33×` markup across desktop/mobile light/dark with no horizontal overflow and flat worksheet fields; validation is green with `git diff --check`, `npm run lint`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run typecheck`, `npm run build` and Playwright fallback screenshots/report for `/tools/cost-calculator`;
- homepage AI-ish card cleanup is applied locally: the `/` route grid is now a grouped route index with route codes, use cases, status/counts and direct actions; audience media cards are replaced by compact role/use-case rows; social platform cards are replaced by channel rows with purpose, content type, rhythm/moderation note and action; the hero, `Что уже доступно`, calculator band, sponsor profile block, header and footer were kept; validation is green with `git diff --check`, `npm run lint`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run typecheck`, `npm run build` and Playwright fallback screenshots for `/` at desktop/mobile in light/dark with no horizontal overflow;
- dark graphite editorial theme polish is applied locally: dark tokens now separate page, panel and elevated graphite surfaces, warm borders, ivory/muted text and restrained burgundy actions/focus; global dark overrides reduce gray slabs, heavy shadows, blur/glow and bright CTA repetition; public/auth form fields use flat graphite surfaces with thin borders and no glossy gradients, and auth login/register use theme-specific light logo assets; validation is green with Playwright fallback screenshots/checks across `/`, `/articles`, `/education`, `/partners`, `/general-sponsors`, `/vacancies`, `/events`, `/suppliers`, `/contacts`, `/tools/cost-calculator`, `/auth/login`, `/auth/register`, `/auth/activate` at `1440x900` and `390x844`, `git diff --check`, `./node_modules/.bin/prisma validate`, `npm run lint`, `npm test`, `npm run typecheck` and `npm run build`;
- `/suppliers` filter polish is applied locally: supplier rows remain directory rows, `PublicFilters` directory tone now has a branded search header, supplier-index context chips, curated category/city/status labels and active filter summary chips; Playwright fallback covered `/suppliers` desktop/mobile in light/dark plus `verified=true` active-filter state with no horizontal overflow, and validation is green with `git diff --check`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run lint`, `npm run typecheck` and `npm run build`;
- homepage browser-comment cleanup is applied locally: the hero copy now says `партнёрские предложения`, the first-screen audience action panel is removed, the featured knowledge card uses the existing bitmap image `/images/generated/content-service.jpg` when no article cover is available, and social promo cards no longer repeat platform names as both uppercase labels and titles; validation is green with `npm run lint`, `npm run typecheck` and Playwright fallback checks/screenshots for `/` at `1175x813` and `822x813` with no horizontal overflow;
- branded form system implementation is applied locally: shared form primitives now define BARSYNERGY-specific input, textarea, custom select, checkbox, radio, upload, search, field label/hint/error, section and action states; the vacancy response form is the reference public form, while public/auth/business/admin forms inherit the same field contract through shared primitives without changing form actions, names, validation schemas or submission flows;
- project status sync is applied locally: `PROJECT_STATUS.md`, `docs/phase-plan.md`, `docs/project-plan.md`, `docs/features.md`, `docs/deploy.md` and the Obsidian Kanban board now separate completed Phase 1-4 work from planned Phase 5 work, map the CMS-first migrations to their actual migration files and keep the production ingress contract on the current single-node Nginx/TLS path;
- code-review findings are remediated locally: the admin upload same-origin guard now treats configured `APP_URL` as the trusted production origin and only allows request URL fallback for local development origins, `docs/output/` is ignored by both Git and Docker context, and validation is green with `git diff --check`, `npm test`, `npm run lint`, `npm run typecheck` and `npm run build`;
- public background system cleanup is applied locally: square/grid/index-map background layers were removed from the global page, section zones and auth form shell; public sections now use warm ivory, muted beige, light warm gray and graphite bands with subtle burgundy radial accents, and the design tokens/docs describe the no-grid background contract;
- site-wide visible-copy cleanup is applied locally: public pages, shared public application forms, public detail helper copy, auth access screens, business request copy, profile response copy and the admin suppliers list description now use simpler Russian wording; legal consent/policy texts were intentionally not rewritten beyond already-linked consent snippets; local homepage CMS rows were updated to match the code copy; validation is green with `git diff --check`, `./node_modules/.bin/prisma validate`, `npm run lint`, `npm run typecheck`, `npm run build`, DB readback for homepage CMS rows and HTTP/HTML smoke for `/`, `/partners`, `/vacancies` and `/auth/login`;
- homepage visible-copy cleanup is applied locally: CMS default homepage blocks, current local homepage CMS rows, homepage fallback text, homepage section labels, events proposal card and contacts document row now use simpler Russian copy without broad promo phrasing; validation is green with `git diff --check`, `npm run lint`, Prisma local DB readback for homepage CMS rows, `./node_modules/.bin/prisma migrate status` and HTTP/HTML smoke on `/`;
- public platform UX/product-presentation follow-up is applied locally: homepage now starts with three audience entry points, honest launch-state signals and a `Сегодня на платформе` block; public event/vacancy/supplier/article/education/partner/sponsor cards expose clearer metadata and CTAs; event detail pages include program/audience/outcome/terms/partner sections; vacancies explain the moderation flow; suppliers use clearer B2B catalog copy; knowledge has starter editorial/demo cards linked to the cost calculator; the calculator has separate unit selectors, empty/clear/duplicate/copy states, sticky desktop results and mobile summary; `/auth/login` now explains closed access and adds `Запросить доступ`; validation is green with HTTP/HTML smoke for the requested public routes, Playwright screenshots at desktop/tablet/mobile in light/dark, focused Playwright interaction checks, `npm run lint`, `npm run typecheck`, `./node_modules/.bin/prisma validate` and `git diff --check`; `npm run build` compiles successfully but the local process is terminated by the environment during the `next build` TypeScript stage before standalone output is created, so the full build remains a verification gap for this batch;
- CMS-first admin foundation implementation is applied locally: `GeneralSponsor` schema/admin CRUD is connected, Hustle Brew is seeded into DB, homepage and `/general-sponsors` read only published sponsor records, category/city/tag CRUD is connected with `/admin/tags` as the canonical tag route, article tags can be assigned and render publicly only when active, core admin lists have search/status filters, `/admin/homepage` now manages published-only homepage hero, audience cards, social cards, community CTA and calculator teaser, and `docs/homepage-data-source-audit.md` maps homepage blocks to sources, status filters and remaining hardcoded areas; validation is green with `git diff --check`, `prisma validate`, `prisma migrate status/deploy`, `prisma generate`, `npm run lint`, `npm test`, `npm run typecheck`, `npm run build`, targeted HTTP/admin-role/data-visibility smoke;
- public-page browser-comment cleanup is applied locally: shared editorial hero metric strips and the shared `Что внутри` card section no longer render on public pages that use `EditorialPublicPage`, and desktop header nav links no longer add a filled hover background; validation is green with `npm run lint`, `npm run typecheck` and Playwright fallback screenshots/checks for `/about`, `/education`, `/articles`, `/partners`, `/suppliers`, `/contacts` and `/tools/cost-calculator` at `1200x813`;
- focused homepage browser-comment follow-up is applied locally: the mobile menu overlay now keeps the header logo and close control visible in light and dark themes, and the dark `О проекте` CTA block no longer shows the decorative leading icon; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck` and Playwright fallback screenshots at the annotated mobile widths;
- project quality review P1 remediation and stale-data cleanup are applied locally: Docker build context is constrained by `.dockerignore`, homepage CMS data route is explicitly dynamic, business-access activation preparation is admin-only, admin content image upload now requires same-origin `Origin`/`Referer`, stale docs/path artifacts are cleaned or marked historical, and the temporary Playwright `.last-run.json` was removed; validation is green with `git diff --check`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run lint`, `npm run typecheck` and `npm run build`;
- editorial background system follow-up is applied locally: `src/app/globals.css` now uses a warm ivory/deep graphite page base, low-opacity paper grain, no square grid layers and burgundy/graphite radial accents; homepage sections now use explicit hero/ivory/beige/gray/tool/sponsor/social/CTA background zones, with the tool teaser on a graphite band; validation is green with `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback screenshots for `/` at mobile/tablet/desktop widths in light/dark with no horizontal overflow;
- editorial UI consistency follow-up is applied locally for the requested public blocks: `/education` pre-launch request cards now have compact format/audience/status details, homepage Telegram/WhatsApp/Instagram cards use shared editorial `SocialCard` surfaces with only small platform accents, the dark homepage community CTA uses the burgundy token stack instead of coral, vacancy CTA buttons are width-limited through the shared `Button`, and dark-theme accent tokens are retuned away from the coral palette; validation is green with `npm run lint`, `npm run typecheck`, `npm run build` and Playwright fallback screenshots for `/`, `/education` and `/vacancies` at `1440`, `900` and `390` widths in light/dark with no horizontal overflow;
- project quality review implementation wave is applied locally: desktop header login stays visible at normal desktop widths, `/education` format cards open the correct application form type, business draft editing now shows only fields for the fixed draft type with a server-side type-change guard, public/auth/business forms use pending submit buttons, social card contrast is strengthened, S3 download/upload paths reuse a shared client, and SMTP/Telegram notifications now have explicit timeouts; validation is green with `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `./node_modules/.bin/prisma validate`, `git diff --check` and focused Playwright smoke for header overflow, education form routing and contact form submit visibility;
- project quality review batch 1 is applied locally: app request identity no longer trusts spoofable inbound forwarding/provider headers, production Nginx overwrites `X-Forwarded-For` with `$remote_addr`, admin action error formatters now preserve Next.js redirect control-flow, `docs/project-plan.md` matches the current Phase 3/4 runtime schema, Playwright runtime artifacts are ignored by default, and `docs/deploy.md` matches the current single-node ingress contract; specialist re-review closed the code/security/docs findings; validation is green with `npm test`, `npm run lint`, `npm run typecheck` and `npm run build`;
- dark-theme UI consistency follow-up is applied locally on `codex/photo-reference-ui-redesign`: the header now uses separate light/dark logo assets instead of filter inversion, theme toggle/header spacing are tightened for `1280`, `1366` and `1440` widths, dark accent/button/chip/field/card surfaces are retokenized, homepage/sponsor/education/events/contacts/calculator/cookie notice issues from the UI audit are fixed, and forms on `/education` and `/events` now appear only after a selected course/event/proposal action; validation is green with `npm run lint`, `npm run typecheck` and a Playwright pass across `/`, `/education`, `/events`, `/general-sponsors`, `/tools/cost-calculator`, `/contacts`, `/auth/login` at `390x844`, `1280x900`, `1366x768`, `1440x813` in light/dark with reload persistence and no horizontal scroll; the old screenshot folder was removed during release-prep cleanup;
- homepage social cards are restored to the `prod` style on `/`, visible Russian copy received a focused `humanizer-ru` cleanup pass across public/legal/profile/admin-facing surfaces, and a persistent light/dark theme toggle is now available in the desktop header and mobile menu; validation is green locally: `git diff --check`, `npm run lint`, `npm run typecheck`, `npm run build`, and Playwright checks for social links, dark theme, mobile menu theme control and no horizontal overflow;
- photo-reference redesign branch is active after checkpoint commit `7e56434 chore: checkpoint current ui preview state` on `codex/barsynergy-ui-preview`; no push or deploy has been performed;
- photo-reference UI redesign is applied locally across public pages, auth, calculator, profile, business cabinet and admin shell/list/form surfaces: runtime keeps current routes, CMS/public queries, GeneralSponsor/Hustle Brew data, application actions, auth/session logic, storage, notifications and admin permissions;
- visual system is now synced around `Playfair Display + Manrope`, warm off-white backgrounds, burgundy actions/focus, soft beige surfaces, thin dividers, smaller card/button radii and subtle shadows in `src/app/globals.css`, shared UI primitives, `DESIGN.md` and `design-tokens.json`;
- public mockup-structure implementation is applied locally across `/`, `/events`, `/articles`, `/vacancies`, `/suppliers`, `/education`, `/partners`, `/general-sponsors`, `/tools/cost-calculator` and `/contacts`: the pages now follow the supplied layout hierarchy while keeping existing routes, public data flows, form actions and the current UI foundation;
- validation for the photo-reference redesign is green locally: secret scan, `git diff --check`, `npm run lint`, `npm test`, `./node_modules/.bin/prisma validate`, `npm run typecheck`, `npm run build` and Playwright QA passed; Browser Use was unavailable in this session, so Playwright was used as the browser fallback;
- Playwright QA covered `/`, `/education`, `/events`, `/articles`, `/vacancies`, `/suppliers`, `/partners`, `/general-sponsors`, `/contacts`, `/tools/cost-calculator`, `/auth/login`, `/auth/register` at `390x844`, `768x1024`, `1280x900`, `1448x1086`, plus authenticated `/profile`, `/business/cabinet`, `/business/cabinet/requests`, `/admin`, `/admin/applications` and `/admin/articles` with local QA accounts;
- public UI-flow implementation from `docs/agent/ui-flow-research-qa-2026-05-03.md` is applied locally: event list registration now opens the selected event detail form with event title context, supplier and partner detail CTAs pass company/context into contacts, education and partner format cards prefill their request forms, sponsorship packages link to sponsor-specific contact context, the empty knowledge state now keeps two editorial CTAs, and the calculator has clearer zero/partial-input/result hints; Browser Use and Playwright QA confirmed context prefill and no horizontal overflow on the checked public routes;
- legal pages are now filled with project-specific working texts instead of short draft placeholders: `/legal/privacy`, `/legal/personal-data-consent`, `/legal/terms` and `/legal/cookies` describe the current contact, application, auth and business-access flows and still remain pending owner/legal review before production personal-data collection;
- legal operator data is now centralized in env-backed runtime fields so the public legal pages can switch from a legal entity to an individual entrepreneur without another route rewrite; production startup now blocks enabling public personal-data forms until operator name, email, address, INN and registration ID are filled;
- personal-data and confidentiality follow-up is applied locally: legal pages now spell out subjects, data categories, purposes, legal bases, processing actions, retention, employer transfer, processor/hosting caveats and RKN-readiness notes; production startup also requires operator address and explicit readiness flags before public forms can be enabled, public consent checkbox text links to both policy and consent, and a public technical-cookie notice is shown on non-workspace pages;
- personal-data launch checklist is now documented in `docs/personal-data-launch-checklist.md`, and the owner-facing action list is copied into the Obsidian BARSYNERGY folder;
- the design-system stabilization batch is completed locally: runtime font drift is fixed, semantic foundation tokens are expanded, and shared UI primitives now cover fields, checkbox rows, consent blocks, notices, segmented selectors, helper panels, status badges, editorial/public links, reusable list rows and admin CRUD tables;
- article full editing has been moved from the `/admin/articles` table to a dedicated `/admin/articles/[articleId]` screen so long article bodies are not rendered inside the list view;
- public application throttling now has a dedicated cleanup command: `npm run application:cleanup:throttles`.
- Phase 4 business-account MVP is implemented at source level: email/password login, logout, business-access request, admin approval/blocking, guarded `/business` cabinet, editable company profile and business request drafts/submission/tracking.
- after every large code batch or cross-module remediation, a dedicated `QA` code review pass is now required before the slice is treated as stable; the rule is recorded in `AGENTS.md`, `docs/agent-workflow.md` and `docs/audit-workflow.md`;
- the current local build is green again after aligning `next/font/google` subsets with the actual Google font metadata used by `bodyFont` and `displayFont`;
- business cabinet request validation now uses request-type-specific server-side schemas and payload shaping instead of one weak shared schema for all request types;
- admin draft deletion for articles, events, courses, vacancies, suppliers and partners now fails closed when the target draft is missing or already unavailable, instead of returning a false success state;
- public UI polish from browser review is applied: homepage feature illustrations use generated vector compositions instead of framed raster images, education/event cards are wider and shorter, community stats and site-section navigation are denser, the global background uses a softer grain/ambient treatment, and form consent checkboxes/focus states are aligned and neutral.
- homepage social entry cards are now added on `/`: Telegram, WhatsApp and Instagram each have their own promo surface with live external links and responsive layout.
- the homepage now includes the first named general sponsor block: Hustle Brew is presented with a local logo asset, concise supply profile, direct Instagram/WhatsApp links and a reusable data structure for future sponsor additions.
- homepage follow-up polish is applied locally: sponsor branding now uses the owner-provided Hustle Brew image instead of a generated placeholder, social CTA buttons now use `Перейти в ...` copy, social promo cards are denser on medium widths, and the public header switches to desktop navigation from `lg` instead of waiting for `xl`.
- homepage micro-copy follow-up is applied locally: mobile spotlight buttons now use shorter route-specific labels, the sponsor contacts heading is clearer, and sponsor social buttons have looser letter spacing for better readability on small screens.
- browser-tab branding is adjusted locally: the favicon and App Router icon now use the light BARSYNERGY mark so the tab icon stays legible against dark browser chrome.
- public follow-up consistency pass is applied locally across homepage/about/education/events/articles/suppliers: the homepage hero no longer keeps redundant section tags, medium-width social promos are denser, the Hustle Brew block uses a cleaner uncropped image treatment with calmer action spacing, repeated `Перейти к ...` CTA wording is aligned across public entry buttons, education fallback demo cards are removed, and shared public list rows now use one card-style surface without doubled divider lines near pagination.
- homepage spotlight cards are tightened into a denser editorial pattern: desaturated/grain-treated media, controlled featured-material typography, integrated metadata rows, calmer footer CTA blocks and a direct featured-article link replace the looser promo-style card structure.
- the `/general-sponsors` profile showcase is refined into a directory-style partner block: the left column now explains the catalog purpose, while sponsor cards expose city, role, specialization, metadata chips and a clearer partner-profile CTA instead of placeholder-style text panels.
- public homepage redesign batch is now applied locally: `/` has been rebuilt around live CMS-fed education/event/article/vacancy/supplier highlights, a new premium public shell, GSAP-driven narrative sections, a stronger B2B route for partners/sponsors and a shorter hero headline validated again on desktop/mobile after layout changes.
- public consistency batch is now applied locally across the main public screens: repeated public typography, section headers, filters, stat shells, content meta chips and form action rows are normalized around shared primitives; its former font note is superseded by the current runtime `Playfair Display + Manrope` contract in `src/lib/fonts.ts`, `DESIGN.md` and `design-tokens.json`.
- public listing sections that use the shared filter/list pattern are refined locally: the left filter rail is denser and sticky on desktop, embedded filters now support active chips/reset/mobile toggle, shared rows have calmer editorial hover states, and `/vacancies` now renders as a clearer opportunity board with company, format, pay and freshness metadata that can be scanned quickly.
- focused browser-comment stabilization is applied locally on `/vacancies`, `/general-sponsors` and `/`: the top vacancy stat panel is removed, page-position metadata now sits under the list, vacancy rows have a clearer surface against the page background, sponsor showcase cards no longer show the red top stripe or hover motion, homepage audience counters are removed, and the spotlight section heading is shortened to `Актуальное`.
- shared form UI is redesigned across public applications and auth screens: inputs, selects, textareas and checkboxes now use deeper editorial surfaces, stronger neutral focus states, explicit consent blocks and richer card shells with consistent action footers.
- auth, business and specialist-profile screens now sit closer to the same shared shell contract: `PageHeader`, action rows, panel usage, stat blocks and sidebar labels are normalized without changing the underlying account or application logic.
- focused Playwright smoke is now rerun for key public, auth, admin and business routes: route responses, `h1`, shell visibility and horizontal overflow are rechecked, the duplicated desktop `Кабинет` nav item is removed, and the low-contrast vacancies scenario card is fixed.
- admin consistency pass is now applied on the main workspace screens: the global admin header is calmer, key admin sections use one shared intro pattern, and placeholder taxonomy screens no longer fall back to an isolated header style.
- technical explanatory blocks were removed from admin and business screens where possible: phase/status helper paragraphs and service placeholders no longer render as pseudo-content, while forms and management actions remain unchanged.
- public pages and forms were reworded away from internal workflow language: copy no longer leans on admin-phase, moderation, publication-pipeline or placeholder explanations where those texts were not useful user content.
- public public-facing helper sections are trimmed further: featured/related content blocks no longer explain their own layout, while `/auth/login`, `/business/cabinet/requests` and `/general-sponsors` now show action-oriented content without meta-descriptions of the page itself.
- demo content for client-facing screen review is now available through `npm run demo:seed:screens`, and the current local database is already populated with realistic mock vacancies, suppliers, applications, draft content and pending business-access examples for admin, vacancies, suppliers and general-sponsor review.
- auth, business-access and vacancy-request screens were cleaned further: `/auth/login`, `/auth/register`, `/business` and the business/public vacancy request forms now focus on the next user step instead of legal-process, moderation or queue-heavy explanations.
- homepage and auth polish follow-up is now applied locally: the homepage has a fixed scroll-to-top button, a new on-page `О проекте` block linked from the footer, calmer first-screen link hovers, denser one-row social cards, a rebuilt general sponsor card with copyable contacts, and `/auth/login` now has a direct way back to the homepage plus a separate right-side info panel.
- homepage browser-comment follow-up is now applied locally: the `О проекте` block no longer uses decorative chips or metric counters, the right-hand explanation cards now have direct CTA buttons, the `Для кого` section is explicitly titled and its action rows are vertically aligned, the sponsor block no longer duplicates Instagram/WhatsApp buttons or the extra lineup photo, and social cards now use integrated background icons instead of cropped square artwork.
- homepage social cards are refined locally again: Telegram, WhatsApp and Instagram now use dedicated local SVG brand marks as separate right-side background objects inside a shared `SocialCard` component, with calmer gradients, equal card height and safer text/logo separation on desktop and mobile.
- sponsor data is now unified between `/` and `/general-sponsors`: the separate sponsors page no longer shows test showcase entries and instead renders the same real published `GeneralSponsor` records as the homepage.
- security remediation batch is applied locally: login and business-access registration now use persistent per-email/per-IP throttling, unknown-email login performs a dummy bcrypt comparison, upload validation checks file signatures, S3 uploads request AES256 server-side encryption, Nginx overwrites inbound forwarding headers and emits a baseline CSP.
- business-access activation remediation is applied locally: `/auth/register` stays request-only, admin application review can now prepare a one-time `/auth/activate` link, and the business owner sets the first password directly instead of receiving a pre-created password-bearing account.
- trusted ingress remediation is applied locally: production docs and Nginx now use the current single-node TLS/Nginx contract, inbound forwarding headers are overwritten, and request identity prefers `X-Real-IP` before falling back to `X-Forwarded-For`.
- follow-up resilience batch is applied locally: admin content writes now retry cleanly on raced slug conflicts, and business-access invites now have a dedicated cleanup command for expired or old used tokens.
- scheduler maintenance runbook is now documented locally: expired sessions, public application throttles and business-access invites are described as one combined production cleanup job instead of separate scattered notes.
- production scheduler proof is now completed on the real host: `ssh.md` is confirmed as the repo source of truth for access, the app runs from `/opt/barsynergy` under `barsynergy.service`, and `barsynergy-cleanup.timer` now runs hourly with a verified manual pass for session/application cleanup on the current production revision.
- production runtime hotfix is now applied on the real host: `.next/standalone/.next` is rebuilt under the `barsynergy` user so Next can create its runtime cache again, and the deploy contract now includes a stable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` plus a release-specific deployment ID to reduce stale-client Server Action mismatches after deploys.
- production style/runtime hotfix is now applied on the real host: the standalone service was missing copied `public/` and `/_next/static` assets after host-side builds, so CSS and fonts returned `404`; the live host is fixed and repo `npm run build` now syncs those assets into `.next/standalone` automatically.
- standalone deploy guard is now part of the local build gate: after `next build`, the repo now syncs standalone assets and then boots `.next/standalone/server.js` in a smoke check that must return `200` for the homepage, one CSS asset, one font asset and one public asset before the build is considered green.
- public mobile/tunnel interaction hardening is applied locally: decorative homepage overlays no longer capture taps above the hero/header area, the public header sits on a stronger interaction layer, and external tunnel origins are now allowlisted for dev assets and Server Actions so menu/form checks are less likely to fail during ngrok-like mobile review.
- public trust cleanup is applied locally: the root loading screen no longer exposes a visible technical message, public filter fallbacks now use visual skeletons, education and partners got controlled empty states with clearer CTA paths, the homepage hero now routes into broader platform actions instead of a dead education-first CTA, and the contacts form uses a fixed topic selector instead of a free-text field.
- public UX pre-launch follow-up is now applied locally: empty education/articles/partners states are rebuilt as action-led pre-launch screens, shared filters now speak in section-specific language, homepage CTAs and availability proof are more concrete, vacancies now expose separate candidate/employer entry points plus the previously unused public application forms, suppliers and partners have direct company/application paths, sponsors now show tiered entry packages, and the contacts form switches to topic-specific fields instead of one generic message flow.
- separate public UI QA hardening is now applied locally after that follow-up: filter controls have explicit accessible labels and keep their route-specific guidance while active, desktop/mobile navigation and footer links expose visible keyboard focus states, internal pre-launch and package cards use calmer product-facing typography, the oversized footer CTA no longer competes with pages that already end in their own local form, suppliers now keep a visible `Добавить компанию` path even when the catalog is populated, and the vacancy application sidebar uses shorter copy that no longer breaks awkwardly in the narrow supporting column.
- local review/demo content is cleaned for public screens: the garbage published vacancy is removed from the current database, the event demo summaries are normalized, and city options are now taken from the same active database list across public filters and the contact form instead of diverging hardcoded values.
- public detail pages now follow a stronger shared editorial article pattern: articles, events, education, vacancies, suppliers and partners use a centered reference-style header, larger hero image, narrower reading column, utility sidebar and a calmer `read next` block instead of the older promo-like split hero.
- partner/sponsor copy cleanup and browser-comment follow-up are now applied locally: homepage CTA hover states keep readable light text, the public header grid no longer pushes nav/actions out of alignment on medium desktop widths, `/partners` now shows the current general sponsor block directly on the page, the `Hustle Brew` card is rebuilt as a calmer editorial partner profile with compact contact rows, social promo cards no longer let the large logo collide with the right-side divider treatment, and project-local agent rules explicitly fix simple human Russian plus the `humanizer-ru` cleanup principle for user-facing prose.
- mobile menu header follow-up is now applied locally: the burger/close control is one stable `MenuToggle` without a second overlay button, the open menu keeps the same mobile header shell for the logo and toggle, body scroll lock compensates scrollbar width to avoid header shift, and `Escape` plus `aria-expanded`/`aria-controls` continue to work on the shared control.
- UX audit remediation follow-up is now applied locally: Next dev allows `127.0.0.1` for in-app browser HMR, the mobile menu keeps closed links out of focus order, public/internal copy no longer exposes `MVP`/`food cost`/download promises where the action is a request, public forms show one explicit contact-channel group before submit, and business requests show type-specific preparation hints before the user writes details.
- cost calculator UX follow-up is now applied locally: ingredient rows use explicit package size and recipe amount labels, unit selectors for `мл`/`л`/`г`/`кг`/`шт`, unit compatibility validation, `л`→`мл` and `кг`→`г` normalization, correct visible division formulas, compact formula/example help, demo fill, clearer result states, mobile ingredient cards without horizontal overflow and a non-overlapping cookie notice on the calculator page.
- public/login style-alignment follow-up is now applied locally: the repeated footer contact CTA is removed, loaded public/auth routes no longer expose the loading fallback or old partner/sponsor labels in visible text or the browser accessibility tree, homepage now has `Сейчас в BARSYNERGY`, a stronger platform-entry card and a separate cost-calculator teaser, filtered-zero states are separated from true pre-launch empty states, article cards include publication date/read metadata, and mobile login prioritizes the form after the short brand intro.

Phase 0 is implemented as the technical foundation:

- Next.js App Router project;
- TypeScript and Tailwind CSS;
- Prisma with PostgreSQL foundation schema;
- Docker Compose setup;
- env validation;
- base auth and storage services;
- admin shell;
- public route structure;
- project documentation.

## Phase 1 Status

Phase 1 public surface is implemented and smoke-verified:

- home;
- about;
- education;
- events;
- articles;
- vacancies;
- suppliers;
- partners;
- general sponsors;
- contacts;
- legal pages;
- shared header and footer;
- route-level loading, error and not-found states;
- responsive public-page layout patterns;
- editorial design-system foundation;
- separate `/general-sponsors` screen with visible homepage and navigation entry points.
- redesigned live-data homepage with GSAP motion and updated public shell.

Completed Phase 1 validation:

- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `./node_modules/.bin/prisma validate`;
- HTTP smoke for all public routes;
- desktop and mobile homepage screenshot spot check with Playwright;
- desktop/mobile shell safety check confirms the public header/footer stay hidden on `/auth/*`;
- mobile menu open and `Esc` close check.
- focused browser smoke for public, auth, admin and business key routes with updated screenshot review on `/vacancies` and `/admin/articles`.

Phase 1 remaining caveat:

- legal text still needs owner/legal review before collecting personal data.

## Current Runtime Schema

The current Prisma schema includes the foundation models:

- `User`;
- `Session`;
- `Profile`;
- `City`;
- `Category`;
- `Tag`;
- `UploadedFile`.

Phase 2 content models are now present in Prisma and backed by migration `20260427123417_phase2_content_models`:

- `Article`;
- `ArticleTag`;
- `Event`;
- `Course`;
- `Vacancy`;
- `Supplier`;
- `Partner`.

CMS-first sponsor, taxonomy and homepage models are backed by migrations `20260505103000_cms_admin_sponsors_taxonomy` and `20260505123000_homepage_cms_blocks`:

- `GeneralSponsor`;
- `HomepageHero`;
- `HomepageAudienceCard`;
- `HomepageSocialBlock`;
- `HomepageCtaBlock`;
- `HomepageCalculatorTeaser`;
- `CategoryType.SERVICE`;
- `CategoryType.GENERAL`;
- `Tag.isActive`;
- `Tag.sortOrder`;
- content `coverImageAlt` fields.

Phase 3 application models are now present in Prisma and backed by migration `20260428102117_phase3_applications_foundation`:

- `Application`;
- `ApplicationType`;
- `ApplicationStatus`.

Phase 3 public submission throttling is backed by migration `20260428123000_phase3_application_guards`:

- `ApplicationSubmissionThrottle`.

Phase 4 business-account foundation is backed by migration `20260428153000_phase4_business_account_foundation`:

- `BusinessAccount`;
- `BusinessAccountStatus`;
- `UserRole.BUSINESS`;
- `ApplicationType.BUSINESS_ACCOUNT_REQUEST`;
- optional `Application.businessAccountId`.

Phase 4 business request management is backed by migration `20260428170000_phase4_business_request_management`:

- `ApplicationStatus.DRAFT`;
- `Application.businessNotes`.

B2B public request types are backed by migration `20260515120000_business_consulting_application_types`:

- `ApplicationType.BUSINESS_SOLUTION`;
- `ApplicationType.CONSULTING_REQUEST`.

Auth attempt throttling is backed by migration `20260430120000_auth_attempt_throttle`:

- `AuthAttemptThrottle`.

Business-access invite activation is backed by migration `20260430225454_phase4_business_access_invites`:

- `BusinessAccessInvite`.

## Next Planned Work

1. Finish the current local preview-branch checkpoint: review the large dirty tree, split or commit it by coherent scope, then merge through `dev` only after owner approval.
2. Owner should check the Phase 4 business-cabinet flow at `/business/cabinet`: login, profile, requests, admin approval/blocking and business-visible admin notes.
3. Owner should check new public `/business` and `/consulting` request flows before enabling public personal-data forms in production.
4. Production public forms may run temporarily for owner-approved admin intake with `ALLOW_PUBLIC_FORMS_WITH_PENDING_LEGAL_REVIEW=true`; real operator details, legal approval and Roskomnadzor/operator-readiness confirmation remain required follow-up work.
5. Verify the current single-node production ingress on the real host before security sign-off: HTTP to HTTPS redirect, real client IP through `X-Real-IP`, and spoofed forwarding headers ignored.
6. Start Phase 5 filters/search/directory-quality work, including the separate service-specialist catalog, only after the current Phase 1-4/CMS branch is checkpointed and accepted.

## Phase 4 Business Account Implementation Update

Completed on 2026-04-28:

- `BusinessAccount` model and `BusinessAccountStatus` enum added.
- `UserRole.BUSINESS` added for approved business cabinet users.
- `ApplicationType.BUSINESS_ACCOUNT_REQUEST` added and linked to `BusinessAccount` through `Application.businessAccountId`.
- `/auth/login` now performs real email/password login with PostgreSQL sessions and httpOnly cookies.
- `/auth/register` now creates only a pending business-access request and linked admin-review application when public personal-data forms are enabled.
- `/admin/applications/[applicationId]` now lets admins prepare a one-time activation link for a reviewed business-access request.
- `/auth/activate` now lets the business owner set the first password and finish activation from that one-time link.
- `/admin/users` now lists business users and lets admins block access or reopen already prepared accounts.
- `/business/cabinet` is guarded for active business users and lets businesses edit company profile data.
- `/business/cabinet/requests` lets active businesses create request drafts or submit requests for vacancy placement, supplier placement, partner application, corporate training and certificate order.
- `/business/cabinet/requests/[applicationId]` lets businesses view only their own requests, edit drafts, submit drafts for admin review or archive drafts.
- admin application detail now has a business-visible comment field.
- `/auth/login` supports logout redirects and pending/blocked access messages.

Validation completed on 2026-04-29:

- `./node_modules/.bin/prisma format`;
- `./node_modules/.bin/prisma validate`;
- `./node_modules/.bin/prisma generate`;
- `npm run prisma:migrate:deploy`;
- `npm test`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`.

Remaining Phase 4 caveats:

- email-based password reset is deferred until production email is configured;
- business users still cannot publish public content directly;
- candidate personal data remains hidden from business accounts unless a future admin-forwarding view is explicitly implemented after legal/product approval.

## Services Catalog Planning Update

Completed on 2026-04-28:

- owner direction captured: services are a separate module, not part of suppliers;
- public route is planned as `/services`;
- admin route is planned as `/admin/services`;
- new catalog entity is planned as `ServiceSpecialist`;
- public entry into the catalog must start as `Application(type = service_specialist_submission)`;
- publication stays admin-moderated;
- specialist personal cabinet is out of scope for the first version;
- implementation is placed in Phase 5 so it does not interrupt the Phase 4 business-account plan;
- implementation contract is documented in `docs/services-specialists-spec.md`.

## Business Account Planning Update

Completed on 2026-04-28:

- owner decision captured: the first private cabinet is for businesses only;
- candidate, student, community-member and general user profiles are deferred, but remain documented as a later product direction;
- business registration direction is request/application first, admin approval second, login access third;
- business cabinet capabilities are documented separately in `docs/business-account-spec.md`.

## Phase 3 Applications Planning Update

Completed on 2026-04-27:

- Phase 3 mini-spec drafted for the unified `Application` model and public application forms;
- vacancy placement is planned as `vacancy_submission`, where a business sends a request and admin publishes the final `Vacancy`;
- vacancy responses are planned as `vacancy_response`, linked to a published vacancy and reviewed by admin before employer transfer;
- candidate resume data remains private application data in MVP, not a reusable public profile;
- employer forwarding is an admin action and must not happen automatically before review and explicit candidate consent.

## Phase 3 Vacancy Applications Implementation Update

Completed on 2026-04-28:

- `ApplicationType` and `ApplicationStatus` enums added.
- `Application` model added with subject, message, contact fields, city/vacancy/resume relations, consent timestamp/text, UTM fields, forwarding metadata, internal notes and indexes.
- Public `/vacancies` now includes two Phase 3 forms: vacancy placement request and vacancy response to a published vacancy.
- Production rendering of these forms is gated by `APPLICATION_FORMS_ENABLED`; omitted production value disables them by default.
- Public form actions include a honeypot and per-client rate limit backed by `ApplicationSubmissionThrottle`.
- Vacancy placement creates `Application(type = vacancy_submission, status = new)` with consent, UTM capture and the fixed MVP position list: `Бариста`, `Управляющий`, `Менеджер`.
- Vacancy response creates `Application(type = vacancy_response, status = new)` linked only to a published vacancy and can store a private resume file or resume URL.
- Public response form is disabled when no published vacancies exist.
- Admin `/admin/applications` now shows a paginated, filterable queue without exposing full contact data in table rows.
- Admin `/admin/applications/[applicationId]` shows protected application detail, full private fields, payload, consent data, status controls, internal notes and an admin-only resume download endpoint.
- Marking an application as `forwarded_to_employer` is allowed only for consented vacancy responses and records `forwardedAt` and `forwardedById`; moving away from that status clears forwarding metadata.
- Admin can create a draft `Vacancy` from a `vacancy_submission` application; the application is linked to the draft and marked `approved`, while publication stays manual in `/admin/vacancies`.
- Additional public forms now write to `Application` from `/education`, `/events`, `/suppliers`, `/partners`, `/business`, `/consulting` and `/contacts`: `course_application`, `corporate_training_application`, `certificate_order`, `event_application`, `supplier_submission`, `partner_application`, `business_solution`, `consulting_request` and `contact_message`.
- When `SMTP_*` is configured, user confirmation emails are sent after successful public submission. When `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` are configured, admins receive a short Telegram notification without full personal data.
- Public application throttles now have a cleanup command: `npm run application:cleanup:throttles`.
- Local public uploads under `STORAGE_DRIVER=local` are served through `/uploads/...` only when an `UploadedFile` record is public.
- Replaced or failed admin cover uploads are cleaned up when no content record references the uploaded file.
- Temporary browser-smoke data was created and cleaned up.

Validation:

- `./node_modules/.bin/prisma validate`;
- `./node_modules/.bin/prisma migrate deploy`;
- `npm test`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- authenticated HTTP smoke for `/admin/applications`;
- Playwright browser smoke: public vacancy placement form created an application, public vacancy response form created an application, admin detail opened, status changed to `forwarded_to_employer` with forwarding metadata.

Remaining Phase 3 gaps:

- legal text still needs owner/legal review before `APPLICATION_FORMS_ENABLED=true` is allowed in production;
- the live host now runs one hourly cleanup timer, but the current production revision still lacks the business-access invite cleanup script from the newer local remediation batch;
- notification providers still require real production SMTP/Telegram credentials before they can send outside local testing;

## Phase 2 Database Update

Completed on 2026-04-27:

- `ContentStatus` enum added with draft, review, published and archived states.
- Prisma models added for articles, events, courses, vacancies, suppliers and partners.
- Article tags use an explicit join table.
- Content models are related to existing city, category, tag, uploaded file and user records where applicable.
- Public-query indexes were added for status, publish date, city, category, sort order and key filters.

Validation:

- `./node_modules/.bin/prisma validate`;
- `./node_modules/.bin/prisma migrate status`;
- `npm run typecheck`.

## Phase 2 Admin Update

Completed on 2026-04-27:

- first article admin CRUD slice added at `/admin/articles`;
- first event admin CRUD slice added at `/admin/events`;
- first course admin CRUD slice added at `/admin/courses`;
- first vacancy admin CRUD slice added at `/admin/vacancies`;
- first supplier admin CRUD slice added at `/admin/suppliers`;
- first partner admin CRUD slice added at `/admin/partners`;
- admins and moderators can create articles, events, courses, vacancies, suppliers and partners;
- article, event, course, vacancy, supplier and partner lists show latest records with taxonomy, status and updater;
- publish and archive actions update publication status dates;
- deleting is limited to non-published articles, events, courses, vacancies, suppliers and partners.
- QA fixes keep existing `publishedAt` when archiving, validate article category/city references server-side and generate a unique slug when needed.
- shared admin content utilities now centralize status labels, slug handling and publication date transitions.

## Phase 2 Admin UX Follow-up Update

Completed on 2026-04-27:

- admin article, event, course, vacancy, supplier and partner lists now use page-based pagination instead of fixed `take: 50` lists;
- each Phase 2 content section now has an inline edit form for existing records;
- create and edit forms now include a public cover image upload slot wired through `StorageService` and `UploadedFile.visibility = public`;
- admin actions now redirect back with success/error messages instead of surfacing raw validation exceptions;
- upload handling is shared between the form actions and `/admin/uploads/content-image`;
- `.gitignore` now ignores only root runtime `/uploads`, so `src/app/admin/uploads/content-image/route.ts` can be tracked.

Current local adjustment on 2026-04-28:

- article list rows now link to `/admin/articles/[articleId]` for full editing so long article bodies do not bloat the list table render;
- article body validation now caps input at `20_000` characters on create and update to match the admin form constraint.

Validation:

- `./node_modules/.bin/prisma validate`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- HTTP smoke: unauthenticated `POST /admin/uploads/content-image` returned JSON `401`.

## Phase 2 Public Read / Upload Update

Completed on 2026-04-27:

- public pages for articles, events, education, vacancies, suppliers and partners now read only `published` records;
- public lists use pagination with a default page size of 12 and maximum page size of 24;
- public read helpers support basic query/filter parameters for search, taxonomy and entity-specific fields;
- public list pagination preserves active query/filter parameters;
- empty public lists render without throwing;
- public content images are resolved only from `UploadedFile.visibility = public`;
- `/admin/uploads/content-image` accepts authenticated admin/moderator public image uploads through `StorageService`;
- upload route allowlists JPEG, PNG, WebP and AVIF and enforces `MAX_UPLOAD_FILE_SIZE_BYTES`.
- unauthenticated upload requests return JSON `401`, and forbidden roles return JSON `403`.

## Phase 2 Review Update

Completed on 2026-04-27:

- schema, admin CRUD slices, public reads, upload boundary, docs and Kanban were reviewed against `docs/phase-2-content-admin-spec.md`;
- public read pagination now preserves active query/filter parameters;
- upload API auth boundary now returns JSON `401/403` instead of an HTML redirect for the upload endpoint;
- follow-up gaps were implemented at source level: edit forms, image upload slots, admin list pagination and admin action validation/error states.

Validation:

- `./node_modules/.bin/prisma validate`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- HTTP smoke: `/articles`, `/events`, `/education`, `/vacancies`, `/suppliers`, `/partners`, `/articles?q=test&page=2` returned `200`;
- HTTP smoke: unauthenticated `POST /admin/uploads/content-image` returned JSON `401`.

## Phase 2 Final QA Update

Completed on 2026-04-27:

- removed runtime warnings from Phase 2 admin forms by letting React Server Actions control form encoding automatically;
- added the Next.js `data-scroll-behavior="smooth"` root attribute required by the existing global smooth-scroll CSS;
- authenticated admin browser smoke created and cleaned up one article, event, course, vacancy, supplier and partner through real admin forms;
- article cover upload through the admin form created a public `UploadedFile` and was cleaned up after verification;
- publish/archive smoke confirmed a published article appears on `/articles` and disappears from the public list after archiving;
- temporary smoke users, sessions, content records and upload files were cleaned up.

Validation:

- `./node_modules/.bin/prisma validate`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- HTTP smoke: `/`, `/articles`, `/events`, `/education`, `/vacancies`, `/suppliers`, `/partners`, `/articles?q=test&page=2` returned `200`;
- unauthenticated `POST /admin/uploads/content-image` returned JSON `401`;
- authenticated admin pages `/admin`, `/admin/articles`, `/admin/events`, `/admin/courses`, `/admin/vacancies`, `/admin/suppliers`, `/admin/partners` returned `200`;
- authenticated `POST /admin/uploads/content-image` accepted PNG and returned a public file reference;
- Playwright admin form smoke passed for all Phase 2 content sections;
- Playwright publish/archive smoke passed for public article visibility.

## Agent Workflow Update

Completed on 2026-04-27:

- project-local agent instructions now require a documentation and Kanban sync decision for every meaningful change;
- `docs/agent-workflow.md` and `docs/kanban-sync.md` now require either updating the relevant docs/board or explicitly stating why no update was needed.

Validation:

- `./node_modules/.bin/prisma validate`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`.

## Architecture Readiness Update

Completed on 2026-04-26:

- Phase 2 content/admin mini-spec added.
- Admin section permission map added.
- Admin pages now require section-level access.
- Storage public URL contract now accepts only public file references.
- Uploads have a fixed maximum file size before real upload routes are exposed.

Validation:

- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `./node_modules/.bin/prisma validate`;
- unauthenticated `/admin/users` redirect smoke.

## QA / Review Update

Completed on 2026-04-26:

- admin guard, section permissions, storage path safety and session cleanup were reviewed against `docs/remediation-plan.md`;
- public visual system was checked on production preview with desktop and mobile screenshots for home, about, education, events, articles, vacancies, suppliers, partners and contacts;
- README and docs were compared with `package.json`, Prisma schema, env examples, Docker Compose and Nginx config.

Validation:

- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `./node_modules/.bin/prisma validate`;
- `npm run session:cleanup:expired`;
- HTTP smoke for public routes;
- unauthenticated `/admin/users` redirect returned `307` to `/auth/login`;
- Playwright screenshot QA on `http://127.0.0.1:3002` with no horizontal overflow and no public `Phase` / `MVP` / `placeholder` text.

## Documentation / Kanban Sync Update

Completed on 2026-04-27:

- project docs, Phase 2 mini-spec, remediation plan and Obsidian Kanban were compared with current source files;
- Phase 2 database models are now implemented, so admin CRUD is the next implementation focus;
- admin section guards, storage boundary changes, upload size cap and session cleanup command are present in source and documented as completed safeguards;
- remaining blockers are now narrowed to trusted edge verification, legal review and future payment decision; the production cleanup timer is configured on the live host.

## Known Blockers

- Production TLS ownership is not confirmed.
- The live host timer is configured, but the current production revision still needs the next release before business-access invite cleanup can run there.
- Legal texts need owner/legal review before collecting personal data.
- Online payments are out of MVP scope and need a separate legal/accounting decision.
