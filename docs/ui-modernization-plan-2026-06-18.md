# UI Modernization Plan — reference research (2026-06-18)

Source: 5 reference screenshots the user likes (Img#9–13). This doc = research findings +
phased plan + where to start. Pairs with `qa-fix-plan-2026-06-18.md` (those are bug fixes;
THIS is the style direction).

---

## 1. What the references actually contain (decoded)

| Ref | What it is | Transferable pattern |
|----|----|----|
| Img#9 | Cookie banner | Bold condensed sans, **big solid-yellow primary** + **dark "deny"** + plain text-link tertiary; generous radius; clear button hierarchy |
| Img#10 | Museum activity cards (carousel) | **Image-forward card**: full-bleed photo, **outlined pill badge** top-left ("ACTIVITEIT"), bottom gradient scrim with small kicker ("Always on") + **bold title overlaid**; large corner radius (~24px) |
| Img#11 | Carousel controls | Minimal `←  →` arrows below the rail, muted/active states |
| Img#12 | Mortgage calculator | **Input pattern**: label above (small, muted) → large value → **unit suffix inline-right** ($, %, Years, 20%); soft neutral card; PLUS **lime result card** "Monthly $2,275" with **dot-grid pattern bottom-right** + pill "Apply Now" |
| Img#13 | "Total Cost" card | **Colored summary card** (orange) with **diagonal-hatch pattern bottom-right**, huge number, icon chip top-right |

**Three reusable ideas** the user explicitly called out:
1. More modern **card style** (bigger radius, image-overlay treatment, cleaner hierarchy).
2. **Calculator input** layout/UI (label-above + big value + unit suffix).
3. **Decorative corner patterns** (dot grid / diagonal hatch) on colored cards — "small
   decorations that add variety without being noisy."

---

## 2. Where current state stands (codebase research)

- **Radius scale is tight** (`tokens.css:205-210`): `--radius-md 0.55rem`, `--radius-lg 0.8rem`,
  `--radius-xl 1rem`. References use ~20–24px. → need a bigger step.
- **Card primitives** are flat/subtle: `Card` (`ui/card.tsx`) and `.public-card-shell`
  (`public.css:1`) both default `--radius-md`, 1px border, no image treatment. No
  image-overlay card primitive exists; image cards are bespoke per consumer
  (`ArticleFeaturedCard`, specialist/supplier cards).
- **Badges**: `CategoryPill` (`article-grid-category-pill.tsx`) = filled/wash pill, no
  **outlined** variant like Img#10. `ui/badge.tsx` exists for status.
- **Calculator** (`cost-calculator/`): inputs already do **unit-suffix grid**
  (`calculator-parameters.tsx:27` `grid-cols-[minmax(0,1fr)_64px]` + suffix span). So the
  Img#12 pattern is *partially* implemented — needs: label-above styling consistency, larger
  value type, softer surface, applied to ALL fields (ingredient/markup/additional editors,
  not just params).
- **Result rail** (`result-rail.tsx`) already has a dark accent header with big number — the
  closest thing to Img#12/13 colored summary card. Best pilot for the **corner-pattern** motif.
- **Palette is dark coffee-bar** (accent gold `#e8b000`, dark surfaces). References are
  light/lime/orange — **do NOT copy those hues**. Port the *structure* (overlay, suffix,
  corner pattern), recolor with existing tokens (`--accent`, `--editorial-dark-*`).

---

## 3. Where to start — atoms that ripple everywhere (do in this order)

Reasoning: changing shared tokens/primitives upgrades many screens at once and keeps the
restyle consistent. Bespoke screens come after the primitives exist.

### Phase 0 — Tokens (foundation, 1 file)
**`src/app/styles/tokens.css`**
- Add a larger radius step (additive, non-breaking): `--radius-2xl: 1.5rem;` (24px) after
  line 209. (Do NOT rescale existing `--radius-*` globally — too many call sites; opt-in only.)
- Add decorative-pattern tokens (reused by the corner-motif cards):
  ```css
  --deco-dots: radial-gradient(currentColor 1.2px, transparent 1.2px);
  --deco-dots-size: 14px 14px;
  --deco-diagonal: repeating-linear-gradient(45deg, currentColor 0 1.5px, transparent 1.5px 12px);
  ```
**Self-check:** `grep -n "radius-2xl\|deco-dots\|deco-diagonal" src/app/styles/tokens.css` → 3+ hits.

### Phase 1 — Reusable primitives (3 small components/utilities)
These are the "typical elements" to build first; everything else composes them.

1. **`OutlinedPill` badge** (Img#10). New variant on `CategoryPill` or a tiny new
   `ui/pill-badge.tsx`: transparent bg, `border border-current`, `rounded-full`, uppercase
   bold tracking. Used for "ACTIVITEIT"-style kickers on image cards.

2. **`MediaCard`** (Img#10) — the highest-impact upgrade. New
   `src/components/public/media-card.tsx`:
   - full-bleed `next/image` (`fill`, `object-cover`), `rounded-[var(--radius-2xl)]`,
     `aspect-[4/5]` or `[3/4]`.
   - bottom scrim `bg-gradient-to-t from-black/80 to-transparent`.
   - slots: `badge` (top-left OutlinedPill), `kicker` (small, e.g. "Always on"), `title`
     (bold display), optional `href`.
   - Recolor scrim/text for the dark theme; keep accent for badge border.

3. **`DecoCard` / `.deco-card` utility** (Img#12 lime + Img#13 orange) — colored summary card
   with corner pattern. Implement as a CSS class set in a stylesheet (e.g. `public.css`):
   ```css
   .deco-card { position: relative; overflow: hidden; border-radius: var(--radius-2xl); }
   .deco-card::after {
     content: ""; position: absolute; right: 0; bottom: 0;
     width: 45%; height: 70%; pointer-events: none; opacity: 0.18;
   }
   .deco-card[data-pattern="dots"]::after     { background-image: var(--deco-dots); background-size: var(--deco-dots-size); }
   .deco-card[data-pattern="diagonal"]::after { background-image: var(--deco-diagonal); }
   ```
   `currentColor` makes the pattern inherit the card's text color → works on any accent fill.
**Self-check:** components compile; `grep -rn "deco-card\|MediaCard\|OutlinedPill" src` → present; build passes.

### Phase 2 — Pilot on ONE surface each (prove before rollout)
- **MediaCard pilot:** `ArticleFeaturedCard` (articles page) → swap bespoke markup for
  `MediaCard`. Visually highest-traffic. Verify, then roll to events / suppliers / specialists.
- **DecoCard pilot:** calculator **result rail header** (`result-rail.tsx:54-73`) → wrap the
  dark header as `deco-card[data-pattern="dots"]`, keep gold number. This is the literal
  Img#12/13 analog and self-contained.

### Phase 3 — Calculator input layout (Img#12)
**Files:** `cost-calculator/calculator-parameters.tsx`, `ingredient-editor*.tsx`,
`markup-pricing.tsx`, `additional-costs-editor.tsx`, CSS `calculator.css`.
- Standardize every field to the **label-above → big value → unit-suffix** pattern already in
  `calculator-parameters.tsx:26-58`. Extract it into a small shared `SuffixInput`
  (`cost-calculator/suffix-input.tsx`) so all editors reuse one component instead of repeating
  the `grid-cols-[minmax(0,1fr)_64px]` markup.
- Bump value type size (Img#12 uses large numerals): inputs `text-base`→`text-lg`,
  `tabular-nums`, softer surface `bg-[var(--surface-wash)]`, radius `--radius-lg`.
**Self-check:** `grep -rn "SuffixInput" src/components/public/cost-calculator` → used in ≥3
editors; `grep -c "grid-cols-\[minmax(0,1fr)_64px\]"` drops (markup centralized); build passes.

### Phase 4 — Carousel controls (Img#11) + button hierarchy (Img#9)
- Add `←/→` arrow controls under any horizontal card rail (events/activities) — muted idle,
  accent on hover, hidden when not scrollable.
- Audit primary/secondary/tertiary button usage to match Img#9 hierarchy (solid accent /
  dark deny / text-link). Mostly already aligned via `ui/button.tsx` variants — verify, don't
  rebuild.

---

## 4. Rollout order (start-here summary)

1. **Phase 0 tokens** — radius-2xl + deco patterns. (foundation, low risk)
2. **Phase 1 primitives** — OutlinedPill, MediaCard, DecoCard. (build the reusable atoms)
3. **Phase 2 pilots** — ArticleFeaturedCard + calculator result header. (prove)
4. **Phase 3 calculator inputs** — SuffixInput rollout. (self-contained, high polish payoff)
5. **Roll MediaCard** to events/suppliers/specialists catalogs.
6. **Phase 4** — carousel arrows + button hierarchy audit.

> Each phase is independently shippable. Phases 0→1→2 must be sequential (later depends on
> earlier); 3 and 4 are parallelizable once 0–1 land.

---

## 5. Decisions — LOCKED (2026-06-18)

- **D1 — Radius: ADDITIVE.** Add opt-in `--radius-2xl: 1.5rem` only. Do NOT rescale the
  existing `--radius-*` scale globally. New large-radius cards opt in; everything else
  unchanged. (Lowest risk, no site-wide regression.)
- **D2 — Patterns: COLORED SUMMARY CARDS ONLY.** Corner dot/diagonal motifs apply only to
  accent/colored summary cards (calculator result rail, stat/CTA cards). Neutral content
  cards stay clean — no pattern. Keeps variety without noise.
- **D3 — MediaCard: ARTICLES-ONLY PILOT FIRST.** Build + ship MediaCard on
  `ArticleFeaturedCard` only. Reassess after it's live, THEN roll to events/suppliers/
  specialists (Phase 5). Phase 5 stays gated on that review.

All three locked — no further sign-off needed to start Phase 0.
