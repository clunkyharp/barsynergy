# Cost Calculator Figma Contract

Status: implementation checkpoint, 2026-05-22.

## Source Nodes

Primary Figma file:

```txt
BARSYNERGY
file key: aKzJvpAdbGIdIhc7J3MQNv
```

Target nodes for the calculator transfer:

| Role | Node |
| --- | --- |
| Public + Calculator Component State Contract — Batch 2 Slice 3 | `40:13849` |
| Calculator Input | `1:6266` |
| Slider | `1:6302` |
| Radio Group | `1:6330` |
| Result Card | `1:6391` |
| Metric | `1:6398` |
| CTA | `1:6409` |
| Panel | `1:6445` |
| Desktop calculator section | `19:8851` |
| Mobile calculated screen | `1:7051` |

Figma app screenshot export currently needs re-authentication. Until that is fixed, runtime work uses the source node list from the owner handoff and fresh runtime verification.

## Token Mapping

The calculator must use the existing runtime token contract instead of one-off calculator colors.

| Figma role | Runtime token |
| --- | --- |
| surface | `--surface` |
| surface muted | `--surface-muted` |
| surface wash | `--surface-wash` |
| border / line | `--border-default`, `--line` |
| text | `--text` |
| muted text | `--muted` |
| accent | `--accent` |
| accent soft | `--accent-soft` |
| danger | `--danger`, `--danger-bg`, `--danger-text`, `--field-border-error` |
| success | `--success`, `--success-bg`, `--success-text`, `--field-border-success` |
| field surface | `--field-surface`, `--field-surface-hover`, `--surface-wash` inside `.cost-sheet` |
| field border / focus | `--field-border`, `--field-border-hover`, `--field-border-focus` |

`.cost-sheet` is allowed to own density, worksheet rhythm, flat field behavior and select menu geometry. It should not introduce a separate palette.

## Component Split

Current internal component targets:

- `CalculatorShell`
- `CalculatorHeader`
- `PricingModeFields`
- `IngredientTable`
- `IngredientRow`
- `MobileIngredientCard`
- `CalculatorFormulaHelp`
- `CalculatorSubtotalStrip`
- `CalculatorResultRail`
- `CalculatorResultMessage`
- `CalculatorActions`

Formula and summary logic stay in `src/lib/calculator/cost-calculator.ts`.

## Primary Result Action

Product decision, 2026-05-24: the calculator does not save or export calculations in v1. The primary result action is copy-only.

- Runtime label: `Скопировать результат`.
- Success label: `Результат скопирован`.
- Empty/error behavior: the copy action stays disabled when the result cannot be calculated.
- Do not use `Сохранить расчёт` in runtime or handoff docs unless a real save/export flow is added.

## State Matrix

| State | Required behavior |
| --- | --- |
| Empty recipe | Empty notice is visible; result rail shows no price; copy action is disabled. |
| Demo filled | Demo rows calculate without row errors; result rail shows себестоимость, sale price, margin and markup. |
| Partial row | Row is excluded from total; status says a row is incomplete; no formula change. |
| Invalid number | Field keeps value; row/result message uses danger tokens; no `NaN` or `Infinity`. |
| Incompatible units | Row shows unit compatibility error; total price is blocked. |
| Invalid food-cost percent | Percent field shows error; auto price is blocked. |
| Manual price empty/invalid | Manual sale price field shows error; copy action stays disabled. |
| Manual price success | Result rail uses manual sale price; recommended price can still be shown as reference. |
| Calculated success | Auto price is based on total cost and target food cost percent. |
| Copy success | Copy button changes to success text temporarily. |
| Copy failed | Inline danger message tells the user to select the result manually. |
| Disabled actions | Disabled buttons keep stable size and do not shift layout. |
| One remaining row delete disabled | Delete action is disabled and visually muted. |

## Acceptance Checklist

- Desktop structure matches the worksheet/result-rail model from Figma.
- Mobile is not a compressed desktop table; ingredient rows are card-like rows with 44px+ controls.
- Light and dark themes use the same semantic roles.
- Long item and ingredient names do not push controls outside the viewport.
- Error, partial, manual and calculated states are visible in runtime.
- Formula tests still pass with demo total cost, recommended price, gross profit, margin and markup unchanged.
- Browser visual QA states the actual tool used: built-in browser, Playwright/CDP screenshot, or explicit gap.
