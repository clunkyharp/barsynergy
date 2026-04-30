# Design System Component Matrix

| Component | Variants | States | Allowed surfaces | Source file | Notes |
| --- | --- | --- | --- | --- | --- |
| `Button` | `primary`, `secondary`, `ghost`, `destructive`, `inverse`; `sm`, `md`, `lg` | default, hover, active, focus, disabled, loading | auth, workspace, public support actions | `src/components/ui/button.tsx` | default operational action primitive |
| `EditorialAction` | `default`, `inverse` | default, hover, focus | public-editorial | `src/components/ui/editorial-action.tsx` | branded public CTA; used on home and general sponsors routes |
| `InlineLink` | inline | default, hover, focus | all | `src/components/ui/inline-link.tsx` | canonical legal/help link primitive |
| `NavLink` | default, active | default, hover, active, focus | workspace-product | `src/components/ui/nav-link.tsx` | sidebar/product navigation |
| `Input` | shared field base | default, hover, focus, disabled, invalid | all forms | `src/components/ui/input.tsx` | uses `field-styles.ts` |
| `Select` | shared field base | default, hover, focus, disabled, invalid | all forms | `src/components/ui/select.tsx` | uses `field-styles.ts` |
| `Textarea` | shared field base | default, hover, focus, disabled, invalid | all forms | `src/components/ui/textarea.tsx` | uses `field-styles.ts` |
| `CheckboxField` | default | checked, focus, disabled, invalid | auth, business, public, workspace helpers | `src/components/ui/checkbox-field.tsx` | generic checkbox + label primitive |
| `ConsentField` | default | checked, focus, disabled, invalid | public, auth, business | `src/components/ui/consent-field.tsx` | canonical consent/data-processing block |
| `InlineAlert` | `info`, `success`, `warning`, `error`, `destructive`, `neutral`; `default`, `compact` | default, success, warning, error, destructive | all | `src/components/ui/inline-alert.tsx` | no new page-local notice shells |
| `Panel` | `default`, `elevated`, `inverse`; `sm`, `md`, `lg` padding | default | auth, workspace, helper public blocks | `src/components/ui/panel.tsx` | canonical support shell for dashboards, sidebars and helper blocks |
| `EditorialShell` | branded shell | default | public-editorial, auth-acquisition | `src/components/ui/editorial-shell.tsx` | larger branded wrapper |
| `StatCard` | default | default | workspace-product | `src/components/ui/stat-card.tsx` | compact metric shell; used on admin and business dashboards |
| `Card` | `interactive`, `selected`, `loading`, `error` flags | hover, focus-within, selected, loading, error | all | `src/components/ui/card.tsx` | generic grouped-content surface |
| `SegmentedControl` | `default`, `inverse`, `compact` | default, hover, selected, disabled, focus | public forms, business flows, future toggles | `src/components/ui/segmented-control.tsx` | button-group semantics via `aria-pressed` |
| `AdminTable` | dense shell | default, empty, row actions | workspace-product | `src/components/ui/admin-table.tsx` | low-level table primitive |
| `DataTable` | alias family for `AdminTable` | default, empty, row actions | workspace-product | `src/components/ui/data-table.tsx` | generic table import for product CRUD screens |
| `StatusBadge` | `success`, `warning`, `danger`, `neutral`, `pending` | default | workspace-product, public status metadata | `src/components/ui/status-badge.tsx` | canonical status meaning primitive |
| `Badge` | compatibility alias | default | legacy compatibility only | `src/components/ui/badge.tsx` | keep only for backward compatibility; new code should use `StatusBadge` |
| `MetaChip` | `default`, `filter`, `selected`, `inverse` | default, selected | public-editorial, filters, workspace metadata | `src/components/ui/meta-chip.tsx` | metadata/filter meaning only |
| `EditorialListRow` | `default`, `content`; `article`, `div` | default, hover by container context | public-editorial | `src/components/ui/editorial-list-row.tsx` | reusable row for editorial sections and index pages |
*** Delete File: /Users/amir/Desktop/CODEX:AGENTS/BARSENERGY/docs/design-system-qa-report.md
