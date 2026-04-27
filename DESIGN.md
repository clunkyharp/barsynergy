# BARSYNERGY Design System

This file is the working design-system contract for BARSYNERGY.

It documents the current source of truth in code and sets rules for new UI work. Keep it aligned with:

- `design-tokens.json`
- `src/app/globals.css`
- `src/components/ui`
- `src/components/public`
- `public/design-system-preview.html`

## Status

Current status: v0.1 foundation.

The project has a usable internal UI kit and an editorial public-page system. It is not a separate package. The source of truth is still local project code.

Do not introduce a third-party component library as the main UI system. The project plan keeps an internal UI kit as the default and allows shadcn/ui only as a reference for basic component patterns.

## Design Direction

BARSYNERGY uses a strict editorial visual language for a bar-industry education and community platform.

Use:

- warm ivory and cream surfaces;
- dark graphite text;
- muted burgundy accent;
- thin divider lines;
- modular editorial grids;
- compact rows and cards;
- route labels, city chips, directory rows and event rows;
- black editorial bands where contrast or section weight is needed;
- restrained collage-like image blocks.

Avoid:

- neon;
- nightclub cliches;
- generic startup gradients;
- decorative 3D;
- WebGL;
- heavy animation;
- fake dashboard styling.

## Foundations

### Color Roles

Use semantic roles in code. Raw hex values belong in `design-tokens.json` and `src/app/globals.css`.

| Role | CSS variable | Current value | Usage |
| --- | --- | --- | --- |
| Background | `--background` | `#f4ebdb` | Page background |
| Surface | `--surface` | `#faf4e8` | Cards, panels, calm blocks |
| Surface muted | `--surface-muted` | `#ece0ce` | Secondary admin hover/background |
| Text | `--text` | `#16130f` | Main text |
| Muted text | `--muted` | `#5f564b` | Supporting copy and labels |
| Line | `--line` | `rgba(22, 19, 15, 0.22)` | Default borders and dividers |
| Accent | `--accent` | `#992c26` | Primary accent and strong labels |
| Accent strong | `--accent-strong` | `#7b1f1a` | Primary hover state |
| Graphite | `--graphite` | `#141412` | Dark bands and graphite buttons |
| Success | `--success` | `#2f684f` | Positive state |
| Warning | `--warning` | `#9a661a` | Warning state |
| Danger | `--danger` | `#9f2f2f` | Error/destructive state |

### Typography

Current fonts:

- body: Manrope;
- display: Oswald.

Rules:

- Use body text first. Do not derive form labels, nav text or rows from hero type.
- Use Oswald only for editorial display headings, large counters and brand-like labels.
- Keep letter spacing at `0` for display helpers unless a compact uppercase label needs explicit tracking.
- Keep long Russian text in Manrope with readable line height.

Core roles:

| Role | Typical class pattern | Usage |
| --- | --- | --- |
| Display hero | `display-tight`, Oswald, `34px-96px` | Public page hero titles |
| Display section | `display-tight`, Oswald, `52px-72px` | Public section headings |
| Body | Manrope, `text-base`, `leading-7` | Public copy |
| Small body | Manrope, `text-sm`, `leading-6/7` | Cards, rows, legal text |
| Label | `text-xs/text-sm`, uppercase, tracking | Eyebrows, route labels, metadata |
| Button | `text-sm`, semibold, uppercase | Primary and secondary actions |

### Spacing

Use Tailwind spacing, but keep repeated roles stable.

| Role | Value | Usage |
| --- | --- | --- |
| Tight | `8px` / `space-y-2` | Label-control grouping |
| Component | `16px-24px` | Card padding, row internals |
| Section | `40px-56px` | Public section vertical padding |
| Large section | `64px-96px` | Non-editorial page headers |
| Container gutter | `16px` each side | `.container` on mobile |

### Radius And Shadow

- Default interactive radius: `rounded-md`.
- Default card radius: `rounded-lg`.
- Editorial public cards may use square corners when strict grid composition is needed.
- Avoid large pill shapes except badges/chips.
- Use shadows only for overlays, dropdowns and admin cards. Editorial public surfaces should rely mostly on borders.

### Layout

Use `.container` as the default page width wrapper.

Current container:

```css
width: min(1320px, calc(100vw - 32px));
margin-inline: auto;
```

Public editorial sections should use:

- `editorial-grid`;
- top/bottom thin dividers;
- two-column or three-column grids on desktop;
- stacked blocks on mobile;
- explicit `min-w-0` for text columns with long Russian titles.

Admin/product surfaces should use:

- quieter cards;
- smaller headings;
- denser vertical rhythm;
- predictable sidebar/content split.

## Components

### Button

Source: `src/components/ui/button.tsx`

Variants:

| Variant | Usage | Default | Hover | Disabled / Loading |
| --- | --- | --- | --- | --- |
| `primary` | Main product/admin action | Accent fill, white text | Accent strong | Component-level disabled opacity and loading spinner |
| `secondary` | Secondary action | Transparent, line border | Accent border/text | Component-level disabled opacity and loading spinner |
| `ghost` | Low-priority action | Transparent muted text | Accent text | Component-level disabled opacity and loading spinner |

Rules:

- Use `Button` for product/admin actions.
- Public editorial CTA links can use local composition only when their square editorial style is required.
- Keep action labels short and literal.
- Preserve `min-h-11` or larger for touch targets.
- Use `loading` and optional `loadingText` for pending mutations; the component keeps the control disabled and layout stable.

### Form Controls

Sources:

- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/form-field.tsx`

States:

| State | Rule |
| --- | --- |
| Default | White surface, line border, readable label |
| Hover | Optional; do not shift layout |
| Focus | Accent border or global focus ring |
| Error | `FormField.error` connects `aria-invalid` and visible `--danger` text |
| Disabled | Native disabled plus muted background, cursor and opacity |
| Required | Use explicit copy near the field, not color alone |

Rules:

- Always wrap labelled fields with `FormField` unless a form has a documented custom layout.
- Error text belongs under the control and should be linked with `FormField`.
- Do not encode validation meaning by color alone.
- Keep public application forms legally clear: consent checkboxes must be visible and literal.

### Badge

Source: `src/components/ui/badge.tsx`

Use for status, category, route and compact metadata labels.

Rules:

- Keep badge text short.
- Use uppercase labels for editorial metadata.
- Do not use badges as buttons unless the component is extended with button/link semantics.

### Card

Source: `src/components/ui/card.tsx`

Use for admin/product grouped content, empty states and repeated compact items.

Rules:

- Do not nest cards inside cards.
- Do not use cards as full page sections.
- Public editorial rows can use borders without `Card` when the row layout is the visual system.

### Empty, Loading And Error States

Sources:

- `src/components/ui/empty-state.tsx`
- `src/components/ui/loading-state.tsx`
- `src/components/ui/error-state.tsx`

Rules:

- Preserve the surrounding layout size as much as possible.
- Use literal Russian labels.
- Error text must state what failed, not blame the user.

### Public Editorial Page

Source: `src/components/public/editorial-public-page.tsx`

Use for simple public sections with:

- hero title;
- summary;
- metric strip;
- rows;
- primary and optional secondary CTA.

Rules:

- Use this component for repeated public information pages unless the page needs unique homepage composition.
- Keep row titles compact and uppercase.
- Keep row descriptions body-sized.
- Avoid new one-off section systems unless a page genuinely needs different content structure.

### Legal Draft Page

Source: `src/components/public/legal-draft-page.tsx`

Use for legal pages that are not final lawyer-approved text.

Rules:

- Keep the legal draft warning visible.
- Use plain language.
- Do not mix marketing CTAs into legal content.

## Component State Matrix

| Component | Default | Hover | Focus | Active | Disabled | Loading | Error | Selected/Expanded |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Button | Yes | Yes | Global ring | Pressed offset | Encoded in component | Encoded in component | N/A | N/A |
| Link CTA | Yes | Yes | Global ring | Native | N/A | N/A | N/A | N/A |
| Input | Yes | Border emphasis | Accent border + ring | N/A | Encoded in component | N/A | `aria-invalid` via `FormField.error` | N/A |
| Select | Yes | Border emphasis | Accent border + ring | N/A | Encoded in component | N/A | `aria-invalid` via `FormField.error` | Native |
| Textarea | Yes | Border emphasis | Accent border + ring | N/A | Encoded in component | N/A | `aria-invalid` via `FormField.error` | N/A |
| Checkbox | Yes | Native | Global ring | Native | Encoded in component | N/A | `aria-invalid` outline | Checked |
| Badge | Yes | N/A | N/A | N/A | N/A | N/A | Semantic variants | N/A |
| Card | Yes | If `interactive` | If `interactive` | N/A | N/A | `loading` pulse | `error` variant | `selected` variant |
| Mobile menu | Closed | Button hover | Global ring | Native | N/A | N/A | N/A | Expanded |

Remaining gap to close later:

- Repeated public CTA links should be promoted to a shared `EditorialLink` if they continue to spread.

## Public Layout Rules

Use public page sections in this order when applicable:

1. Hero or route header.
2. Context or summary.
3. Rows/cards for the section's real content.
4. CTA only when the next user action is clear.

Rules:

- Keep the first viewport focused on the actual section content, not generic marketing text.
- Use image assets only when they show the product, people, context or content type.
- Keep CTA placement stable: hero side rail or section footer, not scattered in every block.
- Keep mobile titles breakable with `break-words` and `min-w-0`.

## Admin Layout Rules

Admin pages use compact product UI, not editorial hero composition.

Rules:

- Use smaller headings.
- Use cards for module summaries and form sections.
- Use table/list rows for future CRUD data.
- Keep actions near the object they affect.
- Do not use public display typography for dense admin workflows.

## Accessibility Rules

- Preserve visible focus with `:focus-visible`.
- Use native controls before custom controls.
- Keep touch targets at least `44px` high.
- Do not rely on color alone for errors, status or selection.
- Check contrast before adding new accent fills.
- Keep links and buttons semantically correct.

## Assets

Brand assets live in `public/brand`.

Generated/supporting public images live in `public/images/generated`.

Rules:

- Use the official lockup in header/footer contexts.
- Do not recolor SVG brand assets locally unless a new asset is added deliberately.
- Do not add stock-like decorative images without a specific content role.

## Preview

Open:

```txt
public/design-system-preview.html
```

The preview is static and has no build dependency. Use it to inspect token roles, component variants, form states, editorial rows and layout rhythm.

## Validation Checklist

Before merging visual changes:

- Typography roles still match this file.
- New colors are added as semantic roles, not one-off raw hex values.
- Repeated buttons, fields, cards and rows use shared primitives or a documented variant.
- Mobile text wraps without overlap.
- Focus states remain visible.
- Public pages still follow the editorial grid rhythm.
- Admin pages stay compact and product-oriented.
- Run the smallest useful code check for the changed files.
