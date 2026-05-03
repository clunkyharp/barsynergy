# UI/UX + Design Refactor Plan

Дата: 2026-04-29

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

Еще не закрыто:

- реальная продуктовая дифференциация шаблонов public-страниц;
- homepage content priorities;
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

Осталось:

- решить публичную стратегию для специалиста:
  - показывать ли отдельный входной путь;
  - будет ли self-serve registration;
  - где профиль специалиста должен быть виден в public IA.

## Phase 4 — Design-System Normalization

Статус: `planned`

Цель:

- довести систему до честного уровня `3/4`, а не описывать как `3 stabilized` без фактической полноты.

Состав:

- уточнить header family;
- закрыть недостающие компоненты: `dialog`, `dropdown`, `toast`, `radio`, `toggle`, real `tabs`;
- развести `Panel`, `Card`, `StatCard` по ролям;
- нормализовать public template rules вместо screen-local composition.

## Phase 5 — Accessibility And Responsive Hardening

Статус: `planned`

Цель:

- закрыть риски, которые нельзя считать решенными только по source review.

Состав:

- keyboard-only QA;
- contrast review;
- focus order on forms and overlays;
- dense-table mobile fallback;
- проверка click/tap target sizes на mobile.

## Документация

Актуальными контрольными документами для этой темы считать:

- `docs/ui-ux-audit-final-2026-04-29.md`
- `docs/design-system-consistency-audit-final-2026-04-29.md`
- `docs/ui-ux-design-refactor-plan.md`

Старые документы с промежуточной или слишком оптимистичной оценкой должны либо ссылаться на эти три файла, либо не использоваться как текущий source of truth.
