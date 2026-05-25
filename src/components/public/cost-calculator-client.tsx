'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Check, Copy, CopyPlus, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Select } from '@/components/ui/select';
import {
  calculateCostSummary,
  calculatorUnitOptions,
  type CalculatorIngredient as Ingredient,
  type CalculatorIngredientRow,
  type CalculatorPricingMode as PricingMode,
  type CalculatorSummary,
  type CalculatorUnit as Unit
} from '@/lib/calculator/cost-calculator';
import { cn } from '@/lib/utils';

const demoIngredients: Ingredient[] = [
  { id: 'ingredient-1', name: 'Зерно для эспрессо', packagePrice: '1450', packageAmount: '1', packageUnit: 'kg', recipeAmount: '18', recipeUnit: 'g' },
  { id: 'ingredient-2', name: 'Молоко', packagePrice: '120', packageAmount: '1', packageUnit: 'l', recipeAmount: '180', recipeUnit: 'ml' },
  { id: 'ingredient-3', name: 'Ванильный сироп', packagePrice: '650', packageAmount: '1', packageUnit: 'l', recipeAmount: '15', recipeUnit: 'ml' }
];

function createEmptyIngredient(id = `ingredient-${Date.now()}`): Ingredient {
  return {
    id,
    name: '',
    packagePrice: '',
    packageAmount: '',
    packageUnit: 'ml',
    recipeAmount: '',
    recipeUnit: 'ml'
  };
}

function money(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
    currency: 'RUB'
  }).format(safeValue);
}

function percent(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toLocaleString('ru-RU', { maximumFractionDigits: 1, minimumFractionDigits: 0 })} %`;
}

function decimal(value: number) {
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

function formulaMoney(value: number) {
  return money(value).replace(/\s?₽$/, ' ₽');
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

function UnitField({
  className,
  error,
  hint,
  id,
  label,
  onAmountChange,
  onUnitChange,
  placeholder,
  unit,
  value
}: {
  className?: string;
  error?: string | null;
  hint?: string;
  id: string;
  label: string;
  onAmountChange: (value: string) => void;
  onUnitChange: (value: Unit) => void;
  placeholder: string;
  unit: Unit;
  value: string;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]" htmlFor={id}>
        {label}
      </label>
      <div className="grid grid-cols-[minmax(0,1fr)_84px] gap-2">
        <Input
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className="h-11 text-sm tabular-nums lg:h-10"
          id={id}
          inputMode="decimal"
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        <Select
          aria-label={`${label}: единица`}
          className="h-11 px-3 pr-5 text-sm lg:h-10"
          onChange={(event) => onUnitChange(event.target.value as Unit)}
          value={unit}
        >
          {calculatorUnitOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      {hint ? (
        <p className="hidden text-xs leading-5 text-[var(--muted)] md:block" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs leading-5 text-[var(--danger)]" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type IngredientUpdate = (id: string, field: keyof Ingredient, value: string) => void;

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
      <CalculatorFoodCostSlider
        disabled={isManualMode}
        error={foodCostError}
        onChange={onFoodCostChange}
        value={foodCostPercent}
      />
    </div>
  );
}

function CalculatorFoodCostSlider({
  disabled,
  error,
  onChange,
  value
}: {
  disabled: boolean;
  error: string | null;
  onChange: (value: string) => void;
  value: string;
}) {
  const numericValue = Number(value.replace(',', '.'));
  const safeValue = Number.isFinite(numericValue) && numericValue > 0 ? Math.min(60, Math.max(5, numericValue)) : 30;

  return (
    <div className="calculator-slider" data-disabled={disabled || undefined} data-state={error ? 'error' : undefined}>
      <div className="flex items-center justify-between gap-4">
        <span>Целевая доля</span>
        <span className="tabular-nums">{percent(safeValue)}</span>
      </div>
      <input
        aria-label="Целевая доля себестоимости"
        disabled={disabled}
        max={60}
        min={5}
        onChange={(event) => onChange(event.target.value)}
        step={1}
        type="range"
        value={safeValue}
      />
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

function IngredientTable({
  hasAnyInput,
  onAddIngredient,
  onClear,
  onDuplicate,
  onFillDemo,
  onRemove,
  onUpdate,
  rowStatusText,
  rows
}: {
  hasAnyInput: boolean;
  onAddIngredient: () => void;
  onClear: () => void;
  onDuplicate: (id: string) => void;
  onFillDemo: () => void;
  onRemove: (id: string) => void;
  onUpdate: IngredientUpdate;
  rowStatusText: string;
  rows: CalculatorIngredientRow[];
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
        <div className="min-w-0">
          <h3 className="text-xl font-bold leading-tight text-[var(--text)]">Ингредиенты</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{rowStatusText}</p>
        </div>
        <CalculatorActions hasAnyInput={hasAnyInput} onClear={onClear} onFillDemo={onFillDemo} />
      </div>

      {!hasAnyInput ? <EmptyRecipeNotice /> : null}

      <div className="mx-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)] md:mx-6">
        <div className="hidden grid-cols-[minmax(130px,1fr)_72px_minmax(132px,0.85fr)_minmax(132px,0.85fr)_88px_96px] gap-2 bg-[var(--surface-muted)]/55 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.11em] text-[var(--muted)] md:px-5 lg:grid">
          <span>Ингредиент</span>
          <span>Цена, ₽</span>
          <span>Упаковка</span>
          <span>В рецепте</span>
          <span>Себестоимость</span>
          <span className="text-center">Действия</span>
        </div>

        <div className="grid gap-3 p-3 lg:block lg:divide-y lg:divide-[var(--line)] lg:p-0">
          {rows.map((ingredient, index) => (
            <div key={ingredient.id} className="lg:contents">
              <MobileIngredientCard
                ingredient={ingredient}
                index={index}
                onDuplicate={onDuplicate}
                onRemove={onRemove}
                onUpdate={onUpdate}
                rowCount={rows.length}
              />
              <IngredientRow
                ingredient={ingredient}
                index={index}
                onDuplicate={onDuplicate}
                onRemove={onRemove}
                onUpdate={onUpdate}
                rowCount={rows.length}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-6">
        <Button className="min-h-12 rounded-[var(--radius-md)] px-5" onClick={onAddIngredient} type="button" variant="secondary">
          <Plus size={17} strokeWidth={1.8} />
          Добавить ингредиент
        </Button>
        <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
          Пример строки: <span className="font-semibold text-[var(--text)]">Зерно · 1450 ₽ · 1 кг · 18 г · 26,10 ₽</span>
        </p>
      </div>
    </>
  );
}

function CalculatorActions({ hasAnyInput, onClear, onFillDemo }: { hasAnyInput: boolean; onClear: () => void; onFillDemo: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button className="min-h-11 rounded-[var(--radius-sm)] px-3 lg:min-h-10" onClick={onFillDemo} size="sm" type="button" variant="secondary">
        Заполнить примером
      </Button>
      <Button className="min-h-11 rounded-[var(--radius-sm)] px-3 lg:min-h-10" disabled={!hasAnyInput} onClick={onClear} size="sm" type="button" variant="ghost">
        <RotateCcw size={16} strokeWidth={1.8} />
        Очистить
      </Button>
    </div>
  );
}

function EmptyRecipeNotice() {
  return (
    <div className="mx-4 mb-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-wash)] p-4 md:mx-6">
      <p className="text-sm font-semibold text-[var(--text)]">Рецепт пока пуст</p>
      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
        Добавьте ингредиент вручную или заполните примером. После этого появится себестоимость и цена продажи.
      </p>
    </div>
  );
}

function MobileIngredientCard({
  ingredient,
  index,
  onDuplicate,
  onRemove,
  onUpdate,
  rowCount
}: {
  ingredient: CalculatorIngredientRow;
  index: number;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: IngredientUpdate;
  rowCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)] p-3 lg:hidden">
      <div className="col-span-2 flex items-start justify-between gap-3">
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2 text-[11px] font-semibold text-[var(--muted)]">
          {index + 1}
        </span>
        <span className="text-sm font-semibold tabular-nums text-[var(--text)]">
          {ingredient.error ? '—' : ingredient.cost === null ? 'Пока нет' : money(ingredient.cost)}
        </span>
      </div>
      <IngredientFields ingredient={ingredient} index={index} onUpdate={onUpdate} scope="mobile" />
      <IngredientActionButtons ingredientId={ingredient.id} onDuplicate={onDuplicate} onRemove={onRemove} rowCount={rowCount} />
      <IngredientRowMessage ingredient={ingredient} className="col-span-2" />
    </div>
  );
}

function IngredientRow({
  ingredient,
  index,
  onDuplicate,
  onRemove,
  onUpdate,
  rowCount
}: {
  ingredient: CalculatorIngredientRow;
  index: number;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: IngredientUpdate;
  rowCount: number;
}) {
  return (
    <div className="hidden gap-2 px-4 py-3 md:px-5 md:py-4 lg:grid lg:grid-cols-[minmax(130px,1fr)_72px_minmax(132px,0.85fr)_minmax(132px,0.85fr)_88px_96px] lg:items-start">
      <IngredientFields ingredient={ingredient} index={index} onUpdate={onUpdate} scope="desktop" />
      <div className="hidden min-h-10 items-center text-sm font-semibold tabular-nums text-[var(--text)] lg:flex">
        {ingredient.error ? '—' : ingredient.cost === null ? 'Пока нет' : money(ingredient.cost)}
      </div>
      <IngredientActionButtons ingredientId={ingredient.id} onDuplicate={onDuplicate} onRemove={onRemove} rowCount={rowCount} />
      <IngredientRowMessage ingredient={ingredient} className="lg:col-span-6" />
    </div>
  );
}

function IngredientFields({
  ingredient,
  index,
  onUpdate,
  scope
}: {
  ingredient: CalculatorIngredientRow;
  index: number;
  onUpdate: IngredientUpdate;
  scope: 'desktop' | 'mobile';
}) {
  const fieldId = (name: string) => `${ingredient.id}-${scope}-${name}`;

  return (
    <>
      <FormField className="col-span-2 lg:col-span-1 lg:[&>label]:sr-only" htmlFor={fieldId('name')} label="Ингредиент">
        <Input
          autoComplete="off"
          className="h-11 text-sm lg:h-10"
          id={fieldId('name')}
          onChange={(event) => onUpdate(ingredient.id, 'name', event.target.value)}
          placeholder={index === 0 ? 'Эспрессо, молоко, сироп...' : 'Ингредиент'}
          value={ingredient.name}
        />
      </FormField>

      <FormField className="col-span-2 sm:col-span-1 lg:[&>label]:sr-only lg:[&>p]:sr-only" htmlFor={fieldId('packagePrice')} hint="В рублях" label="Цена упаковки, ₽">
        <Input
          className="h-11 text-sm tabular-nums lg:h-10"
          id={fieldId('packagePrice')}
          inputMode="decimal"
          onChange={(event) => onUpdate(ingredient.id, 'packagePrice', event.target.value)}
          placeholder="1450"
          value={ingredient.packagePrice}
        />
      </FormField>

      <UnitField
        className="col-span-2 sm:col-span-1 lg:[&>label]:sr-only lg:[&>p]:sr-only"
        hint="Например: 1 кг, 1 л, 1000 г, 1 шт."
        id={fieldId('packageAmount')}
        label="Размер упаковки"
        onAmountChange={(value) => onUpdate(ingredient.id, 'packageAmount', value)}
        onUnitChange={(value) => onUpdate(ingredient.id, 'packageUnit', value)}
        placeholder="1"
        unit={ingredient.packageUnit}
        value={ingredient.packageAmount}
      />

      <UnitField
        className="col-span-2 sm:col-span-1 lg:[&>label]:sr-only lg:[&>p]:sr-only"
        hint="Сколько ингредиента используется в одной порции."
        id={fieldId('recipeAmount')}
        label="Кол-во в рецепте"
        onAmountChange={(value) => onUpdate(ingredient.id, 'recipeAmount', value)}
        onUnitChange={(value) => onUpdate(ingredient.id, 'recipeUnit', value)}
        placeholder="18"
        unit={ingredient.recipeUnit}
        value={ingredient.recipeAmount}
      />
    </>
  );
}

function IngredientActionButtons({
  ingredientId,
  onDuplicate,
  onRemove,
  rowCount
}: {
  ingredientId: string;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  rowCount: number;
}) {
  return (
    <div className="col-span-2 grid grid-cols-2 gap-2 lg:col-span-1 lg:flex lg:justify-center">
      <button
        aria-label="Дублировать ингредиент"
        className="inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 text-[var(--muted)] transition hover:border-[var(--accent)]/35 hover:text-[var(--accent)]"
        onClick={() => onDuplicate(ingredientId)}
        type="button"
      >
        <CopyPlus size={16} strokeWidth={1.8} />
        <span className="ml-2 lg:sr-only">Дублировать</span>
      </button>
      <button
        aria-label="Удалить ингредиент"
        className={cn(
          'inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 text-[var(--muted)] transition hover:border-[var(--accent)]/35 hover:text-[var(--accent)]',
          rowCount === 1 && 'pointer-events-none opacity-45'
        )}
        disabled={rowCount === 1}
        onClick={() => onRemove(ingredientId)}
        type="button"
      >
        <Trash2 size={16} strokeWidth={1.8} />
        <span className="ml-2 lg:sr-only">Удалить</span>
      </button>
    </div>
  );
}

function IngredientRowMessage({ className, ingredient }: { className?: string; ingredient: CalculatorIngredientRow }) {
  if (!ingredient.error && !ingredient.note) {
    return null;
  }

  return (
    <p className={cn('text-sm leading-6', ingredient.error ? 'text-[var(--danger)]' : 'text-[var(--muted)]', className)}>
      {ingredient.error ?? ingredient.note}
    </p>
  );
}

function CalculatorResultRail({
  copyState,
  foodCost,
  onCopyResult,
  resultMessage,
  rowErrors,
  salePriceTone,
  summary
}: {
  copyState: 'idle' | 'copied' | 'failed';
  foodCost: number;
  onCopyResult: () => void;
  resultMessage: string | null;
  rowErrors: CalculatorIngredientRow[];
  salePriceTone: string;
  summary: CalculatorSummary;
}) {
  const {
    activeSalePrice,
    actualFoodCostPercent,
    canShowRecommendedPrice,
    canShowSalePrice,
    foodCostError,
    grossMargin,
    grossProfit,
    isManualMode,
    markupPercent,
    recommendedPrice,
    totalCost
  } = summary;

  const resultTitle = isManualMode ? 'Цена продажи' : 'Рекомендованная цена';
  const resultState = rowErrors.length || foodCostError ? 'error' : canShowSalePrice ? 'calculated' : 'empty';
  const resultDescription = canShowSalePrice
    ? isManualMode
      ? `Расчёт от вашей цены продажи и себестоимости ${money(totalCost)}.`
      : `Расчёт: себестоимость ${money(totalCost)} и целевая доля ${percent(foodCost * 100)}.`
    : 'Добавьте ингредиенты и параметры. После этого появится себестоимость и цена в меню.';

  return (
    <aside className="order-last xl:order-none">
      <div
        aria-invalid={resultState === 'error' ? true : undefined}
        className="calculator-result-card cost-sheet xl:sticky xl:top-24"
        data-calculator-result-state={resultState}
      >
        <div className="calculator-result-badge">
          {resultState === 'error' ? 'Проверьте' : canShowSalePrice ? 'Итог' : 'Пока пусто'}
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-bold leading-tight text-[var(--text)]">{resultTitle}</h2>
          <p className="mt-2 text-[2.35rem] font-bold leading-none tabular-nums text-[var(--text)] md:text-[2.75rem]">
            {canShowSalePrice ? money(activeSalePrice) : '—'}
          </p>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{resultDescription}</p>
          {canShowSalePrice ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">{salePriceTone}</p>
          ) : null}
        </div>

        <CalculatorResultMessage foodCostError={foodCostError} resultMessage={resultMessage} rowErrors={rowErrors} />

        <dl className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <ResultMetricCard tone="accent" label="Себестоимость" value={rowErrors.length ? '—' : money(totalCost)} />
          <ResultMetricCard label="Доля себестоимости" value={canShowSalePrice ? percent(actualFoodCostPercent) : percent(foodCost * 100)} />
          {canShowSalePrice ? (
            <>
              <ResultMetricCard label="Маржа" value={percent(grossMargin)} />
              <ResultMetricCard label="Наценка" value={percent(markupPercent)} />
              <ResultMetricCard label="Валовая прибыль" value={money(grossProfit)} />
              {isManualMode && canShowRecommendedPrice ? <ResultMetricCard label="Рекомендованная цена по цели" value={money(recommendedPrice)} /> : null}
            </>
          ) : null}
        </dl>

        {canShowSalePrice ? (
          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
            <span className="font-semibold text-[var(--text)]">{isManualMode ? 'Источник цены' : 'Формула'}:</span>{' '}
            {isManualMode ? 'ручной режим' : (
              <>
                {formulaMoney(totalCost)} <DivisionSign /> {decimal(foodCost)}
              </>
            )}
          </div>
        ) : null}

        <div className="mt-4 grid gap-2">
          <Button className="min-h-12 w-full rounded-[var(--radius-md)]" disabled={!canShowSalePrice} onClick={onCopyResult} type="button">
            {copyState === 'copied' ? <Check size={17} strokeWidth={1.8} /> : <Copy size={17} strokeWidth={1.8} />}
            {copyState === 'copied' ? 'Результат скопирован' : 'Скопировать результат'}
          </Button>
          {copyState === 'failed' ? (
            <p className="text-sm leading-6 text-[var(--danger)]">Не удалось скопировать автоматически. Выделите итог вручную.</p>
          ) : null}
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
          Расчёт ориентировочный. Перед запуском в меню проверьте формулу.
        </p>
      </div>
    </aside>
  );
}

function ResultMetricCard({ label, tone, value }: { label: string; tone?: 'accent'; value: ReactNode }) {
  return (
    <div
      className={cn(
        'calculator-metric-card',
        tone === 'accent' ? 'calculator-metric-card-accent' : 'calculator-metric-card-neutral'
      )}
    >
      <dt className="text-[11px] font-semibold leading-4 text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-lg font-bold leading-6 tabular-nums text-[var(--text)]">{value}</dd>
    </div>
  );
}

function CalculatorResultMessage({
  foodCostError,
  resultMessage,
  rowErrors
}: {
  foodCostError: string | null;
  resultMessage: string | null;
  rowErrors: CalculatorIngredientRow[];
}) {
  if (!resultMessage) {
    return null;
  }

  return (
    <div className={cn('mt-4 rounded-[12px] border px-4 py-3 text-sm leading-6', rowErrors.length || foodCostError ? 'border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]' : 'border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--muted)]')}>
      {resultMessage}
    </div>
  );
}

export function CostCalculatorClient() {
  const [itemName, setItemName] = useState('Ванильный латте');
  const [foodCostPercent, setFoodCostPercent] = useState('30');
  const [pricingMode, setPricingMode] = useState<PricingMode>('auto');
  const [salePrice, setSalePrice] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>(demoIngredients);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const summary = useMemo(
    () => calculateCostSummary({ foodCostPercent, ingredients, pricingMode, salePrice }),
    [foodCostPercent, ingredients, pricingMode, salePrice]
  );
  const {
    activeSalePrice,
    actualFoodCostPercent,
    canShowRecommendedPrice,
    canShowSalePrice,
    completedRows,
    foodCost,
    foodCostError,
    grossMargin,
    grossProfit,
    hasManualSalePrice,
    hasPartialRows,
    isManualMode,
    markupPercent,
    recommendedPrice,
    rowErrors,
    rows,
    salePriceError,
    totalCost
  } = summary;
  const hasAnyInput = Boolean(
    itemName.trim() ||
      foodCostPercent.trim() ||
      salePrice.trim() ||
      rows.some((ingredient) =>
        [ingredient.name, ingredient.packagePrice, ingredient.packageAmount, ingredient.recipeAmount].some((value) => value.trim().length > 0)
      )
  );
  const resultMessage = rowErrors.length
    ? 'Исправьте ошибки в составе рецепта, чтобы получить итоговую цену.'
    : totalCost <= 0
      ? 'Введите ингредиенты, чтобы увидеть расчёт.'
      : salePriceError
        ? salePriceError
        : foodCostError && !isManualMode
          ? foodCostError
          : !isManualMode && foodCost <= 0
            ? 'Укажите целевую долю себестоимости для автоматической цены.'
          : null;
  const rowStatusText = rowErrors.length
    ? 'В составе есть ошибки, итоговая цена пока не считается.'
    : hasPartialRows
      ? 'В одной из строк не хватает числа, поэтому она пока не входит в итог.'
      : `${completedRows} ${completedRows === 1 ? 'строка участвует' : 'строк участвуют'} в расчёте.`;

  function updateIngredient(id: string, field: keyof Ingredient, value: string) {
    setIngredients((current) => current.map((ingredient) => (ingredient.id === id ? { ...ingredient, [field]: value } : ingredient)));
  }

  function addIngredient() {
    setIngredients((current) => [...current, createEmptyIngredient()]);
  }

  function duplicateIngredient(id: string) {
    setIngredients((current) => {
      const source = current.find((ingredient) => ingredient.id === id);

      if (!source) {
        return current;
      }

      return [...current, { ...source, id: `ingredient-${Date.now()}` }];
    });
  }

  function removeIngredient(id: string) {
    setIngredients((current) => (current.length === 1 ? current : current.filter((ingredient) => ingredient.id !== id)));
  }

  function clearCalculator() {
    setItemName('');
    setFoodCostPercent('');
    setPricingMode('auto');
    setSalePrice('');
    setIngredients([createEmptyIngredient('ingredient-empty')]);
    setCopyState('idle');
  }

  function fillDemo() {
    setItemName('Ванильный латте');
    setFoodCostPercent('30');
    setPricingMode('auto');
    setSalePrice('');
    setIngredients(demoIngredients);
    setCopyState('idle');
  }

  async function copyResult() {
    if (!canShowSalePrice) {
      return;
    }

    const resultText = [
      `Позиция: ${itemName.trim() || 'Позиция меню'}`,
      `Себестоимость: ${money(totalCost)}`,
      isManualMode ? `Цена продажи задана вручную: ${money(activeSalePrice)}` : `Цена продажи по целевой доле: ${money(activeSalePrice)}`,
      canShowRecommendedPrice ? `Рекомендованная цена по цели: ${money(recommendedPrice)}` : null,
      `Доля себестоимости: ${percent(actualFoodCostPercent)}`,
      foodCost > 0 ? `Целевая доля себестоимости: ${percent(foodCost * 100)}` : null,
      `Валовая прибыль: ${money(grossProfit)}`,
      `Маржа: ${percent(grossMargin)}`,
      `Наценка: ${percent(markupPercent)}`
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(resultText);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2200);
    }
  }

  const salePriceTone = hasManualSalePrice ? 'Задана вручную' : 'Рассчитана по целевой доле';

  return (
    <CalculatorShell
      resultRail={
        <CalculatorResultRail
          copyState={copyState}
          foodCost={foodCost}
          onCopyResult={copyResult}
          resultMessage={resultMessage}
          rowErrors={rowErrors}
          salePriceTone={salePriceTone}
          summary={summary}
        />
      }
    >
      <div className="calculator-panel cost-sheet min-w-0">
        <CalculatorHeader
          canShowRecommendedPrice={canShowRecommendedPrice}
          foodCostError={foodCostError}
          foodCostPercent={foodCostPercent}
          isManualMode={isManualMode}
          itemName={itemName}
          onFoodCostChange={setFoodCostPercent}
          onItemNameChange={setItemName}
          onPricingModeChange={setPricingMode}
          onSalePriceChange={setSalePrice}
          pricingMode={pricingMode}
          recommendedPrice={recommendedPrice}
          salePrice={salePrice}
          salePriceError={salePriceError}
        />
        <CalculatorFormulaHelp />
        <IngredientTable
          hasAnyInput={hasAnyInput}
          onAddIngredient={addIngredient}
          onClear={clearCalculator}
          onDuplicate={duplicateIngredient}
          onFillDemo={fillDemo}
          onRemove={removeIngredient}
          onUpdate={updateIngredient}
          rowStatusText={rowStatusText}
          rows={rows}
        />
      </div>
    </CalculatorShell>
  );
}
