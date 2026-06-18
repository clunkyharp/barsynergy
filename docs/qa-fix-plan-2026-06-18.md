# QA Fix Plan — 2026-06-18 (visual remarks → code tasks)

**Audience:** implementation agent that CANNOT do visual QA. Every task below has exact
file:line anchors, the current code, the required change, and a **non-visual self-check**
(grep / build / count) so completion can be verified without looking at a browser.

Branch: `prod`. Run `npm run build` (or `npx tsc --noEmit && npm run lint`) after each task.

Screenshot → task index:
- Img#2 → Task 1 (business "Что получите" title overflow)
- Img#3 → Task 2 (contact channel cards: text wrap, button overflow, height mismatch)
- Img#4 → Task 3 (contacts "Не нашли свой случай?" route cards: eyebrow, icons, color)
- Img#5 → Task 4 (articles "Предложить тему" — internal-only, remove)
- Img#6 → Task 5 (PageInfoSection sidebar — center/fill vertical space)
- Img#7 → Task 6 (specialist directory: "Найдено N" too big, mode UI inconsistent)
- Img#8 → Task 8 (events subscribe block unfinished)
- Cross-cutting → Task 7 (scan duplicate/abstract section copy)

---

## Task 1 — Business "Что получите" title overflows under right cards (Img#2)

**File:** `src/app/(public)/business/page.tsx:179`

**Problem:** Section uses 2-col grid `xl:grid-cols-[minmax(18rem,0.54fr)_minmax(0,1.46fr)]`
(line 175). Left column min width = 18rem (288px). The display title defaults to
`size="section"` = `md:text-[64px]` (see `public-primitives.tsx:90`). The single word
"получите" at 64px is wider than 288px, so it overflows to the right and renders UNDER the
right-hand benefit cards.

**Current (line 179):**
```tsx
<PublicDisplayTitle className="mt-4 max-w-[13ch]">Что получите</PublicDisplayTitle>
```

**Change to:** cap the font so the longest word fits the 18rem column, and add an
overflow-wrap safety net:
```tsx
<PublicDisplayTitle className="mt-4 max-w-[13ch] !text-[clamp(2rem,4.4vw,2.9rem)] [overflow-wrap:break-word]">Что получите</PublicDisplayTitle>
```
(Pattern matches existing overrides in `application-form-section.tsx:261,294`.)

**Self-check (non-visual):**
- `grep -n "Что получите" src/app/(public)/business/page.tsx` → line shows `!text-[clamp(` and `overflow-wrap`.
- Build passes.

---

## Task 2 — Contact channel cards: text wrap, button overflow, uneven heights (Img#3)

**File:** `src/components/public/social-channel-card.tsx` (contact mode, lines 89–129).
Data: `src/components/public/contact-application-form-constants.ts` (`contactMethods`).
Consumer: `contact-channels.tsx:28` grid `lg:grid-cols-3`.

Three defects in one card footer (lines 117–127):

**2a. `helper` text wraps vertically into a tall stack** ("ОБЫЧНО ДО 1 РАБОЧЕГО ЧАСА"
breaks one word per line). Cause: `helper` span shares one flex row with a non-shrinking
button; the button eats the width so helper is squeezed to ~1 word wide.

**2b. Button text clipped** ("Написать в WhatsA…"). Same row, `justify-between` + long
labels → button overflows card edge on the narrow middle column.

**2c. Cards different heights / button baselines misaligned** because footers have
different content heights and the card root has no min-height equalizer; grid rows stretch
but inner content isn't bottom-aligned consistently.

**Fix — restructure the footer (lines 117–127).** Replace the single `justify-between`
row with a stacked layout: `helper` on its own line above, full-width button below. Make
the whole card use `h-full` and push the footer to the bottom.

Current:
```tsx
        <div className="flex w-full items-center justify-between gap-3 border-t border-[color-mix(in_srgb,var(--editorial-dark-text)_15%,transparent)] pt-4">
          {helper ? (
            <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[color-mix(in_srgb,var(--editorial-dark-text)_50%,transparent)]">
              {helper}
            </span>
          ) : null}
          <span className="ml-auto inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--editorial-dark-surface)]">
            {actionLabel}
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2} />
          </span>
        </div>
```

Replace with (stacked; helper no longer competes with button for width; button full-width so label never clips):
```tsx
        <div className="mt-auto flex w-full flex-col gap-3 border-t border-[color-mix(in_srgb,var(--editorial-dark-text)_15%,transparent)] pt-4">
          {helper ? (
            <span className="text-[11px] font-semibold uppercase leading-4 tracking-[var(--tracking-eyebrow-sm)] text-[color-mix(in_srgb,var(--editorial-dark-text)_50%,transparent)]">
              {helper}
            </span>
          ) : null}
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--editorial-dark-surface)]">
            {actionLabel}
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2} />
          </span>
        </div>
```

Also make the inner content column grow so `mt-auto` works — line 103:
```tsx
      <div className="flex flex-col items-start gap-3 rounded-[20px] bg-[var(--editorial-dark-surface-muted)] p-5">
```
change to:
```tsx
      <div className="flex flex-1 flex-col items-start gap-3 rounded-[20px] bg-[var(--editorial-dark-surface-muted)] p-5">
```
And the card root (line 92–96 `<a>` contact mode) already has `flex flex-col` — add `h-full` so all three equalize:
```tsx
        'group relative flex h-full flex-col overflow-hidden rounded-[28px] ...'
```
(insert `h-full` after `flex`).

**Optional copy fix (recommended):** the `helper` values in
`contact-application-form-constants.ts` are long ("ОБЫЧНО ДО 1 РАБОЧЕГО ЧАСА"). Shorten to
≤3 words each (e.g. `Ответ до 1 часа`, `Звонок по договорённости`, `Ответ в течение дня`).
Find and edit the `helper:` fields there.

**Self-check (non-visual):**
- `grep -n "justify-between" src/components/public/social-channel-card.tsx` → contact-mode footer line gone.
- `grep -n "w-full items-center justify-center" src/components/public/social-channel-card.tsx` → button present.
- `grep -n "flex h-full flex-col" src/components/public/social-channel-card.tsx` → 1 hit (contact mode root).
- Build passes.

---

## Task 3 — Contacts "Не нашли свой случай?" route cards (Img#4)

**File:** `src/app/(public)/contacts/page.tsx`. Data `alternativeRoutes` lines 77–102;
markup lines 191–240.

**3a. Abstract eyebrow "Другой маршрут" (line 197).** Replace with concrete copy:
```tsx
                  Быстрые разделы
```
(or `Точные разделы`). Keep `<h2>` "Не нашли свой случай?" as-is.

**3b. Remove the icon band — block looks unfinished with a near-empty top strip.**
Delete the media `<span aria-hidden>` block (lines 218–225) entirely, and remove the now-unused
`Icon` lookup (line 210 `const Icon = route.icon;`) and the `icon:` fields in
`alternativeRoutes` (lines 79, 87, 95) plus the icon imports (`Briefcase, Package2, Newspaper`)
if they become unused — verify with grep before deleting imports.
Resulting card = just the text block (`<span className="flex flex-1 flex-col p-5">`), give it
top padding to compensate: change `p-5` → `p-6`.

**3c. Inconsistent per-card accent colors (gold / green / amber-mix).** The middle card uses
`var(--success)` (green link text) — looks accidental, not systematic. Unify all three to the
brand accent. In `alternativeRoutes` set every `accent:` to `'var(--accent)'` (lines 84, 92, 100).

**Self-check (non-visual):**
- `grep -n "Другой маршрут" src/app/(public)/contacts/page.tsx` → 0 hits.
- `grep -c "var(--accent)'" src/app/(public)/contacts/page.tsx` within `alternativeRoutes` → 3 (no `--success`, no `--warning` mix in that array).
- `grep -n "route.icon\|aria-hidden=\"true\"" src/app/(public)/contacts/page.tsx` → route-card icon band removed.
- `npx eslint` shows no "unused import" for removed icons.
- Build passes.

---

## Task 4 — "Предложить тему" is internal-only — remove from public (Img#5)

Users cannot propose articles/training; it is an internal project action.

**File:** `src/components/public/article-grid-section.tsx`
- Remove top CTA, lines 73–78 (`<div className="flex items-start justify-end">…Предложить тему…</div>`). Delete the whole wrapper div.
- Remove empty-state CTA, lines 111–117 (`<Button … href={SUBMIT_TOPIC_HREF}>Предложить тему</Button>`).
- Remove now-unused `SUBMIT_TOPIC_HREF` const (line 27) and `Pencil` import (line 3) if unused after — grep first.

**File:** `src/components/public/education-application-forms.tsx`
- Remove the "Предложить тему" option object, lines 59–63 (the `{ href: '/education?...courseTitle=Предложить тему...', label: 'Предложить тему', … }`).

**File:** `src/app/(public)/partners/page.tsx:38` — `nextStep: 'Предложить тему материала.'`
is internal partner-flow copy. Reword to remove the public "propose" promise, e.g.
`nextStep: 'Материал проходит редакторскую проверку.'` (confirm context at that line; if it's
describing an internal editorial step, leave it — it is not a public CTA. Only change if it
renders a user-facing "propose" action.)

**Self-check (non-visual):**
- `grep -rn "Предложить тему" src` → 0 hits (or only the intentionally-left partners line).
- `grep -rn "SUBMIT_TOPIC_HREF" src` → 0 hits.
- `npx eslint` no unused `Pencil` / `SUBMIT_TOPIC_HREF`.
- Build passes.

---

## Task 5 — PageInfoSection sidebar: center / fill vertical space (Img#6)

**File:** `src/components/public/page-info-section.tsx`. Grid line 30, sidebar lines 44–62.

**Problem:** Grid is `lg:items-start`; the left text column is tall, the right
"ПОЛЕЗНЫЕ ССЫЛКИ" box is short → large empty gap below the sidebar; looks unfinished.

**Fix:** vertically center the sidebar within the row.
Line 30 — keep `lg:items-start` for the text but center the sidebar specifically. Simplest:
change grid alignment to start AND give the sidebar `self-center`:

Line 45, add `lg:self-center` to the sidebar wrapper:
```tsx
              <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-wash)] p-5 lg:self-center">
```

**Self-check (non-visual):**
- `grep -n "lg:self-center" src/components/public/page-info-section.tsx` → 1 hit on sidebar div.
- Build passes.

> NOTE: PageInfoSection is shared (events, articles, etc.). This change affects all of them —
> intended (consistent). No per-page override needed.

---

## Task 6 — Specialist directory: oversized "Найдено N" + inconsistent filter UI (Img#7)

**File:** `src/app/(public)/vacancies/specialist-list-section.tsx`
**CSS:** `src/app/styles/forms.css` (`.specialist-mode-*`, lines 962–1089)

**6a. "Найдено N" heading too large (line 151):**
```tsx
<h2 className="mt-2 text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.5rem]">Найдено {content.total}</h2>
```
Reduce to match other section summaries (e.g. articles "Все материалы" = `text-xl`):
```tsx
<h2 className="mt-2 text-[1.6rem] font-semibold leading-tight text-[var(--text)] md:text-[1.9rem]">Найдено {content.total}</h2>
```

**6b. Filter UI inconsistent with rest of site.** Other listings use pill filters
(`CategoryPill`, see `article-grid-section.tsx:82`); here the mode picker is a tall vertical
radio-list (`.specialist-mode-link` with ● / ○, lines 67–86 + CSS 976–1008). Decision needed
(see "Open question" below). Default recommendation: convert the desktop `SpecialistFilters`
radio-list into the same horizontal segmented pill control already used in the mobile
`SpecialistModeBar` (lines 94–124 / CSS `.specialist-mode-bar*`), so desktop + mobile + the
rest of the site share ONE pattern. Concretely: in `SpecialistListSection` (lines 135–156),
drop the left `<aside>` mode panel and render `SpecialistModeBar` on ALL breakpoints (remove
`lg:hidden` at line 104), move it above the summary, and collapse the grid to a single column.

**6c. Top stat bar "0 вакансий / 1 специалистов" + tab toggle** (separate component — the
`view=specialists` switcher rendered above this section). Locate it:
`grep -rn "вакансий\|специалистов" src/app/(public)/vacancies` and align its indicator styling
with the chosen pill pattern. (Find file first; not in this section component.)

**Self-check (non-visual):**
- `grep -n "Найдено" src/app/(public)/vacancies/specialist-list-section.tsx` → font no longer `text-[2.5rem]`.
- If 6b applied: `grep -n "lg:hidden" specialist-list-section.tsx` → removed from mode bar; `grep -n "specialist-mode-panel" ...` → aside removed or repurposed.
- Build passes.

---

## Task 7 — Scan for duplicate / abstract section copy (cross-cutting, from Img#4 note)

User: "нужен скан всего текста и поиск схожего текста" — abstract eyebrows and near-duplicate
section intros across pages. Produce a report (no code change unless duplicates found):

```bash
grep -rn "tracking-\[var(--tracking-eyebrow" src --include=*.tsx | grep -oE ">[^<]+<" 
# list every eyebrow string; flag abstract ones ("Другой маршрут", "Платформа", "Режим", "Польза")
```
Deliverable: list of eyebrow/H2 pairs per page; flag any that are (a) abstract/non-descriptive
or (b) duplicated verbatim across pages. Bring list back for copy decisions — do not mass-rename
without sign-off.

---

## Task 8 — Events "Не пропустите события" subscribe block unfinished (Img#8)

**File:** `src/app/(public)/events/page.tsx:97–102` (prelaunch branch) — bare `<h3>` + form,
no eyebrow, no description, no card framing; visually a loose strip.
**Form:** `src/components/public/content-subscribe-form.tsx`.

**Fix:** wrap in the same card framing used elsewhere and add a one-line description so it
reads as a finished block. Replace lines 97–102:
```tsx
          <section className="border-b border-[var(--line)] py-8 md:py-12">
            <div className="container">
              <h3 className="text-[1.05rem] font-semibold leading-tight text-[var(--text)] mb-3">Не пропустите события</h3>
              <ContentSubscribeForm topic="EVENTS" label="Узнать о новых событиях" />
            </div>
          </section>
```
with a carded block (max width, border, padding, supporting copy):
```tsx
          <section className="border-b border-[var(--line)] py-8 md:py-12">
            <div className="container">
              <div className="mx-auto max-w-3xl rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-6 md:p-8">
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">Подписка</span>
                <h3 className="mt-2 text-[1.15rem] font-semibold leading-tight text-[var(--text)]">Не пропустите события</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">Пришлём анонс, когда появятся новые каппинги, чемпионаты и мастер-классы в регионе.</p>
                <ContentSubscribeForm className="mt-5" topic="EVENTS" label="Узнать о новых событиях" />
              </div>
            </div>
          </section>
```
(`ContentSubscribeForm` already accepts `className` — see component line 13/18.)

**Self-check (non-visual):**
- `grep -n "max-w-3xl rounded-\[var(--radius-xl)\]" src/app/(public)/events/page.tsx` → 1 hit in subscribe block.
- Build passes.

---

## Open question for the user (block Task 6b until answered)

Specialist-directory filter pattern: **(A)** convert the РЕЖИМ radio-list to the site-wide
horizontal pill control (recommended — one consistent pattern), or **(B)** keep the
left-rail radio style but only restyle/shrink it. 6a, 6c and all other tasks proceed regardless.

## Suggested commit slicing
1. `fix(public): contact channel card layout (wrap/overflow/height)` — Task 2
2. `fix(public): business + events section polish` — Tasks 1, 8
3. `fix(public): contacts route cards — copy, icons, accent` — Task 3
4. `chore(public): remove internal "Предложить тему" CTAs` — Task 4
5. `fix(public): PageInfoSection sidebar centering` — Task 5
6. `fix(public): specialist directory sizing + filter UI` — Task 6 (after open question)
