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

## Экраны 2–6
Снять референс-скрины и спеку отличий аналогично перед каждым портом.
