# BARSYNERGY — План исправлений UI/UX

Дата составления: 2026-06-08  
Источник: UX/UI-аудит + серия ревью в рамках сессии разработки

Статус: ✅ сделано / 🔴 P0 / 🟡 P1 / 🟢 P2 / 🔵 стратегическое

---

## Статус уже выполненных правок

| # | Файл | Что сделано |
|---|---|---|
| ✅ | `home-cta-faq-section.tsx` | Добавлена кнопка «Написать команде» в CTA-панель |
| ✅ | `homepage-section-cards.tsx` | Исправлен breakpoint карточек: `sm:grid-cols-2 lg:grid-cols-3` вместо `md:grid-cols-2 xl:grid-cols-3` |
| ✅ | `public-card-patterns.tsx` | `FeatureCard` row-presentation получил `grid-cols-1` как базовый mobile-класс |
| ✅ | `article-grid-section.tsx` | Filter bar переведён в `flex-col gap-2 sm:flex-row` — поиск не давит категории на мобильном |
| ✅ | `cost-calculator/result-rail.tsx` | `order-first xl:order-none` — результат виден до таблицы ингредиентов на мобильном |
| ✅ | `homepage-client.tsx` | Editorial stack: featured card full-width, NowCards в `grid-cols-1 sm:grid-cols-3` ниже |
| ✅ | `homepage-current.tsx` (FeaturedNowCard) | Overlay контент в `flex-col md:flex-row`; заголовок адаптивный `text-[1.35rem] md:text-[1.8rem] lg:text-[2.45rem]`; badge скрыт на mobile (`hidden md:inline-flex`) |
| ✅ | `homepage-current.tsx` (NowCard) | `sm:min-h-0` вместо `sm:min-h-[11.5rem]` — карточки не имеют принудительной высоты |
| ✅ | `app/(public)/about/page.tsx` | «Следующий шаг» переведён в action-strip: кнопка + secondary ссылки в одну горизонтальную строку |

---

## P0 — Критические баги (блокируют использование)

### 1. FeaturedNowCard — проверить aspect-ratio на малых экранах

**Файл:** `src/components/public/homepage-current.tsx`, строка 51

**Текущее состояние:**
```
aspect-[3/2] overflow-hidden md:aspect-[21/9]
```

**Проблема:** На телефонах шириной < 380px `aspect-[3/2]` при full-width карточке даёт высоту ~250px. Если заголовок длинный (3+ строки в `text-[1.35rem]`), он вместе с summary и action row может не умещаться в оверлей.

**Действие:**
- Добавить `min-h-[220px]` к карточке как страховку снизу
- Проверить на реальных устройствах (iPhone SE = 375px, Poco X = 360px)
- Если summary перекрывает заголовок — скрыть summary на мобильном: `hidden sm:block` на `.featured-now-summary`

---

### 2. NowCard — `[&>a:last-child]:border-b-0` при grid-cols-3

**Файл:** `src/components/public/homepage-client.tsx`, строка 45

**Текущее состояние:**
```jsx
<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 [&>a:last-child]:border-b-0">
```

**Проблема:** `[&>a:last-child]:border-b-0` убирает нижнюю границу только у последнего элемента. На мобильном (1-col) это правильно — убирает линию под последней карточкой. Но на `sm:grid-cols-3` все карточки переключаются на card-стиль через `sm:border sm:border-[var(--card-border)]` и нижняя граница строки (`border-b border-[var(--line)]`) уже не используется — там border идёт от card-shell. `[&>a:last-child]:border-b-0` здесь безвреден, но можно сделать аккуратнее.

**Действие (опционально):** Ограничить правило только mobile-уровнем:
```jsx
<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 [&>a:last-child]:border-b-0 sm:[&>a:last-child]:border-b">
```

---

## P1 — Значительные проблемы

### 3. FeaturedNowCard — заголовок рендерится через `<span>`, не семантический заголовок

**Файл:** `src/components/public/homepage-current.tsx`, строка 75

**Текущее состояние:**
```jsx
<span className={`${displayFont.className} featured-now-title ...`}>
  {card.title}
</span>
```

**Проблема:** Заголовок контента — семантически должен быть `<h3>` (секция «Актуальное» — `<h2>`, карточка внутри — `<h3>`). `<span>` не индексируется поисковиками как заголовок и недоступен для screen readers в правильном порядке.

**Действие:**
```jsx
// Было:
<span className={`${displayFont.className} featured-now-title ...`}>
  {card.title}
</span>

// Стало:
<h3 className={`${displayFont.className} featured-now-title ...`}>
  {card.title}
</h3>
```
Аналогично — `<span>` для summary → можно оставить как есть (не заголовок).

---

### 4. NowCard заголовок — тоже `<h3>` вместо `<span>`

**Файл:** `src/components/public/homepage-current.tsx`, строка 162

**Текущее состояние:**
```jsx
<h3 className={`${displayFont.className} home-current-support-title ...`}>
```
✅ Уже `<h3>` — не требует правки.

---

### 5. HomeCtaFaqSection — heading `<h2>` внутри `<section>`, но нет `aria-labelledby`

**Файл:** `src/components/public/home-cta-faq-section.tsx`, строка 44

**Проблема:** `<section>` без `aria-label` или `aria-labelledby` — секция анонимна для screen readers.

**Действие:**
```jsx
// Добавить id на h2:
<h2 id="home-faq-title" className={...}>
  Напишите команде BARSYNERGY
</h2>

// Добавить на section:
<section aria-labelledby="home-faq-title" ...>
```

---

### 6. Calculator — sticky работает только на xl (1280px+)

**Файл:** `src/components/public/cost-calculator/result-rail.tsx`, строка 58

**Текущее состояние:**
```
xl:sticky xl:top-24
```

**Проблема:** На планшетах (768–1279px) result rail не sticky. Пользователь добавляет ингредиенты и вынужден скроллить наверх к результату.

**Действие:** Понизить порог sticky до `lg`:
```jsx
// Было:
className="calculator-result-card cost-sheet xl:sticky xl:top-24"

// Стало:
className="calculator-result-card cost-sheet lg:sticky lg:top-24"
```
На мобильном result rail уже поставлен first через `order-first` — этого достаточно.

---

### 7. About page — удалить фразу «Платформа развивается»

**Файл:** `src/app/(public)/about/page.tsx`, строка 203–206

**Текущее состояние:**
```jsx
<div className="mt-8 flex items-center gap-3 border-t border-white/15 pt-5 text-sm leading-6 text-white/68">
  <Store className="shrink-0" size={18} strokeWidth={1.8} />
  <p>Платформа развивается: добавляем разделы и функции по запросам пользователей и партнёров.</p>
</div>
```

**Проблема:** Открытое признание незрелости продукта — снижает доверие первых посетителей. Фраза воспринимается как «мы ещё не готовы», хотя смысл позитивный.

**Вариант А (удалить полностью):** Убрать весь блок со `<Store>`.

**Вариант Б (переформулировать):**
```
«Открыты к предложениям — новые разделы появляются по запросам сообщества.»
```

---

### 8. Nav — калькулятор не представлен в навигации

**Файл:** `src/components/layout/site-header.tsx`, строка 46

**Текущее состояние:**
```js
const desktopPrimaryNavItems = getNavItems(['/education', '/events', '/articles', '/vacancies', '/suppliers', '/business']);
```

**Проблема:** Калькулятор — единственный интерактивный инструмент с немедленной ценностью — полностью отсутствует в навигации. Пользователь не найдёт его без целенаправленного поиска.

**Действие:**
1. Добавить в `guestNavItems` (строка 25):
```js
{ label: 'Калькулятор', href: '/tools/cost-calculator' },
```
2. Добавить в `desktopMoreNavItems` или заменить один из менее приоритетных пунктов primary:
```js
const desktopMoreNavItems = getNavItems(['/about', '/consulting', '/tools/cost-calculator', '/partners', '/general-sponsors', '/contacts']);
```
3. В мобильном меню добавить в группу «Платформа» (`mobile-site-menu.tsx`, строка 34):
```js
hrefs: ['/events', '/education', '/vacancies', '/suppliers', '/articles', '/tools/cost-calculator']
```

---

### 9. Nav — «О проекте» скрыт в «Ещё», хотя критичен для новых пользователей

**Файл:** `src/components/layout/site-header.tsx`, строка 47

**Текущее состояние:**
```js
const desktopMoreNavItems = getNavItems(['/about', '/consulting', '/partners', '/general-sponsors', '/contacts']);
```

**Проблема:** Новый пользователь первым делом ищет «О проекте». На десктопе он скрыт за «Ещё» — приходится угадывать.

**Действие (одно из двух):**

_Вариант А:_ Переместить `/about` в primary nav, убрав наименее используемый пункт:
```js
const desktopPrimaryNavItems = getNavItems(['/education', '/events', '/vacancies', '/suppliers', '/business', '/about']);
```

_Вариант Б:_ Переименовать «Ещё» → «О нас» когда активен путь `/about`, сделать его более очевидным (уже реализовано через `activeMoreItem?.label ?? 'Ещё'`, достаточно).

---

### 10. Footer — нет ссылки на калькулятор

**Файл:** `src/components/layout/site-footer.tsx`, строка 37–57

**Действие:** В секцию «Платформа» добавить строку:
```jsx
<AppLink className={footerLinkClassName} href="/tools/cost-calculator">
  Калькулятор
</AppLink>
```

---

## P2 — Визуальные улучшения

### 11. FeaturedNowCard — summary занимает место на маленьких экранах

**Файл:** `src/components/public/homepage-current.tsx`, строка 78

**Действие:** Скрывать summary ниже `sm`:
```jsx
<span className="featured-now-summary mt-2 hidden sm:block max-h-[4.5rem] ... md:mt-3 md:max-h-[5.2rem] ...">
  {card.summary}
</span>
```
Это разгружает оверлей на маленьких телефонах, оставляя только теги + заголовок + action.

---

### 12. NowCard — `sm:min-h-10` на description для выравнивания карточек в 3-col

**Файл:** `src/components/public/homepage-current.tsx`, строка 165

**Проблема:** В `sm:grid-cols-3` карточки разной высоты если контент различается. Сейчас `sm:min-h-10` на `<p>` задаёт минимум — это правильно, но если заголовки разной длины (одна карточка с длинным названием вакансии, другая с коротким «Материалы»), действие будет выглядеть неравномерно.

**Действие:** Добавить `sm:grid` + `sm:items-stretch` на родительский контейнер в `homepage-client.tsx` — grid уже автоматически выравнивает высоту строк. Убедиться что `sm:h-full` на Link стоит (уже есть).

---

### 13. Контрастность text-white/60 в badge и футере

**Файл:** `src/components/public/homepage-current.tsx`, строка 91  
**Файл:** `src/components/layout/site-footer.tsx`, строка 13

**Проблема:** `text-white/60` (#ffffff99) на тёмном фоне (#1a1a18) даёт контраст ~4.2:1 — чуть ниже WCAG AA (4.5:1) для мелкого текста.

**Действие:**
- `text-white/60` → `text-white/70` в badge (`homepage-current.tsx:91`)
- В футере уже используется `text-[var(--editorial-dark-muted)]` — проверить переменную на соответствие AA

---

### 14. HomeSectionCards — заголовок секции без `aria-labelledby` на section

**Файл:** `src/components/public/homepage-section-cards.tsx`, строка 62

**Действие:**
```jsx
<section
  aria-labelledby="home-sections-title"
  ...
>
  <div className="container">
    <div className="grid gap-8 xl:grid-cols-[...]">
      <div className="xl:pr-4">
        <PublicEyebrow>Платформа</PublicEyebrow>
        <PublicDisplayTitle id="home-sections-title" ...>Разделы платформы</PublicDisplayTitle>
```

---

### 15. ArticleGridSection — счётчик «Материалов: N» без aria-live

**Файл:** `src/components/public/article-grid-section.tsx`, строка 87

**Проблема:** При изменении фильтра счётчик обновляется, но screen reader не объявляет изменение.

**Действие:**
```jsx
<MetaChip aria-live="polite" aria-atomic="true" ...>
  Материалов: {content.total}
</MetaChip>
```

---

## Стратегические улучшения (Месяц 1–2)

### S1. Онбординг после регистрации

**Текущее состояние:** После регистрации пользователь попадает в `/profile` без каких-либо инструкций.

**Что сделать:**
1. Создать компонент `WelcomeBanner` — появляется один раз в первый визит в кабинет
2. Содержит: «Добро пожаловать в BARSYNERGY» + 3 действия (найти вакансию / посмотреть поставщиков / прочитать материал)
3. Закрывается кнопкой «Понятно», состояние сохраняется в `localStorage` или флагом в профиле
4. Файлы для создания: `src/components/layout/welcome-banner.tsx` + включение в layout кабинета

---

### S2. Социальное доказательство на главной

**Что сделать:**
1. Новая секция на `homepage-client.tsx` между hero и «Актуальным»: логотипы заведений/поставщиков партнёров
2. Или: цитата / короткий кейс от одного заведения (имя + город + результат)
3. Минимальный вариант: `«Уже в каталоге: [Название 1], [Название 2], [Название 3] и ещё N заведений СКФО»`

---

### S3. Hero — сегментированный первый шаг

**Файл:** `src/components/public/homepage-hero.tsx`, строка 76–83

**Текущее состояние:** Две кнопки «Смотреть вакансии» + «Найти обучение» — оба для соискателей.

**Что сделать:** Заменить на сегментацию:
```
[Я ищу работу]     [Я — заведение / поставщик]
```
При клике — переход в соответствующий раздел. Или хотя бы переименовать вторую кнопку: «Добавить заведение» / «Для бизнеса».

---

### S4. Empty states — проактивные CTA

**Где:** Все листинги (`/vacancies`, `/suppliers`, `/articles`, `/education`, `/events`)

**Что сделать:** Заменить пассивные тексты на вовлекающие:

| Страница | Было | Станет |
|---|---|---|
| Вакансии | «Вакансий пока нет» | «Появитесь первыми — разместите вакансию в барной индустрии СКФО. [Разместить вакансию →]» |
| Поставщики | «Поставщиков нет по фильтру» | «Не нашли нужного поставщика? Предложите его добавить. [Написать команде →]» |
| Материалы | «Материалов пока нет» | «Есть тема? Предложите — станьте автором первой публикации. [Предложить тему →]» |

---

### S5. Retention — уведомления о новых вакансиях

**Что сделать:**
1. Добавить поле `notifyOnNewVacancies: boolean` в модель пользователя
2. Форма подписки на странице `/vacancies` (для гостей — email, для авторизованных — галочка в профиле)
3. Cron-job или триггер при публикации вакансии → email зарегистрированным подписчикам
4. Текст письма: «Новая вакансия в BARSYNERGY: [Название] в [Город] → [Смотреть]»

---

### S6. Поиск — inline expansion вместо page transition

**Файл:** `src/components/layout/site-header.tsx`, строка 301–310

**Текущее состояние:** Клик по иконке поиска — полный page transition на `/search`.

**Альтернатива:** При клике на мобильном — expand input прямо в header (overlay поверх контента), как в Stripe/Vercel. Это убирает холодный старт страницы поиска.

**Сложность:** Medium (нужен state в header + анимация).

---

## Дизайн-система — технический долг

### D1. Унифицировать spacing секций

**Проблема:** Разные паттерны вертикальных отступов в разных компонентах.

**Инвентарь (найденные варианты):**
- `py-14 md:py-20`
- `py-16 max-[900px]:py-[60px]`
- `py-8 md:py-12`
- `py-10 md:py-14`

**Решение:** Определить шкалу и применить единообразно:
- `sm` (small section): `py-10 md:py-14`
- `md` (standard section): `py-14 md:py-20`
- `lg` (hero/feature section): `py-20 md:py-28`

---

### D2. Унифицировать breakpoints — убрать `max-[Npx]`

**Проблема:** `max-[900px]`, `max-[640px]`, `max-[480px]` — нестандартные breakpoints. Усложняют отладку и создают рассинхрон с Tailwind-дефолтами.

**Файлы с нарушениями:**
- `home-cta-faq-section.tsx`: `max-[900px]:grid-cols-1`, `max-[640px]:px-6`
- `homepage-hero.tsx`: `max-[640px]:text-[clamp(...)]`
- `public-content-detail-page.tsx`: `max-[480px]:text-[...]`

**Решение:** Перевести на `sm:` (640px), `md:` (768px), `lg:` (1024px) с mobile-first логикой.

---

### D3. Унифицировать min-height кнопок

**Проблема:** Встречаются `min-h-10` (40px), `min-h-11` (44px), `min-h-12` (48px) без правила.

**Решение:** Зафиксировать в документации:
- `size="sm"` → `min-h-9` (36px) — inline/compact
- `size="default"` → `min-h-11` (44px) — стандарт
- `size="lg"` → `min-h-12` (48px) — prominent CTA

---

### D4. Убрать дублирующиеся разделители

**Встречаются три паттерна горизонтального разделителя:**
1. `border-t border-[var(--line)]`
2. `border-t border-white/15`
3. `<span className="h-3 w-px bg-[var(--line)]" aria-hidden="true" />`

Паттерн 2 — только на тёмных поверхностях (`data-theme="dark"`), это нормально. Паттерн 3 — вертикальный разделитель, другая роль. Всё ок — документировать правило в комментарии или CLAUDE.md.

---

## Приоритизированный roadmap

### Неделя 1 (уже сделано или делать прямо сейчас)
- ✅ FeaturedNowCard mobile overlay fix
- ✅ HomeCtaFaqSection кнопка
- ✅ Calculator order-first mobile
- ✅ HomeSectionCards sm:grid-cols-2
- ✅ ArticleGridSection filter flex-col mobile
- ✅ Editorial stack layout (homepage)
- 🔴 [#3] FeaturedNowCard → `<h3>` вместо `<span>` (5 мин)
- 🔴 [#8] Калькулятор в nav (15 мин)
- 🟡 [#7] Убрать «Платформа развивается» (5 мин)
- 🟡 [#11] Summary hidden на mobile (10 мин)

### Неделя 2
- 🟡 [#1] Проверить FeaturedNowCard на SE/360px + min-h страховка
- 🟡 [#6] Calculator sticky на lg (не только xl)
- 🟡 [#9] О проекте в primary nav
- 🟡 [#10] Калькулятор в footer
- 🟡 [#13] Контраст text-white/70

### Недели 3–4
- 🟢 [S2] Social proof секция на главной
- 🟢 [S3] Сегментация hero CTA
- 🟢 [S4] Проактивные empty states
- 🟢 [D1] Унификация spacing секций
- 🟢 [D2] Убрать max-[Npx] breakpoints

### Месяц 2
- 🔵 [S1] Онбординг welcome screen
- 🔵 [S5] Email-уведомления о вакансиях
- 🔵 [S6] Inline поиск в header
- 🔵 Настройка аналитики (события из аудита)
- 🔵 A/B тест: сегментированный hero CTA

---

## Ключевые метрики для отслеживания

После внедрения правок настроить события в аналитике:

| Событие | Место | Метрика |
|---|---|---|
| `cta_hero_click` | Hero кнопки | CTR по сегменту |
| `calculator_result_viewed` | Result rail | % activation калькулятора |
| `application_submitted` | Все формы | CR заявок |
| `application_abandoned` | Все формы | Abandonment rate |
| `nav_calculator_click` | Header | Дисковерабельность инструмента |
| `featured_card_click` | FeaturedNowCard | Engagement с контентом |
| `nowcard_click` | NowCards | Распределение переходов |
| `faq_expanded` | HomeCtaFaqSection | Вовлечённость в FAQ |
| `search_submitted` | `/search` | Потребности пользователей |
| `registration_completed` | `/auth/register` | Registration rate |
