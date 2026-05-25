# Design System Status

Дата: 2026-05-25

## Current source of truth

Актуальный статус дизайн-системы описывается в трех документах:

- `docs/design-system-consistency-audit-final-2026-04-29.md`
- `docs/ui-ux-audit-final-2026-04-29.md`
- `docs/ui-ux-design-refactor-plan.md`

Этот файл нужен только как короткая статусная сводка.

## Current maturity

Текущий уровень: `2 / 4`

Почему:

- tokens, шрифтовой контракт и shared primitives уже существуют и реально используются;
- но система еще не закрывает полный набор core interaction components;
- public page templates все еще слишком зависят от локальных экранных решений;
- list/detail pattern только начал внедряться и еще не завершен по всей public IA;
- responsive/accessibility hardening не доведен до sign-off уровня.

## What is already true

- shared filters стали сильнее и ближе к реальным данным;
- public catalog rows теперь ведут в detail flow;
- public catalog pages получили reusable featured pattern;
- public detail pages получили reusable related/next-step pattern;
- public detail shell now exposes type-specific labels, section blocks and 320px hardening for article/event/course/vacancy/supplier/partner pages;
- `GeneralSponsorCard` now has variant/state hooks, hover/focus states, long-content wrapping, compact mobile behavior and source-level archived-state styling;
- auth/navigation copy стала честнее;
- public auth login now has explicit role-card state hooks, 320px layout hardening, and verified error/request-sent states without changing auth flow;
- admin sidebar больше не выдает незавершенные справочники за готовые рабочие разделы.
- code-side core interaction layer теперь включает `Dialog`, `ToastProvider`/`useToast`, `Tabs`, `Toggle` и `Switch`.
- admin table/form layer now has mobile row fallback labels, compact inline edit records, 76px sticky form actions and admin-scoped invalid field states without red glow.
- shared `FileUpload` now covers private/public notices, selected-file success, server/client error, and submit-pending upload visuals.
- calculator worksheet/result surfaces now use semantic light/dark tokens instead of raw light panels, and the checked calculator controls keep 40-44px interaction targets.
- `/education` format cards now use semantic surface/accent tokens for card, label, hover and fact-row surfaces instead of raw light-only color values.
- `RoleTaskCard` and `FeatureCard` now support a row presentation for navigation/process choices, so public pages do not have to turn every choice block into equal card grids.

## What is still not true

- нельзя считать систему полностью стабилизированной;
- нельзя считать maturity уровнем `3 stabilized`;
- общий `Dropdown/Menu` primitive and row/card variants need continued route-by-route usage review before the system can be called fully stabilized;
- `Dialog` и `ToastProvider` сверены с live Figma Desktop Bridge, но `Tabs` и `Toggle/Switch` не имеют найденных source components в Figma;
- `ToastProvider` установлен на shell level, но конкретные toast callers еще подключаются только по отдельным behavior-задачам;
- нельзя использовать старые PASS-формулировки как текущий итог по всей системе без оговорок.

## Next checkpoint

Следующая контрольная точка для этой темы:

- закрыть Phase 1-3 из `docs/ui-ux-design-refactor-plan.md`;
- затем сделать отдельный accessibility/responsive QA pass.
