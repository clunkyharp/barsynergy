'use client';

import { type ReactNode } from 'react';
import { ChevronDown, Link2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { FormField } from '@/components/ui/form-field';
import { CalculatorResultRail } from '@/components/public/cost-calculator/result-rail';
import { CalculatorParameters } from '@/components/public/cost-calculator/calculator-parameters';
import { AdditionalCostsEditor } from '@/components/public/cost-calculator/additional-costs-editor';
import { PopularDrinks } from '@/components/public/cost-calculator/popular-drinks';
import { HelpfulTips } from '@/components/public/cost-calculator/helpful-tips';
import { MarkupPricing } from '@/components/public/cost-calculator/markup-pricing';
import { IngredientEditor } from '@/components/public/cost-calculator/ingredient-editor';
import { decimal, money } from '@/components/public/cost-calculator/format';
import { useCostCalculatorState } from '@/components/public/cost-calculator/use-cost-calculator-state';
import {
  type CalculatorPricingMode,
  type CalculatorSummary,
} from '@/lib/calculator/cost-calculator';

/* ------------------------------------------------------------------ */
/* Stacked divider between sections inside the left panel              */
/* ------------------------------------------------------------------ */
function SectionDivider() {
  return <div className="mt-10 border-t border-[var(--line)] pt-10" />;
}

/* ------------------------------------------------------------------ */
/* Shell – two‑column grid                                            */
/* ------------------------------------------------------------------ */
function CalculatorShell({ children, resultRail }: { children: ReactNode; resultRail: ReactNode }) {
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
/* Toolbar (page‑level actions)                                       */
/* ------------------------------------------------------------------ */
function formatTime(date: Date) {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function CalculatorToolbar({
  hasAnyInput,
  lastSavedAt,
  onClear,
  onFillDemo,
  onShare,
}: {
  hasAnyInput: boolean;
  lastSavedAt: Date | null;
  onClear: () => void;
  onFillDemo: () => void;
  onShare: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          className="min-h-10 rounded-[var(--radius-sm)] px-3 text-sm"
          onClick={onFillDemo}
          size="sm"
          type="button"
          variant="secondary"
        >
          Заполнить примером
        </Button>
        <Button
          className="min-h-10 rounded-[var(--radius-sm)] px-3 text-sm"
          disabled={!hasAnyInput}
          onClick={onClear}
          size="sm"
          type="button"
          variant="ghost"
        >
          <RotateCcw size={15} strokeWidth={1.8} />
          Новый расчёт
        </Button>
        <Button
          className="min-h-10 rounded-[var(--radius-sm)] px-3 text-sm"
          onClick={onShare}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Link2 size={15} strokeWidth={1.8} />
          Поделиться ссылкой
        </Button>
      </div>
      {lastSavedAt ? (
        <span aria-live="polite" className="text-[11px] leading-none text-[var(--muted)]">
          Сохранено локально · {formatTime(lastSavedAt)}
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mode selector (two equal compact cards)                            */
/* ------------------------------------------------------------------ */
function ModeSelector({
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
function ParameterFields({
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
        <input
          aria-invalid={foodCostError ? 'true' : undefined}
          className="field-base h-11 w-full text-right text-sm font-semibold tabular-nums disabled:opacity-50"
          disabled={isManualMode}
          id="calculatorFoodCost"
          inputMode="decimal"
          maxLength={8}
          onChange={(e) => onFoodCostChange(e.target.value)}
          placeholder="30"
          value={foodCostPercent}
        />
      </FormField>

      <FormField
        htmlFor="calculatorSalePrice"
        label="Своя цена, ₽"
        error={salePriceError ?? undefined}
      >
        <input
          aria-invalid={salePriceError ? 'true' : undefined}
          className="field-base h-11 w-full text-right text-sm font-semibold tabular-nums disabled:opacity-50"
          disabled={!isManualMode}
          id="calculatorSalePrice"
          inputMode="decimal"
          maxLength={12}
          onChange={(e) => onSalePriceChange(e.target.value)}
          placeholder={canShowRecommendedPrice ? decimal(recommendedPrice) : '190'}
          value={salePrice}
        />
      </FormField>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile result strip                                                */
/* ------------------------------------------------------------------ */
function CalculatorMobileResultStrip({ summary }: { summary: CalculatorSummary }) {
  const hasError = summary.rowErrors.length > 0 || Boolean(summary.foodCostError || summary.salePriceError);
  const can = summary.canShowSalePrice;
  const state = hasError ? 'error' : can ? 'calculated' : summary.totalCost > 0 ? 'partial' : 'empty';
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
function CalculatorFormulaHelp() {
  return (
    <details className="mt-8 text-xs leading-5 text-[var(--muted)]">
      <summary className="calculator-formula-help-summary flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[var(--tracking-marker)] text-[var(--accent)] [&::-webkit-details-marker]:hidden">
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

/* ================================================================== */
/* Main client component                                              */
/* ================================================================== */
export function CostCalculatorClient() {
  const calc = useCostCalculatorState();
  const { showToast } = useToast();

  async function handleShareRecipe() {
    const result = await calc.shareRecipe();

    if (result === 'shared') {
      showToast({
        id: 'calculator-share',
        title: 'Ссылка готова',
        description: 'Рецепт передан через системное окно.',
        tone: 'success',
        duration: 3200
      });
      return;
    }

    if (result === 'copied') {
      showToast({
        id: 'calculator-share',
        title: 'Ссылка скопирована',
        description: 'Откройте её на другом устройстве или отправьте в чат.',
        tone: 'success',
        duration: 3200
      });
      return;
    }

    showToast({
      id: 'calculator-share',
      title: 'Не удалось поделиться',
      description: 'Попробуйте ещё раз.',
      tone: 'error',
      duration: 5000
    });
  }

  return (
    <>
      <CalculatorShell
        resultRail={
          <CalculatorResultRail
            breakdown={calc.breakdown}
            copyState={calc.copyState}
            onCopyResult={calc.copyResult}
            resultMessage={calc.resultMessage}
            resultMessageKind={calc.resultMessageKind}
            summary={calc.summary}
          />
        }
      >
        {/* LEFT PANEL */}
        <div className="calculator-panel cost-sheet min-w-0">

          {/* Toolbar */}
          <CalculatorToolbar
            hasAnyInput={calc.hasAnyInput}
            lastSavedAt={calc.lastSavedAt}
            onClear={calc.clearCalculator}
            onFillDemo={calc.fillDemo}
            onShare={handleShareRecipe}
          />

          {/* Mode selector */}
          <div className="mt-6">
            <h3 className="calculator-input-group-title mb-3">Режим</h3>
            <ModeSelector onChange={calc.setPricingMode} value={calc.pricingMode} />
          </div>

          {/* Basic parameters */}
          <div className="mt-6">
            <h3 className="calculator-input-group-title mb-3">Параметры</h3>
            <ParameterFields
              canShowRecommendedPrice={calc.summary.canShowRecommendedPrice}
              foodCostError={calc.foodCostError}
              foodCostPercent={calc.foodCostPercent}
              isManualMode={calc.isManualMode}
              itemName={calc.itemName}
              onFoodCostChange={calc.setFoodCostPercent}
              onItemNameChange={calc.setItemName}
              onSalePriceChange={calc.setSalePrice}
              recommendedPrice={calc.recommendedPrice}
              salePrice={calc.salePrice}
              salePriceError={calc.salePriceError}
            />
          </div>

          <CalculatorMobileResultStrip summary={calc.summary} />

          <SectionDivider />

          {/* Ingredients */}
          <IngredientEditor
            hasAnyInput={calc.hasAnyInput}
            onAddIngredient={calc.addIngredient}
            onDuplicate={calc.duplicateIngredient}
            onRemove={calc.removeIngredient}
            onUpdate={calc.updateIngredient}
            rowStatusText={calc.rowStatusText}
            rows={calc.rows}
          />

          <details className="group mt-8 rounded-[var(--radius-lg)] border border-[var(--border-default)]">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-[var(--text)] transition-colors hover:text-[var(--accent)] [&::-webkit-details-marker]:hidden">
              Дополнительные параметры
              <ChevronDown className="transition-transform duration-[var(--motion-duration-base)] group-open:rotate-180 motion-reduce:transition-none" size={16} strokeWidth={1.8} />
            </summary>
            <div className="px-5 pb-5">
              <SectionDivider />

              {/* Additional costs */}
              <AdditionalCostsEditor
                costs={calc.additionalCostRows}
                onAdd={calc.addAdditionalCost}
                onRemove={calc.removeAdditionalCost}
                onUpdate={calc.updateAdditionalCost}
                total={calc.additionalCostTotal}
              />

              <SectionDivider />

              {/* Drink parameters */}
              <CalculatorParameters
                params={calc.drinkParams}
                onParamChange={calc.updateDrinkParam}
              />
            </div>
          </details>

          <SectionDivider />

          {/* Markup & pricing */}
          <MarkupPricing
            customMarkupPercent={calc.customMarkupPercent}
            grossProfit={calc.grossProfit}
            markupPercent={calc.markupPercent}
            onMarkupChange={calc.setCustomMarkupPercent}
            onRoundingChange={calc.setRoundingMode}
            roundingMode={calc.roundingMode}
            totalCost={calc.totalCost}
          />

          {/* Formula help (no divider — it's always last) */}
          <CalculatorFormulaHelp />
        </div>
      </CalculatorShell>

      {/* Below calculator: popular drinks + tips */}
      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-10">
        <div className="container">
          <PopularDrinks />
        </div>
      </section>

      <HelpfulTips />
    </>
  );
}
