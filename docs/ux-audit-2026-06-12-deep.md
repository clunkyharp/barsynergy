# BARSYNERGY — глубокий UX/UI-аудит (2026-06-12)

**Контекст.** Премиум editorial-платформа specialty/HoReCa СКФО. Не SaaS, не маркетплейс. Аудит против актуального состояния ветки `dev` после fix-батча `58d6c13` + cabinet-аудита 2026-06-12. Цитаты — `file:line`.

**Источник.** Сводный отчёт по 17 направлениям. Покрывает публичные экраны, кабинеты, формы, действия, состояния, тексты, дизайн-систему, адаптив, сценарии.

---

## 0. Baseline — уже сделано (не флагать повторно)

| Что | Где | Статус |
|---|---|---|
| Dual-audience router в hero | `src/components/public/homepage-hero.tsx:83-115` | ✅ |
| Hero trust markers вместо `null` | `src/components/public/homepage-hero.tsx:49-67` | ✅ |
| Регистрация в шапке | `src/components/layout/site-header.tsx:254-265` | ✅ |
| Footer CTA per-route | `src/components/layout/site-footer.tsx:73-151` | ✅ |
| Welcome-блоки профиля и бизнес-кабинета | `src/app/profile/page.tsx:105-140`, `src/app/(business-workspace)/business/cabinet/page.tsx:47-82` | ✅ |
| Дубль аватара убран | `src/app/profile/page.tsx:141-162` | ✅ |
| KPI-тайлы на обзоре профиля | `src/app/profile/page.tsx:164-195` | ✅ |
| Topic-details секция в контакт-форме | `src/components/public/contact-application-form.tsx:148-243` | ✅ |
| Footer `<h3>` + аккордеон на mobile | `src/components/layout/site-footer.tsx:38-64` | ✅ |
| Header `aria-expanded` на «Ещё» | `src/components/layout/site-header.tsx:172` | ✅ |

---

## 1. Краткое резюме

**Общее.** Платформа выросла от MVP к premium editorial: dark hero, Cormorant Garamond, тёплая палитра, тонкие dividers, низкие radius. Три области тормозят зрелость:

1. **Кабинеты ощущаются как bootstrap-форма.** Server-action `action={updateXxx}` → full POST → redirect. Соседние формы теряют черновики. Skills = чекбоксы. Пароль min 6. Аватар без кропа. Весь S1–S3 cabinet-плана 2026-06-12 в коде ещё не приземлён.
2. **Editorial-обещание ломается в формах.** Базовые `<Input>`/`<Select>` OK, но `SkillsSelector` использует raw `<input>` вне дизайн-системы (`src/components/profile/skills-selector.tsx:37-43`). Часть кнопок в кабинетах `size="sm"` (h-9=36px) — ниже WCAG touch 44px.
3. **Anti-proof тексты остались.** `business/page.tsx`, `about/page.tsx` всё ещё с placeholder-метриками («СКФО», «100% ручная проверка», «1 точка входа»). Не верифицируемо. Ломает позиционирование премиум-медиа.

**Главное — пять P0:**

1. Cabinet save: убрать full-POST, перейти на `useFormState` + inline-success. Соседи не теряют черновики.
2. Skills: tag-input + autocomplete + `Skill.source: ADMIN | USER_GENERATED`.
3. Сегмент-табы `Активные / Закрытые / Архив` в `/profile/responses`, `/profile/inquiries`, `/business/cabinet/requests`, `/business/cabinet/responses`.
4. Hardcoded anti-proof убрать с `/business` и `/about`. Две реальные метрики или ничего.
5. Avatar cropper. Сейчас `FileUpload` без preview и кропа.

---

## 2. Critical issues (P0)

### P0-1. Cabinet save = full POST → reset черновиков соседних форм
- **Где.** `src/app/profile/settings/page.tsx` — 7 секций, каждая `<form action={updateAvatar|updateBasicProfile|updateJobSearch|updateProfileSkills|updateWorkExperiences|changePassword}>`. Server action делает redirect.
- **Почему плохо.** Премиум-кабинет не должен «перезагружаться». Юзер заполнил «Основное» + начал «Статус поиска» → нажал Сохранить → черновик «Статус поиска» исчез.
- **Фикс.** Server-action возвращает `{ok: true}` без redirect; клиент через `useActionState` + `useTransition` обновляет state + показывает inline-success «Сохранено · HH:MM». Черновики 24ч в `localStorage` ключ `profile-draft-<section>`.
- **Приоритет.** High.

### P0-2. SkillsSelector — preset-чекбоксы, не tag-input
- **Где.** `src/components/profile/skills-selector.tsx:46-66`. CheckboxField на все скиллы базы.
- **Почему плохо.** Не масштабируется, юзер не может добавить свой навык, выглядит как опросник для админа, не editorial.
- **Фикс.** Tag-input (Enter/запятая → тег), autocomplete из `Skill`, новые навыки → `Skill.source = USER_GENERATED` для модерации. Лимит 20 тегов, 1–40 симв. Стиль — meta-chip с × для удаления.
- **Приоритет.** High.

### P0-3. Фильтры по статусам = 7 enum-опций
- **Где.** `src/app/profile/responses/page.tsx:98-110`, `src/app/profile/inquiries/page.tsx`, `src/app/(business-workspace)/business/cabinet/requests/`, `responses/`.
- **Почему плохо.** Dropdown «Все статусы / Черновик / На рассмотрении / В работе / Подтверждено / Отклонено / Завершено / Архив» — когнитивная перегрузка. Юзер хочет быстро отделить активный диалог от закрытого.
- **Фикс.** Сегментный контрол `Активные / Закрытые / Архив` (компонент `src/components/ui/segmented-control.tsx` уже есть). Сортировка — стрелка ▼/▲ возле поиска, мгновенный `router.replace` без кнопки «Применить». Бейдж статуса в карточке только если ≠ нейтральный.
- **Приоритет.** High.

### P0-4. Anti-proof stats на /business + /about
- **Где.** `src/app/(public)/business/page.tsx`, `src/app/(public)/about/page.tsx`.
- **Почему плохо.** «СКФО» как «число» = placeholder. «100% ручная проверка», «1 точка входа» — подсказывает MVP. Ломает positioning премиум-медиа.
- **Фикс.** Удалить facts-полосу до получения реальных метрик ИЛИ оставить 2 реальных (#партнёров каталога, #опубликованных материалов).
- **Приоритет.** High.

### P0-5. Avatar без cropper
- **Где.** `src/app/profile/settings/page.tsx:101-118`. `FileUpload` без preview/кроппинга.
- **Почему плохо.** Результат непредсказуем; фото обрезается сервером по centerCrop без согласия юзера.
- **Фикс.** Новый `src/components/profile/avatar-cropper.tsx` — модалка, canvas, круг-маска, экспорт 1:1 512×512 JPEG q=0.9. Server-action `updateAvatar` менять не надо.
- **Приоритет.** High.

### P0-6. Password min 6 + слабая защита
- **Где.** `src/app/profile/settings/page.tsx:257,260,264`. `PasswordInput ... minLength={6}` + хелпер «Минимум 6 символов».
- **Почему плохо.** B2B-доступ к кабинету компании за 6-символьным паролем = compliance fail. NIST baseline ≥ 10.
- **Фикс.** Минимум 10, расширить `PasswordPairValidation` (длина/энтропия/HIBP k-Anonymity). Текст: «Минимум 10 символов. Слова + цифры или фраза».
- **Приоритет.** High.

---

## 3. UI issues

| # | Где | Проблема | Фикс | P |
|---|---|---|---|---|
| UI-1 | `skills-selector.tsx:37-43` | raw `<input>` вне дизайн-системы — нет focus-ring, нет data-filled | заменить на `<Input>` (search variant) | M |
| UI-2 | `profile/page.tsx:157,216,241` | Action buttons `size="sm"` (h-9=36px) — ниже WCAG touch 44px | `size="md"` или принудительный `min-h-11` | M |
| UI-3 | `business/cabinet/page.tsx:84-105` | KPI-полоса = 4 числа + кнопка в одной строке; на 1024px ломается | grid в `<Panel>`, KPI в `<dl>`, кнопка в `<ActionRow>` | M |
| UI-4 | `homepage-client.tsx:78-89` | «Свежие карточки / Свежее на платформе» — eyebrow≈h2 | оставить только h2 | L |
| UI-5 | `homepage-hero.tsx:83-115` | Два audience-карточки одинакового веса. Editorial требует асимметрии | основной CTA крупнее, вторая — link-style | L |
| UI-6 | `site-header.tsx:215-238` | Conditional CTA (Разместить вакансию / Найти вакансии) — теряется на лэндингах | в шапке оставить Register+Login, conditional CTA — в hero/footer | L |
| UI-7 | `profile/settings/page.tsx:99-119` etc. | 7 секций портянкой. Нет аккордеона | `<details>` per section + persist в `localStorage: profile-section-open: string[]` | M |
| UI-8 | `profile/page.tsx:226-244` | Кольцо прогресса + текст + 2 строки + кнопка в одной flex-row. На narrow ломается | вертикальный layout на <md | L |
| UI-9 | `business/cabinet/page.tsx:107-145` | `BusinessProfileSummary` (вся форма компании) на дашборде = гигант | вынести в `/business/cabinet/settings`, на обзоре — summary-card | M |
| UI-10 | `homepage-client.tsx:96-142` | Home about-panel — карточка-в-карточке (container + border + bg) | одна поверхность, убрать внутренний контейнер | L |

---

## 4. UX issues

| # | Место | Проблема | Фикс | P |
|---|---|---|---|---|
| UX-1 | Settings/Skills | Кнопка `Сохранить навыки` активна при пустом state | disable при selectedSkillIds.size===0 и без диффа от initial | M |
| UX-2 | `/profile/responses` (`responses/page.tsx:130`) | Empty с фильтрами — единственная кнопка «Сбросить» | + пилюли активных фильтров со снятием | M |
| UX-3 | `business/cabinet` | NextActionPanel пункт «Проверить профиль» — нет state «готово» с галочкой | done-state + auto-hide через 7 дней | M |
| UX-4 | `profile/page.tsx:151-155` | MetaChip «Активно ищу работу» — нейтральный chip, кликабельность неясна | link → settings#search ИЛИ убрать interactive look | L |
| UX-5 | `profile/page.tsx:197-205` | InlineAlert о скрытом профиле — только если `jobSearchStatus !== NOT_LOOKING` | показать также при ACTIVE + isPublic=false с CTA «Открыть профиль» одним кликом | M |
| UX-6 | `/auth/register` | Single chip "Я владею заведением" — не выбор, не клик | удалить ИЛИ реальный 2-role chooser выше формы | M |
| UX-7 | `/auth/login` | После logout email-input сохраняет последний email | очистить или дать "войти как другой" | L |
| UX-8 | `contact-application-form.tsx:31-93` | 9 различных `messageLabel` + `topicDetailsTitle` + `topicDetailsHint` — большая ladder в JSX | вынести в `contact-application-form-constants.ts` | M |
| UX-9 | Avatar action — full reload, теряется скролл | связано с P0-1 | см. P0-1 | M |
| UX-10 | `homepage-client.tsx:78-89` | «Свежее на платформе» дублирует «Актуальное» (тот же контент) | объединить ИЛИ дать второй угол (топ-10 за неделю) | M |
| UX-11 | `responses/page.tsx:140-172` | `UnreadBadge` + StatusBadge + кнопка — три акцента в правой колонке | unread → red-dot на заголовке (top-right overlay), статус — chip под датой | M |
| UX-12 | `/business/cabinet/requests` | Нет фильтра «непрочитанные» | toggle + бейдж count | M |

---

## 5. Forms audit

### Найдено форм (16+)
- **Auth:** `auth/login`, `auth/password-reset`, `auth/register`, `auth/register/user`, `auth/business-activation`, `auth/activate`, `auth/verify-email`
- **Публичные заявки:** `business-solution-form`, `business-request-form`, `contact-application-form`, `consulting-request-form`, `education-application-forms`, `event-application-form`, `supplier-application-form`, `partner-application-form`, `vacancy-application-forms`
- **Кабинет:** `profile/settings` × 7 секций; `business/cabinet/*` request-form
- **Фильтры:** `PublicFilters` (sidebar/stacked/toolbar variants)
- **Калькулятор:** cost-calculator с ingredient/additional-cost editors

### Проблемы

| # | Форма | Проблема | Фикс | P |
|---|---|---|---|---|
| F-1 | `profile/settings/*` 7 sections | full-POST, нет inline-success, теряет соседи | P0-1 | H |
| F-2 | `SkillsSelector` | raw input, no `Input` component | UI-1 / P0-2 | H |
| F-3 | `ContactApplicationForm` | 9-вариантный label/title/hint map в JSX | UX-8 | M |
| F-4 | `PublicFilters` (sidebar) | Кнопка «Применить» вместо instant | sidebar тоже instant + Reset | M |
| F-5 | `auth/register/user` | Вероятно нет real-time email/password validation | дублирующая Zod-валидация client+server | M |
| F-6 | `experience-editor.tsx` | Нет client-side `endDate >= startDate` | client-zod check | M |
| F-7 | `business-solution-form.tsx` | LG-grid `0.42fr_0.58fr` — left-panel декоративно. На md ломается | media-query коллапсирует panel сверху | L |
| F-8 | `password-input.tsx` (settings, register) | min 6 + нет HIBP | P0-6 | H |
| F-9 | Все формы | `action={serverAction}` → нет client prevent-submit при невалидном; браузерный popup ломает editorial visual | `noValidate` + zod-client + кастомные FieldError | M |
| F-10 | `FileUpload` для аватара | нет preview, нет crop | P0-5 | H |
| F-11 | `business/cabinet/page.tsx:109` `BusinessProfileSheet` | гигант форма прямо в дашборде | UI-9 | M |
| F-12 | Все формы | success → `redirect(?success=...)` + InlineAlert наверху. На длинной форме юзер не видит | inline FieldSuccess + scroll к началу | M |
| F-13 | `NotificationSettings` | Не разделено «не подписан» vs «браузер не разрешил» | 2 разных empty-state | M |

### Состояния полей

| State | Покрытие | Где не хватает |
|---|---|---|
| focus | ✅ field-styles | — |
| hover | ⚠️ Button OK, Input border не меняется | input hover-border |
| disabled | ✅ button + input | — |
| error | ✅ FieldError + aria-live | сообщения часто generic «Проверьте поля» (register) — давать field-level |
| success | ⚠️ FieldSuccess в API есть, не используется | profile-save inline-success |
| loading | ✅ SubmitButton loading | — |
| filled | ✅ data-filled через autofill listener | — |
| required-marker | ✅ FieldLabel | — |

---

## 6. Buttons and actions audit

| # | Кнопка / действие | Проблема | Фикс | P |
|---|---|---|---|---|
| B-1 | `profile/page.tsx:157,216,241` редактировать/заполнить/дозаполнить | size="sm" h-9=36px touch | size="md" | M |
| B-2 | `business/cabinet/page.tsx:101` «Создать заявку» size="sm" | основной CTA не должен быть sm | size="md" + primary | M |
| B-3 | `homepage-hero.tsx:102-108` audience CTAs | `tracking-[0.08em]` + `uppercase` на «Открыть для бизнеса» обрезается на 360px | text-transform off на mobile / shorten label | L |
| B-4 | `site-footer.tsx:200-205` Button inverse на dark | hover →accent ломает консистентность | вариант `on-dark` | L |
| B-5 | `business/cabinet/page.tsx:139-142` closed-requests inline-block | не интерактивный, выглядит как карточка | link → archive view | L |
| B-6 | `business/page.tsx:159-162` «Перейти к форме» (anchor #business-request) | повторяется в hero + benefits | оставить один | L |
| B-7 | `homepage-client.tsx:74-76` «Открыть поиск» variant="link" | `px-0` → bbox мелкий, touch ≤ 36px | min-h-11 + p-2 | M |
| B-8 | `profile/responses/page.tsx:131` «Сбросить фильтры» | href переходит на page без query вместо `router.replace` | router.replace from client form | L |
| B-9 | `auth/login` LoginForm | проверить наличие role-tab между user/business | role-tab если нет | M |
| B-10 | `site-header.tsx:215-237` conditional CTA per role | на home-top тёмная кнопка `Найти вакансии` контрастит слабо | accent-border | L |

### Hover/active/focus покрытие

Кнопки OK (variants + focus-visible:ring). KPI-tiles `<a>` — есть hover-border. ProfileSheet sections — нет hover. NavLink — OK. CheckboxField — отдельно проверить.

---

## 7. Text and microcopy audit

| Где | Текст | Проблема | Замена |
|---|---|---|---|
| `homepage-hero.tsx:147` | «Платформа для кофейных баров СКФО» | «кофейных баров» сужает | «Платформа барной индустрии СКФО» |
| `homepage-hero.tsx:149-151` | «...всё в одном месте...» | generic SaaS | «Один контур: обучение, вакансии, поставщики, события, инструменты» |
| `homepage-hero.tsx:26,32` | «путь к заявкам, каталогу» | мутно | «Каталог заведений и рабочий кабинет для команды» |
| `homepage-client.tsx:69-71` | «Свежие карточки» + «Свежее на платформе» + «Живые карточки из вакансий...» | три раза «карточки» | eyebrow «Что нового», h2 «Свежее на платформе», описание удалить |
| `business/page.tsx:50` | «Видимость в профильной среде» | канцелярит | «Заметность для гостей, кандидатов и партнёров» |
| `business/page.tsx:62` | «Без случайных карточек / Команда вручную сверяет базовые данные» | anti-proof | «Каждая карточка проходит редакторскую проверку» |
| `auth/login/page.tsx:55` | «Для заведений и специалистов BARSYNERGY.» | дубль h1 | «Войдите как специалист или представитель компании» |
| `auth/register/page.tsx:69-71` | «...нужен рабочий кабинет» | generic | «...кому нужен доступ к заявкам, каталогу и журналу» |
| `auth/register/page.tsx:73-75` | Decoration chip «Я владею заведением или представляю бренд» | не клик | удалить ИЛИ 2-role selector |
| `profile/page.tsx:66-69` | «Не хватает: имя» | оборванное единственное число | «Добавьте ещё: имя» |
| `profile/page.tsx:235` | «Заполненный профиль помогает работодателям быстрее понять...» | banal | «Полный профиль чаще попадает в подборки работодателей» или удалить |
| `business/cabinet/page.tsx:57-59` | «Доступ открыт» | формально | «Кабинет активен. Заполните профиль и создайте первую заявку» |
| `business/cabinet/page.tsx:64` | «Ответы команды и новые реакции» | соц-сленг | «Ответы команды и новые отклики» |
| `contact-application-form.tsx:101` | «Напишите нам» | generic | «Опишите задачу — ответим на ваш контакт» |
| `contact-application-form.tsx:260` | «После отправки ответим в течение рабочего дня по указанному способу связи.» | дубль | «Отвечаем в течение рабочего дня» |
| `business-solution-form.tsx:57-60` | «В форме не собираем оплату» | вводит тему денег | удалить |
| `business-solution-form.tsx:71-85` | «Что написать» bullet-list | checklist, не editorial | нумерация или подзаголовки |
| `profile/responses/page.tsx:124-128` | «...Отклики, отправленные без входа, могут не отображаться...» | технический хвост пугает | «Отклики на вакансии появятся здесь» + tooltip если надо |
| `auth/register/page.tsx:10` | «Заявку получили. Обычно отвечаем за 1–2 рабочих дня.» | OK | — |

### Generic SaaS-фразы из стоп-листа

Не найдено («Откройте новые возможности», «Ваш успех начинается здесь» и т.п. отсутствуют). ✅

### Tone of voice

Editorial, спокойный, конкретный — где есть. Ломается: `business/page.tsx` benefits (канцелярит), homepage live-cards (дубли), placeholder «Coffee Point» в форме (англоязычный пример для русской аудитории — заменить на нейтральный).

---

## 8. Design system inconsistencies

| # | Что выбивается | Где | Фикс |
|---|---|---|---|
| DS-1 | raw `<input>` вне `Input` | `skills-selector.tsx:37-43` | `<Input>` |
| DS-2 | Inline rounded на `<a>` | `profile/page.tsx:185-194` (KPI-tiles) | вынести в `Card` patterns |
| DS-3 | `<section>` + border + bg вместо `<Panel>` | `business/cabinet/page.tsx:47-82,84-105,139-143` | `<Panel tone="elevated">` |
| DS-4 | `gap-px` grid-like processSteps | `business/page.tsx:132-145` | `card-patterns/CardGrid` |
| DS-5 | MetaChip `variant="filter"` для skill vs `variant="inverse"` в supplier-form hero | разные visuals под одним именем | `variant="skill"` отдельно |
| DS-6 | Eyebrow text `text-[11px] uppercase tracking-[0.12em]` повторяется по дашборду | разные strings | компонент `<Eyebrow muted />` |
| DS-7 | Raw `<a>` для KPI tiles вместо `AppLink` | `profile/page.tsx:124,185` | `AppLink` для prefetch + style consistency |
| DS-8 | `<details>` для footer-accordion vs custom button-state в profile-sidebar | разные подходы | единый `<DisclosurePanel>` |
| DS-9 | Hero gradient inline `style={{background:...}}` | `homepage-hero.tsx:137-139` | CSS class `hero-gradient` в `tokens.css`/`public.css` |
| DS-10 | `home-services-section`, `editorial-current-section`, `home-about-panel` — custom classes без общей системы | разные CSS-файлы | grouping в `public.css` или Tailwind утилиты |

---

## 9. Recommended fixes — план по спринтам

### S1 (4 дня) — критичные UX
1. **P0-1** Cabinet save без full-POST (`useFormState` + inline-success).
2. **P0-3** Сегмент-табы `Активные/Закрытые/Архив` — новый `src/components/messaging/conversation-list-tabs.tsx` для responses/inquiries/business-requests/business-responses.
3. **P0-4** Удалить anti-proof facts на `/business` + `/about`.
4. **P0-5** Avatar cropper модалка.
5. **UI-9** Вынести `BusinessProfileSheet` из dashboard в `/business/cabinet/settings`.

### S2 (5 дней) — design polish + новые механики
6. **P0-2** SkillsSelector → tag-input + autocomplete + `Skill.source` миграция.
7. **UI-7** Settings секции в `<details>` accordion + localStorage persist.
8. **DS-1, DS-3, DS-7** Заменить raw `<input>`, `<section>` с border, `<a>` на компоненты дизайн-системы.
9. **UX-3** NextActionPanel — done-state с галочкой.
10. **F-13** Notification empty-state раздельный.

### S3 (3 дня) — security + a11y
11. **P0-6** Password min 10 + HIBP k-Anonymity на register/changePassword.
12. **B-1, B-2, B-7, UI-2** Touch-target ≥ 44px на всех action-кнопках в кабинетах.
13. **UI-8** Vertical layout ProgressRing panel на <md.
14. **UX-5** Скрытый профиль + ACTIVE → inline-CTA одним кликом.

### S4 (2 дня) — texts + metrics
15. **Микрокопирайтинг** все пункты секции 7.
16. **UX-10** Объединить «Актуальное» + «Свежее на платформе» ИЛИ дать второй угол.
17. **Metrics** — замер: T до первого save, % заполненных профилей до/после, % drop при заявке поставщику.

---

## 10. Checklist для разработчика

```
SETTINGS REFACTOR (S1)
[ ] lib/profile/basic-profile-actions.ts → return {ok:true}, no redirect
[ ] lib/profile/job-search-actions.ts → ditto
[ ] lib/profile/skills-actions.ts → ditto
[ ] lib/profile/work-experience-actions.ts → ditto
[ ] lib/profile/avatar-actions.ts → ditto
[ ] lib/profile/password-actions.ts → ditto
[ ] components/profile/section-form.tsx — обёртка useActionState + useTransition
[ ] inline FieldSuccess «Сохранено · HH:MM»
[ ] localStorage profile-draft-<section> с TTL 24h

CABINET TABS (S1)
[ ] components/messaging/conversation-list-tabs.tsx — SegmentedControl Активные/Закрытые/Архив
[ ] profile/responses/page.tsx — Select → табы
[ ] profile/inquiries/page.tsx — то же
[ ] business/cabinet/requests/page.tsx — то же
[ ] business/cabinet/responses/page.tsx — то же
[ ] router.replace без кнопки «Применить»
[ ] unread наверх

ANTI-PROOF (S1)
[ ] business/page.tsx — удалить heroStats {value:'4'}, {value:'СКФО'}, {value:'100%', label:'ручная проверка'}
[ ] about/page.tsx — удалить facts ['6+',...], ['СКФО',...], ['1','точка входа']
[ ] заменить на 2 реальные метрики ИЛИ удалить блок

AVATAR (S1)
[ ] components/profile/avatar-cropper.tsx — модалка, canvas, круг-маска
[ ] export 1:1 512×512 JPEG q=0.9
[ ] profile/settings/page.tsx avatar section — FileUpload → cropper

SKILLS TAG-INPUT (S2)
[ ] prisma migration: Skill.source enum ADMIN|USER_GENERATED
[ ] lib/profile/skills-actions.ts — addSkill (slug + USER_GENERATED)
[ ] components/profile/skills-selector.tsx — tag-input
[ ] Enter/comma → tag, × → remove, autocomplete dropdown
[ ] limit 20, length 1-40
[ ] admin moderation view для USER_GENERATED

SETTINGS ACCORDION (S2)
[ ] components/profile/settings-section.tsx — обёртка <details>
[ ] persist в localStorage profile-section-open: string[]
[ ] open default из URL hash или с ошибкой
[ ] ProfileTabs клик → open section + scroll

BUSINESS DASHBOARD (S1)
[ ] вынести BusinessProfileSheet form в business/cabinet/settings
[ ] на dashboard — BusinessProfileSummary (read-only + «Редактировать»)
[ ] KPI-полоса — Panel tone="elevated"
[ ] NextActionPanel done-state с галочкой

PASSWORD (S3)
[ ] zod schema min 10
[ ] PasswordPairValidation: длина + энтропия + HIBP
[ ] lib/security/hibp.ts — k-Anonymity к api.pwnedpasswords.com
[ ] обновить settings.tsx и auth/register placeholder

A11Y (S3)
[ ] profile/page.tsx, business/cabinet/page.tsx — size="md" на action buttons
[ ] homepage-client.tsx — variant="link" + min-h-11
[ ] ProfileProgressRing — aria-label="Профиль заполнен на N%"

TEXTS (S4)
[ ] homepage-hero.tsx — «Платформа барной индустрии СКФО», убрать «всё в одном месте»
[ ] homepage-client.tsx live-cards — eyebrow «Что нового», h2 «Свежее», описание убрать
[ ] business/page.tsx — переписать benefits без канцелярита
[ ] business-solution-form.tsx — убрать «не собираем оплату»
[ ] profile/responses/page.tsx empty — убрать хвост «без входа»
[ ] auth/register/page.tsx — убрать decoration chip
[ ] profile/page.tsx formatMissingFields — единственное число
[ ] contact-application-form.tsx — вынести labels в constants
[ ] business/cabinet/page.tsx welcome — «Кабинет активен», «отклики» вместо «реакции»

DESIGN SYSTEM (S2)
[ ] components/ui/disclosure-panel.tsx — единый collapsible
[ ] components/ui/eyebrow.tsx — единый компонент eyebrow
[ ] public.css — hero-gradient class заменить inline-style
[ ] skills-selector input → Input component
[ ] business/cabinet/page.tsx <section> wrappers → <Panel>
```

---

## 11. Итоговые оценки (1–10)

| Метрика | Score | Δ vs 2026-06-11 | Комментарий |
|---|---|---|---|
| UX | **7.0** | +0.6 | hero-router, welcome-блоки, P0 убраны |
| UI | **8.0** | +0.2 | editorial выдержан, минорные несостыковки |
| Навигация | **7.2** | +0.4 | header search + register + dual-role |
| Конверсионность | **6.0** | +0.8 | dual-CTA hero, route-CTA, но cabinet save ломает flow |
| Доверие | **5.4** | +0.8 | anti-proof частично убран, но /business + /about ещё с placeholder-метриками |
| Доступность | **6.6** | +0.2 | aria-expanded есть, touch < 44 на sm-buttons |
| Mobile | **6.8** | +0.2 | footer-accordion OK, hero adapt OK, KPI-полоса ломкая |
| **Overall** | **6.9** | +0.6 | |

---

## 12. Top-10 проблем

1. Cabinet save = full POST, сбрасывает соседей (P0-1).
2. SkillsSelector чекбоксы вместо tag-input (P0-2).
3. 7-enum dropdown статусов вместо сегмент-табов (P0-3).
4. Anti-proof facts на /business, /about (P0-4).
5. Avatar без кроппера (P0-5).
6. Password min 6 + нет HIBP (P0-6).
7. BusinessProfileSheet (гигант форма) на dashboard (UI-9).
8. Settings 7 секций портянкой без аккордеона (UI-7).
9. Touch-target < 44px на size="sm" CTA в кабинетах (UI-2, B-1, B-2).
10. Homepage дубль секций «Актуальное» + «Свежее на платформе» (UX-10).

---

## 13. Top-10 эффективных улучшений

1. Refactor server-actions → `{ok:true}` + `useActionState` → конверсия настроек ↑15–20%.
2. Tag-input скилов → % полных профилей ↑10%.
3. Сегмент-табы статусов → CTR на «Подробнее» ↑.
4. Avatar cropper → % профилей с аватаром ↑.
5. Убрать anti-proof facts → trust ↑, NPS ↑.
6. HIBP password check → security baseline.
7. Аккордеон settings → time-to-first-save ↓.
8. Расширить welcome-карточки на /business/cabinet → activation ↑.
9. Inline-CTA в editorial-материалах (по аналогии с per-route footer-CTA).
10. Editorial микрокопирайтинг (секция 7) → premium-feel ↑.

---

## 14. Сравнение с конкурентами

| Конкурент | Сильнее у них | Что взять |
|---|---|---|
| sprudge.com | Editorial typography, фото-первый layout, минимум CTA | материалу больше воздуха, h1 крупнее, бесшумный sidebar |
| barista magazine | Чёткое разделение editorial vs job board | секции job/edu не должны выглядеть как menu-tiles |
| hh.ru | Моментальные фильтры, segmented tabs статусов | взять прямо в S1 |
| eventica.com | Onboarding бизнес-кабинета с пошаговым progress | welcome-карточка есть, расширить до prog-checklist |
| linkedin profile | Tag-input навыки + endorse | tag-input взять, endorse пока не делать |

---

## 15. A/B-кандидаты

1. **Hero CTA wording** — «Открыть для бизнеса» vs «Открыть каталог».
2. **Hero layout** — dual-route cards vs single-CTA + secondary link.
3. **Settings flow** — full-POST (текущий) vs inline-save.
4. **Status filter** — Select vs Segmented Tabs.
5. **Welcome-banner** — текущая 3-CTA-карточка vs 1-CTA + чек-лист.

---

## Источники / связано
- [[ux-audit-2026-06-11]] — baseline Top-10
- [[ux-audit-cabinets-2026-06-12]] — глубокий аудит кабинетов + 4-спринт-план
- [[architecture-routes]] — карта роутов
- [[design-system]] — coffee-bar токены
- Файлы кода: `src/components/public/homepage-hero.tsx`, `src/components/public/homepage-client.tsx`, `src/components/layout/site-header.tsx`, `src/components/layout/site-footer.tsx`, `src/app/profile/page.tsx`, `src/app/profile/settings/page.tsx`, `src/app/profile/responses/page.tsx`, `src/app/(business-workspace)/business/cabinet/page.tsx`, `src/app/(public)/business/page.tsx`, `src/app/(public)/suppliers/page.tsx`, `src/components/public/contact-application-form.tsx`, `src/components/public/business-solution-form.tsx`, `src/components/profile/skills-selector.tsx`, `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/form-field.tsx`.

**Источник истины — текущее состояние ветки `dev`, коммит `58d6c13`.**
