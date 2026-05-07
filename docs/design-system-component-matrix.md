# Design System Component Matrix

| Component | Variants | States | Allowed surfaces | Source file | Notes |
| --- | --- | --- | --- | --- | --- |
| `Button` | `primary`, `secondary`, `ghost`, `destructive`, `inverse`; `sm`, `md`, `lg` | default, hover, active, focus, disabled, loading | auth, workspace, public support actions | `src/components/ui/button.tsx` | default operational action primitive |
| `EditorialAction` | `default`, `inverse` | default, hover, focus | public-editorial | `src/components/ui/editorial-action.tsx` | branded public CTA; used on home and general sponsors routes |
| `InlineLink` | inline | default, hover, focus | all | `src/components/ui/inline-link.tsx` | canonical legal/help link primitive |
| `NavLink` | default, active | default, hover, active, focus | workspace-product | `src/components/ui/nav-link.tsx` | sidebar/product navigation |
| `Input` | shared field base | default, hover, focus, disabled, invalid | all forms | `src/components/ui/input.tsx` | uses `field-styles.ts` |
| `SearchInput` | shared search field | default, hover, focus, disabled, invalid | public filters, admin filters, workspace search | `src/components/ui/search-input.tsx` | wraps `Input` with the canonical search icon and spacing |
| `Select` | shared field base | default, hover, focus, disabled, invalid | all forms | `src/components/ui/select.tsx` | uses `field-styles.ts` |
| `Textarea` | shared field base | default, hover, focus, disabled, invalid | all forms | `src/components/ui/textarea.tsx` | uses `field-styles.ts` |
| `CheckboxField` | default | checked, focus, disabled, invalid | auth, business, public, workspace helpers | `src/components/ui/checkbox-field.tsx` | generic checkbox + label primitive |
| `RadioField` | default | checked, hover, focus, disabled, invalid | auth, business, public, workspace helpers | `src/components/ui/radio-field.tsx` | generic radio + label primitive |
| `RadioGroup` | fieldset group | default, with description | auth, business, public, workspace forms | `src/components/ui/radio-field.tsx` | semantic wrapper for related radio choices |
| `ConsentField` | default | checked, focus, disabled, invalid | public, auth, business | `src/components/ui/consent-field.tsx` | canonical consent/data-processing block |
| `FileUpload` | default, with title, description and meta | default, hover, focus, disabled, filled | public uploads, admin media | `src/components/ui/file-upload.tsx` | branded file control; raw browser upload buttons are not part of the form system |
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
