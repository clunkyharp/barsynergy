# Figma Runtime Transfer Map

Дата: 2026-05-23

Источник: live Figma Console MCP, файл `BARSYNERGY`, `aKzJvpAdbGIdIhc7J3MQNv`.

## Правила среза

- Не переносить header, footer, логотип и иконки из Figma.
- Не менять маршруты, данные, Prisma, seed, actions и API.
- Не копировать layout один в один, если он конфликтует с реальными данными.
- Не использовать локальные экспортированные изображения как источник решений по этому срезу.

## Live-узлы Figma

| Узел | Роль в Figma | Что переносим в код | Статус |
| --- | --- | --- | --- |
| `40:13464` | `Surface Levels + Card Taxonomy — Visual Batch 2` | Контракт поверхностей, карточек и базовых состояний | Использован в этом срезе |
| `40:13478` | `Surface 0` | Фоновые band-уровни без теней, радиус только у вложенного content | Уже в токенах `--background-band`, без изменений |
| `40:13484` | `Surface 1` | Ivory card: `#fffdf9`, 1px border, radius 8, padding 24-32 | Выровнены `Card`, `Panel`, `public-card-shell` |
| `40:13493` | `Surface 2` | Усиленная панель/tool surface без случайных shadow stacks | Частично покрыто `Panel tone="elevated"` и существующими токенами |
| `40:13636` / `25:11225` | Metadata Chip | Pill 34px, border, 13px medium text, роли category/city/date/status/price | Выровнен `MetaChip` и public-card meta |
| `40:13616` / `1:6080` | Button state matrix | Состояния default/hover/pressed/focus/disabled/loading/secondary/ghost/link/destructive | Выровнен `Button` во втором срезе |
| `40:13626` / `25:7366` | Auth Role Card | Состояния default/hover/focus/selected/disabled/role tones | Выровнен public auth role selector во втором срезе; 320px, explicit state hooks and request/error states hardened в десятом срезе |
| `1:6266` | Component / Calculator Input | Calculator input states: default/focus/filled/error/disabled, 44px inner control, 11px label, 12px helper/error | Применено к `/tools/cost-calculator` в третьем срезе |
| `1:6302` | Component / Calculator Slider | Target-share slider state pattern and disabled behavior | Применено к `/tools/cost-calculator` в третьем срезе |
| `1:6330` | Component / Calculator Radio Group | 44px mode switch with auto/manual selected states | Применено к `/tools/cost-calculator` в третьем срезе |
| `1:6391` | Component / Calculator Result Card | Result states empty/calculated/error/loading: 18px card, badge, 44px main value, metric cards | Применено к `/tools/cost-calculator` в третьем срезе |
| `1:6445` | Component / Calculator Panel | Desktop/mobile panel source: light worksheet panel, 18px radius, 24px padding, compact control grid | Применено к `/tools/cost-calculator` в третьем срезе; runtime panel now uses semantic calculator surface tokens so light/dark themes stay readable |
| `1:6116` | Component / Form Field | Public form field states: 12px card radius, 14px padding, 44px inner control, visible text error/success states | Применено к публичным application/contact forms в четвёртом срезе |
| `1:3112` | Component / Filter panel | Public catalog filter panel: 8px radius, 24px padding, 42px controls, visible field labels | Применено к `PublicFilters` в четвёртом срезе |
| `25:6740` / `25:6748` | Pattern / Missing states | Empty/filtered-zero states stay adjacent to list templates, not separate full-screen fallbacks | Применено к `PublishedContentSection` в четвёртом срезе |
| `20:10595` | Component / Form Submission Feedback | Public form submission result card: 340px target width, 96px min height, 12px radius, 14/16px padding, title/body hierarchy | Применено к публичным application/contact result states в пятом срезе |
| `20:10670` | Component / Contact Form / States | Public contact form state shell: 14px outer radius, no random shadow, 10px field cards, graphite focus, success/error feedback states | Применено к публичным form shells и contact feedback в пятом срезе |
| `1:6190` | Component / Card | Navigation/content card: 14px radius, 22px padding, 12px internal rhythm, 11px pill label, 20px title, 13px body, accent action | Применено к `/education` format/service cards в шестом срезе |
| `13:8123` | Component / Badge / Label | Section/metadata/status/attention pill labels: 32px documented set, 11px semibold label, pill geometry | Применено к `/education` card labels/status pills в шестом срезе |
| `55:1042` | Component / Home / General Sponsor Card | Home sponsor feature card: dark 12px shell, 430px desktop media/logo box, 28px sponsor badges, 30px chips, 46px CTA, no full phone/social contact blocks on home | Применено к home-only `GeneralSponsorCard variant="home"` в седьмом срезе; hover/focus/long content/archived/mobile compact hardening applied в двенадцатом срезе |
| `55:780` | Component / Home / Sponsor Logo Box | Sponsor logo safe area and media constraints for home sponsor card | Применено к home sponsor media/logo box в седьмом срезе |
| `55:788` | Component / Home / Sponsor Benefit List | Compact benefit list with three short bullets for home sponsor card | Применено к home sponsor benefits в седьмом срезе |
| `22:11416` | Component / Admin Data Table / documented states | Dense admin table states and mobile-friendly row fallback labels | Применено к shared `AdminTable`/`DataTable` и core admin list pages в восьмом срезе |
| `22:11442` | Component / Admin Form Field / documented states | Admin field label/control/error density, no glow error state | Применено к `.admin-shell` form states в восьмом срезе |
| `22:11451` | Component / Admin Sticky Form Actions | 76px sticky action bar, 14px radius, compact action spacing | Применено к `AdminCmsActions` в восьмом срезе |
| `22:11460` | Component / Admin Confirm Dialog | 235x200 confirm dialog, 18px radius, 24px padding, 18px title, 14px body, 38px action buttons | Применено: `Dialog size="confirm"` используется в `AdminActionMenuButton`; overlay marker сохраняет совместимость с dropdown ownership |
| `22:11483` | Component / Admin Inline Edit Row | Compact inline edit row with grouped fields and stable open state | Применено к `AdminCmsInlineEditRecord` в восьмом срезе |
| `39:13203` | Component / Admin Toast / variants | 360x78 toast variants: success/error/warning/info, 12px radius, 16px padding, 16px title and 13px body | Применено: `ToastProvider`/`useToast` существует и установлен в root layout; конкретные toast callers подключать только по отдельным behavior-задачам |
| `25:6708` / `25:6769` | File upload pattern and upload failed state | Upload metadata/privacy row and adjacent upload-failed state near the component/list context | Применено ко shared `FileUpload`: private/public notice, selected-file success, adjacent error, submit-pending upload state; live storage/API upload QA remains a separate authenticated scenario |
| `25:5692` | Public detail templates | Article/Event/Course/Vacancy/Supplier/Partner split hero, fact rail, body column, action rail and type-specific sections | Shared detail shell was already applied; type-specific body labels, section blocks and 320px hardening applied в одиннадцатом срезе |

## Изменения первого среза

- `src/components/ui/meta-chip.tsx`: metadata chip приведён к live Figma форме: pill, высота 34px, 13px medium, без принудительного uppercase.
- `src/components/ui/card.tsx`: базовая карточка приведена к Surface 1: radius 8px-class, border, без стандартной тени.
- `src/app/globals.css`: `inset-panel`, `public-card-shell`, list-row shell и public metadata/label chip выровнены с Surface/Card Taxonomy.

## Изменения второго среза

- `src/components/ui/button.tsx`: button state matrix приведён ближе к live Figma `1:6080`: 44px default/md/sm height, 10px radius, 15px bold text, primary/secondary/ghost/link/destructive разделены по ролям, pressed state не сдвигает layout.
- `src/components/ui/auth-role-card.tsx`: добавлен общий `AuthRoleCard` по live Figma `25:7366`: 126px min-height, 8px radius, default/hover/focus/selected/disabled semantics, мягкий selected state без боковой полосы, selected dot 11px.
- `src/app/auth/login/page.tsx`: public role selector использует `AuthRoleCard`, сохраняя текущие роли `participant` и `business`, form action, hidden role input и маршруты.
- Текстовые CTA, которые были `ghost`, но визуально работали как Figma `Link`, переведены на `Button variant="link"`.

## Изменения третьего среза

- `src/components/public/cost-calculator-client.tsx`: `/tools/cost-calculator` выровнен по live Figma калькуляторным компонентам без изменения формул и данных: panel, mode control, calculator field cards, target-share slider и result card.
- `src/app/globals.css`: добавлены scoped-стили `.calculator-panel`, `.calculator-field-card`, `.calculator-slider`, `.calculator-result-card` и `.calculator-metric-card` по live Figma размерам: 18px panel/result radius, 24px padding, 44px controls, 10px metric/input radius.
- Решение по CTA, 2026-05-24: runtime не поддерживает сохранение/export расчёта, поэтому основной result action остаётся `Скопировать результат`; `Сохранить расчёт` нельзя использовать в макете или интерфейсе без отдельной save/export реализации.
- Визуальный QA с Playwright сохранён в `qa/figma-calculator-transfer-2026-05-23/`: desktop `1366`, mobile `390`, narrow `320`, все с `overflowX = 0`.

## Изменения четвёртого среза

- `src/components/public/public-filters.tsx`: публичные фильтры получили scoped-классы для Figma-панели, полей, labels, controls и active chips; видимые label теперь есть не только в directory-tone вариантах.
- `src/app/globals.css`: добавлены scoped-стили `.public-form-shell`, `.public-filter-*` и `.public-missing-state` по live Figma размерам: 12px form field radius, 14px form field padding, 44px form controls, 8px filter panel radius, 24px filter panel padding, 42px filter controls.
- Публичные application/contact form components помечены `public-form-shell`; form actions, names, validation, routes and data не менялись.
- `src/components/public/published-content-section.tsx`: empty/filtered-zero panels получили `public-missing-state`, сохраняя текущие тексты, actions и adjacent-to-list placement.

## Изменения пятого среза

- `src/components/public/application-form-section.tsx`: добавлен общий `PublicSubmissionFeedback` для публичных success/error состояний без изменения result data contract.
- `src/components/public/contact-application-form.tsx`: контактная страница использует общий public feedback card вместо свободного inline alert.
- `src/app/globals.css`: public form shell выровнен с live Figma contact state shell: 14px outer radius, no shadow, 10px field cards, graphite focus state. Public feedback cards получили 12px radius, 14/16px padding, 96px min-height, 340px desktop target width и Figma success/error backgrounds.
- Visual QA сохранён в `qa/figma-contact-feedback-transfer-2026-05-23/final/`: `/contacts` success/error and `/education` empty filters на desktop/mobile, `overflowX = 0`, browser console/page errors clean.

## Изменения шестого среза

- `src/app/(public)/education/page.tsx`: форматная матрица `/education` заменена на visual course/service card grid по live Figma `Component / Card`, сохраняя текущие `educationFormats`, routes and contact-form links. Внешний референс `https://baristaschool.ru/` использован только как UX-ориентир для образовательного блока “курсы и услуги”; тексты, бренд, данные и изображения референса не переносились.
- `src/app/globals.css`: добавлены scoped-стили `.education-format-*`: 14px card radius, 192px media area, 23px pill labels/status, 20px title, 13px body, accent link action. Фото взяты из существующих локальных `public/images/**`.
- Visual QA сохранён в `qa/figma-education-card-transfer-2026-05-23/final/`: `/education#education-formats` на desktop/mobile, 7 cards/media/images/actions, `overflowX = 0`, browser console/page errors clean.

## Изменения седьмого среза

- `src/components/public/general-sponsor-card.tsx`: добавлен `variant="home"` для главной страницы. Home sponsor card теперь не выводит полные phone/WhatsApp/Instagram contact blocks, но сохраняет текущие sponsor data, logoSrc из базы, benefit text, chips и CTA на существующие маршруты.
- `src/components/public/homepage-client.tsx`: главная использует `GeneralSponsorCard variant="home"` и выставляет `priority` для первого sponsor logo image.
- `src/app/globals.css`: добавлены scoped-стили `.home-sponsor-*` по live Figma размерам: 12px dark shell, 430px desktop media box, 336px safe area, 28px badges, 30-32px chips, 46px CTAs. Full sponsor page card styles and contacts were kept.
- Visual QA сохранён в `qa/figma-home-sponsor-card-transfer-2026-05-23/final/`: `/` desktop/mobile and `/general-sponsors` desktop, `overflowX = 0`, browser console/page errors clean. Verified home card has `0` full phone/channel blocks, while `/general-sponsors` keeps full contact cards.

## Изменения восьмого среза

- `src/components/ui/admin-table.tsx`: `AdminTable`/`DataTable` получили `mobileLayout` and `label` API for mobile card fallback; action cells now provide the default `Действия` label.
- `src/app/admin/{articles,vacancies,courses,events,partners,suppliers,general-sponsors}/page.tsx` and `src/app/admin/applications/page.tsx`: core admin table cells now pass labels for mobile row fallback; queries, routes, actions and data were not changed.
- `src/components/admin/admin-cms-form.tsx`: `AdminCmsActions` and `AdminCmsInlineEditRecord` now expose scoped classes for Figma-sized sticky actions and compact inline edit rows.
- `src/components/ui/dialog.tsx`: `Dialog size="confirm"` keeps confirm actions in one row and applies compact body spacing.
- `src/components/ui/admin-action-menu.tsx`: admin confirmation now composes the shared `Dialog` primitive instead of owning a separate local portal/focus loop.
- `src/app/layout.tsx`: root app shell installs `ToastProvider`, so `useToast` can be used by future screen-specific behavior without extra provider wiring.
- `src/components/ui/file-upload.tsx`: upload primitive now supports adjacent error text, `aria-invalid` and `aria-describedby` wiring while preserving the no-glow error rule.
- `src/app/globals.css`: added scoped admin table mobile-card CSS, admin form-field state overrides without red glow, sticky action sizing and inline edit open-state styling.
- Validation: `git diff --check`, `npm run lint`, `npm run typecheck`, `npm test` passed. Playwright fallback CSS fixture verified mobile table card layout with `overflowX = 0`, hidden header, grid cells, static action cell and invalid field without red glow. Authenticated admin screen was not live-verified because `/admin/applications` redirects to `/admin/login` without a session.

## Изменения девятого среза

- `src/components/ui/file-upload.tsx`: shared upload primitive now supports private/public notices, selected-file success copy, adjacent error copy, submit-pending upload state, state icons, `aria-invalid` and composed `aria-describedby`.
- `src/components/admin/cover-image-input.tsx`: admin cover image upload now passes public-file notice, server/client error, and selected-preview success state into the shared primitive; storage actions and form data were not changed.
- `src/components/public/vacancy-application-forms.tsx`: resume upload now shows a private-file notice and selected-file success state while preserving the existing vacancy application action and form contract.
- `src/app/globals.css`: added scoped upload CSS for filled, uploading, success, error and private/public notice states without red glow or hover lift.
- Validation: `git diff --check`, `npm run lint`, `npm run typecheck`, `npm test` passed. Playwright fallback CSS fixture verified upload states at 390px with `overflowX = 0`, state borders/icons, wait cursor for uploading, and no red glow. Figma Desktop Bridge was unavailable during this slice, so source parity used the previously recorded Figma inventory for `25:6708` / `25:6769`; authenticated live upload/storage QA was kept out of scope to avoid data mutation.

## Изменения десятого среза

- `src/components/ui/auth-role-card.tsx`: role card now exposes explicit `data-state="idle|selected|disabled"` and uses `aria-current="page"` for the selected public role.
- `src/app/auth/login/page.tsx`: public auth login received scoped runtime hooks for mobile layout, submit loading, role list and request-sent notice while preserving current roles, hidden `role/surface` fields, form action and redirect behavior.
- `src/app/globals.css`: added scoped `.auth-login-*`, `[data-auth-role-card]` and `.auth-access-notice` CSS for 320px layout, selected/hover/disabled role card states, pending submit cursor and request-sent notice. No red glow, hover lift or auth-flow changes were added.
- `tests/auth-login-ui-states.test.mjs`: static regression covers public-only role cards, selected state contract, 320px CSS hooks, loading hook, error hook and request-sent hook.
- Validation: `git diff --check`, targeted ESLint, targeted auth login test, `npm run lint`, `npm run typecheck`, `npm test` passed. Playwright/Chromium fallback smoke verified `/auth/login`, `/auth/login?role=business`, invalid error, role-mismatch warning and request-sent states at 320px with `overflowX = 0`, two public role cards, selected `aria-current="page"`, 44px submit and no admin/moderator role text.

## Изменения одиннадцатого среза

- `src/components/public/public-content-detail-page.tsx`: shared detail shell now exposes `data-detail-kind`, type-specific body labels and type-specific fallback copy for article/event/course/vacancy/supplier/partner pages.
- `src/lib/public/content-details.ts`: article, course, vacancy, supplier and partner detail builders now return type-specific section blocks from existing fields. Event sections were already present.
- `src/app/(public)/{articles,education,vacancies,suppliers,partners}/[slug]/page.tsx`: detail routes now pass `sections` into the shared detail template; queries, slugs, data fetching and CTA targets were not changed.
- `src/app/globals.css`: added scoped `.public-detail-*` CSS for stable section cards, type hooks and 320px overflow hardening.
- `tests/public-detail-hardening.test.mjs`: static regression covers type-specific labels, section blocks and route-to-template section wiring.
- Validation: `git diff --check`, targeted ESLint, targeted public detail hardening test, `npm run lint`, `npm run typecheck`, `npm test` passed. Playwright/Chromium fallback discovered current local detail URLs from list pages and verified the available supplier detail on desktop, 390px and 320px with `overflowX = 0`, `data-detail-kind="supplier"`, 2 type-specific section cards and 44px primary action. Current local listings had no published article/event/course/vacancy/partner detail links, so those browser states are covered by source/static tests only.

## Изменения двенадцатого среза

- `src/components/public/general-sponsor-card.tsx`: `GeneralSponsorCard` now exposes `data-sponsor-variant="home|full"` and `data-sponsor-state="active|archived"`, keeps home/full variants separate, removes mobile description clipping, and gives phone/channel/chip text safer long-content wrapping.
- `src/app/globals.css`: added scoped sponsor-card hover/focus states, archived/inactive muted state, long-content wrapping and compact mobile rules for 480px and 360px without hover lift.
- `tests/general-sponsor-card-states.test.mjs`: static regression covers variant/state hooks, removed description clipping, hover/focus, archived and compact mobile CSS.
- Validation: `git diff --check`, targeted ESLint, targeted general sponsor test, `npm run lint`, `npm run typecheck`, `npm test` passed. Playwright/Chromium fallback verified `/` home card and `/general-sponsors` full card on desktop, 390px and 320px with `overflowX = 0`, active state, variant hooks, visible focus, long description not clipped and no full contact cards in the home variant. Archived state is source/static verified because public runtime only queries `PUBLISHED` sponsors.

## Зафиксированные расхождения

- Figma screenshot tool через app connector требует повторную авторизацию; визуальная реализация сверялась по live Desktop Bridge tree и runtime browser screenshots.
- Live Figma inventory on 2026-05-24 used Figma Console Desktop Bridge because the app connector still required reauthentication and REST/file-data calls hit `429 Rate limit exceeded`.
- Search found no local Figma components named `tabs`, `toggle`, `switch` or `upload`; upload exists as a documented pattern/state, not a source component set.
- Admin/editorial/service role variants из `25:7366` не выводятся на public `/auth/login`, потому что v1 public login по проектному решению показывает только participant/business.
- Админские таблицы, upload, toast, mobile stress и photo rules отмечены в Figma как отдельные batch-и и не входят сюда.
- Повторный REST-запрос к Figma во время работы получил `429 Rate limit exceeded`; решения выше основаны на live Desktop Bridge data, полученных через Figma Console MCP.
- Четвёртый срез использовал Figma Console MCP Desktop Bridge screenshots for `1:6116`, `1:3112` and `25:6740`; app connector screenshots не использовались из-за требования повторной авторизации.
- Пятый срез использовал live Figma Console MCP Desktop Bridge deep component data and screenshots for `20:10595` and `20:10670`; header, footer, logo, Figma icons, routes, actions, data and Prisma were kept out of scope.
- Шестой срез использовал live Figma Console MCP Desktop Bridge deep component data and screenshot for `1:6190` plus deep component data for `13:8123`; header, footer, logo, Figma icons, routes, actions, CMS data and Prisma were kept out of scope.
- Седьмой срез использовал live Figma Console MCP Desktop Bridge deep component data and screenshot for `55:1042`, plus deep component data for `55:780` and `55:788`; header, footer, Figma logos, Figma icons, routes, actions, CMS data and Prisma were kept out of scope.
- Восьмой срез использовал live Figma Console MCP Desktop Bridge component data and screenshot for `22:11416`, and component data for `22:11442`, `22:11451`, `22:11460`, `22:11483`, `39:13203`; routes, actions, queries, auth, CMS data, Prisma and seed were kept out of scope.
- Девятый срез не смог подключиться к Figma Desktop Bridge: `Cannot connect to Figma Desktop`; implementation was based on the existing recorded Figma inventory for `25:6708` / `25:6769`. Routes, actions, storage API, authenticated upload flow, CMS data, Prisma and seed were kept out of scope.
- Десятый срез не смог подключиться к Figma Desktop Bridge: `Cannot connect to Figma Desktop`; implementation used the already recorded clean auth v1 decision and prior `25:7366` role-card inventory. Auth actions, cookies, redirects, admin/service roles, Prisma, seed and business cabinet data were kept out of scope.
- Одиннадцатый срез не смог подключиться к Figma Desktop Bridge: `Cannot connect to Figma Desktop`; implementation used the recorded `25:5692` detail template decision and runtime source review. Current local listings exposed only supplier detail for browser verification; article/event/course/vacancy/partner browser verification needs published local examples.
- Двенадцатый срез не смог подключиться к Figma Desktop Bridge: `Cannot connect to Figma Desktop`; implementation used the recorded `55:1042`, `55:780` and `55:788` sponsor-card inventory plus runtime browser checks. Archived/inactive sponsor state is not exposed by the public query and was verified as a source/static visual hook only.
