# Maturity UX/Layout Plan — 2026-06-19

Goal: bring BARSYNERGY to a mature product level — pleasant to read, user doesn't get lost, genuinely useful. Not endless redesign — targeted gaps only.

Source: distilled from external design-reference research (`Untitled_Document`), then verified against actual code. Most of the research's "fixes" are already shipped; this plan keeps only genuine remaining work.

## Method

Every research claim was checked against current code (`src/app/(public)/*`, `src/components/public/*`, `DESIGN.md`, `src/app/layout.tsx`). Done items are excluded from the plan.

## Progress (updated 2026-06-19)

| Item | Status |
|---|---|
| B1 — vacancies H1 | ✅ done — `title="Вакансии и специалисты"` (both view branches) |
| C1 — how-it-works explainer | ✅ done — `HowItWorksSection`/`HowItWorksSteps` on vacancies, events, suppliers, calculator |
| C2 — per-page differentiation | ✅ done — see breakdown below (events city-tabs added; suppliers/education already shipped) |
| C3 — image direction in DESIGN.md | ✅ done — `## Image Direction` section added |
| C4 — featured hierarchy | ✅ done — `public.css` cover-gradient + support tiles |
| C5 — pitch-deck commercial pages | ✅ already shipped; only gap (visual placement example) closed via C6 |
| C6 — placement example + callouts | ✅ done — `PlacementExample` on sponsorship + business |

Gate after the above: typecheck ✓, lint ✓, tests 343/343 ✓.

Review notes closed during the batch: a11y heading-skip (eyebrow → `<h2>`), DRY (shared `HowItWorksSection`), rounded-corner 2×2 bug (grid `overflow-hidden`). One test (`site-header-navigation.test.mjs:75`) updated for the B1 rename.

---

## A. Already done — do NOT touch

The research audit is stale. These were claimed broken but are correct in code:

| Research claim | Reality in code |
|---|---|
| "footer/CTA before H1" (P0) | `layout.tsx:67-69` Header→main→Footer; `page-hero/page-hero.tsx:223` title `as="h1"` renders first |
| "create DESIGN.md" | `DESIGN.md` already exists, 544 lines, v0.5 Miro palette migration |
| "materials = archive, need editorial hub" | `articles/page.tsx`: featuredItem + rubricSections present |
| "calculator overloaded, need sticky result" | `cost-calculator-client.tsx:34` split `grid-cols-[1fr_22rem]` + `result-rail` + mobile sticky strip |
| "breakdown values stuck 35₽37%" | `cost-breakdown.tsx:41` grid `gap-x-2` + aria — fixed |
| "search too basic, need Guided Search" | `search/page.tsx`: weighted suggestion chips, quick categories, empty state with suggestions |
| "slipped CTA, need ActionGroup" | primitives exist: `action-row`, `editorial-action`, `hero-actions` |
| "dark vs Miro conflict" | intentional hybrid: light `background-zone-ivory` + dark `data-theme="dark"` editorial sections |

Product is more mature than the research describes.

---

## B. Confirmed real gaps (found in code)

### B1 — Vacancies H1 = "Каталог" (generic) — ✅ DONE
- File: `src/app/(public)/vacancies/page.tsx`
- Problem: H1 "Каталог" was too generic — user didn't know where they are.
- Shipped: `title="Вакансии и специалисты"` in both view branches (default + `view=specialists`); subtitle + `VacanciesViewTabs` kept. Test `site-header-navigation.test.mjs:75` updated to the new title.
- This was the only structural research claim that reproduced live.

---

## C. Useful research additions for maturity (genuinely missing)

Ranked by the real pain: pleasant to read / doesn't get lost / useful — NOT by visual flash.

### P0 — user doesn't get lost

**C1 — "How it works" sketch-explainer** (research §4, §17.7) — ✅ DONE
- "Как это работает?" CTAs exist, but the actual scenario isn't shown → users drop off.
- Shipped: `src/components/ui/how-it-works-steps.tsx` — `HowItWorksSteps` (numbered cells, `gap-px` hairlines, grid `overflow-hidden` rounding) + `HowItWorksSection` wrapper (`<h2>` label). Wired on vacancies, events, suppliers, calculator with per-page step copy.

**C2 — Per-page differentiation instead of identical cards** (research §6, §16) — ✅ DONE
- Suppliers/vacancies/events/education shared near-identical card logic → sections blurred together.
- Outcome by slice:
  - **Events → city-tabs** — ✅ new `EventCityTabs` in `events-page-header.tsx` (reuses `CategoryPill`, `Все города` + cities, `buildHref` preserves `q/format/period`). Removed the duplicate city `<Select>` from `EventsSearchBar`; added hidden `city` input so the active city sticks across text-search submits.
  - **Suppliers → directory card** — already mature (`DirectoryListRow`: category eyebrow, meta chips, geo, verified badge, primary + profile CTA). Fixed real defect: primary "Связаться" pointed at the same `detailHref` as "Профиль" → now deep-links to `#supplier-contact-rail` via additive `primaryActionHash` prop (masters unaffected).
  - **Education → program cards** — already shipped: featured `EditorialCard` 4-col grid + `CourseListRow` ("Записаться") + prelaunch. No work needed.

### P1 — pleasant to read / hierarchy

**C3 — Codify image direction in existing DESIGN.md** (research §2, §3, §15) — ✅ DONE
- Did NOT create a new file — added `## Image Direction` to `DESIGN.md`: per-content-type treatment table (articles = still-life/shallow-focus, events = two-shot/handheld, suppliers = overhead/close-up/hard light, vacancies = environmental portrait, …) + rules (no cocktail cliches, faces only for profiles, muted backgrounds, no watermarks, default to still-life).

**C4 — Strengthen "Актуальное" / featured hierarchy** (research §1, §16) — ✅ DONE
- Featured exists (`EditorialFeatured`), but main↔secondary visual contrast was weak.
- Shipped in `public.css`: `.editorial-featured-gradient` (magazine-cover overlay) + `.editorial-current-support-row` tile overrides (4:3 media, tighter padding, single-line summary). Classes wired in `homepage-current.tsx`.

### P2 — commercial maturity (conversion, not "lost")

**C5 — Pitch-deck structure for commercial pages** (research §5, §16) — ✅ DONE (already shipped)
- Verified against code: sponsorship/business/partners/consulting are already slide-like decks — large statement `<h2>` (clamp up to 5.6rem), audience tiles, package/format grids, placements, sponsor ticker, final CTA section. The research described an older state.
- The only genuine gap was research deck-step 5 (a visual "how the placement looks"), closed by C6 below.

**C6 — Callout annotations on Business / Sponsorship** (research §14) — ✅ DONE
- Shipped reusable `src/components/public/placement-example.tsx` — framed `visual` slot + callout rail (arrow points at the figure; rotates on mobile stack).
- Sponsorship (`general-sponsors/page.tsx`): `SponsorPlacementMock` (logo / status / chips / contact) + 4 callouts (logo, categories, direct contact, where it shows). Placed before the final CTA so the example is visible even when no real sponsor is published yet.
- Business (`business/page.tsx`): `VenuePlacementMock` (venue catalog card) + 4 callouts (name/format, city/направления, verified status, direct contact). Placed right before the application form (decision point).
- Note (not done, out of scope): business "Как это работает" still uses an inline 3-step block instead of the shared `HowItWorksSection` — carries the old per-cell rounding logic. Candidate for a later DRY pass.

---

## Dropped from research (noise for maturity)

- Pinterest masonry as layout — research itself advises against; take only the discovery idea (already in search).
- Variant — unverified (auth redirect).
- Motion from Framer/MotionSites — risky, conflicts with "doesn't get lost"; at most C4 hover.
- ezscreenshots, Neuform, deck.gallery as tools — for presentations/promo, not the product.
- "Create BARSYNERGY DESIGN.md" — already exists.

---

## Work order

1. ✅ **B1** — vacancies H1
2. ✅ **C1** — how-it-works steps
3. ✅ **C3** — image direction in DESIGN.md
4. ✅ **C4** — featured hierarchy
5. ✅ **C2** — per-page differentiation (events city-tabs built; suppliers CTA fixed; education already done)
6. ✅ **C5 / C6** — commercial pages (C5 already shipped; C6 placement example added to sponsorship + business)

All planned items (B1, C1–C6) are now done. Optional follow-up: DRY pass on the business "Как это работает" inline steps → shared `HowItWorksSection`.
