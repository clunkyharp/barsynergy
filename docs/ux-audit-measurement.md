# UX Audit Measurement Contract

Source: `docs/ux-audit-2026-06-12-deep.md`, S4 Metrics.

This file defines source-level hooks and formulas for future analytics. It does not enable an analytics provider, cookies, external event shipping, or personal-data export.

## Legal And Privacy Boundary

- Current code does not connect a separate analytics counter.
- Before adding a real provider, update `/legal/cookies`, `/legal/privacy`, env docs and the production readiness checklist.
- Event payloads must not include names, emails, phone numbers, Telegram handles, free-text form bodies or uploaded file data.
- Allowed event payloads: event name, timestamp, route, profile section id, completion percent, result state and anonymous session/user key chosen by the future analytics layer.

## Source Hooks

| Hook | Selector | Purpose |
|------|----------|---------|
| `profile_settings_first_save` | `[data-ux-event="profile_settings_first_save"]` | Start/end point for measuring time to first profile settings save. |
| `profile_completion_viewed` | `[data-ux-metric="profile_completion_viewed"]` | Snapshot source for profile completion percent. |
| `supplier_application_started` | `[data-ux-event="supplier_application_started"]` | Start point for supplier application funnel. |
| `supplier_application_submitted` | `[data-ux-success-event="supplier_application_submitted"]` | Success point for supplier application funnel. |

## Metrics

### Time To First Save

`T до первого save = profile_settings_first_save_completed.timestamp - profile_settings_first_save_started.timestamp`

Collector rule: treat the first successful `profile_settings_first_save` form result per anonymous session or authenticated user as `profile_settings_first_save_completed`. Use `data-ux-section` only as a dimension, not as personal data.

### Profile Completion Before / After

`% заполненных профилей = count(profile_completion_viewed where data-ux-value = 100) / count(profile_completion_viewed) * 100`

For release comparison, calculate the same formula for the pre-release and post-release windows. Keep the window length equal, for example 7 days before release and 7 days after release.

### Supplier Application Drop

`% drop при заявке поставщику = (supplier_application_started - supplier_application_submitted) / supplier_application_started * 100`

Collector rule: count `supplier_application_submitted` only after a success result. Do not send field values from the supplier form.

## Implementation Status

- DOM hooks are present in profile settings forms, the profile completion source and the supplier application form.
- No analytics provider is wired.
- Target windows, dashboards and event storage remain a product/ops decision.
