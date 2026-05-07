# UI/UX + Design Refactor Plan

Дата: 2026-05-04

Основа для плана:

- `docs/ui-ux-audit-final-2026-04-29.md`
- `docs/design-system-consistency-audit-final-2026-04-29.md`

Режим: `IMPLEMENTATION`

## Цель

Перевести public/auth/shared UI из состояния “сильная визуальная база, но средняя прикладная полезность” в состояние, где:

- у public-каталогов есть нормальный сценарий `список -> деталь -> действие`;
- фильтрами реально можно пользоваться, а не только видеть их;
- страницы с локальной формой ведут в локальную форму, а не в общий контактный поток;
- логика входа и кабинетов перестает быть двусмысленной;
- дизайн-система перестает переоцениваться в документации и описывается честно.

## Текущий статус батча

Уже реализовано в коде в этом батче:

- создан чекпоинт текущего dirty tree на `codex/barsynergy-ui-preview`, после чего работа продолжена в ветке `codex/photo-reference-ui-redesign`;
- глобальный визуальный слой переведён ближе к фото-референсам: `Playfair Display` для крупных заголовков, `Manrope` для основного текста, тёплый off-white фон, бордовые action-цвета, тонкие разделители, меньшие радиусы и спокойные тени;
- обновлены shared primitives: header, mobile menu, footer, `Button`, `Panel`, `Card`, `MetaChip`, `PageHeader`, `StatCard`, public list rows, filters, sponsor card, auth shells, калькулятор, business/profile/admin shell;
- главная `/` перестроена под структуру референса с реальными счётчиками, текущими CMS-данными, разделами платформы, аудиториями и DB-записями `GeneralSponsor` / Hustle Brew;
- public-каталоги, формы, детальные страницы, auth, калькулятор, profile, business и admin-поверхности приведены к одной фото-reference системе без изменения маршрутов, Prisma schema, auth, application actions, storage, notifications или permissions;

- интерактивные public list rows;
- detail routes для `articles`, `education`, `events`, `vacancies`, `suppliers`, `partners`;
- shared public detail page shell;
- shared featured block над public-каталогами;
- shared related block на detail-страницах;
- расширенные public filters с debounce и route-specific select filters;
- CTA на `education`, `events`, `partners` переведены на локальные формы;
- вход перенаправляет `USER` в `/profile`, а не на `/`;
- public nav теперь обещает `Войти`, а не абстрактный `Кабинет`;
- незавершенные admin-справочники вынесены в честный блок `Скоро`, а placeholder-state переписан без ложного empty-state смысла.
- добавлен follow-up по UX-аудиту: `/auth/login` яснее объясняет, кому доступен кабинет, публичные формы получили общий блок выбора канала связи, `/business/requests` показывает требования по выбранному типу заявки, sponsor/calculator copy очищены от внутренних и двусмысленных терминов, а локальный in-app browser больше не ломает HMR на `127.0.0.1`.
- добавлен style-alignment follow-up после review: site-wide footer CTA больше не дублирует основной контент, homepage получила явный блок `Сейчас в BARSYNERGY`, отдельную навигационную карту платформы и teaser калькулятора, `/articles`, `/education`, `/partners` и `/suppliers` различают полный пустой каталог и пустой результат фильтра, карточки материалов показывают дату/время чтения, а `/auth/login` на mobile быстрее выводит пользователя к форме входа.
- закрыт follow-up по тёмной теме и UI consistency: header больше не инвертирует logo через CSS-фильтр, desktop header проверен на `1280`, `1366` и `1440`, dark accent/button/chip/field/card tokens выровнены по контрасту, homepage/sponsor/education/events/contacts/calculator/cookie notice приведены к одной light/dark модели, а постоянные education/events формы заменены на показ после выбранного действия.

Еще не закрыто:

- реальная продуктовая дифференциация шаблонов public-страниц;
- полнота component layer для dialog/dropdown/toast/radio/toggle;
- dedicated accessibility pass по клавиатуре и контрасту;
- mobile fallback для плотных admin tables.

## Phase 1 — Navigation And Detail Flow

Статус: `mostly done`

Цель:

- убрать главный UX-разрыв public-каталогов.

Состав:

- интерактивные строки списка;
- detail pages для основных public сущностей;
- явные переходы назад к каталогу;
- CTA на детальных страницах, ведущие к следующему действию.

Сделано:

- `PublishedContentSection` теперь строит переходы в detail routes;
- detail flow добавлен для шести публичных каталогов;
- shared detail shell введен в `src/components/public/public-content-detail-page.tsx`.
- shared detail shell дополнительно приведен ближе к owner reference: центрированный article-header, крупный hero, узкая колонка чтения и более спокойный related-block.
- featured blocks добавлены над каталогами через `PublicFeaturedContent`;
- related/next-step blocks добавлены на detail pages через `PublicRelatedContentSection`.

Осталось:

- довести related content до более точной логики по категории/городу, а не только по последним записям раздела;
- добавить category-aware recommendations, когда появится достаточно данных;
- проверить визуальный порядок на mobile после live QA.

## Phase 2 — Filter Utility And Action Clarity

Статус: `mostly done`

Цель:

- сделать public-страницы полезными как каталоги и сервисы, а не только как длинные editorial sections.

Состав:

- debounce для текстового поиска;
- category/city/route-specific filters;
- первичные CTA в локальные формы;
- сокращение лишних переходов в `/contacts`.

Сделано:

- новый shared filter API добавлен в `PublicFilters`;
- добавлены route-specific filters для education/events/vacancies/suppliers/partners;
- `education`, `events`, `partners` ведут первичным CTA на локальную форму.
- recommended item вынесен над списком и больше не дублируется в основном списке.
- public pages теперь различают true empty state и filtered-zero state: при полном отсутствии записей показывается сценарный pre-launch блок, а при пустом результате поиска остаются фильтры и сброс.

Осталось:

- поднять фильтры выше на ряде страниц, если live QA покажет, что они все еще слишком поздно;
- решить, нужен ли sticky utility bar для mobile catalog routes.

## Phase 3 — Auth And Information Architecture Clarity

Статус: `partially done`

Цель:

- перестать обещать пользователю несуществующую или неясную модель кабинета.

Состав:

- честный label для входа;
- корректный post-login redirect;
- переписанный auth copy;
- явная граница между business-access flow и specialist profile.

Сделано:

- `Кабинет` заменен на `Войти` в public navigation;
- `USER` после логина уходит в `/profile`;
- тексты на `/auth/login` больше не маскируют multi-role модель под business-only wording.
- `/auth/login` теперь отделяет вход для уже выданных доступов от восстановления доступа через команду и не подталкивает нового пользователя к несуществующей самостоятельной регистрации.
- mobile layout `/auth/login` теперь показывает форму сразу после короткого брендового intro; подробная value-колонка остаётся для tablet/desktop.

Осталось:

- решить публичную стратегию для специалиста:
  - показывать ли отдельный входной путь;
  - будет ли self-serve registration;
  - где профиль специалиста должен быть виден в public IA.

## Phase 4 — Design-System Normalization

Статус: `in progress`

Цель:

- довести систему до честного уровня `3/4`, а не описывать как `3 stabilized` без фактической полноты.

Состав:

- уточнить header family;
- закрыть недостающие компоненты: `dialog`, `dropdown`, `toast`, `radio`, `toggle`, real `tabs`;
- развести `Panel`, `Card`, `StatCard` по ролям;
- нормализовать public template rules вместо screen-local composition.

Сделано в photo-reference batch:

- `DESIGN.md`, `design-tokens.json`, `src/lib/fonts.ts` и `src/app/globals.css` синхронизированы с runtime-направлением `Playfair Display + Manrope`;
- общие public/product primitives получили меньший radius scale, более тонкие border/shadow роли и бордовый action/focus слой;
- отрицательный letter-spacing убран из пользовательских UI-поверхностей.
- dark-mode token pass добавил отдельный `accent-contrast`, отдельные logo assets для light/dark, более спокойные hover-состояния header/nav, tokenized states для `Button`, `Select`, `Checkbox`, consent blocks, `MetaChip`, `PublicFilters`, sponsor cards и cookie notice.

## Phase 5 — Accessibility And Responsive Hardening

Статус: `browser QA passed for current photo-reference branch; dedicated accessibility audit remains planned`

Цель:

- закрыть риски, которые нельзя считать решенными только по source review.

Состав:

- keyboard-only QA;
- contrast review;
- focus order on forms and overlays;
- dense-table mobile fallback;
- проверка click/tap target sizes на mobile.

Проверено в текущем photo-reference batch:

- Playwright fallback вместо Browser Use: public routes на `390x844`, `768x1024`, `1280x900`, `1448x1086`;
- authenticated smoke для `/profile`, `/business`, `/business/requests`, `/admin`, `/admin/applications`, `/admin/articles`;
- mobile menu open/close, active nav, visible focus state, calculator interaction, contact form enabled/disabled shell and horizontal overflow checks.
- Browser Use/in-app browser follow-up: после `allowedDevOrigins` для `127.0.0.1` HMR снова работает в локальном браузере, а основные публичные маршруты после перезапуска dev-сервера возвращают `200`.
- финальный dark/light pass после UI consistency batch: `/`, `/education`, `/events`, `/general-sponsors`, `/tools/cost-calculator`, `/contacts`, `/auth/login` проверены на `390x844`, `1280x900`, `1366x768`, `1440x813`; подтверждены reload persistence темы, отсутствие горизонтального скролла, отсутствие видимого `Страница загружается` и старого `Напишите команде BARSYNERGY`. Исторические скриншоты из `docs/output/` удалены во время release-prep cleanup 2026-05-07 после согласования; для нового sign-off нужно сгенерировать свежие артефакты.

## Документация

Актуальными контрольными документами для этой темы считать:

- `docs/ui-ux-audit-final-2026-04-29.md`
- `docs/design-system-consistency-audit-final-2026-04-29.md`
- `docs/ui-ux-design-refactor-plan.md`

Старые документы с промежуточной или слишком оптимистичной оценкой должны либо ссылаться на эти три файла, либо не использоваться как текущий source of truth.
