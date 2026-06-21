# Open Design redesign — порт предпочитаемых макетов

Источник макетов (HTML, локально): `~/Library/Application Support/Open Design/namespaces/release-stable/data/projects/6b9e1997-aa9f-449b-8e57-c33dc033d954/*.html` + `design-tokens.css`, `icons.svg`. Заголовки в макетах — **Unbounded** (геометрический сан), не Cormorant.

## Метод
Порт дизайна макета в существующие React-компоненты + токены (не литеральная копия HTML). По одному экрану: порт → проверка desktop/tablet/mobile → коммит. Порядок:
1. article-detail (экран материала)
2. articles (карточки статей / related)
3. vacancy-detail (открытая вакансия)
4. vacancies (список вакансий)
5. suppliers
6. masters

## Экран 1 — article-detail (спека отличий)

Текущее: `article-detail-body.tsx` (grid 1fr / minmax(18rem,0.38fr)), сайдбар `article-detail-sidebar.tsx` = TOC «В материале» + Детали + Темы + Калькулятор. Hero `article-detail-hero.tsx`. Related внизу `article-related-section.tsx`.

Макет (целевое):
- **Layout**: `grid 1fr 320px; gap 56px; max-w 1280; align-items:start`. Сайдбар sticky `top:88px`, секции = bordered cards (border-subtle, radius-lg, padding 24, bg surface).
- **Hero**: большой `article-header__image` (height 420px desktop / 280 tablet / 220 mobile, radius-xl, overflow hidden) под заголовком+мета. Сейчас картинки в hero нет.
- **Body**: `p.lead` (1.125rem, muted, 500) первый абзац; h2/h3 Unbounded; `ul li` кастомный буллет (accent dot 6px); **pull-quote** (left 3px accent border, surface bg, Unbounded 1.25rem + attr).
- **Sidebar секции** (порядок):
  1. **Содержание** (TOC) — плоский список, item `padding 8px 0`, border-bottom между, `--active` (accent, 600), `--l2` (padding-left 16, 0.8125rem).
  2. **Похожие статьи** — `sidebar-article` строки: thumb 64×64 (radius-md) + info (rubric accent 0.6875 uppercase + title 2-line clamp). Нужны related-данные → пробросить в сайдбар (сейчас они только в нижнем related).
  3. **Подписка** — text + input (surface-muted, radius-md, 11×16) + button (full, accent). Переиспользовать `ContentSubscribeForm`.
- **Убрать/перенести** из сайдбара: Детали, Темы, Калькулятор (или вынести ниже/в подвал статьи — решить).
- **Related внизу** «Читайте также»: grid 3 (2 tablet / 1 mobile), `related-card` = image (height ~) + body (rubric accent, title 2-line, date muted 0.8125).
  - Сейчас есть `article-related-section` — привести карточки к этому виду.

Ключевые правки файлов: `article-detail-body.tsx` (layout, lead, pull-quote), `article-detail-sidebar.tsx` (полная пересборка: TOC+Похожие+Подписка), `article-detail-hero.tsx` (+image), `article-related-section.tsx` (карточки), CSS `base.css .article-body` + `public.css`. Проводка related → sidebar в `articles/[slug]/page.tsx`.

## Прогресс
- [x] Экран 1 — article-detail: sticky-сайдбар (TOC+Похожие+Детали+Темы+Подписка), related-карточки по макету (фото+rubric-пилюля+title+дата), фолбэк-обложки. Коммиты 5d34c8b, b79333b.
- [x] Экран 2 — articles: карточки (фото+пилюля+title+дата), featured горизонтальный split, нумерованная пагинация. Коммиты b62bb4d, ad23aca.
- [x] Экран 3 — vacancy-detail: «Другие вакансии» = компактная карточка вакансии. cbb36e0.
- [x] Экран 4 — vacancies: `OpportunityListRow` → компактная кликабельная карточка (бейдж+«Новая»+должность+амбер-зарплата+чипы). cbb36e0.
- [ ] Экран 5 — suppliers
- [ ] Экран 6 — masters

Демо-данные засеяны частично (`demo:seed:screens`, упал на publicHandle): vacancy 3 PUB, supplier 4 PUB, master 7 PUB. Сбросить при желании.

## Экраны 5–6 (suppliers / masters) — спека
Общий компонент `DirectoryListRow` (published-content-row-directory.tsx). Сейчас: высокая карточка badge-слева + name + chips + описание + 2 кнопки (Связаться+Профиль) + сайт.
Макет suppliers: 4-кол сетка, карточка = МЕДИА-ШАПКА с крупной категорией (ROAST/ESPRESSO/SYRUP) flush к краям + body (name+verified, city, chips, описание 2 строки, «Связаться» full-width amber).
ЗАМЕЧАНИЕ: flush-медиа конфликтует с `.public-list-row-shell-hh` padding 1.5rem (forms.css ~1020). Чистый порт = вынести карточку из shell-системы (own border/overflow) ИЛИ убрать padding шелла для suppliers/masters и дать body свой padding. Грид: суж. minmax до ~16rem для 4 колонок.
Альтернатива (дешевле): компактная карточка как у вакансий (в рамках shell, без flush-медиа) — консистентно с vacancy, но без медиа-шапки макета.
