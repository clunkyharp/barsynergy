'use client';

import { type ReactNode } from 'react';
import { FormField } from '@/components/ui/form-field';

function calcResultState(hasError: boolean, canShow: boolean, hasCost: boolean) {
  if (hasError) return 'error';
  if (canShow) return 'calculated';
  if (hasCost) return 'partial';
  return 'empty';
}
import { decimal, money } from '@/components/public/cost-calculator/format';
import {
  type CalculatorPricingMode,
  type CalculatorSummary,
} from '@/lib/calculator/cost-calculator';

/* ------------------------------------------------------------------ */
/* Stacked divider between sections inside the left panel              */
/* ------------------------------------------------------------------ */
export function SectionDivider() {
  return <div className="mt-10 border-t border-[var(--line)] pt-10" />;
}

/* ------------------------------------------------------------------ */
/* Shell – two‑column grid                                            */
/* ------------------------------------------------------------------ */
export function CalculatorShell({ children, resultRail }: { children: ReactNode; resultRail: ReactNode }) {
  return (
    <section className="calculator-workspace-section background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-12">
      <div className="container grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_25rem]">
        {children}
        {resultRail}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Mode selector (two equal compact cards)                            */
/* ------------------------------------------------------------------ */
export function ModeSelector({
  onChange,
  value,
}: {
  onChange: (v: CalculatorPricingMode) => void;
  value: CalculatorPricingMode;
}) {
  const modes: { value: CalculatorPricingMode; label: string; desc: string }[] = [
    {
      value: 'auto',
      label: 'Рассчитать цену',
      desc: 'Укажите целевой food cost — калькулятор предложит цену меню.',
    },
    {
      value: 'manual',
      label: 'Проверить цену',
      desc: 'Введите цену продажи и проверьте маржу.',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {modes.map((m) => (
        <button
          key={m.value}
          className="choice-card rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition"
          data-selected={value === m.value ? 'true' : 'false'}
          onClick={() => onChange(m.value)}
          type="button"
        >
          <span className="block text-[13px] font-semibold leading-snug text-[var(--text)]">{m.label}</span>
          <span className="mt-0.5 block text-[11px] leading-[1.45] text-[var(--muted)]">{m.desc}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Basic parameters row                                               */
/* ------------------------------------------------------------------ */
export function ParameterFields({
  canShowRecommendedPrice,
  foodCostError,
  foodCostPercent,
  isManualMode,
  itemName,
  onFoodCostChange,
  onItemNameChange,
  onSalePriceChange,
  recommendedPrice,
  salePrice,
  salePriceError,
}: {
  canShowRecommendedPrice: boolean;
  foodCostError: string | null;
  foodCostPercent: string;
  isManualMode: boolean;
  itemName: string;
  onFoodCostChange: (v: string) => void;
  onItemNameChange: (v: string) => void;
  onSalePriceChange: (v: string) => void;
  recommendedPrice: number;
  salePrice: string;
  salePriceError: string | null;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(8rem,0.55fr)_minmax(10rem,0.7fr)]">
      <FormField htmlFor="calculatorItemName" label="Напиток">
        <input
          autoComplete="off"
          className="field-base h-11 w-full text-sm font-semibold"
          id="calculatorItemName"
          maxLength={120}
          onChange={(e) => onItemNameChange(e.target.value)}
          placeholder="Например, эспрессо тоник"
          value={itemName}
        />
      </FormField>

      <FormField
        htmlFor="calculatorFoodCost"
        label="Food cost, %"
        error={foodCostError ?? undefined}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-2">
          <input
            aria-invalid={foodCostError ? 'true' : undefined}
            className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 text-right text-lg font-semibold tabular-nums text-[var(--text)] outline-none transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 disabled:opacity-50"
            disabled={isManualMode}
            id="calculatorFoodCost"
            inputMode="decimal"
            maxLength={8}
            onChange={(e) => onFoodCostChange(e.target.value)}
            placeholder="30"
            value={foodCostPercent}
          />
          <span className="flex items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-2 text-[11px] font-semibold text-[var(--muted)]">%</span>
        </div>
      </FormField>

      <FormField
        htmlFor="calculatorSalePrice"
        label="Своя цена, ₽"
        error={salePriceError ?? undefined}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-2">
          <input
            aria-invalid={salePriceError ? 'true' : undefined}
            className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 text-right text-lg font-semibold tabular-nums text-[var(--text)] outline-none transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 disabled:opacity-50"
            disabled={!isManualMode}
            id="calculatorSalePrice"
            inputMode="decimal"
            maxLength={12}
            onChange={(e) => onSalePriceChange(e.target.value)}
            placeholder={canShowRecommendedPrice ? decimal(recommendedPrice) : '190'}
            value={salePrice}
          />
          <span className="flex items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-2 text-[11px] font-semibold text-[var(--muted)]">₽</span>
        </div>
      </FormField>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile result strip                                                */
/* ------------------------------------------------------------------ */
export function CalculatorMobileResultStrip({ summary }: { summary: CalculatorSummary }) {
  const hasError = summary.rowErrors.length > 0 || Boolean(summary.foodCostError || summary.salePriceError);
  const can = summary.canShowSalePrice;
  const state = calcResultState(hasError, can, summary.totalCost > 0);
  let line = 'Итог появится после заполнения ингредиентов.';
  if (hasError) line = 'Проверьте поля: итог временно не рассчитан.';
  else if (can) line = `Цена ${money(summary.activeSalePrice)} · себестоимость ${money(summary.totalCost)}`;
  else if (summary.totalCost > 0) line = `Себестоимость ${money(summary.totalCost)} · цена пока не рассчитана`;

  return (
    <div
      aria-live="polite"
      role="status"
      className="calculator-mobile-result-strip sticky top-16 z-10 xl:hidden"
      data-calculator-mobile-result-state={state}
    >
      <span className="sr-only">Итог: </span>
      <strong className="calculator-mobile-result-strip-value">{line}</strong>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Collapsed formula help                                             */
/* ------------------------------------------------------------------ */
export function CalculatorFormulaHelp() {
  return (
    <details className="mt-8 text-xs leading-5 text-[var(--muted)]">
      <summary className="calculator-formula-help-summary flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[var(--tracking-marker)] text-[var(--accent-ink)] [&::-webkit-details-marker]:hidden">
        Как считается
        <span className="calculator-formula-help-icon" aria-hidden="true">+</span>
      </summary>
      <div className="mt-3 border-t border-[var(--line)] pt-3 grid gap-3 md:grid-cols-2">
        <div>
          <span className="block font-semibold text-[var(--text)]">Формула строки</span>
          <p>Цена упаковки ÷ размер упаковки × расход на порцию = себестоимость ингредиента.</p>
        </div>
        <div>
          <span className="block font-semibold text-[var(--text)]">Цена продажи</span>
          <p>В авто-режиме: себестоимость ÷ целевая доля = цена меню. В ручном — укажите свою цену.</p>
        </div>
      </div>
    </details>
  );
}
