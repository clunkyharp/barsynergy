# Admin UI Refine — Implementation Plan (for executing agent)

This plan is self-contained. Execute the stages in order. After each stage run the verification
block at the bottom. Do **not** change behavior/data — these are visual/CSS-level refinements.

## Context you must read first
- Design direction: **techno-editorial** (warm coffee-bar editorial + techno-futurist structure).
  Full reference: `docs/ui-references.md`.
- The dashboard `/admin` (`src/app/admin/page.tsx`) was already converted to a bento command-center.
- A **mono micro-label convention** is already applied admin-wide. The canonical class string is:
  ```
  font-mono text-[10px] font-medium uppercase tracking-[0.22em]
  ```
  In `src/app/admin/page.tsx` it exists as the const `microLabel`. In CSS, the mono stack used is:
  ```
  font-family: ui-monospace, "SF Mono", "JetBrains Mono", "Menlo", monospace;
  ```
- Stack: Next.js (App Router) + Tailwind **v4** (CSS `@theme`, no tailwind.config). CSS lives in
  `src/app/styles/*.css`, layered: `@layer tokens, base, forms, calculator, ui-primitives, public, admin`.
  The `admin` layer is last → it overrides Tailwind utilities (which are in the `base` layer).
- Design tokens: `src/app/styles/tokens.css` (light `:root` + dark `:root[data-theme="dark"]`).
  Relevant existing tokens — DO NOT invent new ones unless a stage says so:
  `--shadow-card`, `--shadow-panel`, `--surface`, `--surface-card`, `--surface-card-muted`,
  `--surface-card-hover`, `--card-border`, `--card-border-hover`, `--card-border-selected`,
  `--admin-surface`, `--admin-surface-muted`, `--border-default`, `--border-subtle`, `--border-strong`,
  `--accent`, `--accent-soft`, `--radius-md`, `--radius-lg`, `--motion-duration-base`, `--motion-ease-standard`.

---

## Stage 1 — Sidebar active marker (small, do first)

**Files:** `src/app/styles/admin.css`, `src/components/ui/nav-link.tsx`

**Current state**
- `src/components/ui/nav-link.tsx` (≈line 17) applies a Tailwind active style
  `bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)]` (full amber fill).
- `src/app/styles/admin.css` `.admin-nav-link` (≈308–359) defines the real admin look: base
  `border-left: 2px solid transparent` + `border-radius: 0 var(--radius-md) var(--radius-md) 0`, and
  active `.admin-nav-link[aria-current="page"]` → `border-left-color: var(--accent)` + tinted bg
  `var(--admin-sidebar-item-active-bg)`.
- **Problem:** the Tailwind full-amber fill is dead code in admin (admin layer overrides it) — confusing;
  and the active marker is a weak full-height 2px border, active icon/label not emphasized.

**Target**
1. In `nav-link.tsx`: the amber-fill active branch is generic (used by `NavLink` elsewhere too — verify
   with `grep -rn "NavLink" src`). Do NOT break other usages. Keep the component default, but ensure the
   admin sidebar relies on CSS. If `NavLink` is admin-only, simplify the active Tailwind to just
   `aria-current` and let CSS own the look. If used elsewhere, leave the component and only adjust CSS.
2. In `admin.css` `.admin-nav-link`:
   - Replace the full-height left border marker with an **inset pill bar**: use `::before`,
     `position:absolute; left:0; top:7px; bottom:7px; width:3px; border-radius:999px; background:transparent;`
   - On `[aria-current="page"]::before` → `background: var(--accent);`
   - Remove/keep `border-left` transparent (avoid layout shift — if removing border, add equivalent
     left padding so text doesn't jump between states).
   - Active state: keep tinted bg `var(--admin-sidebar-item-active-bg)`; set label color to
     `var(--admin-sidebar-text)` and `font-weight: 700`.
3. Active **icon** → accent: add rule so `.admin-nav-link[aria-current="page"] .admin-sidebar-link-icon { color: var(--accent); }`.
4. Add `transition: background-color, color` on the bar/link using `var(--motion-duration-fast)` +
   `var(--motion-ease-standard)`; respect `motion-reduce`.
5. Collapsed state (`[data-sidebar-state="collapsed"]`): ensure the inset bar still renders and the
   icon-only links look correct (check ≈415 block).

**Acceptance**
- Active item shows a crisp inset accent pill on the left, accent icon, bold label, subtle tint.
- No layout shift switching active/inactive. Collapsed sidebar still correct. Light + dark themes OK.
- No dead/conflicting active styles remain.

---

## Stage 2 — Card elevation tiers

**Files:** `src/components/ui/card.tsx`, `src/app/styles/tokens.css` (only if a hover-lift shadow token is missing), consumers under `src/app/admin/**`.

**Current state**
- `src/components/ui/card.tsx`: single flat style — `rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface)] shadow-none`, plus `interactive` (hover border accent + focus ring) and `selected` props. All admin cards look identical → no hierarchy.

**Target — three deliberate tiers**
1. Add an `elevation?: 'flat' | 'raised' | 'focal'` prop to `Card` (default `'flat'` = current look, so
   existing usages are unchanged):
   - `flat` — `bg-[var(--surface)]` + `border-[var(--border-default)]`, no shadow (current).
   - `raised` — same border + `shadow-[var(--shadow-card)]`, `bg-[var(--surface-card)]`.
   - `focal` — `shadow-[var(--shadow-card)]` + accent-tinted border `border-[var(--card-border-selected)]`
     (use existing token), slightly stronger surface.
2. Improve `interactive`: on hover add a tiny lift — `hover:shadow-[var(--shadow-card)]` +
   `hover:border-[var(--accent)]` + `hover:-translate-y-px`, transition via existing
   `transition-[...] duration-[var(--motion-duration-base)]`; keep `motion-reduce:transition-none`.
3. Do NOT mass-apply tiers. Apply `focal`/`raised` only where it creates hierarchy on `/admin`
   (e.g. the most important supporting card). Keep changes tasteful and few; the bento hero already
   carries the main focal weight.
4. If a dedicated hover-lift shadow is wanted distinct from `--shadow-card`, add `--shadow-card-hover`
   to BOTH `:root` and `:root[data-theme="dark"]` in `tokens.css`. Otherwise reuse `--shadow-card`.

**Acceptance**
- `Card` with no `elevation` prop renders exactly as before (zero visual diff on untouched screens).
- Three tiers visually distinct in light + dark. Interactive cards lift subtly on hover; reduced-motion
  users get no transform. tsc + eslint clean.

---

## Stage 3 — Public "Три шага до результата" cards (separate pass)

**Files:** `src/components/public/homepage-steps.tsx`, `src/app/styles/public.css`.

**Current state / problems (user-reported)**
- `homepage-steps.tsx`: each card visual has (a) a boxed `SectionIcon` in an accent-tinted square,
  (b) a `displayFont` number `text-[3rem]` in accent, and (c) a `home-step-card-watermark` span — a
  giant faded number behind it.
- `public.css` `.home-step-card-watermark` (≈218–228): `font-size: clamp(5rem, 18vw, 9rem)`,
  `color: color-mix(... accent 16% ...)`, positioned bottom-right.
- **Problem:** the watermark number and the foreground number overlap/clash; both accent-colored; boxed
  icons feel templated; whole card reads as unfinished.

**Target (pick the cleaner direction — implement option A unless it looks worse than B)**
- **Option A (recommended): number-led, techno-editorial.**
  - Remove the watermark span entirely (and its CSS rule).
  - Replace the boxed icon + big number row with a **mono step index** eyebrow: `01 · НАЙДИТЕ НУЖНОЕ`
    style — use the mono micro-label class (`font-mono ... tracking-[0.22em]`) for `0{n}`.
  - Keep ONE clean line-icon (no filled box) OR drop the icon and let the number lead. Tie accent to
    the existing per-step tone (`data-step-tone` already drives `--home-step-accent`).
- **Option B: keep a hero number but fix the clash.**
  - Keep one large ghost/outline number (transparent fill + `-webkit-text-stroke` or very low-opacity
    accent), remove the duplicate foreground number, de-box the icon.

**Acceptance**
- No two overlapping numbers. Icons no longer look like default template boxes.
- Cards look intentional and on-brand (matches techno-editorial). Responsive (1-col mobile → 3-col md).
- Public homepage unaffected elsewhere; light + dark OK.

---

## Stage 4 — (Optional) Cyrillic mono webfont

Only if requested. Currently mono uses the system `font-mono` stack (matches existing prod convention
for IDs). To upgrade identity:
- Add a Cyrillic-capable mono (e.g. `JetBrains_Mono`) to `src/lib/fonts.ts` with
  `subsets: ['latin','cyrillic']`, expose as a CSS variable `--font-mono`, wire it so Tailwind
  `font-mono` and the CSS `font-family: ui-monospace,...` fall back to it. Verify Cyrillic renders for
  Russian uppercase labels. Keep body = Manrope, display = Unbounded.

---

## Verification (run after every stage)
```
cd "/Users/amir/Desktop/CODEX:AGENTS/BARSENERGY"
./node_modules/.bin/tsc --noEmit -p tsconfig.json     # must be clean
./node_modules/.bin/eslint src/app/admin src/components --max-warnings=0
```
Then manually (dev server on localhost:3000, log in as admin):
- `/admin` and every admin list/create/edit screen — labels stay mono, no regressions.
- Sidebar active state (Stage 1), card tiers (Stage 2).
- Public homepage steps section (Stage 3).

## Global rules / guardrails
- Use semantic CSS variables, never raw hex. Small radius, no large rounded cards. Avoids:
  neon, glassmorphism, generic gradients, decorative 3D, uncontrolled shadows, multiple accents.
- Do not alter data fetching, routes, permissions, or component prop contracts beyond the additive
  `elevation` prop in Stage 2.
- Keep diffs minimal and tasteful. When unsure between two visual options, prefer the lower-risk one
  and leave a `TODO(review):` comment rather than guessing big.
```
