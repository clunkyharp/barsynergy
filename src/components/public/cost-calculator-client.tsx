'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, CopyPlus, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type Unit = 'ml' | 'l' | 'g' | 'kg' | 'pcs';
type UnitKind = 'volume' | 'weight' | 'piece';

type Ingredient = {
  id: string;
  name: string;
  packagePrice: string;
  packageAmount: string;
  packageUnit: Unit;
  recipeAmount: string;
  recipeUnit: Unit;
};

type IngredientRow = Ingredient & {
  cost: number | null;
  error: string | null;
  note: string | null;
  isComplete: boolean;
};

const unitOptions: { value: Unit; label: string; kind: UnitKind; factor: number }[] = [
  { value: 'ml', label: 'мл', kind: 'volume', factor: 1 },
  { value: 'l', label: 'л', kind: 'volume', factor: 1000 },
  { value: 'g', label: 'г', kind: 'weight', factor: 1 },
  { value: 'kg', label: 'кг', kind: 'weight', factor: 1000 },
  { value: 'pcs', label: 'шт', kind: 'piece', factor: 1 }
];

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

function numberValue(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number.parseFloat(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : null;
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

function multiplier(value: number) {
  const safeValue = Number.isFinite(value) && value > 0 ? value : 0;
  return `${safeValue.toLocaleString('ru-RU', { maximumFractionDigits: 2, minimumFractionDigits: 0 })}×`;
}

function decimal(value: number) {
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

function formulaMoney(value: number) {
  return money(value).replace(/\s?₽$/, ' ₽');
}

function unitKind(unit: Unit) {
  return unitOptions.find((option) => option.value === unit)?.kind ?? 'volume';
}

function normalizeAmount(value: number, unit: Unit) {
  const option = unitOptions.find((item) => item.value === unit);
  return value * (option?.factor ?? 1);
}

function unitsCompatible(packageUnit: Unit, recipeUnit: Unit) {
  return unitKind(packageUnit) === unitKind(recipeUnit);
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

function ingredientCost(ingredient: Ingredient): IngredientRow {
  const packagePrice = numberValue(ingredient.packagePrice);
  const packageAmount = numberValue(ingredient.packageAmount);
  const recipeAmount = numberValue(ingredient.recipeAmount);
  const unitsMatch = unitsCompatible(ingredient.packageUnit, ingredient.recipeUnit);

  if (!unitsMatch) {
    return {
      ...ingredient,
      cost: null,
      error: 'Единицы упаковки и рецепта должны быть одного типа: объём, вес или штуки.',
      note: null,
      isComplete: false
    };
  }

  if (packagePrice !== null && packagePrice <= 0) {
    return {
      ...ingredient,
      cost: null,
      error: 'Цена упаковки должна быть больше нуля.',
      note: null,
      isComplete: false
    };
  }

  if (packageAmount !== null && packageAmount <= 0) {
    return {
      ...ingredient,
      cost: null,
      error: 'Размер упаковки должен быть больше нуля.',
      note: null,
      isComplete: false
    };
  }

  if (recipeAmount !== null && recipeAmount < 0) {
    return {
      ...ingredient,
      cost: null,
      error: 'Кол-во в рецепте не может быть меньше нуля.',
      note: null,
      isComplete: false
    };
  }

  if (packagePrice === null || packageAmount === null || recipeAmount === null) {
    return {
      ...ingredient,
      cost: null,
      error: null,
      note: null,
      isComplete: false
    };
  }

  const normalizedPackageAmount = normalizeAmount(packageAmount, ingredient.packageUnit);
  const normalizedRecipeAmount = normalizeAmount(recipeAmount, ingredient.recipeUnit);

  return {
    ...ingredient,
    cost: (packagePrice / normalizedPackageAmount) * normalizedRecipeAmount,
    error: null,
    note: recipeAmount === 0 ? 'В рецепте указано 0, строка даст 0 ₽.' : null,
    isComplete: true
  };
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
      <div className="grid grid-cols-[minmax(0,1fr)_64px] gap-2">
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
          {unitOptions.map((option) => (
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

export function CostCalculatorClient() {
  const [itemName, setItemName] = useState('Ванильный латте');
  const [foodCostPercent, setFoodCostPercent] = useState('30');
  const [salePrice, setSalePrice] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>(demoIngredients);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const rows = useMemo(
    () => ingredients.map((ingredient) => ingredientCost(ingredient)),
    [ingredients]
  );
  const rowErrors = rows.filter((ingredient) => ingredient.error);
  const totalCost = rows.reduce((sum, ingredient) => sum + (ingredient.cost ?? 0), 0);
  const foodCostInput = numberValue(foodCostPercent);
  const foodCostError = foodCostPercent.trim() && (foodCostInput === null || foodCostInput <= 0) ? 'Целевая доля себестоимости должна быть больше нуля.' : null;
  const foodCost = foodCostInput && foodCostInput > 0 ? foodCostInput / 100 : 0;
  const manualSalePriceInput = numberValue(salePrice);
  const salePriceError = salePrice.trim() && (manualSalePriceInput === null || manualSalePriceInput <= 0) ? 'Цена продажи должна быть больше нуля.' : null;
  const manualSalePrice = manualSalePriceInput && manualSalePriceInput > 0 ? manualSalePriceInput : 0;
  const hasManualSalePrice = manualSalePrice > 0 && !salePriceError;
  const canShowRecommendedPrice = rowErrors.length === 0 && totalCost > 0 && !foodCostError && foodCost > 0;
  const recommendedPrice = canShowRecommendedPrice ? totalCost / foodCost : 0;
  const activeSalePrice = hasManualSalePrice ? manualSalePrice : recommendedPrice;
  const canShowSalePrice = rowErrors.length === 0 && totalCost > 0 && !salePriceError && activeSalePrice > 0 && (hasManualSalePrice || canShowRecommendedPrice);
  const actualFoodCostPercent = canShowSalePrice ? (totalCost / activeSalePrice) * 100 : 0;
  const grossProfit = canShowSalePrice ? activeSalePrice - totalCost : 0;
  const grossMargin = canShowSalePrice && activeSalePrice > 0 ? (grossProfit / activeSalePrice) * 100 : 0;
  const markup = canShowSalePrice && totalCost > 0 ? activeSalePrice / totalCost : 0;
  const completedRows = rows.filter((ingredient) => ingredient.isComplete).length;
  const hasAnyInput = Boolean(
    itemName.trim() ||
      foodCostPercent.trim() ||
      salePrice.trim() ||
      rows.some((ingredient) =>
        [ingredient.name, ingredient.packagePrice, ingredient.packageAmount, ingredient.recipeAmount].some((value) => value.trim().length > 0)
      )
  );
  const hasPartialRows = rows.some((ingredient) => {
    const filledFields = [ingredient.packagePrice, ingredient.packageAmount, ingredient.recipeAmount].filter((value) => value.trim()).length;
    return filledFields > 0 && !ingredient.isComplete && !ingredient.error;
  });
  const resultMessage = rowErrors.length
    ? 'Исправьте ошибки в составе рецепта, чтобы получить итоговую цену.'
    : totalCost <= 0
      ? 'Введите ингредиенты, чтобы увидеть расчёт.'
      : salePriceError
        ? salePriceError
        : foodCostError && !hasManualSalePrice
          ? foodCostError
          : !hasManualSalePrice && foodCost <= 0
            ? 'Укажите цену продажи или целевую долю себестоимости.'
          : null;
  const rowStatusText = rowErrors.length
    ? 'В составе есть ошибки, итоговая цена пока не считается.'
    : hasPartialRows
      ? 'В одной из строк не хватает числа, поэтому она пока не входит в итог.'
      : `${completedRows} ${completedRows === 1 ? 'строка участвует' : 'строк участвуют'} в расчёте.`;
  const issueStatusText = rowErrors.length ? 'Есть ошибки' : hasPartialRows ? 'Есть черновые строки' : 'Ошибок нет';

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
    setSalePrice('');
    setIngredients([createEmptyIngredient('ingredient-empty')]);
    setCopyState('idle');
  }

  function fillDemo() {
    setItemName('Ванильный латте');
    setFoodCostPercent('30');
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
      hasManualSalePrice ? `Цена продажи задана вручную: ${money(activeSalePrice)}` : `Цена продажи по целевой доле: ${money(activeSalePrice)}`,
      `Доля себестоимости: ${percent(actualFoodCostPercent)}`,
      foodCost > 0 ? `Целевая доля себестоимости: ${percent(foodCost * 100)}` : null,
      `Валовая прибыль: ${money(grossProfit)}`,
      `Валовая маржа: ${percent(grossMargin)}`
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

  return (
    <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-12">
      <div className="container grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="cost-sheet min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface)]">
          <div className="grid gap-5 border-b border-[var(--line)] p-4 md:grid-cols-[minmax(0,1fr)_18rem] md:p-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Расчётный лист</p>
              <h2 className={`${displayFont.className} mt-2 text-[1.8rem] font-semibold leading-none text-[var(--text)] md:text-[2.15rem]`}>
                Себестоимость позиции
              </h2>
              <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-[var(--muted)] sm:block">
                Заполните строки как рабочую таблицу: упаковка, расход на порцию, себестоимость строки.
              </p>
            </div>
            <div className="grid gap-3">
              <FormField htmlFor="calculatorItemName" label="Позиция">
                <Input
                  autoComplete="off"
                  className="h-10 text-sm"
                  id="calculatorItemName"
                  maxLength={120}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder="Например, ванильный латте"
                  value={itemName}
                />
              </FormField>
              <FormField error={foodCostError ?? undefined} htmlFor="calculatorFoodCost" hint="Ориентир: 25-35%." label="Доля себестоимости, %">
                <Input
                  aria-invalid={foodCostError ? true : undefined}
                  className="h-10 text-sm tabular-nums"
                  id="calculatorFoodCost"
                  inputMode="decimal"
                  maxLength={8}
                  onChange={(event) => setFoodCostPercent(event.target.value)}
                  value={foodCostPercent}
                />
              </FormField>
              <FormField
                error={salePriceError ?? undefined}
                htmlFor="calculatorSalePrice"
                hint="Если заполнить, итог будет считаться от этой цены."
                label="Цена продажи, ₽"
              >
                <Input
                  aria-invalid={salePriceError ? true : undefined}
                  className="h-10 text-sm tabular-nums"
                  id="calculatorSalePrice"
                  inputMode="decimal"
                  maxLength={12}
                  onChange={(event) => setSalePrice(event.target.value)}
                  placeholder={canShowRecommendedPrice ? decimal(recommendedPrice) : '190'}
                  value={salePrice}
                />
              </FormField>
            </div>
          </div>

          <details className="border-b border-[var(--line)] text-xs leading-5 text-[var(--muted)] md:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)] [&::-webkit-details-marker]:hidden">
              Формула расчёта
              <span aria-hidden="true">+</span>
            </summary>
            <div className="grid gap-2 border-t border-[var(--line)] px-4 py-3">
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
                Задайте вручную или рассчитайте через целевую долю.
              </p>
            </div>
          </details>

          <div className="hidden gap-3 border-b border-[var(--line)] px-4 py-3 text-xs leading-5 text-[var(--muted)] md:grid md:grid-cols-3 md:px-5">
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
              Задайте вручную или рассчитайте через целевую долю.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-5">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text)]">Ингредиенты</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{rowStatusText}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="min-h-11 rounded-[var(--radius-sm)] px-3 lg:min-h-9" onClick={fillDemo} size="sm" type="button" variant="secondary">
                Заполнить примером
              </Button>
              <Button className="min-h-11 rounded-[var(--radius-sm)] px-3 lg:min-h-9" disabled={!hasAnyInput} onClick={clearCalculator} size="sm" type="button" variant="ghost">
                <RotateCcw size={16} strokeWidth={1.8} />
                Очистить
              </Button>
            </div>
          </div>

          {!hasAnyInput ? (
            <div className="mx-4 mb-4 border border-dashed border-[var(--border-default)] bg-[var(--surface-wash)] p-4 md:mx-5">
              <p className="text-sm font-semibold text-[var(--text)]">Рецепт пока пуст</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Добавьте ингредиент вручную или заполните примером, чтобы увидеть расчёт себестоимости и цены продажи.
              </p>
            </div>
          ) : null}

          <div className="border-y border-[var(--line)]">
            <div className="hidden grid-cols-[minmax(170px,1.25fr)_minmax(104px,0.55fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(112px,0.6fr)_76px] gap-3 bg-[var(--surface-muted)]/55 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] text-[var(--muted)] md:px-5 lg:grid">
              <span>Ингредиент</span>
              <span>Цена, ₽</span>
              <span>Упаковка</span>
              <span>В рецепте</span>
              <span>Себестоимость</span>
              <span className="text-right">Действия</span>
            </div>

            <div className="divide-y divide-[var(--line)]">
              {rows.map((ingredient, index) => (
                <div
                  className="grid grid-cols-2 gap-3 px-4 py-3 md:px-5 md:py-4 lg:grid-cols-[minmax(170px,1.25fr)_minmax(104px,0.55fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(112px,0.6fr)_76px] lg:items-start"
                  key={ingredient.id}
                >
                  <div className="col-span-2 flex items-start justify-between gap-3 lg:hidden">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center border border-[var(--border-default)] px-2 text-[11px] font-semibold text-[var(--muted)]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-[var(--text)]">
                      {ingredient.error ? '—' : ingredient.cost === null ? 'Пока нет' : money(ingredient.cost)}
                    </span>
                  </div>

                  <FormField className="col-span-2 lg:col-span-1 lg:[&>label]:sr-only" htmlFor={`${ingredient.id}-name`} label="Ингредиент">
                    <Input
                      autoComplete="off"
                      className="h-11 text-sm lg:h-10"
                      id={`${ingredient.id}-name`}
                      onChange={(event) => updateIngredient(ingredient.id, 'name', event.target.value)}
                      placeholder={index === 0 ? 'Эспрессо, молоко, сироп...' : 'Ингредиент'}
                      value={ingredient.name}
                    />
                  </FormField>

                  <FormField className="col-span-1 lg:[&>label]:sr-only lg:[&>p]:sr-only" htmlFor={`${ingredient.id}-packagePrice`} hint="В рублях" label="Цена упаковки, ₽">
                    <Input
                      className="h-11 text-sm tabular-nums lg:h-10"
                      id={`${ingredient.id}-packagePrice`}
                      inputMode="decimal"
                      onChange={(event) => updateIngredient(ingredient.id, 'packagePrice', event.target.value)}
                      placeholder="1450"
                      value={ingredient.packagePrice}
                    />
                  </FormField>

                  <UnitField
                    className="col-span-1 lg:[&>label]:sr-only lg:[&>p]:sr-only"
                    hint="Например: 1 кг, 1 л, 1000 г, 1 шт."
                    id={`${ingredient.id}-packageAmount`}
                    label="Размер упаковки"
                    onAmountChange={(value) => updateIngredient(ingredient.id, 'packageAmount', value)}
                    onUnitChange={(value) => updateIngredient(ingredient.id, 'packageUnit', value)}
                    placeholder="1"
                    unit={ingredient.packageUnit}
                    value={ingredient.packageAmount}
                  />

                  <UnitField
                    className="col-span-1 lg:[&>label]:sr-only lg:[&>p]:sr-only"
                    hint="Сколько ингредиента используется в одной порции."
                    id={`${ingredient.id}-recipeAmount`}
                    label="Кол-во в рецепте"
                    onAmountChange={(value) => updateIngredient(ingredient.id, 'recipeAmount', value)}
                    onUnitChange={(value) => updateIngredient(ingredient.id, 'recipeUnit', value)}
                    placeholder="18"
                    unit={ingredient.recipeUnit}
                    value={ingredient.recipeAmount}
                  />

                  <div className="hidden min-h-10 items-center text-sm font-semibold tabular-nums text-[var(--text)] lg:flex">
                    {ingredient.error ? '—' : ingredient.cost === null ? 'Пока нет' : money(ingredient.cost)}
                  </div>

                  <div className="col-span-2 grid grid-cols-2 gap-2 lg:col-span-1 lg:flex lg:justify-end">
                    <button
                      aria-label="Дублировать ингредиент"
                      className="inline-flex h-11 items-center justify-center border border-[var(--border-default)] px-3 text-[var(--muted)] transition hover:border-[var(--accent)]/35 hover:text-[var(--accent)] lg:h-10"
                      onClick={() => duplicateIngredient(ingredient.id)}
                      type="button"
                    >
                      <CopyPlus size={16} strokeWidth={1.8} />
                      <span className="ml-2 lg:sr-only">Дублировать</span>
                    </button>
                    <button
                      aria-label="Удалить ингредиент"
                      className={cn(
                        'inline-flex h-11 items-center justify-center border border-[var(--border-default)] px-3 text-[var(--muted)] transition hover:border-[var(--accent)]/35 hover:text-[var(--accent)] lg:h-10',
                        rows.length === 1 && 'pointer-events-none opacity-45'
                      )}
                      disabled={rows.length === 1}
                      onClick={() => removeIngredient(ingredient.id)}
                      type="button"
                    >
                      <Trash2 size={16} strokeWidth={1.8} />
                      <span className="ml-2 lg:sr-only">Удалить</span>
                    </button>
                  </div>

                  {ingredient.error || ingredient.note ? (
                    <p className={cn('text-sm leading-6 lg:col-span-6', ingredient.error ? 'text-[var(--danger)]' : 'text-[var(--muted)]')}>
                      {ingredient.error ?? ingredient.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <dl className="grid border-b border-[var(--line)] md:grid-cols-3">
            <div className="border-b border-[var(--line)] px-4 py-3 md:border-b-0 md:border-r md:px-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Итого по строкам</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--text)]">{rowErrors.length ? '—' : money(totalCost)}</dd>
            </div>
            <div className="border-b border-[var(--line)] px-4 py-3 md:border-b-0 md:border-r md:px-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Строки</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--text)]">{completedRows} / {rows.length}</dd>
            </div>
            <div className="px-4 py-3 md:px-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Статус</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--text)]">{issueStatusText}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-5">
            <Button className="min-h-11 rounded-[var(--radius-sm)] px-4" onClick={addIngredient} type="button" variant="secondary">
              <Plus size={17} strokeWidth={1.8} />
              Добавить ингредиент
            </Button>
            <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
              Пример строки: <span className="font-semibold text-[var(--text)]">Зерно · 1450 ₽ · 1 кг · 18 г · 26,10 ₽</span>
            </p>
          </div>
        </div>

        <aside className="order-first xl:order-none">
          <div className="cost-sheet overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface)]">
            <div className="border-b border-[var(--line)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Итог</p>
              <h2 className={`${displayFont.className} mt-2 text-[1.7rem] font-semibold leading-none text-[var(--text)]`}>{itemName.trim() || 'Позиция меню'}</h2>
            </div>

            <dl>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-[var(--line)] px-4 py-3">
                <dt className="text-sm leading-6 text-[var(--muted)]">Себестоимость</dt>
                <dd className="text-base font-semibold tabular-nums text-[var(--text)]">{rowErrors.length ? '—' : money(totalCost)}</dd>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-[var(--line)] px-4 py-3">
                <dt className="text-sm leading-6 text-[var(--muted)]">Доля себестоимости</dt>
                <dd className="text-base font-semibold tabular-nums text-[var(--text)]">{canShowSalePrice ? percent(actualFoodCostPercent) : percent(foodCost * 100)}</dd>
              </div>
              <div className="border-b border-[var(--line)] bg-[var(--accent-soft)] px-4 py-4">
                <dt className="text-sm leading-6 text-[var(--muted)]">Цена продажи</dt>
                <dd className="mt-1 text-[2rem] font-semibold leading-none tabular-nums text-[var(--text)]">{canShowSalePrice ? money(activeSalePrice) : '—'}</dd>
                {canShowSalePrice ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                    {hasManualSalePrice ? 'Задана вручную' : 'Рассчитана по целевой доле'}
                  </p>
                ) : null}
              </div>
              {resultMessage ? (
                <div className={cn('border-b border-[var(--line)] px-4 py-3 text-sm leading-6', rowErrors.length || foodCostError ? 'bg-[var(--danger-bg)] text-[var(--danger-text)]' : 'text-[var(--muted)]')}>
                  {resultMessage}
                </div>
              ) : null}
              {canShowSalePrice ? (
                <div className="grid gap-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-[var(--line)] px-4 py-3 text-sm leading-6">
                    <dt className="text-[var(--muted)]">{hasManualSalePrice ? 'Источник цены' : 'Формула'}</dt>
                    <dd className="text-right font-semibold tabular-nums text-[var(--text)]">
                      {hasManualSalePrice ? 'вручную' : (
                        <>
                          {formulaMoney(totalCost)} <DivisionSign /> {decimal(foodCost)}
                        </>
                      )}
                    </dd>
                  </div>
                  {hasManualSalePrice && canShowRecommendedPrice ? (
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-[var(--line)] px-4 py-3 text-sm leading-6">
                      <dt className="text-[var(--muted)]">Ориентир по целевой доле</dt>
                      <dd className="font-semibold tabular-nums text-[var(--text)]">{money(recommendedPrice)}</dd>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-[var(--line)] px-4 py-3 text-sm leading-6">
                    <dt className="text-[var(--muted)]">Валовая прибыль</dt>
                    <dd className="font-semibold tabular-nums text-[var(--text)]">{money(grossProfit)}</dd>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-[var(--line)] px-4 py-3 text-sm leading-6">
                    <dt className="text-[var(--muted)]">Валовая маржа</dt>
                    <dd className="font-semibold tabular-nums text-[var(--text)]">{percent(grossMargin)}</dd>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-[var(--line)] px-4 py-3 text-sm leading-6">
                    <dt className="text-[var(--muted)]">Наценка</dt>
                    <dd className="font-semibold tabular-nums text-[var(--text)]">{multiplier(markup)}</dd>
                  </div>
                </div>
              ) : null}
            </dl>

            <div className="grid gap-2 p-4">
              <Button
                className="w-full rounded-[var(--radius-sm)]"
                disabled={!canShowSalePrice}
                onClick={copyResult}
                type="button"
                variant="secondary"
              >
                {copyState === 'copied' ? <Check size={17} strokeWidth={1.8} /> : <Copy size={17} strokeWidth={1.8} />}
                {copyState === 'copied' ? 'Результат скопирован' : 'Скопировать результат'}
              </Button>
              {copyState === 'failed' ? (
                <p className="text-sm leading-6 text-[var(--danger)]">Не удалось скопировать автоматически. Выделите итог вручную.</p>
              ) : null}
            </div>

            <div className="border-t border-[var(--line)] px-4 py-3 text-xs leading-5 text-[var(--muted)]">
              Если цена не заполнена, пример расчёта: 57,45 ₽ <DivisionSign /> 0,30 = 191,50 ₽.
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
