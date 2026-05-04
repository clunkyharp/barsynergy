# BARSYNERGY Design System

This document is the working UI contract for BARSYNERGY. It exists to keep runtime code, tokens and future screens aligned.

## Status

Current status: `v0.3 photo-reference redesign`.

The project is being aligned to the supplied photo references: warm off-white pages, serif editorial headlines, burgundy actions, thin dividers, low-radius cards and compact product screens. The goal is to keep that visual direction while preserving current routes, data, auth, applications and admin permissions.

## Source Of Truth

Use this order when rules conflict:

1. `src/lib/fonts.ts`
2. `src/app/globals.css`
3. `src/components/ui`
4. `design-tokens.json`
5. `public/design-system-preview.html`
6. this file

Rules:

- Runtime code wins over outdated documentation.
- `design-tokens.json` must describe the current runtime contract, not an aspirational one.
- New repeated UI belongs in `src/components/ui` before it spreads through pages.
- Do not introduce a third-party UI kit as the main design-system layer.

## Design Direction

BARSYNERGY keeps one visual identity across the product:

- warm ivory and cream surfaces;
- high-contrast serif public and auth headings;
- dark graphite typography;
- burgundy primary actions;
- thin dividers;
- editorial grids on public surfaces;
- compact, readable product density for admin and business flows;
- small card/button radius instead of large rounded cards.

Avoid:

- neon or nightlife cliches;
- generic startup gradients;
- decorative 3D;
- gratuitous glassmorphism;
- uncontrolled shadow stacks;
- page-specific CTA or form styling without a shared primitive.

## Design Principles

1. Editorial structure over decoration. Typography, dividers, grid and content hierarchy do the main visual work.
2. Product clarity over novelty. Auth, admin and business screens must stay operational and predictable.
3. Same meaning, same primitive. Repeated job means repeated component or explicit documented variant.
4. Body-first hierarchy. Product UI starts from readable body text, not from hero type.
5. Conservative motion. Hover, focus and loading states may reinforce hierarchy, but must not steal attention from content.
6. Stable implementation over one-off polish. If a choice will be repeated, encode it as a token, primitive or variant.

## Typography Roles

Runtime fonts:

- body: `Manrope`
- display: `Playfair Display`
- accent: `Manrope`

Rules:

- `Playfair Display` is for public, auth and selected workspace headings.
- `Manrope` is the default body, control and product/workspace font.
- The accent role is limited to short labels and brand-adjacent text; it should not replace body copy.
- Russian helper labels and long Russian copy must stay on `Manrope`, not on the display font.
- Long Russian text stays in body typography.
- Do not use display sizing for dense product workflows.

| Role | Token | Allowed surfaces | Typical use |
| --- | --- | --- | --- |
| Public H1 | `text-h1-public` | `public-editorial` | Home hero, main route hero |
| Public H2 | `text-h2-public` | `public-editorial` | Section titles |
| Product H1 | `text-h1-product` | `auth-acquisition`, `workspace-product` | Page titles, large auth titles |
| Product H2 | `text-h2-product` | `auth-acquisition`, `workspace-product` | Section titles, panel titles |
| Body | `text-body` | all | Main copy |
| Body small | `text-body-sm` | all | metadata, helper text, dense rows |
| Caption | `text-caption` | all | short support text |
| Label | `text-label` | all | field labels, eyebrows, metadata labels |
| Button | `text-button` | all interactive surfaces | buttons and strong action labels |

## Color Roles

Use semantic roles, not raw color names, in component APIs.

| Role | CSS variable | Use |
| --- | --- | --- |
| Background | `--background` | page background |
| Surface base | `--surface` | main cards, shells, rows |
| Surface muted | `--surface-muted` | table headers, muted blocks |
| Surface elevated | `--surface-elevated` | inner panels, overlays, raised shells |
| Surface inverse | `--surface-inverse` | graphite/inverse actions and selected cards |
| Text primary | `--text` | primary text |
| Text secondary | `--muted` | helper text, metadata |
| Accent | `--accent` | primary accent |
| Accent hover | `--accent-strong` | primary hover |
| Success | `--success` | positive state |
| Warning | `--warning` | warning state |
| Danger | `--danger` | destructive/error state |
| Focus ring | `--focus-ring` | neutral focus emphasis |
| Focus ring danger | `--focus-ring-danger` | invalid/error focus |

Status surfaces:

- success: `--success-bg`, `--success-border`, `--success-text`
- warning: `--warning-bg`, `--warning-border`, `--warning-text`
- error/destructive: `--danger-bg`, `--danger-border`, `--danger-text`

Field surfaces:

- `--field-bg`
- `--field-bg-hover`
- `--field-bg-disabled`

Selection/loading surfaces:

- `--selected-bg`
- `--selected-border`
- `--pending-bg`
- `--skeleton-fill`

## Spacing Rules

Spacing tokens express relationship, not arbitrary numbers.

| Token | Meaning | Typical use |
| --- | --- | --- |
| `space-field` | tight | label to control, small grouped metadata |
| `space-card` | component interior | card content, grouped panel body |
| `space-panel` | compact supporting shell | inset blocks, helper panels |
| `space-action-row` | action grouping | footer actions, toolbar actions |
| `space-sidebar` | sidebar rhythm | nav groups, reminders |
| `space-section-product` | product page rhythm | auth, admin, business sections |
| `space-section-public` | public section rhythm | landing/editorial sections |

Rules:

- tight spacing means semantic relationship;
- large spacing means unrelated or higher-level sections;
- do not introduce new spacing values for repeated UI roles without updating tokens.

## Radius Scale

Allowed shared scale:

- `radius-none`
- `radius-sm`
- `radius-md`
- `radius-lg`
- `radius-xl`
- `radius-pill`

Rules:

- `radius-md` is the default field and button radius.
- `radius-lg` is the default inner panel/card radius.
- `radius-xl` is reserved for large editorial/form shells only.
- `radius-pill` is for icon circles, status dots and explicitly round controls only.
- New repeated `rounded-[...]` values are not allowed without token promotion.

## Elevation And Border Rules

Shadows:

- `shadow-none`
- `shadow-card`
- `shadow-panel`
- `shadow-overlay`
- `shadow-focus`

Borders and dividers:

- `border-subtle`
- `border-default`
- `border-strong`
- `border-inverse`
- `divider-public`
- `divider-product`

Rules:

- editorial public surfaces should mostly rely on dividers and layout, not heavy shadow;
- product/helper panels may use `shadow-card`;
- overlays and raised shells use `shadow-panel` or `shadow-overlay`;
- repeated `border-black/10`, `border-black/15`, `border-black/20`, `border-black/30`, `border-white/16`, `border-white/50` should be mapped to semantic border roles.

## State Matrix

Every reusable interactive primitive should define relevant states before page-level polish.

| State | Required contract |
| --- | --- |
| Default | stable size and readable contrast |
| Hover | no layout shift; usually border/background emphasis |
| Active | minor pressed feedback only |
| Focus-visible | visible, neutral and keyboard-usable |
| Disabled | muted + non-interactive + readable |
| Loading | stable layout, no control jump |
| Selected | explicit background/border change, not color alone |
| Expanded | visible relationship between trigger and content |
| Pending | status preserved without looking like success |
| Optimistic | same structural shell as pending until confirmed |
| Skeleton | muted placeholder surface, stable dimensions |
| Empty | literal message and next action |
| Success | explicit text + structured notice |
| Warning | explicit text + structured notice |
| Error | explicit text + structured notice |
| Destructive | visually distinct from neutral actions |

## Layout Template Modes

### `public-editorial`

Use for:

- home
- vacancies
- public content pages
- landing/editorial sections

Rules:

- display typography allowed;
- thin public dividers;
- warm cream background;
- editorial grid;
- stronger brand expression.

### `auth-acquisition`

Use for:

- login
- register
- password reset
- onboarding-like request screens

Rules:

- connected to editorial brand, but form-first;
- consistent auth shell and helper panel;
- less decorative than public surface;
- product clarity is more important than hero styling.

### `workspace-product`

Use for:

- admin
- business cabinet
- CRUD screens
- tables
- product workflows

Rules:

- body-first typography;
- denser, more utilitarian layout;
- stable sidebar/content split;
- reusable table/list/form panels;
- no public hero type.

## Core Components

### Actions

Source files:

- `src/components/ui/button.tsx`
- `src/components/ui/editorial-action.tsx`
- `src/components/ui/inline-link.tsx`
- `src/components/ui/nav-link.tsx`

Rules:

- `Button` is for product and operational actions.
- `EditorialAction` is for branded editorial CTA treatments.
- `InlineLink` is for inline legal/help text links.
- `NavLink` is for product/sidebar navigation.
- Do not build new repeated CTA styles inline inside pages.

`Button` variants:

- `primary`
- `secondary`
- `ghost`
- `destructive`
- `inverse`

`Button` sizes:

- `sm`
- `md`
- `lg`

### Fields

Source files:

- `src/components/ui/field-styles.ts`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/form-field.tsx`
- `src/components/ui/checkbox-field.tsx`
- `src/components/ui/consent-field.tsx`

Rules:

- `Input`, `Select` and `Textarea` share one field base contract.
- Labels and errors should go through `FormField`.
- `CheckboxField` is the generic checkbox + label primitive.
- Consent blocks should use `ConsentField` or a thin wrapper over it.
- Repeated field styling must not be redefined in page-local className chains.

### Alerts / Notices

Source: `src/components/ui/inline-alert.tsx`

Variants:

- `info`
- `success`
- `warning`
- `error`
- `destructive`
- `neutral`

Rule:

- New success/warning/error helper boxes must use `InlineAlert`.

### Panels And Shells

Source files:

- `src/components/ui/panel.tsx`
- `src/components/ui/editorial-shell.tsx`
- `src/components/ui/stat-card.tsx`
- `src/components/ui/card.tsx`
- `src/components/layout/admin-header.tsx`
- `src/components/layout/admin-sidebar.tsx`
- `src/components/layout/business-sidebar.tsx`

Rules:

- `Card` stays the generic grouped-content container.
- `Panel` is for inset/helper/stat sub-blocks inside larger surfaces.
- `EditorialShell` is for large public/auth shells that use the branded layered surface.
- `StatCard` is the preferred compact metric shell when the same pattern repeats.
- workspace headers and sidebars should compose from `Panel`, `NavLink`, `MetaChip` and `StatCard` before inventing one-off shells.

### Selection

Source: `src/components/ui/segmented-control.tsx`

Rules:

- multi-mode screen switches must use `SegmentedControl`;
- selection must be semantic via `aria-pressed` or tabs, not visual only;
- selected and disabled states must be explicit.

### Tables

Source files:

- `src/components/ui/admin-table.tsx`
- `src/components/ui/data-table.tsx`
- `src/components/ui/editorial-list-row.tsx`

Rules:

- new admin CRUD tables start from `AdminTableFrame` + `AdminTable`;
- `DataTable` is the generic alias for the same shared table contract;
- page-local raw table shells should not be duplicated;
- document either overflow strategy or mobile stack strategy per table family.
- public/editorial repeating rows should use `EditorialListRow` instead of local grid copies.

### Chips And Status

Source files:

- `src/components/ui/status-badge.tsx`
- `src/components/ui/meta-chip.tsx`
- legacy compatibility: `src/components/ui/badge.tsx`

Rules:

- use `StatusBadge` for workflow state;
- use `MetaChip` for filtering or lightweight metadata;
- `Badge` remains a compatibility alias only; new status UI should import `StatusBadge` directly;
- do not mix “status” and “filter” meaning in one visual variant without a reason.

## Accessibility Rules

- Keep visible `:focus-visible` on every interactive path.
- Minimum target height is `44px`.
- Do not encode important state by color alone.
- Error feedback must stay textual and structurally visible.
- Use native controls where possible.
- Keep segmented choice, tables and consent flows keyboard-usable.
- Check long Russian labels and headings on mobile before sign-off.

## Tailwind Arbitrary Value Policy

Allowed:

- one-off responsive layout values;
- rare alignment fixes with clear local scope;
- values that are truly unique to a single editorial composition.

Not allowed for repeated UI:

- repeated colors;
- repeated shadows;
- repeated radiuses;
- repeated border opacity values;
- repeated field shells;
- repeated CTA shells;
- repeated notice shells.

Rule:

- if an arbitrary value appears repeatedly in more than one surface or primitive family, promote it into a token, shared class or reusable component.

## Local Variant Rule

Do not create a new local variant unless:

1. the surface has a genuinely different job;
2. the existing primitive cannot express that difference through a documented variant;
3. the new exception is documented in this file or in the component matrix.

If the same exception appears for the third time, it becomes a shared primitive or a formal variant.

## Validation Checklist

Before closing a meaningful UI batch:

- runtime fonts match `src/lib/fonts.ts`;
- `design-tokens.json` matches implemented tokens;
- repeated fields use the shared field contract;
- repeated notices use `InlineAlert`;
- repeated mode selectors use `SegmentedControl`;
- repeated product tables use `AdminTable`;
- desktop and mobile hierarchy remain readable;
- docs describe the implemented state, not a future intention.
