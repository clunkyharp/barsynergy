'use client';

import { type ReactNode } from 'react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { IngredientEditor } from '@/components/public/cost-calculator/ingredient-editor';
import { CalculatorResultRail } from '@/components/public/cost-calculator/result-rail';
import { decimal } from '@/components/public/cost-calculator/format';
import { useCostCalculatorState } from '@/components/public/cost-calculator/use-cost-calculator-state';
import { type CalculatorPricingMode as PricingMode } from '@/lib/calculator/cost-calculator';

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
    <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-12">
      <div className="container grid gap-5 xl:grid-cols-[minmax(0,1fr)_25rem] xl:items-start">
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
    <div className="calculator-panel-header grid gap-[18px]">
      <div className="min-w-0">
        <h2 className="text-xl font-bold leading-tight text-[var(--text)]">Параметры расчёта</h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[var(--muted)]">
          Выберите режим цены, добавьте позицию, долю себестоимости и ингредиенты.
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
      <SegmentedControl
        className="calculator-mode-control"
        items={[
          {
            value: 'auto',
            eyebrow: 'Автоматически',
            label: 'Рассчитать цену',
            description: 'От целевой доли себестоимости.'
          },
          {
            value: 'manual',
            eyebrow: 'Ручной ввод',
            label: 'Проверить свою цену',
            description: 'Введите цену продажи и посмотрите маржу.'
          }
        ]}
        onChange={onPricingModeChange}
        value={pricingMode}
        variant="compact"
      />
      <div className="calculator-control-grid grid gap-3 md:grid-cols-3">
        <FormField className="calculator-field-card" htmlFor="calculatorItemName" label="Позиция">
          <Input
            autoComplete="off"
            className="h-11 text-sm font-semibold"
            id="calculatorItemName"
            maxLength={120}
            onChange={(event) => onItemNameChange(event.target.value)}
            placeholder="Например, ванильный латте"
            value={itemName}
          />
        </FormField>
        <FormField
          className="calculator-field-card"
          error={foodCostError ?? undefined}
          htmlFor="calculatorFoodCost"
          hint="Обычно используют 25-35%. Можно ввести своё значение."
          label="Доля себестоимости"
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
          className="calculator-field-card"
          error={salePriceError ?? undefined}
          htmlFor="calculatorSalePrice"
          hint={isManualMode ? 'От этой цены считаются прибыль, маржа и наценка.' : 'Поле работает только в ручном режиме.'}
          label="Ручная цена продажи, ₽"
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
    </div>
  );
}

function CalculatorFormulaHelp() {
  return (
    <>
      <details className="border-b border-[var(--line)] text-xs leading-5 text-[var(--muted)] md:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)] [&::-webkit-details-marker]:hidden">
          Формула расчёта
          <span aria-hidden="true">+</span>
        </summary>
        <FormulaHelpGrid className="border-t border-[var(--line)] px-4 py-3" />
      </details>

      <FormulaHelpGrid className="hidden gap-3 border-b border-[var(--line)] px-4 py-3 text-xs leading-5 text-[var(--muted)] md:grid md:grid-cols-3 md:px-5" />
    </>
  );
}

function FormulaHelpGrid({ className }: { className: string }) {
  return (
    <div className={className}>
      <p>
        <span className="block font-semibold text-[var(--text)]">Строка</span>
        Цена упаковки <DivisionSign /> размер упаковки × расход.
      </p>
      <p>
        <span className="block font-semibold text-[var(--text)]">Итог</span>
        Сумма всех заполненных строк без ошибок.
      </p>
      <p>
        <span className="block font-semibold text-[var(--text)]">Цена продажи</span>
        Выберите автоматический расчёт или ручную цену.
      </p>
    </div>
  );
}

function DivisionSign() {
  return (
    <span className="mx-1 inline-flex h-[1em] w-[0.72em] translate-y-[0.12em] items-center justify-center">
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
        <CalculatorFormulaHelp />
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
      </div>
    </CalculatorShell>
  );
}
