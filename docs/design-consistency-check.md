# Design Consistency Check

Date: 2026-04-26

Mode: source-level QA plus browser screenshot QA.

This check covers the current design-system foundation, public-page code and production-preview browser screenshots.

## Scope

Checked:

- `src/app/globals.css`
- `src/components/ui`
- `src/components/public`
- `src/components/layout/site-header.tsx`
- `src/components/layout/site-footer.tsx`
- public pages under `src/app/(public)`
- `DESIGN.md`
- `design-tokens.json`
- `public/design-system-preview.html`

Out of scope:

- live production browser QA;
- admin CRUD screens that do not exist yet;
- refactoring current page markup.

## Result

Current status: pass with known gaps.

The project now has a documented design-system contract, a token file and a static preview page. Existing UI code already follows the same broad color, typography and editorial layout direction, but some repeated public CTA/link styles are still local compositions rather than shared components.

Browser QA update on 2026-04-26:

- desktop and mobile screenshots passed for home, about, education, events, articles, vacancies, suppliers, partners and contacts;
- public route HTTP smoke passed for all Phase 1 routes;
- mobile menu open and `Esc` close check passed;
- no checked public route had horizontal overflow at 1440px or 390px viewport width;
- no checked public route exposed `Phase`, `MVP` or `placeholder` text.

## What Is Consistent

- Global semantic color roles exist in `src/app/globals.css`.
- Body and display fonts are centralized in `src/lib/fonts.ts`.
- Base UI primitives exist under `src/components/ui`.
- Public repeated informational pages use `EditorialPublicPage`.
- Legal pages use `LegalDraftPage`.
- Header and footer use the same graphite/accent/editorial direction as public pages.
- Focus visibility is globally defined through `:focus-visible`.
- Main public route groups use thin dividers, editorial grid structure and muted/accent labels.

## Known Gaps

| Area | Gap | Risk | Recommended follow-up |
| --- | --- | --- | --- |
| Public CTA component | Editorial CTA link classes are still local compositions. | Drift if more bespoke CTA variants are added. | Add `EditorialLink` or `EditorialAction` if CTA duplication continues. |
| Form workflows | Component states exist, but real forms are not wired yet. | Future forms can still misuse validation or pending states. | Use `FormField.error`, control `disabled`, and `Button.loading` in Phase 3 forms. |
| Design preview | Preview is static HTML, not generated from React components. | Preview can drift if components change. | Keep it manually synced or replace with Storybook later. |
| Visual QA | Page-by-page desktop/mobile screenshot QA passed for the current static public routes. | Future data-driven content can still introduce overflow or copy regressions. | Re-run screenshot QA after connecting real content data. |

## Admin/Product UI Follow-Up

Phase 2 admin CRUD should use the public design tokens but avoid public hero scale. Lists, forms and status controls should stay dense, predictable and task-focused.

## Public Page Pattern Map

| Surface | Current pattern |
| --- | --- |
| Home | Custom editorial composition |
| About | `EditorialPublicPage` |
| Education | `EditorialPublicPage` |
| Events | `EditorialPublicPage` |
| Articles | `EditorialPublicPage` |
| Vacancies | `EditorialPublicPage` |
| Suppliers | `EditorialPublicPage` |
| Partners | `EditorialPublicPage` |
| Contacts | `EditorialPublicPage` |
| Legal pages | `LegalDraftPage` |
| 404/loading/error | Editorial fallback composition |

## Review Checklist

Use this before approving future visual changes:

- New color is represented as a semantic token or justified as local art direction.
- New repeated UI uses `src/components/ui` or gets documented as a component gap.
- Public pages use the editorial grid unless they have a clear custom role.
- Admin pages avoid public hero typography.
- Form states include label, help/error text and keyboard focus behavior.
- Mobile text wraps without overlap.
- Buttons and links remain semantically correct.
- Browser screenshots are checked before release.
