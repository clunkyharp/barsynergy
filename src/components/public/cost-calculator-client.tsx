'use client';

import { type ReactNode } from 'react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { IngredientEditor } from '@/components/public/cost-calculator/ingredient-editor';
import { CalculatorResultRail } from '@/components/public/cost-calculator/result-rail';
import { decimal, money } from '@/components/public/cost-calculator/format';
import { useCostCalculatorState } from '@/components/public/cost-calculator/use-cost-calculator-state';
import { displayFont } from '@/lib/fonts';
import {
  type CalculatorPricingMode as PricingMode,
  type CalculatorSummary
} from '@/lib/calculator/cost-calculator';

type CalculatorHeaderProps = {
  itemName: string;
  foodCostError: string | null;
  foodCostPercent: string;
  isManualMode: boolean;
  pricingMode: PricingMode;
  recommendedPrice: number;
  salePrice: string;
  salePriceError: string | null;
  canShowRecommendedPrice: boolean;
  onFoodCostChange: (value: string) => void;
  onItemNameChange: (value: string) => void;
  onPricingModeChange: (value: PricingMode) => void;
  onSalePriceChange: (value: string) => void;
};

function CalculatorShell({ children, resultRail }: { children: ReactNode; resultRail: ReactNode }) {
  return (
    <section className="calculator-workspace-section background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-12">
      <div className="container grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_25rem]">
        {children}
        {resultRail}
      </div>
    </section>
  );
}

function CalculatorHeader({
  itemName,
  foodCostError,
  foodCostPercent,
  isManualMode,
  pricingMode,
  recommendedPrice,
  salePrice,
  salePriceError,
  canShowRecommendedPrice,
  onFoodCostChange,
  onItemNameChange,
  onPricingModeChange,
  onSalePriceChange
}: CalculatorHeaderProps) {
  return (
    <div className="calculator-panel-header grid gap-4">
      <div className="min-w-0">
        <h2 className={`${displayFont.className} calculator-panel-title`}>Калькулятор себестоимости</h2>
        <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-[var(--muted)]">
          Укажите ингредиенты напитка и долю себестоимости — калькулятор рассчитает цену для меню.
        </p>
      </div>
      <PricingModeFields
        canShowRecommendedPrice={canShowRecommendedPrice}
        foodCostError={foodCostError}
        foodCostPercent={foodCostPercent}
        isManualMode={isManualMode}
        itemName={itemName}
        onFoodCostChange={onFoodCostChange}
        onItemNameChange={onItemNameChange}
        onPricingModeChange={onPricingModeChange}
        onSalePriceChange={onSalePriceChange}
        pricingMode={pricingMode}
        recommendedPrice={recommendedPrice}
        salePrice={salePrice}
        salePriceError={salePriceError}
      />
    </div>
  );
}

function PricingModeFields({
  itemName,
  foodCostError,
  foodCostPercent,
  isManualMode,
  pricingMode,
  recommendedPrice,
  salePrice,
  salePriceError,
  canShowRecommendedPrice,
  onFoodCostChange,
  onItemNameChange,
  onPricingModeChange,
  onSalePriceChange
}: CalculatorHeaderProps) {
  return (
    <div className="grid gap-4">
      <section className="calculator-input-group" aria-labelledby="calculator-mode-title">
        <h3 id="calculator-mode-title" className="calculator-input-group-title">Режим</h3>
        <SegmentedControl
          className="calculator-mode-control calculator-mode-inline"
          items={[
            {
              value: 'auto',
              label: 'Рассчитать цену по доле себестоимости',
              description: 'Введите целевую долю, и калькулятор покажет цену меню.'
            },
            {
              value: 'manual',
              label: 'Проверить введённую цену',
              description: 'Укажите цену продажи, чтобы проверить себестоимость и маржу.'
            }
          ]}
          onChange={onPricingModeChange}
          value={pricingMode}
          variant="compact"
        />
      </section>
      <section className="calculator-input-group" aria-labelledby="calculator-fields-title">
        <h3 id="calculator-fields-title" className="calculator-input-group-title">Параметры</h3>
        <div className="calculator-parameter-fields grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(8rem,0.55fr)_minmax(10rem,0.7fr)]">
          <FormField htmlFor="calculatorItemName" label="Напиток">
            <Input
              autoComplete="off"
              className="h-11 text-sm font-semibold"
              id="calculatorItemName"
              maxLength={120}
              onChange={(event) => onItemNameChange(event.target.value)}
              placeholder="Например, эспрессо тоник"
              value={itemName}
            />
          </FormField>
          <FormField
            error={foodCostError ?? undefined}
            htmlFor="calculatorFoodCost"
            label="Доля себестоимости, %"
          >
            <Input
              aria-invalid={foodCostError ? true : undefined}
              className="h-11 text-sm font-semibold tabular-nums"
              id="calculatorFoodCost"
              inputMode="decimal"
              maxLength={8}
              onChange={(event) => onFoodCostChange(event.target.value)}
              value={foodCostPercent}
            />
          </FormField>
          <FormField
            error={salePriceError ?? undefined}
            htmlFor="calculatorSalePrice"
            label="Своя цена продажи"
          >
            <Input
              aria-invalid={salePriceError ? true : undefined}
              className="h-11 text-sm font-semibold tabular-nums"
              disabled={!isManualMode}
              id="calculatorSalePrice"
              inputMode="decimal"
              maxLength={12}
              onChange={(event) => onSalePriceChange(event.target.value)}
              placeholder={canShowRecommendedPrice ? decimal(recommendedPrice) : '190'}
              value={salePrice}
            />
          </FormField>
        </div>
      </section>
    </div>
  );
}

function CalculatorMobileResultStrip({ summary }: { summary: CalculatorSummary }) {
  const hasBlockingError = summary.rowErrors.length > 0 || Boolean(summary.foodCostError || summary.salePriceError);
  const state = hasBlockingError ? 'error' : summary.canShowSalePrice ? 'calculated' : summary.totalCost > 0 ? 'partial' : 'empty';
  let line = 'Итог появится после заполнения ингредиентов.';

  if (hasBlockingError) {
    line = 'Проверьте поля: итог временно не рассчитан.';
  } else if (summary.canShowSalePrice) {
    line = `Цена ${money(summary.activeSalePrice)} · себестоимость ${money(summary.totalCost)}`;
  } else if (summary.totalCost > 0) {
    line = `Себестоимость ${money(summary.totalCost)} · цена пока не рассчитана`;
  }

  return (
    <div aria-live="polite" className="calculator-mobile-result-strip xl:hidden" data-calculator-mobile-result-state={state}>
      <span className="sr-only">Итог: </span>
      <strong className="calculator-mobile-result-strip-value">{line}</strong>
    </div>
  );
}

function CalculatorFormulaHelp() {
  return (
    <details className="calculator-formula-help border-b border-[var(--line)] text-xs leading-5 text-[var(--muted)]">
      <summary className="calculator-formula-help-summary flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)] md:px-5 [&::-webkit-details-marker]:hidden">
        Инструкция
        <span className="calculator-formula-help-icon" aria-hidden="true">+</span>
      </summary>
      <FormulaHelpGrid className="calculator-formula-help-grid grid gap-4 border-t border-[var(--line)] px-4 py-4 md:grid-cols-3 md:px-5" />
    </details>
  );
}

function FormulaHelpGrid({ className }: { className: string }) {
  return (
    <div className={className}>
      <div className="grid gap-3 md:col-span-2">
        <div>
          <span className="block font-semibold text-[var(--text)]">Как пользоваться</span>
          <p className="mt-1">1. Добавьте ингредиенты — название, цену упаковки, размер и расход на порцию.</p>
          <p className="mt-1">2. Выберите режим: авто (по целевой доле) или ручной (проверить свою цену).</p>
          <p className="mt-1">3. Итог и цена появятся справа после заполнения.</p>
        </div>
        <p>
          <span className="block font-semibold text-[var(--text)]">Формула строки</span>
          Цена упаковки <DivisionSign /> размер упаковки × расход на порцию = себестоимость ингредиента.
          Итог — сумма всех заполненных строк без ошибок.
        </p>
      </div>
      <div className="grid gap-3">
        <p>
          <span className="block font-semibold text-[var(--text)]">Цена продажи</span>
          В автоматическом режиме: себестоимость <DivisionSign /> целевая доля.
          В ручном — укажите свою цену, калькулятор покажет фактическую долю и маржу.
        </p>
        <p>
          <span className="block font-semibold text-[var(--text)]">Подсказка</span>
          Целевая доля себестоимости для кофеен обычно 25–35%. Чем ниже доля, тем выше маржа.
        </p>
      </div>
    </div>
  );
}

function DivisionSign() {
  return (
    <span className="mx-1 inline-flex h-[1em] w-[0.72em] items-center justify-center">
      <span className="sr-only">÷</span>
      <span className="inline-flex h-[1em] w-[0.72em] flex-col items-center justify-center gap-[0.12em]" aria-hidden="true">
        <span className="size-[3px] rounded-full bg-current" />
        <span className="h-px w-full bg-current" />
        <span className="size-[3px] rounded-full bg-current" />
      </span>
    </span>
  );
}

export function CostCalculatorClient() {
  const calculator = useCostCalculatorState();

  return (
    <CalculatorShell
      resultRail={
        <CalculatorResultRail
          copyState={calculator.copyState}
          foodCost={calculator.summary.foodCost}
          onCopyResult={calculator.copyResult}
          resultMessage={calculator.resultMessage}
          rowErrors={calculator.summary.rowErrors}
          salePriceTone={calculator.salePriceTone}
          summary={calculator.summary}
        />
      }
    >
      <div className="calculator-panel cost-sheet min-w-0">
        <CalculatorHeader
          canShowRecommendedPrice={calculator.summary.canShowRecommendedPrice}
          foodCostError={calculator.foodCostError}
          foodCostPercent={calculator.foodCostPercent}
          isManualMode={calculator.isManualMode}
          itemName={calculator.itemName}
          onFoodCostChange={calculator.setFoodCostPercent}
          onItemNameChange={calculator.setItemName}
          onPricingModeChange={calculator.setPricingMode}
          onSalePriceChange={calculator.setSalePrice}
          pricingMode={calculator.pricingMode}
          recommendedPrice={calculator.recommendedPrice}
          salePrice={calculator.salePrice}
          salePriceError={calculator.salePriceError}
        />
        <CalculatorMobileResultStrip summary={calculator.summary} />
        <IngredientEditor
          hasAnyInput={calculator.hasAnyInput}
          onAddIngredient={calculator.addIngredient}
          onClear={calculator.clearCalculator}
          onDuplicate={calculator.duplicateIngredient}
          onFillDemo={calculator.fillDemo}
          onRemove={calculator.removeIngredient}
          onUpdate={calculator.updateIngredient}
          rowStatusText={calculator.rowStatusText}
          rows={calculator.rows}
        />
        <CalculatorFormulaHelp />
      </div>
    </CalculatorShell>
  );
}
