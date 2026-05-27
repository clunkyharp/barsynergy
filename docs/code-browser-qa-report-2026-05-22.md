# Code/Browser QA Report - 2026-05-22

Mode: Browser QA + Code QA + targeted fixes.

Artifact: QA report and targeted code fixes.

## Summary

Checked the runtime/code layer that cannot be closed from Figma screenshots: lint, keyboard/focus, cookie settings, calculator formula behavior, authenticated admin routes, admin status badges and CSS/token parity.

Fixed:

- `references/**` is now a global ESLint ignore because `references/` contains moodboard/reference artifacts, not production app code.
- Admin action menu now moves focus into the opened menu item and restores focus to the trigger on Escape.
- Existing confirm-dialog code path has focus-trap/aria support through the shared helper added in this batch.
- Several hard-coded surface/border colors in public/business/auth surfaces were replaced with shared CSS tokens.

Remaining runtime gaps:

- Confirm dialog could not be opened in browser without mutating local seed data: current article rows are `ARCHIVED`, so the destructive draft action is not present.
- Current seeded applications list loaded, but no application detail link was found by the CDP selector in the latest run.
- Cookie settings are functional and persisted, but the full Tab order is not marked verified because the first Tab after opening settings moved to the header link.
- Playwright/Cypress project setup is absent; browser evidence was collected through headless Chrome DevTools Protocol.

## Lint Gap

Decision: Option A, exclude `references/` from production lint.

Reason: `references/barsynergy-ui-moodboard/build-moodboard.mjs` belongs to design reference/moodboard artifacts, not runtime product code. Keeping reference scripts in app-wide production lint creates noise and does not validate `src/app`, `src/components` or tests.

Changed:

- `eslint.config.mjs`: global ignore now includes `references/**` before recommended flat configs.

Result:

- `npm run lint`: passed.

## Browser QA

Tool used:

- Google Chrome headless through Chrome DevTools Protocol against `npm run dev`.

Routes checked:

- Public: `/`, `/tools/cost-calculator`, `/auth/login`, `/contacts`, `/events`, `/education`, `/vacancies`, `/suppliers`, `/partners`.
- Admin unauthenticated smoke: `/admin`, `/admin/articles`, `/admin/applications`, `/admin/homepage` returned `307`.
- Admin authenticated: `/admin`, `/admin/articles`, `/admin/applications`, `/admin/users`, `/admin/homepage`, `/admin/categories`, `/admin/cities`, `/admin/tags`, `/admin/articles/create`.

Verified by browser evidence:

- Cookie banner appears on first visit.
- Cookie settings panel opens on desktop and mobile.
- Cookie save writes `localStorage` key `barsynergy_cookie_notice_accepted` with value shape `"true"`.
- Banner stays hidden after save and reload.
- Mobile menu opens and Escape closes it (`aria-expanded` goes `true` -> `false`).
- Auth invalid login redirects to `/auth/login?error=invalid` and shows the invalid login error.
- Calculator route loads, demo input is present, expected demo result is visible, invalid `0` percent shows the runtime error and no `NaN`/`Infinity` appears.
- Admin login reaches `/admin`.
- Admin dashboard, articles, applications, business access, homepage CMS, categories, cities, tags and article create form load.
- Admin action menu opens, focus moves to the first menu item, Escape closes it, focus returns to the trigger.
- Admin article create form validation error is visible after invalid submit.

## Authenticated Admin QA

Local admin access was created through the project-supported `npm run admin:upsert:local` workflow. The password is not recorded in this report.

Historical checks covered:

- Admin dashboard, articles, applications, business access, homepage CMS, dictionaries, cities, tags and article create form.
- Admin action menu open/focus/Escape behavior.
- Article create form invalid-submit error state.

Not proven:

- Application detail screenshot in the latest run: the applications page loaded, but the CDP selector did not find a detail link in the current page state.
- Confirm dialog runtime screenshot: current local article rows are archived, so destructive/draft confirm action was absent.

## Cookie Proof

Scenarios verified in browser:

- First visit: clear storage, open `/`, banner appears.
- Settings: click `Настроить`, panel opens.
- Save: click `Сохранить настройки`, `localStorage["barsynergy_cookie_notice_accepted"] === "true"`.
- Revisit: reload `/`, banner does not reappear.
- Mobile: 390px viewport, banner and settings panel are visible and usable.

## CSS/Token Parity

Inspected:

- `src/app/globals.css`
- shared UI/admin/public components
- `rg` scan for `#`, `rgb(`, `hsl(`, `rgba(`, `style={{`, red utility classes and one-off state colors.

Fixed obvious core UI one-offs:

- `src/components/business/business-request-form.tsx`
- `src/app/(business-workspace)/business/cabinet/requests/[applicationId]/page.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/(public)/articles/page.tsx`

Findings:

- Core status/action colors route through CSS variables: danger, success, warning, selected, focus, fields and status badges.
- External/contact brand accents remain hard-coded in `contact-action-row`, `social-card` and `general-sponsor-card`; these are not core UI state tokens and are left as brand/channel accents.
- `globals.css` still contains many raw color values because it is the token source itself.
- Dark mode tokens exist in CSS, but dark mode remains deferred for v1 handoff; not marked as complete parity.

## Calculator Formula

Formula was not changed without product decision.

Test evidence:

- `tests/cost-calculator-formula.test.mjs`
- `npm test`: passed 55 tests.

Covered cases:

- Demo recipe total cost: `57.45`.
- Recommended price at 30% food cost: `191.5`.
- Manual price `250`: gross profit, margin and markup.
- Unit conversion `l/ml`, `kg/g`.
- Incompatible units.
- Invalid percent `0`.
- Zero recipe amount.
- No `NaN`/`Infinity`.

Historical checks covered desktop/mobile calculator render, invalid error state and targeted calculator result assertions.

## Validation

- `npm run lint`: passed.
- `npm test`: passed, 55 tests.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Playwright/e2e script: not configured in `package.json`.
- Standalone local runtime: attempted without production-like env and failed by design on env guards (`STORAGE_DRIVER`, server actions encryption key, legal/operator readiness fields). This is classified as environment/setup gap, not a regression from this batch.

## FDR Status Update

- FDR-P1-22: `CLOSED / VERIFIED`; not reopened.
- FDR-P2-06: `CODE-VERIFIED` through `tests/admin-status-badge-usage.test.mjs`, `src/components/ui/status-badge.tsx` and admin imports from `@/components/ui/status-badge`.
- Keyboard/focus: partially browser-verified for mobile menu and admin action menu; full route-by-route tab order remains not proven.
- Dialog focus trap: code-fixed for local confirm dialogs, but browser runtime opening is not proven because current seed lacks a destructive action.
- Cookie settings: browser-verified for open/save/reload/mobile persistence; full Tab order not fully closed.
- Calculator formulas: test-verified and browser-smoked for normal/invalid/no `NaN`.
- CSS/token parity: targeted code parity improved; full design-token parity remains a reported debt.

## MemPalace

`.npmrc` was inspected without printing secret values. It contains only safe npm settings, no auth token. MemPalace dry-run and full refresh were rerun with `--allow-sensitive-names` after that review and completed successfully. One corrupt local HNSW segment was quarantined automatically by the tool before filing the refreshed project data.
