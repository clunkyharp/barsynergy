# BARSYNERGY Project Status

Last updated: 2026-05-27

## Current Branch

- Active branch: `feature/stabilization-remediation`
- Production branch: `prod`
- Current work mode: `IMPLEMENTATION`

## Current Phase

Phase 1-4 MVP foundation is implemented at source level:

- Phase 1 public website MVP is implemented;
- Phase 2 content/admin CMS work is implemented for the current MVP contract;
- Phase 3 unified `Application` flows and public form handling are implemented;
- Phase 4 auth and first business account cabinet are implemented;
- public `/business` and `/consulting` request pages are implemented;
- Phase 5 service-specialist catalog, filters/search/directory-quality work remains planned and should not start until the stabilization queue in `docs/remediation-plan.md` is closed or explicitly deferred by the owner.

Public personal-data forms remain disabled by default in production until `APPLICATION_FORMS_ENABLED=true` is explicitly approved after legal/operator readiness checks.

## Current Stabilization Batch

The current branch is a pre-Phase-5 stabilization branch. The previous dirty `dev` tree was checkpointed before this work as `5f42e91 Checkpoint UI QA remediation`; the already-open stabilization dirty state was separately checkpointed as `e134fd3 chore: checkpoint stabilization remediation` before the remaining remediation tasks started.

Implemented in this branch so far:

- typed `Application.payload` contract with Zod parse/build helpers and migrated public/admin/business readers and writers;
- same-origin protection helper for server actions, applied to high-risk public, auth, admin and business mutations with a source test;
- notification outbox schema, migration, processor, immediate post-commit dispatch and `npm run notifications:retry`;
- admin application notification attempt status on the application detail page;
- split admin application server actions into status, notes, publication and business-access files while keeping `src/app/admin/applications/actions.ts` as the facade;
- common public application submission helper, migrated for suppliers, partners, events, education, business, consulting, contacts and vacancy placement; vacancy response stays specialized because it owns private resume upload cleanup;
- mechanical CSS split into `src/app/styles/*` with `src/app/globals.css` kept as the import facade;
- direct dependencies pinned to exact currently resolved versions;
- CSP `frame-ancestors` changed to `'none'`;
- scheduler runbook updated with notification retry;
- cost calculator split into a thin client shell plus state hook, formatting helpers, ingredient editor and result rail modules without changing formulas or visible values;
- public content service split into domain query modules behind the existing `src/lib/public/content.ts` facade;
- shared admin content lifecycle helper added for repeated status update and draft delete logic across content entities;
- Playwright/axe keyboard/form coverage added for the custom Select and admin Dropdown primitives;
- focused browser QA completed for public smoke, public accessibility sweep, authenticated admin routes, UI primitives and a screenshot sweep of the key public/admin surfaces.

Validation so far:

- `npm run lint` passed;
- CSS parse for `src/app/**/*.css` passed with 8 files;
- `npm test` passed with 122/122 tests;
- `./node_modules/.bin/prisma validate` passed;
- `git diff --check` passed;
- direct `./node_modules/.bin/tsc --noEmit` passed after the application/action refactors;
- `npm run typecheck` completed but still printed the local Next/SWC code-signature warning during `next typegen`;
- `npm audit signatures` and `npm audit --omit=dev` passed;
- full `npm audit --audit-level=low` reports one moderate dev-only `brace-expansion` advisory under `typescript-eslint`;
- Playwright public smoke passed 1/1;
- Playwright public accessibility sweep passed 28/28;
- Playwright authenticated admin QA passed 23/23;
- Playwright UI primitives passed 2/2;
- focused Playwright screenshot sweep passed for home, suppliers, contacts form, calculator desktop/mobile, admin applications desktop and admin mobile fallback, and temporary screenshots/reports were removed;
- `npm run build` is blocked locally by the known Next/SWC darwin-arm64 code-signature Team ID mismatch after successful `prisma generate`.

Still open in this stabilization queue:

- confirmation that the production scheduler is configured for session cleanup and notification retry before launch;
- owner decision on whether mobile admin read-only/actions is required as a separate product task;
- clean production build in an environment without the local SWC code-signature blocker before merge.

## Previous Local Batch (Historical)

Code/browser QA remediation has been run locally on `dev` and is ready for the requested release checkpoint:

- Figma admin UI-only transfer follow-up is applied locally: the admin shell now uses the recorded 272px dark sidebar, 56px flat topbar, light content background and compact page intro; sidebar now has separate expanded/collapsed desktop states with an edge toggle, icon navigation and persisted local preference; admin form fields, sticky actions, inline edit rows, confirm dialogs, toast shell and table empty/no-results states follow the recorded `13 — Admin Screens` component contract, while admin data, queries, roles, auth, routes, server actions, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment homepage digital-solutions heading copy micro-fix is applied locally: the headline now says `Сайты, боты и автоматизация для бизнеса` instead of `для барных проектов`, while surrounding copy, links, routes, data, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment homepage current-list typography micro-fix is applied locally: support-card titles in the `Актуальное` block now use a safer serif line-height and balanced wrapping to prevent stacked lines from touching on mobile, while links, copy, data, routes, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment homepage role-router arrow micro-fix is applied locally: role-router rows on mobile now keep the arrow affordance as a trailing right-side control instead of dropping it below the text, while links, routes, copy, data, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment cost calculator mobile row-summary micro-fix is applied locally: mobile ingredient cards now show the row number as plain accent text without a square badge and make the row cost more prominent, while ingredient inputs, row actions, formulas, validation, routes, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment cost calculator ingredient-list micro-fix is applied locally: the mobile ingredient list no longer paints the outer list/card as a highlighted surface, while individual controls, row actions, formulas, validation, routes, Prisma schema, dependencies and production env values remain unchanged;
- browser-comment mobile header theme-toggle micro-fix is applied locally: public mobile header now exposes the existing compact theme switch next to the menu button, keeping the current theme persistence, navigation behavior, routes, Prisma schema, dependencies and production env values unchanged;
- browser-comment cost calculator dark contrast micro-fix is applied locally: the selected pricing-mode card in `/tools/cost-calculator` now uses a high-contrast dark-theme text pair while keeping accent meaning on border/state surfaces; calculator formulas, inputs, route behavior, Prisma schema, dependencies and production env values were kept unchanged;
- browser-comment cost calculator target-share micro-fix is applied locally: `/tools/cost-calculator` now keeps one editable control for `Доля себестоимости` by removing the duplicate target-share range slider; calculator formulas, validation, route behavior, Prisma schema, dependencies and production env values were kept unchanged;
- browser-comment cost calculator formula alignment micro-fix was superseded by the formula deduplication micro-fix: the separate result formula row is no longer part of `/tools/cost-calculator`;
- browser-comment cost calculator copy-button contrast micro-fix is applied locally: the result copy CTA in `/tools/cost-calculator` now uses a local dark-theme contrast pair inside the calculator sheet, keeping the button role, copy action, formulas, validation, route behavior, Prisma schema, dependencies and production env values unchanged;
- browser-comment cost calculator formula deduplication micro-fix is applied locally: the result card in `/tools/cost-calculator` no longer repeats the formula row, while the existing formula-help section and copy action remain available; calculator formulas, validation, route behavior, Prisma schema, dependencies and production env values were kept unchanged;
- modern-web-guidance UI hardening batch is applied locally: shared form feedback now exposes structured live error/success announcements, public filters use the native `<search>` landmark, live filter status, explicit labels and mobile search keyboard hints, touch devices get 48px/16px filter controls, and lower homepage sections use progressive `content-visibility: auto` with intrinsic size placeholders; routes, data fetching, server actions, Prisma schema, dependencies and production env values were kept unchanged;
- homepage hero search focus micro-fix is applied locally: clicking the first-screen search input no longer shows the global red focus outline, while the form keeps a calmer focused bottom border; search action, copy, route behavior, data fetching, Prisma schema and production env values were kept unchanged;
- owner-selected visual direction follow-up is applied locally: the runtime font pair is now `Noto Serif Display + Noto Sans`, the homepage hero follows the selected search-over-photo variant with quick links, the previous product-purpose H1 text is restored, and the hero photo is replaced with a local high-resolution Unsplash coffee-bar asset; routes, data model, forms and admin behavior were kept unchanged;
- owner-selected contact form follow-up is applied locally: `/contacts` now uses the selected two-column contact pattern with channel cards on the left and the existing public contact form opened on the right; server action, field names, consent, UTM, honeypot, Prisma schema, routes outside `/contacts` and production env values were kept unchanged;
- owner-selected detail page follow-up is applied locally: the shared article/event/course/vacancy/supplier/partner detail shell now follows the selected split dark hero, media panel, facts/content/action layout and controlled hero title wrapping while reusing existing `Panel`, `MetaChip`, `Button`, typography and route components; data fetching, slugs, forms, server actions, Prisma schema and production env values were kept unchanged;
- owner-selected catalog/filter follow-up is applied locally: `/events`, suppliers and vacancies now use the selected sidebar-filter plus right-list-toolbar structure, while keeping existing event cards and `EditorialListRow`-based supplier/vacancy cards; data fetching, filters, routes, server actions, Prisma schema, admin behavior and production env values were kept unchanged;
- motion smoothing follow-up is applied locally: shared motion tokens now drive common durations/easing, and buttons, cards, filters, header/nav, mobile menu, dropdown/dialog shells, public list rows, media hover states, contact/sponsor rows, tabs, toggles and admin action menu controls use smoother tokenized transitions with reduced-motion fallbacks; routes, data fetching, server actions, Prisma schema, dependencies and production env values were kept unchanged;
- audit-plan follow-up batch is applied at code/test/docs level: `/` now uses a product-purpose H1, keeps `BARSYNERGY` as the brand label, adds direct first-screen actions and a real bar-industry image; `/events` separates true upcoming-empty, archive-empty and filtered-zero states with next-step actions; supplier rows show contact method metadata and a smaller no-logo fallback; supplier application copy says logo/photo is needed before publication; shared field error styling no longer adds a red outer glow; routes, server actions, Prisma schema and production env values were kept unchanged;
- audit-plan form/supplier stabilization follow-up is applied at code/docs level: public forms using `public-form-shell` now add adjacent validation text after blur or submit without showing error on focus, required contact/message/consent errors are visible next to the field, checkbox/radio invalid states no longer use red glow, and supplier detail facts use the explicit `География` / `Контакты` labels above the main profile text; routes, server actions, Prisma schema and production env values were kept unchanged;
- UX/UI audit remediation batch is applied locally: `/tools/cost-calculator` no longer mixes a light worksheet panel with dark-theme text tokens, calculator result badges/metric cards use semantic theme tokens, calculator mode controls/range input/ingredient action buttons and footer links now meet the 40-44px interaction target used in this batch, homepage role routing now uses editorial rows instead of a card grid, education format cards use theme-safe surface/accent tokens, and business/consulting/partner navigation-choice blocks can use the shared row presentation instead of repeated card tiles; formulas, routes, server actions, Prisma schema, auth, admin permissions and production env values were kept unchanged;
- accessibility QA tooling dependency is added: `axe-core@4.11.4` is pinned as an exact dev dependency for future Playwright/browser accessibility smoke scripts, installed with npm and `--ignore-scripts`; `lighthouse` and `@axe-core/playwright` were not added because they are not required for the current remediation checks and would add broader dependency/runtime surface;
- direct Playwright project workflow is configured: `@playwright/test@1.60.0` is pinned as an exact dev dependency, Chromium for Playwright `1.60.0` is installed in the local Playwright cache, `playwright.config.ts` starts Next dev through `webServer` on `127.0.0.1:3100` and runs with `workers: 1` for stable Next dev route compilation in this workspace, npm scripts now expose `npm run qa:browser`, `npm run playwright`, `npm run playwright:ui`, `npm run playwright:install` and `npm run playwright:report`, and `tests/e2e/public-smoke.spec.ts` verifies `/tools/cost-calculator` render plus critical axe violations without custom Chrome executable fallbacks;
- admin mobile fallback batch is applied at layout level: protected admin routes now show a clear `Нужен широкий экран` state below `md`, the working admin shell is available from 768px upward, and a static regression test keeps the mobile unsupported contract in place;
- shared Dropdown/Menu primitive batch is applied at code level: `src/components/ui/dropdown-menu.tsx` now owns portal rendering, overlay positioning, outside-click dismissal, Escape handling and first-item focus for menu overlays, while `AdminActionMenu` keeps its existing public API and admin-specific item/confirm styling by composing the shared primitive;
- UI remediation closeout batch is applied at code/docs level: `AdminActionMenuButton` now composes the shared `Dialog` confirm primitive, `ToastProvider` is installed in the root app shell, `FileUpload` supports adjacent error text with `aria-invalid`/`aria-describedby` and no glow styling, and status docs no longer list already-closed remediation work as open;
- live Figma upload states slice is applied at code level: shared `FileUpload` now supports private/public notice text, selected-file success, adjacent error, submit-pending upload visuals and state icons; admin cover image upload and public vacancy resume upload consume those states while routes, actions, storage API, authenticated upload flow, CMS data, Prisma and seed remain unchanged;
- live Figma auth/cabinet login slice is applied at code level: public `/auth/login` keeps only participant/business role cards, adds explicit role-card state hooks, hardens 320px layout, submit loading, invalid/role-mismatch feedback and request-sent notice, while auth actions, cookies, redirects, admin/service roles, Prisma, seed and business cabinet data remain unchanged;
- live Figma public detail hardening slice is applied at code level: shared article/event/course/vacancy/supplier/partner detail shell now exposes `data-detail-kind`, type-specific body labels, type-specific section cards, and 320px overflow hardening; article/course/vacancy/supplier/partner routes now pass existing `sections` into the shared template while queries, slugs, data fetching, CTA targets, Prisma and seed remain unchanged;
- live Figma general sponsor card hardening slice is applied at code level: `GeneralSponsorCard` now exposes `data-sponsor-variant` and `data-sponsor-state`, has hover/focus states, long-content wrapping, compact mobile behavior and source-level archived styling, while sponsor data, public queries, routes, CMS logic, Prisma and seed remain unchanged;
- public route-by-route accessibility sweep is added to project Playwright: `tests/e2e/public-accessibility-sweep.spec.ts` covers 14 unauthenticated public routes at `1280x900` and `390x844`, checks successful render, no horizontal overflow, visible keyboard focus movement across Tab stops, no page errors, no critical `axe-core` violations, and no serious `color-contrast` violations on every covered public route;
- authenticated admin route/upload QA is added to project Playwright: `tests/e2e/admin-authenticated-qa.spec.ts` creates a temporary local admin session, checks 21 admin routes at `1280x900` for authenticated render, desktop shell, no horizontal overflow and visible Tab focus movement, verifies the mobile admin wide-screen fallback at `390x844`, and covers both successful image upload and rejected invalid upload with cleanup of temporary uploaded records/files;
- release-checkpoint QA cleanup is applied locally: stale source-level expectations in `tests/home-feature-card-density.test.mjs` and `tests/public-cta-copy.test.mjs` were refreshed for the current event empty-state, public filter and contact form contracts; public contact-channel fieldsets no longer use invalid `aria-required` on `fieldset`; light-theme placeholder contrast was raised for public select controls;
- Figma consistency F6 no-logo fallback is applied at code level: sponsor, supplier and partner public cards no longer use random large initials as the main missing-logo state; sponsor fallback now shows entity type, `Без логотипа` and sponsor status, while directory supplier/partner fallback keeps the shared type/no-logo/status pattern; admin publication warnings remain out of scope for a separate admin batch; no Prisma schema, migrations, package changes or production env values were changed;
- Figma consistency F5 calculator CTA sync is closed through the product/runtime contract: `/tools/cost-calculator` keeps the copy-only result action `Скопировать результат`, docs now state that `Сохранить расчёт` must not be used until a real save/export flow exists, and Playwright verified the empty disabled state, copy success label and clipboard text; no runtime calculator formula, Prisma schema, migrations, package changes or production env values were changed;
- Figma consistency F4 mobile-menu modal contract is applied at code level: the mobile public menu now uses the shared focus-trap helper, moves initial keyboard focus into the dialog, keeps `Tab` and `Shift+Tab` inside the menu, closes with `Escape`, returns focus to the menu trigger, and labels the modal dialog with a hidden heading; no Prisma schema, migrations, package changes or production env values were changed;
- independent UI/UX remediation Batch 4 is applied at code level: public request disclosures and public form shell headers now support explicit `h2`/`h3` levels, `/contacts?topic=...#contact-form` opens the contact form with an `h2` before section `h3` headings, mobile/header/filter controls were normalized to 44px targets where this batch found smaller controls, and the accessibility smoke now covers heading order, hash focus, visible control names, keyboard interaction for custom selects, target sizes and spot contrast checks; no Prisma schema, migrations, package changes or production env values were changed;
- independent UI/UX remediation Batch 3 is applied at code level: `/education` format selection now uses the shared program matrix instead of image-heavy equal cards, supplier prelaunch categories render as directory-like rows rather than generic cards, the cookie notice is lighter with `role="region"`, compact copy and 44px controls, public footer/legal copy no longer uses `ПДн`, contact disclosure uses `Написать команде`, and B2B/consulting/partner disclosure CTAs use `Открыть форму заявки`; no Prisma schema, migrations, package changes or production env values were changed;
- independent UI/UX remediation Batch 2 is applied at code level: desktop public navigation now uses the approved primary set without `/about`, the `Ещё` dropdown shows the active business/contact section label and exposes `aria-current`, mobile navigation is grouped into `Найти`, `Разместить / обсудить` and `Команда` with a separate `Написать команде` action and active states, directory rows no longer show the secondary `Контакты внутри` CTA, and supplier/partner rows share the neutral `Без логотипа` fallback plus status/date metadata; no Prisma schema, migrations, package changes or production env values were changed;
- independent UI/UX remediation Batch 1 is applied at code level: `/events` now defaults to upcoming events, `period=past` renders archived events without a signup CTA, event detail pages hide registration for past events, public catalog/form heroes are shorter on events, suppliers, vacancies, education, contacts and sponsorship pages, and `/contacts?topic=...#contact-form` opens the contact form directly with the topic selected; no Prisma schema, migrations, package changes or production env values were changed;
- Figma-only remediation is no longer used as proof for runtime behavior;
- FDR-P1-22 remains verified and must not be reopened without new evidence;
- FDR-P2-06 is closed through the code path: admin status UI uses the shared `StatusBadge` component and static tests verify admin usage;
- `/auth/login` is aligned toward the clean auth v1 Figma state board for public users: participant/business remain the only public role cards, staff access stays on `/admin/login`, anonymous `/admin` redirects there, and mobile 320px/state smoke is now covered;
- calculator formula logic is extracted and covered by unit tests;
- calculator Figma transfer has started: `CostCalculatorClient` is split into internal worksheet/result components, and the state/token contract is documented in `docs/cost-calculator-figma-contract.md`;
- Figma-to-development transfer rules are documented in `docs/figma-to-development-plan.md`: design language can move into code, but data, routes, header, footer, logo and Figma icons stay out of scope unless separately approved;
- live Figma runtime transfer map is documented in `docs/figma-runtime-transfer-map.md`; the current first slice uses live Figma Console MCP node `40:13464` for surface/card/chip taxonomy and does not use local Figma exports as the source;
- cookie notice has a real settings interaction;
- mobile public menu has a focused Figma-alignment follow-up: the open state now uses grouped text navigation with thin dividers and a compact contact action while preserving the existing mobile nav item data;
- admin action menu and local confirm dialogs have targeted keyboard/focus fixes;
- code-side design-system primitive gap is closed for the current runtime scope: `Dialog`, `DropdownMenu`, `ToastProvider`/`useToast`, `Tabs`, `Toggle`, `Switch`, radio/checkbox fields and `FileUpload` exist as shared UI primitives on existing runtime tokens; `Dialog size="confirm"` is wired into admin action confirms, `ToastProvider` is available from root layout, `FileUpload` covers the recorded Figma upload states, and `Tabs`/`Toggle`/`Switch` have no matching source components in live Figma search;
- Figma UI/layout transfer batch is applied at code level: shared public card/list surfaces, public label/meta/action chips and admin table/action-menu shells now use tokenized Figma-style surface roles while keeping header, footer, login, forms, routes, data, API and Prisma schema unchanged;
- live Figma Surface/Card Taxonomy slice is applied at code level: `Card`, `Panel`, `public-card-shell`, public list-row shell and `MetaChip` now use the Figma radius/border/no-random-shadow/pill metadata pattern from node `40:13464` while keeping header, footer, logo, icons, routes, data, API and Prisma schema unchanged;
- live Figma calculator component slice is applied at code level: `/tools/cost-calculator` now uses the live Figma Console MCP calculator panel/input/radio/slider/result-card sizing and state roles from nodes `1:6266`, `1:6302`, `1:6330`, `1:6391` and `1:6445`, while keeping calculator formulas, current fields, route, data, header, footer, logo, icons, Prisma and API unchanged;
- live Figma public forms/filter slice is applied at code level: public application/contact forms now use scoped `public-form-shell` field cards from node `1:6116`, `PublicFilters` uses filter panel/control roles from node `1:3112`, and shared list empty states use the adjacent missing-state pattern from `25:6740`; form actions, input names, validation, routes, data, header, footer, logo, icons, Prisma and API were kept;
- live Figma public contact feedback slice is applied at code level: public form result states now use `PublicSubmissionFeedback` from node `20:10595`, and public/contact form shells are refined against node `20:10670` with 14px outer radius, no shadow, 10px field cards and graphite focus; form actions, input names, validation, routes, data, header, footer, logo, icons, Prisma and API were kept;
- live Figma education card slice is applied at code level: `/education` format/service cards now use live Figma `Component / Card` node `1:6190` and `Badge / Label` node `13:8123` geometry with local education images; current `educationFormats`, routes, contact-form links, filters, CMS content, header, footer, logo, Figma icons, Prisma and API were kept;
- live Figma home sponsor card slice is applied at code level: homepage sponsor cards now use `GeneralSponsorCard variant="home"` from live Figma node `55:1042`, with home-only dark shell/logo-safe-area/benefit/chip/CTA roles and no full phone/social contact blocks; `/general-sponsors` keeps the full contact variant, and current sponsor data, logoSrc from DB, routes, header, footer, Figma logos/icons, Prisma and API were kept; hover/focus, long content, archived-state hooks and compact mobile hardening are now covered;
- live Figma admin table/status slice is applied at code level: shared admin table shells now use the live Figma data-table density from component `22:11416`, and shared admin status badges use the Figma pill geometry/color groups from component `22:11281`; real row content, actions, routes, data, header, footer, logo, icons, Prisma and API were kept;
- homepage CTA/FAQ adaptation is applied at code level: `/` now has a lower two-column CTA plus FAQ accordion using the existing BARSYNERGY typography, surfaces, burgundy/graphite tokens and `lucide-react` chevrons; the standalone Inter/Vite/Tailwind prompt was adapted to the current Next.js project instead of adding a new font or changing the global style direction;
- P0 product-clarity batch is applied at code level: `/` now starts with a platform value proposition, two primary actions, a visual metric card and four role-router cards; desktop navigation uses the approved primary set plus `Ещё` dropdown, mobile navigation uses grouped sections, contact errors render inside the form panel, and `/consulting` no longer exposes service/handoff wording;
- public visible copy humanization batch is applied at code level: key public hero texts, route cards, empty states, form intros, form hints, auth role copy and success messages were rewritten toward short direct Russian copy using `humanizer-ru` and BaristaSchool as tone reference; legal consent text, field names, route/data contracts, admin UI and business logic were kept out of scope;
- `/about` content rebuild is applied at code level: the page now has the requested hero, project story, pilot metrics, directions, audience roles, team functions, expert areas, work process, partner categories, regional context and final CTA; no schema, routes outside `/about`, forms or business logic were changed;
- public detail templates are aligned with the Figma `25:5692` detail board at code level: article, event, education, vacancy, supplier and partner detail routes use the shared split hero, media panel, fact card, content column, action/sidebar structure and type-specific section blocks;
- the `references/**` lint gap is fixed through a global ESLint ignore because `references/` is design/moodboard material, not production code.

No Prisma schema, migrations or production env values are in scope for this batch.

Validation completed for this QA/code batch:

- `git diff --check` passed after the current docs, calculator UI fixes and admin UI-only shell alignment.
- `npm run lint` passed with Homebrew `npm`.
- `npm test` passed with 116/116 tests after refreshing the admin mobile-shell source expectation.
- `npm run typecheck` still hits the local Next/SWC code-signature blocker during `next typegen`; direct `tsc --noEmit` passed after the admin UI patch.
- Browser QA used Playwright without saving screenshots. The existing `127.0.0.1:3001` server confirmed the current admin sidebar CSS: expanded width `272px`, collapsed width `84px`, edge toggle crossing the sidebar border, hidden collapsed labels and no horizontal overflow at `1280x900` and `768x900`. A fresh dev server on `127.0.0.1:3010` still could not be used because Next failed on the same SWC code-signature error.
- Playwright DOM/metric checks covered `/tools/cost-calculator#calculator` at `582x814` in dark theme through `next dev --webpack -p 3001`: the result card no longer repeats the formula row, the copy CTA remains visible, and the copy-button text/background contrast measured `9.49:1`.

Validation gap:

- Fresh `next dev` on a new port is blocked by the Next/SWC code-signature error, but the already-running `127.0.0.1:3001` server was usable for current authenticated admin sidebar QA.
- Figma app connector/Desktop Bridge currently requires reauthentication, so the admin UI-only patch used the already recorded live Figma inventory for admin nodes `22:10907`, `22:11416`, `22:11442`, `22:11451`, `22:11460`, `22:11483`, `39:13203` plus the user-provided sidebar toggle reference for node `24:1875`.
- The latest admin sidebar slice grouped the runtime sidebar by the recorded Figma sections, kept demo counters out of scope, and passed targeted ESLint, direct `tsc --noEmit`, focused `git diff --check`, plus a Playwright runtime-CSS fixture for expanded/collapsed widths and contrast. Fresh authenticated QA is currently blocked inside Codex Node by the Prisma native engine code-signature Team ID mismatch.
- MemPalace project refresh remains blocked because `.npmrc` looks sensitive and is not ignored.
- Built-in browser/browser-use was unavailable in the latest remediation batch, so browser verification used Playwright fallback.
- DB-backed public route visual rechecks remain environment-dependent when local PostgreSQL at `localhost:55432` is unavailable and Docker Desktop is not running.

## Recent Verified State

- `dev` and `prod` currently point to `f4f49a5 Fix public header navigation spacing` locally before the 2026-05-26 release checkpoint commit.
- Production deployment for merge `da182de` was completed on 2026-05-17.
- Previous final public/admin maturity QA reported green validation with `git diff --check`, `npm run lint`, `./node_modules/.bin/prisma validate`, `npm run typecheck` and `npm run build`.
- The `npx` Prisma validation wrapper is intentionally not used in this workspace because the local path contains `:`, which breaks wrapper resolution.

## Active Blockers / Risks

- Owner/legal review is still required before production personal-data collection.
- Production SMTP/Telegram credentials are required before real external notifications can be relied on.
- Production ingress still needs real-host sign-off for HTTP-to-HTTPS redirect, `X-Real-IP` identity and spoofed forwarding-header rejection.
- `references/` contains local moodboard/reference files and is ignored; it should not be merged to `prod` unless explicitly approved as source material.
- Production deploy still needs the release checkpoint commit to be pushed to `dev` and fast-forwarded into `prod`.

## Next Recommended Steps

1. Commit and push the reviewed 2026-05-26 release checkpoint.
2. Fast-forward `prod` from `dev`, push `prod`, update the production checkout and run the deployment smoke checks.
3. Keep Phase 5 implementation separate from this release checkpoint.

## Historical Notes

Detailed prior status logs were archived to:

- `docs/archive/project-status-history-2026-05-22.md`

That archive is historical context only. It is not the active task queue.
