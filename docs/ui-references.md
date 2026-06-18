# UI References & Visual Direction — BARSYNERGY

Research-backed reference board for upgrading component UI (admin first). Goal: make the
interface more visually interesting and distinctive **without** abandoning the existing
coffee-bar editorial identity or rebuilding the token system. Adapt, don't copy.

> Sourcing note: the neuform.ai community design and Framer gallery are login-gated and could
> not be inspected directly. This board is built from (a) neuform.ai's own marketing-site
> aesthetic that *was* captured, (b) named, publicly-documented design systems, and (c) 2026
> dashboard-design trend research. See Sources at the bottom.

---

## 1. Where BARSYNERGY sits today

- **Identity:** warm coffee-bar editorial — graphite surfaces, Cormorant serif headlines,
  Manrope body, single amber accent (`#e8b000` light / `#ffd02f` dark), low radius, compact density.
- **Admin today:** light content area (`#f7f8fa`), dark graphite sidebar, white *shadowless*
  cards, 14px radius, grouped nav, role badge, count badges. Clean and correct — but visually
  **flat and safe**. Reads like a generic CRUD panel, not a branded product.
- **Strengths to keep:** token-driven, restrained single accent, dark/light parity, editorial type.
- **Gap to close:** no visual hierarchy between "hero" data and routine rows; cards are
  undifferentiated rectangles; no signature texture/motif; dashboard ("Рабочая очередь") doesn't
  feel like a command center.

## 2. The 2026 landscape (research)

SaaS UI has split into two coherent camps:

| Camp | Signature | Examples |
|------|-----------|----------|
| **Techno-futurist** | dark-first, mono micro-labels, bento grids, one neon-ish accent, FPS/system chrome | neuform, Raycast, Sentry, Supabase, Linear |
| **Editorial** | cream/paper, serif display, generous whitespace, restraint | Stripe docs, Mercury, Notion |

**BARSYNERGY already lives in the editorial camp.** The opportunity is a deliberate fusion:
keep editorial warmth, borrow techno-futurist *structure and rigor*. Call it **"techno-editorial"** —
that fusion is the unique angle (most products pick one camp; few do warm-editorial + structured-data well).

Cross-cutting trends worth adopting:
- **Bento grids** — asymmetric tiles, one hero KPI spanning more columns. Controls cognitive load.
- **Progressive disclosure** — answer "is everything OK?" in 2s, drill down on demand.
- **Single restrained accent** — the discipline isn't dark mode, it's *one* accent used sparingly. ✅ already do this.

## 3. What to borrow, from whom (concrete)

### neuform.ai (captured landing aesthetic)
- **Mono uppercase micro-labels** with wide letter-spacing (`PROMPT-TO-PRODUCTION DESIGN WORKFLOW`).
  → Adopt for admin eyebrows / group titles / table column heads. We already have
  `--tracking-eyebrow-md: 0.16em`; pair it with a mono font for section labels.
- **Bento card grid on near-black**, each tile self-contained with quiet borders, no heavy shadows.
- **System chrome as decoration** (the `13 FPS` pill). → A small "last synced / live" status chip
  in the admin header reads as intentional craft.
- **Pill primary button with trailing circular icon** (`Continue with Google →`).
  → Strong CTA treatment for the one primary action per admin screen.

### Linear
- **Hairline-driven layout**, ~1px borders doing the heavy lifting instead of shadows. ✅ we already
  lean this way — push further: remove remaining shadows, let hairlines + spacing define structure.
- **Tight, dense tables** with subtle row-hover, keyboard-first feel. Quiet zebra via hover only.
- **Command-palette mindset** — primary actions discoverable, not scattered.

### Stripe / Mercury
- **Single-metric hero** at top of dashboard: the one number that matters, large, with a sparkline.
- **Trust through calm** — lots of whitespace around financial/critical numbers.

### Vercel / Geist
- **Monospace for data/IDs/timestamps** — instantly makes a panel feel engineered. Map `font-mono`
  to application IDs, dates, counts in tables.
- **Crisp focus rings**, generous touch targets.

### Raycast / Sentry (dark tooling)
- **Dark surface stratification** — 2–3 elevation steps via subtle bg shifts, not shadows. Our dark
  sidebar already does this; extend the language into a dark *dashboard* option.

## 4. Concrete adaptation plan — admin components

Priority order = highest visual payoff first. All values map to existing tokens; new tokens noted.

### A. Dashboard "Рабочая очередь" → command center (highest payoff)
- Convert the queue landing into a **bento grid**:
  - Hero tile (spans 2 cols): "Новые заявки" count, large numeral (Cormorant or mono), trend line.
  - Smaller tiles: pending by type (vacancies / suppliers / masters), each a quiet KPI card.
  - Wide tile: latest activity list.
- Micro-label every tile with mono uppercase eyebrow.
- This is the single biggest "feels like a product, not a CRUD" win.

### B. Sidebar refinement
- Keep dark graphite (already strong). Add: mono uppercase group titles (`РАБОТА`, `КОНТЕНТ`…),
  thinner, more letter-spaced — currently they read as plain text.
- Active item: keep amber tint; add a **2px left accent bar** instead of full-border for a more
  deliberate "you are here" marker.
- Brand mark `B`: give it the amber-on-graphite treatment as a small signature motif.

### C. Tables (admin-table)
- Column headers → mono uppercase, `--admin-table-header` bg, wide tracking.
- IDs / dates / counts → monospace.
- Row hover only (no zebra), hairline dividers (`--border-subtle`).
- Status → keep the existing status-badge tokens (already well-built); ensure one consistent badge
  component everywhere.

### D. Cards / surfaces
- Introduce **deliberate elevation tiers** instead of uniform flat white:
  - Tier 0 page bg `#f7f8fa`, Tier 1 card `#ffffff` + hairline, Tier 2 hero/selected card +
    `--shadow-card` and amber-tinted border (`--card-border-selected`).
- Asymmetric sizing where data justifies it (bento), not a uniform grid of equal boxes.

### E. Buttons & primary actions
- One primary (amber) action per screen, pill-ish, optional trailing icon — neuform CTA pattern.
- Secondary = hairline ghost (already have `--admin-secondary-*`).

### F. Signature motif (the "unique style" ask)
Pick ONE and apply consistently so the product is recognizable:
- **Mono micro-labels** everywhere structural (recommended — cheap, high identity, fits editorial).
- Optional: a faint paper-grain on dark surfaces (we already have `--background-paper-grain-opacity`).
- A tiny "system status" chip in the admin header (neuform's FPS-pill energy, but useful: last sync).

## 5. Hard avoids (from existing design rules)
Neon/nightlife palettes, glassmorphism, generic gradients, decorative 3D, uncontrolled shadows,
square uniform grids, multiple competing accents. The fusion stays *warm and calm*, not flashy.

## 6. Suggested font addition
Add **one monospace** to `src/lib/fonts.ts` (e.g. Geist Mono / JetBrains Mono / IBM Plex Mono) for
micro-labels, IDs, timestamps, KPI numerals. This single addition delivers most of the
"techno-editorial" identity. Body stays Manrope, display stays Cormorant.

---

## Sources
- [Bento Grid Dashboard Design Guide 2026 — Orbix](https://www.orbix.studio/blogs/bento-grid-dashboard-design-aesthetics)
- [50 Best Dashboard Design Examples 2026 — Muzli](https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/)
- [35 SaaS Dashboard Design Examples & Patterns 2026 — 925studios](https://www.925studios.co/blog/saas-dashboard-design-examples-2026)
- [21 Best Dark Admin Dashboard Templates 2026 — Colorlib](https://colorlib.com/wp/dark-admin-dashboard-templates/)
- [54 real design systems as HTML/CSS (Stripe, Linear, Vercel) — Hermes](https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/creative/creative-popular-web-designs)
- neuform.ai landing aesthetic — captured in-session (community design itself login-gated)
