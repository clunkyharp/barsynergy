# Design System Consistency Audit BARSYNERGY

Дата: 2026-04-29

Режим: `QA`

Охват: mixed full audit

Статус: исторический аудит. Текущий шрифтовой контракт после owner-selected visual follow-up — `Noto Serif Display + Noto Sans`; если ниже встречается прежний контракт `Geist + Oswald + Outfit`, он описывает состояние на дату аудита и не является текущим source of truth.

- Public и auth: runtime, screenshots, source review.
- Admin, business, profile: source-level review и existing QA artifacts.
- Оценка делается не по критерию “нравится / не нравится”, а по критерию стабильной реализации через tokens, components и predictable frontend rules.

## Evidence Legend

- `runtime + screenshot`
- `runtime only`
- `source-level`
- `existing QA artifact`

## 1. Executive summary

Насколько дизайн консистентен:

- Частично консистентен. У проекта уже есть единый visual language, общая палитра, стабильный шрифтовой характер и заметный набор shared primitives. Но page-level behavior и часть layout-решений все еще слишком зависят от локальных экранных решений. `Evidence: runtime + screenshot, source-level`

Насколько он готов к современной веб-разработке:

- Готов для controlled development, но не готов как полностью зрелая система для быстрой масштабируемой разработки несколькими людьми без риска drift. `Evidence: source-level`

Главные проблемы:

- слишком много одинаково собранных public pages;
- нет нормального reusable pattern для list -> detail;
- несколько параллельных header patterns;
- часть core interaction primitives отсутствует совсем;
- admin sidebar уже выглядит шире, чем фактическая готовность разделов.

Главный риск для разработки:

- Система уже достаточно красива, чтобы внушать ложную уверенность. Но если продолжать строить новые экраны до нормализации page templates, header rules и missing components, проект снова начнет разъезжаться локальными исключениями. `Evidence: source-level`

## 2. Design system maturity score

Уровень: `2 / 4`

Почему такой уровень:

- Есть tokens, typography contract, semantic colors, radius/shadow scale, shared fields, panels, tables, status badges и public primitives. `Evidence: source-level`
- Но нет полного набора core components для growth-phase продукта: modal/dialog, dropdown, toast/notification, radio/toggle, real tabs. `Evidence: source-level`
- Layout rules есть в документации, но в runtime еще много page-local composition logic. `Evidence: source-level`
- Responsive behavior для dense product tables пока не нормализован. `Evidence: source-level`

Что мешает следующему уровню:

- отсутствие closed set of page templates;
- отсутствие interactive list/detail pattern;
- отсутствие полного interaction component layer;
- наличие overlapping header primitives;
- incomplete live QA по закрытым продуктовым зонам.

## 3. Token audit

### Colors

Что работает:

- Есть понятная базовая система: `background`, `surface`, `surface-muted`, `surface-elevated`, `surface-inverse`, `text`, `muted`, `accent`, `success`, `warning`, `danger`. `Evidence: source-level`
- Базовые contrast pairs в ядре палитры рабочие. `#16130f` на `#f4ebdb` и `#5f564b` на светлых поверхностях проходят с запасом. `Evidence: source-level`

Что не работает:

- Public pages продолжают использовать локальные opacity-mixes и ad-hoc gradients для важных surface decisions.
- Primary action местами живет в черном, местами в burgundy, местами в separate editorial treatment.

Что нормализовать:

- CTA semantic colors per surface.
- Overlay/scrim tokens для dark hero, menu overlay, spotlight cards.
- Link tokens для default/inverse/muted/editorial.

Какие токены нужны:

- `action-primary-public`
- `action-primary-workspace`
- `action-secondary-public`
- `overlay-scrim-dark`
- `overlay-scrim-soft`
- `link-default`
- `link-muted`
- `link-inverse`
- `placeholder-text`

### Typography

Что работает:

- На дату аудита был зафиксирован прежний font contract: `Geist` + `Oswald` + `Outfit`. Сейчас он superseded текущим `Noto Serif Display + Noto Sans`. `Evidence: source-level`
- Есть roles для public/product headings, body, caption, label, button. `Evidence: source-level`

Что не работает:

- В runtime еще много local heading sizes и page-level clamp values.
- Small uppercase labels `11px/12px` слишком широко используются как глобальный secondary language.

Что нормализовать:

- Eyebrow scale.
- Metric card typography.
- Table header typography.
- Large public title tiers by page type, not per screen.

Какие токены нужны:

- `text-eyebrow-sm`
- `text-eyebrow-md`
- `text-metric-value`
- `text-metric-label`
- `text-table-header`
- `text-list-title-public`

### Spacing

Что работает:

- Есть базовая шкала и named spacing roles в tokens/docs. `Evidence: source-level`

Что не работает:

- Runtime все еще во многом живет через raw utility spacing.
- Нет четкого public-template spacing API для `hero`, `context`, `list`, `form`, `b2b block`.

Что нормализовать:

- Section spacing per template.
- Gap between intro and filters.
- List row vertical rhythm.
- Form footer spacing.

Какие токены нужны:

- `space-hero-public`
- `space-context-public`
- `space-filters-public`
- `space-list-row`
- `space-form-footer`
- `space-dashboard-grid`

### Radius

Что работает:

- Базовая шкала radius есть и понятна. `Evidence: source-level`

Что не работает:

- Public runtime использует заметное количество local rounded values: header pill, large hero cards, auth shells, homepage spotlights.

Что нормализовать:

- Hero card radius.
- Nav pill radius.
- Spotlight/quote card radius.

Какие токены нужны:

- `radius-nav-pill`
- `radius-hero-card`
- `radius-spotlight-card`

### Shadows / elevation

Что работает:

- Есть `card`, `panel`, `overlay`, `focus`. `Evidence: source-level`

Что не работает:

- Public home still relies on local box-shadow recipes for hero cards, spotlight cards and sticky header shell.

Что нормализовать:

- Sticky header shadow.
- Spotlight card shadow.
- Large public feature card shadow.

Какие токены нужны:

- `shadow-header-sticky`
- `shadow-spotlight`
- `shadow-feature-card`

### Borders

Что работает:

- Есть base border roles и public/product dividers. `Evidence: source-level`

Что не работает:

- Editorial layer still uses raw `border-black/10`, `border-black/12`, `border-black/20` in many places.

Что нормализовать:

- Divider intensities for public section boundaries.
- Row border for list/catalog surfaces.
- Header shell border.

Какие токены нужны:

- `divider-editorial-soft`
- `divider-editorial-default`
- `border-shell-public`
- `border-row-public`

### States

Что работает:

- Tokens and implementations exist for focus, hover, active, disabled, loading, selected, pending, skeleton, error, success, warning, destructive. `Evidence: source-level`

Что не работает:

- Не хватает системных states для row-hover, row-selected, nav-active/inactive, dropdown-open, dialog-backdrop, toast tones.
- `optimistic` token задекларирован, но живого pattern нет.

Что нормализовать:

- Table row interaction states.
- Nav item states.
- Dialog/toast states before those primitives появятся локально.

Какие токены нужны:

- `row-hover`
- `row-selected`
- `nav-active-bg`
- `nav-active-text`
- `dialog-backdrop`
- `toast-success-bg`
- `toast-error-bg`

## 4. Component consistency audit

| Component | Current issue | Needed variants | Needed states | Recommendation |
| --- | --- | --- | --- | --- |
| Button | CTA geometry and tone differ too much across surfaces. | public-primary, public-secondary, workspace-primary, workspace-secondary, destructive, inverse | hover, active, focus-visible, disabled, loading | Fix a surface-based CTA contract and stop solving CTA hierarchy per page. |
| Link | Inline, nav and editorial links exist, but there is no reusable content-row link pattern. | text, inline, nav, editorial, row-link | hover, focus-visible, active, visited if needed | Add `row-link` and unify link semantics by context. |
| Input | Base styling is stable, but long forms still rely on page composition rather than field groups. | default, compact, file, URL, numeric | hover, focus-visible, invalid, disabled | Keep field base, add grouped field patterns and error-summary behavior. |
| Select | Stable base, but utility filters are limited by page logic, not by component. | default, compact, filter-select | hover, focus-visible, invalid, disabled | Add explicit filter-select variant and grouped filter bars. |
| Checkbox | Base exists and consent block is reusable. | default, consent | checked, focus-visible, invalid, disabled | Keep as base; no critical issue. |
| Radio / Toggle | Absent. | radio, toggle, switch | checked, focus, disabled | Add before new settings and multi-option flows appear. |
| Card | `Card`, `Panel`, `StatCard` overlap semantically. | content-card, metric-card, helper-card, interactive-card | hover, selected, loading, error | Clarify shell roles and stop using multiple shells for the same job. |
| Badge / Tag | `StatusBadge` and `MetaChip` are good, but semantic border between metadata and status must stay strict. | status, filter, selected-filter, inverse-meta | selected, disabled if interactive | Preserve distinct roles. |
| Tabs | Absent. `SegmentedControl` is not a full tab system. | tabs-inline, tabs-block | active, focus, disabled | Add if content areas start switching inside the same page. |
| Modal / Dialog | Absent. | confirm, form-dialog, side-sheet | open, close, focus-trap, destructive | Add before first page invents a local modal. |
| Dropdown | Absent. | menu, action-menu, select-menu | open, hover, keyboard, disabled | Add a canonical dropdown primitive. |
| Table | Reusable base exists, but responsive strategy is weak. | dense, comfortable, stacked-mobile | row-hover, selected, empty, loading | Add mobile table pattern. |
| List row | Strong visual primitive, but not interactive. | static, interactive, featured | hover, focus-visible, selected | Convert into reusable navigation pattern. |
| Navigation | Public header, mobile menu and sidebars are consistent in style, but not fully tokenized in behavior. | public-topbar, mobile-overlay, sidebar-product | active, hover, focus-visible, expanded | Normalize nav states and spacing. |
| Header | Too many header implementations. | page-intro-public, page-intro-product, page-intro-admin | default, action slot, with support copy | Consolidate header family. |
| Footer | Strong global footer CTA, but it can dominate pages with already strong final actions. | full-cta-footer, compact-footer | default, inverse | Consider per-template footer intensity. |
| Empty state | Reusable component exists, but some unfinished features misuse it. | data-empty, action-empty, feature-unavailable | default | Split empty state from unavailable state. |
| Loading state | Reusable component exists, but root loading and shared loading are visually different worlds. | page-loading, section-loading, table-loading | busy, skeleton | Normalize loading language. |
| Error state | Root error and shared error patterns are not the same family. | page-error, section-error, inline-error | alert, retry, destructive | Unify error shells by scale. |
| Toast / Notification | Absent. | success, warning, error, neutral | enter, exit, stacked | Add before more async admin/business feedback appears. |

## 5. Layout and responsive consistency

### Проблемы сетки

- Public pages overuse one editorial grid pattern for very different goals. `Evidence: runtime + screenshot, source-level`
- Home has richer composition than inner pages, so the system already proves it can vary more than it currently does. `Evidence: runtime + screenshot, source-level`

### Проблемы контейнеров

- `container` is stable, but surface shells inside it are not always derived from a small named set.
- Large public cards and auth shells still lean on page-level classes.

### Проблемы spacing

- Filters are visually and functionally too far from the content they control.
- Form footers and support blocks vary by page more than they should.
- Admin create forms use another spacing rhythm than admin intro/list pages.

### Проблемы адаптива

- Public mobile heroes consume too much first-screen height on several routes. `Evidence: runtime + screenshot`
- Dense admin tables rely on sideways scroll. `Evidence: source-level`
- Some large desktop compositions are good visually but do not yet have equally clear mobile utility order.

### Рекомендации

- Normalize 3 public templates: editorial explainer, catalog utility, B2B conversion.
- Add mobile-first priority order for each template.
- Introduce stacked mobile data pattern for admin tables and long lists.

## 6. Interaction and accessibility states

Какие состояния уже есть:

- focus-visible, hover, active, disabled, loading, selected, pending, skeleton, success, warning, error. `Evidence: source-level`

Каких состояний не хватает как системных:

- dialog open/close;
- dropdown open/close;
- toast/notification;
- row-hover/row-selected;
- tab-active;
- toggle/radio states.

Где есть accessibility risks:

- Small uppercase labels are used very often and can hurt readability when combined with textured backgrounds or low-attention contexts. `Evidence: runtime + screenshot, source-level`
- Public hero text often sits over image overlays, so contrast quality depends on art direction, not only tokens. `Evidence: runtime + screenshot`
- Horizontal-scroll tables are usable, but not strong UX for narrow widths. `Evidence: source-level`
- Several states in public catalogs are implied by layout and copy, but not by a stronger explicit action pattern.

Что добавить в дизайн-систему:

- explicit row interaction states;
- feature-unavailable state;
- dialog/toast state rules;
- larger label option for dense but important contexts;
- focus-visible checks for interactive list rows and future dialogs.

## 7. Frontend implementation risks

Какие решения сложно реализовать стабильно:

- Public catalog rows that look like content previews but currently do not define navigation behavior.
- Continued reliance on page-local public compositions for different section types.
- Future async UX without toast/dialog/dropdown primitives.

Где будет custom CSS хаос:

- If new public screens keep copying `EditorialPublicPage` and then overriding it screen by screen.
- If future modal/dropdown/tab behavior lands locally in admin/business flows without a shared component layer.
- If hero/spotlight cards continue adding new ad-hoc shadow/radius/overlay recipes.

Где нужны reusable components:

- interactive list row;
- public filter bar with richer variants;
- page intro family;
- unavailable feature state;
- modal/dialog;
- toast;
- dropdown;
- tabs.

Что надо упростить перед разработкой:

- Role model around cabinet entry.
- Public CTA routing on form-driven pages.
- Admin navigation for unfinished directories.
- Register flow from “full registration” to “access request”.

## 8. Top consistency issues

### Title: Four parallel page-header systems

- Severity: `high`
- Where: `EditorialPublicPage`, `PageHeader`, `SectionHeader`, `AdminPageIntro`, manual create-page headers
- Problem: одинаковая роль “заголовок страницы + описание + действие” реализована разными способами.
- Impact: заголовки и vertical rhythm будут разъезжаться с каждым новым экраном.
- Recommendation: собрать `PageIntro` family с вариантами по surface.
- Design-system fix: `page-intro-public`, `page-intro-product`, `page-intro-admin`.
- Frontend implementation note: уменьшит page-local class stacks и повтор кода.

### Title: Public list rows are not a navigation primitive

- Severity: `critical`
- Where: `PublishedContentSection`, `EditorialListRow`
- Problem: строка выглядит как содержательная запись, но не ведет дальше.
- Impact: ломается основной content/catalog flow.
- Recommendation: сделать interactive variant с явным link affordance.
- Design-system fix: reusable `content-row-interactive`.
- Frontend implementation note: позволит стабильно строить list-detail pages.

### Title: Public templates are visually unified but behaviorally under-differentiated

- Severity: `critical`
- Where: public routes built through `EditorialPublicPage`
- Problem: разные разделы используют почти одинаковую компоновку и action structure.
- Impact: снижается information scent и полезность внутренних экранов.
- Recommendation: ввести отдельные templates by job, not by style only.
- Design-system fix: page-template matrix.
- Frontend implementation note: new pages should choose a template instead of cloning a screen.

### Title: Admin navigation overpromises implementation completeness

- Severity: `high`
- Where: `AdminSidebar`, `/admin/categories`, `/admin/cities`, `/admin/tags`
- Problem: навигация ведет в placeholder pages, которые выглядят как обычное empty state.
- Impact: пользователь путает отсутствие данных с отсутствием готовой функции.
- Recommendation: скрыть или явно маркировать unfinished sections.
- Design-system fix: unavailable-feature state.
- Frontend implementation note: prevents misleading UX and reduces support churn.

### Title: CTA hierarchy changes shape and tone too often

- Severity: `high`
- Where: home, editorial pages, auth, workspace
- Problem: primary action visually кодируется по-разному на близких сценариях.
- Impact: slower action recognition.
- Recommendation: fix CTA semantics by surface and intent.
- Design-system fix: surface-based CTA matrix.
- Frontend implementation note: reduces one-off button styling.

### Title: Home runtime still depends on placeholder external imagery

- Severity: `medium`
- Where: `src/components/public/homepage-client.tsx`
- Problem: `picsum.photos` used for hero, narrative cards and testimonial imagery.
- Impact: unstable brand quality, unpredictable asset behavior, weak production confidence.
- Recommendation: replace with controlled imagery or abstract system visuals.
- Design-system fix: media guidelines for public hero/feature surfaces.
- Frontend implementation note: avoid runtime external placeholder dependencies.

### Title: Core interaction primitives are incomplete

- Severity: `high`
- Where: UI layer overall
- Problem: no modal/dialog, dropdown, toast, radio/toggle, true tabs.
- Impact: future flows will likely invent local implementations.
- Recommendation: build missing primitives before feature expansion needs them urgently.
- Design-system fix: core interaction backlog.
- Frontend implementation note: cheaper to normalize now than after three local variants exist.

### Title: Table responsiveness is still an implementation patch, not a product pattern

- Severity: `medium`
- Where: `AdminTableFrame`, admin CRUD pages
- Problem: overflow-x is the only mobile fallback.
- Impact: narrow-width usability degrades quickly as columns grow.
- Recommendation: create stacked mobile row pattern for key resources.
- Design-system fix: responsive table modes.
- Frontend implementation note: avoid per-page emergency responsive fixes later.

## 9. Normalization plan

### Phase 1 — Foundation tokens

- Colors: add CTA, overlay, link and placeholder tokens.
- Typography: normalize eyebrow, metric, list-title and table-header roles.
- Spacing: add template-level section spacing and filter/list/form rhythm.
- Radius: lock hero-card, nav-pill and spotlight radii.
- Borders: replace repeated raw editorial border opacity choices with named divider tokens.
- States: add row, nav, dialog and toast state tokens.

### Phase 2 — Core components

- Buttons: lock CTA matrix by surface.
- Forms: add grouped field patterns and error-summary behavior.
- Cards: clarify `Card` vs `Panel` vs `StatCard`.
- Navigation: unify active/hover/focus rules across topbar and sidebars.
- Lists: introduce interactive content rows.
- Tables: add responsive variants.
- Modals: add canonical dialog before local implementations appear.

### Phase 3 — Layout rules

- Container: keep one stable width/gutter contract.
- Grid: define template-specific grid rules instead of one public editorial formula.
- Section spacing: encode per template.
- Responsive behavior: define first-screen order and collapse rules for each template.

### Phase 4 — Patterns and pages

- Repeating sections: featured content, utility filters, sponsor package blocks, next-step panels.
- Page templates: editorial explainer, catalog utility, B2B conversion, workspace CRUD.
- Empty/loading/error states: distinguish `no data`, `loading`, `error`, `feature unavailable`.

## 10. Quick wins

- Stop using `/contacts` as the primary CTA on sections that already contain their own form.
- Add debounce to `PublicFilters`.
- Hide or mark unfinished admin directories.
- Replace `picsum.photos` in home runtime.
- Turn list rows into real links before building more content surfaces.
- Consolidate page-header family before adding more create/edit screens.

## 11. Final verdict

Можно ли передавать дизайн в разработку:

- Да, но только в текущем контролируемом режиме, где новые экраны проходят через shared primitives и review.

Что обязательно исправить до активного масштабирования:

- page-template differentiation;
- interactive list/detail pattern;
- incomplete component layer;
- misleading unfinished admin states;
- CTA contract.

Что можно исправлять параллельно с разработкой:

- richer B2B templates;
- mobile table fallback;
- typography fine-tuning for supporting labels.

Какие правила надо закрепить в дизайн-системе:

- same job, same primitive;
- one page chooses one template;
- no new async flow without feedback primitive;
- no new navigation surface without explicit active/focus rules;
- no new content list without declared detail behavior.
