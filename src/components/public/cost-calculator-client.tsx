'use client';

import { useMemo, useState } from 'react';
import { Calculator, Info, Plus, Trash2 } from 'lucide-react';
import { IconBadge } from '@/components/public/public-ui-adaptation';
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
  { id: 'ingredient-1', name: 'Джин', packagePrice: '1890', packageAmount: '700', packageUnit: 'ml', recipeAmount: '30', recipeUnit: 'ml' },
  { id: 'ingredient-2', name: 'Красный вермут', packagePrice: '2250', packageAmount: '1000', packageUnit: 'ml', recipeAmount: '30', recipeUnit: 'ml' },
  { id: 'ingredient-3', name: 'Кампари', packagePrice: '1650', packageAmount: '1000', packageUnit: 'ml', recipeAmount: '30', recipeUnit: 'ml' }
];

function numberValue(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number.parseFloat(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function money(value: number) {
  const safeValue = Number.isFinite(value) && value >= 0 ? value : 0;

  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
    currency: 'RUB'
  }).format(safeValue);
}

function percent(value: number) {
  const safeValue = Number.isFinite(value) && value > 0 ? value : 0;
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
    <div className={cn('space-y-2.5', className)}>
      <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]" htmlFor={id}>
        {label}
      </label>
      <div className="grid grid-cols-[1fr_72px] gap-2">
        <Input
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className="h-12"
          id={id}
          inputMode="decimal"
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        <Select
          aria-label={`${label}: единица`}
          className="h-12 px-3 pr-6"
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
        <p className="text-sm leading-6 text-[var(--muted)]" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm leading-6 text-[var(--danger)]" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CostCalculatorClient() {
  const [itemName, setItemName] = useState('Классический Негрони');
  const [foodCostPercent, setFoodCostPercent] = useState('22');
  const [ingredients, setIngredients] = useState<Ingredient[]>(demoIngredients);

  const rows = useMemo(
    () => ingredients.map((ingredient) => ingredientCost(ingredient)),
    [ingredients]
  );
  const rowErrors = rows.filter((ingredient) => ingredient.error);
  const totalCost = rows.reduce((sum, ingredient) => sum + (ingredient.cost ?? 0), 0);
  const foodCostInput = numberValue(foodCostPercent);
  const foodCostError = foodCostPercent.trim() && (foodCostInput === null || foodCostInput <= 0) ? 'Целевая доля себестоимости должна быть больше нуля.' : null;
  const foodCost = foodCostInput && foodCostInput > 0 ? foodCostInput / 100 : 0;
  const canShowRecommendedPrice = rowErrors.length === 0 && totalCost > 0 && foodCost > 0;
  const recommendedPrice = canShowRecommendedPrice ? totalCost / foodCost : 0;
  const grossProfit = recommendedPrice > totalCost ? recommendedPrice - totalCost : 0;
  const grossMargin = recommendedPrice > 0 ? (grossProfit / recommendedPrice) * 100 : 0;
  const markup = totalCost > 0 ? recommendedPrice / totalCost : 0;
  const completedRows = rows.filter((ingredient) => ingredient.isComplete).length;
  const hasPartialRows = rows.some((ingredient) => {
    const filledFields = [ingredient.packagePrice, ingredient.packageAmount, ingredient.recipeAmount].filter((value) => value.trim()).length;
    return filledFields > 0 && !ingredient.isComplete && !ingredient.error;
  });
  const resultMessage = rowErrors.length
    ? 'Исправьте ошибки в составе рецепта, чтобы получить итоговую цену.'
    : totalCost <= 0
      ? 'Введите ингредиенты, чтобы увидеть расчёт.'
      : foodCostError
        ? foodCostError
        : foodCost <= 0
          ? 'Укажите целевую долю себестоимости, чтобы увидеть цену продажи.'
          : null;

  function updateIngredient(id: string, field: keyof Ingredient, value: string) {
    setIngredients((current) => current.map((ingredient) => (ingredient.id === id ? { ...ingredient, [field]: value } : ingredient)));
  }

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      {
        id: `ingredient-${Date.now()}`,
        name: '',
        packagePrice: '',
        packageAmount: '',
        packageUnit: 'ml',
        recipeAmount: '',
        recipeUnit: 'ml'
      }
    ]);
  }

  function removeIngredient(id: string) {
    setIngredients((current) => (current.length === 1 ? current : current.filter((ingredient) => ingredient.id !== id)));
  }

  function fillDemo() {
    setItemName('Классический Негрони');
    setFoodCostPercent('22');
    setIngredients(demoIngredients);
  }

  return (
    <section className="border-b border-[var(--line)] py-10 md:py-14">
      <div className="container grid gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.34fr)] 2xl:items-start">
        <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)]">
          <div className="border-b border-[var(--line)] p-5 md:p-6">
            <h2 className={`${displayFont.className} text-[1.9rem] font-semibold leading-none text-[var(--text)]`}>1. Информация о позиции</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <FormField htmlFor="calculatorItemName" label="Название позиции">
                <Input
                  autoComplete="off"
                  className="h-12"
                  id="calculatorItemName"
                  maxLength={120}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder="Например, классический Негрони"
                  value={itemName}
                />
              </FormField>
              <FormField htmlFor="calculatorFoodCost" hint="Рекомендуемый диапазон: 18-28%." label="Целевая доля себестоимости, %">
                <Input
                  aria-invalid={foodCostError ? true : undefined}
                  className="h-12"
                  id="calculatorFoodCost"
                  inputMode="decimal"
                  maxLength={8}
                  onChange={(event) => setFoodCostPercent(event.target.value)}
                  value={foodCostPercent}
                />
              </FormField>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <h2 className={`${displayFont.className} text-[1.9rem] font-semibold leading-none text-[var(--text)]`}>2. Состав рецепта</h2>
            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 text-sm leading-6 text-[var(--muted)]">
              <p className="font-semibold text-[var(--text)]">Как считается себестоимость</p>
              <p className="mt-1">
                Себестоимость ингредиента = цена упаковки <DivisionSign /> размер упаковки × количество в рецепте.
              </p>
              <p>Итоговая себестоимость = сумма себестоимости ингредиентов.</p>
              <p>
                Рекомендованная цена продажи = итоговая себестоимость <DivisionSign /> доля себестоимости.
              </p>
              <p className="mt-1">
                Пример: бутылка джина 700 мл стоит 1890 ₽, в рецепте 30 мл. Себестоимость: 1890 <DivisionSign /> 700 × 30 = 81 ₽.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4">
              <p className="text-sm leading-6 text-[var(--muted)]">
                Пример строки: <span className="font-semibold text-[var(--text)]">Джин · 1890 ₽ · 700 мл · 30 мл · 81 ₽</span>
              </p>
              <Button className="rounded-[var(--radius-md)] px-4" onClick={fillDemo} type="button" variant="secondary">
                Заполнить примером
              </Button>
            </div>

            <div className="mt-6 hidden grid-cols-[minmax(220px,1.4fr)_minmax(140px,0.8fr)_minmax(190px,0.9fr)_minmax(190px,0.9fr)_minmax(140px,0.7fr)_44px] gap-3 border-b border-[var(--line)] pb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] lg:grid">
              <div>
                <span>Ингредиент</span>
              </div>
              <div>
                <span>Цена упаковки, ₽</span>
                <p className="mt-1 text-[12px] font-medium normal-case leading-5 tracking-normal">Сколько стоит вся бутылка / пачка / упаковка</p>
              </div>
              <div>
                <span>Размер упаковки</span>
                <p className="mt-1 text-[12px] font-medium normal-case leading-5 tracking-normal">Например: 700 мл, 1 л, 1000 г, 1 шт</p>
              </div>
              <div>
                <span>Кол-во в рецепте</span>
                <p className="mt-1 text-[12px] font-medium normal-case leading-5 tracking-normal">Сколько ингредиента используется в одной порции</p>
              </div>
              <div>
                <span>Себестоимость</span>
              </div>
              <span className="sr-only">Удалить</span>
            </div>

            <div className="grid gap-4 lg:gap-0">
              {rows.map((ingredient, index) => (
                <div
                  className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 lg:grid-cols-[minmax(220px,1.4fr)_minmax(140px,0.8fr)_minmax(190px,0.9fr)_minmax(190px,0.9fr)_minmax(140px,0.7fr)_44px] lg:items-start lg:border-0 lg:border-b lg:border-[var(--line)] lg:bg-transparent lg:p-0 lg:py-4"
                  key={ingredient.id}
                >
                  <FormField className="lg:[&>label]:sr-only" htmlFor={`${ingredient.id}-name`} label="Ингредиент">
                    <Input
                      autoComplete="off"
                      className="h-12"
                      id={`${ingredient.id}-name`}
                      onChange={(event) => updateIngredient(ingredient.id, 'name', event.target.value)}
                      placeholder={index === 0 ? 'Джин, сироп, сок...' : 'Ингредиент'}
                      value={ingredient.name}
                    />
                  </FormField>
                  <FormField className="lg:[&>label]:sr-only lg:[&>p]:sr-only" htmlFor={`${ingredient.id}-packagePrice`} hint="В рублях" label="Цена упаковки, ₽">
                    <Input
                      className="h-12"
                      id={`${ingredient.id}-packagePrice`}
                      inputMode="decimal"
                      onChange={(event) => updateIngredient(ingredient.id, 'packagePrice', event.target.value)}
                      placeholder="1890"
                      value={ingredient.packagePrice}
                    />
                  </FormField>
                  <UnitField
                    className="lg:[&>label]:sr-only lg:[&>p]:sr-only"
                    hint="Например: 700 мл, 1 л, 1000 г, 1 шт."
                    id={`${ingredient.id}-packageAmount`}
                    label="Размер упаковки"
                    onAmountChange={(value) => updateIngredient(ingredient.id, 'packageAmount', value)}
                    onUnitChange={(value) => updateIngredient(ingredient.id, 'packageUnit', value)}
                    placeholder="700"
                    unit={ingredient.packageUnit}
                    value={ingredient.packageAmount}
                  />
                  <UnitField
                    className="lg:[&>label]:sr-only lg:[&>p]:sr-only"
                    hint="Сколько ингредиента используется в одной порции."
                    id={`${ingredient.id}-recipeAmount`}
                    label="Кол-во в рецепте"
                    onAmountChange={(value) => updateIngredient(ingredient.id, 'recipeAmount', value)}
                    onUnitChange={(value) => updateIngredient(ingredient.id, 'recipeUnit', value)}
                    placeholder="30"
                    unit={ingredient.recipeUnit}
                    value={ingredient.recipeAmount}
                  />
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] lg:sr-only">Себестоимость</p>
                    <p className="flex h-12 items-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 text-sm font-semibold leading-6 text-[var(--text)]">
                      {ingredient.error ? '—' : ingredient.cost === null ? 'Пока нет' : money(ingredient.cost)}
                    </p>
                  </div>
                  <button
                    aria-label="Удалить ингредиент"
                    className={cn(
                      'inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] px-4 text-[var(--muted)] transition hover:border-[var(--accent)]/30 hover:text-[var(--accent)] lg:px-0',
                      rows.length === 1 && 'pointer-events-none opacity-45'
                    )}
                    disabled={rows.length === 1}
                    onClick={() => removeIngredient(ingredient.id)}
                    type="button"
                  >
                    <Trash2 size={17} strokeWidth={1.8} />
                    <span className="ml-2 lg:sr-only">Удалить</span>
                  </button>
                  {ingredient.error || ingredient.note ? (
                    <p className={cn('text-sm leading-6 lg:col-span-5', ingredient.error ? 'text-[var(--danger)]' : 'text-[var(--muted)]')}>
                      {ingredient.error ?? ingredient.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Button className="rounded-[var(--radius-md)] px-5" onClick={addIngredient} type="button" variant="secondary">
                <Plus size={17} strokeWidth={1.8} />
                Добавить ингредиент
              </Button>
              <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
                {rowErrors.length
                  ? 'В составе есть ошибки, итоговая цена пока не считается.'
                  : hasPartialRows
                  ? 'В одной из строк не хватает числа, поэтому она пока не входит в итог.'
                  : `${completedRows} ${completedRows === 1 ? 'строка участвует' : 'строк участвуют'} в расчёте.`}
              </p>
            </div>
          </div>
        </div>

        <aside className="2xl:sticky 2xl:top-28">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5 shadow-[0_18px_50px_rgba(20,20,18,0.05)] md:p-6">
            <div className="flex items-center gap-3">
              <IconBadge icon={Calculator} size="md" tone="accent" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Результаты расчёта</p>
                <h2 className={`${displayFont.className} mt-1 text-[1.8rem] font-semibold leading-none text-[var(--text)]`}>{itemName.trim() || 'Позиция меню'}</h2>
              </div>
            </div>

            <dl className="mt-6 grid gap-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5">
                <dt className="text-sm leading-6 text-[var(--muted)]">Себестоимость позиции</dt>
                <dd className="mt-2 text-[2rem] font-semibold leading-none text-[var(--text)]">{rowErrors.length ? '—' : money(totalCost)}</dd>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5">
                <dt className="text-sm leading-6 text-[var(--muted)]">Целевая доля себестоимости</dt>
                <dd className="mt-2 text-[2rem] font-semibold leading-none text-[var(--text)]">{percent(foodCost * 100)}</dd>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--accent)]/35 bg-[var(--accent-soft)] p-5">
                <dt className="text-sm leading-6 text-[var(--muted)]">Рекомендованная цена продажи</dt>
                <dd className="mt-2 text-[2.2rem] font-semibold leading-none text-[var(--text)]">{canShowRecommendedPrice ? money(recommendedPrice) : '—'}</dd>
              </div>
              {resultMessage ? (
                <div className={cn('rounded-[var(--radius-md)] border p-4 text-sm leading-6', rowErrors.length || foodCostError ? 'border-[var(--danger)]/30 bg-[var(--danger-bg)] text-[var(--danger-text)]' : 'border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--muted)]')}>
                  {resultMessage}
                </div>
              ) : null}
              {canShowRecommendedPrice ? (
                <div className="grid gap-3 border-t border-[var(--line)] pt-4">
                  <div className="flex items-center justify-between gap-4 text-sm leading-6">
                    <dt className="text-[var(--muted)]">Формула</dt>
                    <dd className="font-semibold text-[var(--text)]">
                      {formulaMoney(totalCost)} <DivisionSign /> {decimal(foodCost)} = {formulaMoney(recommendedPrice)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm leading-6">
                    <dt className="text-[var(--muted)]">Валовая прибыль</dt>
                    <dd className="font-semibold text-[var(--text)]">{money(grossProfit)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm leading-6">
                    <dt className="text-[var(--muted)]">Валовая маржа</dt>
                    <dd className="font-semibold text-[var(--text)]">{percent(grossMargin)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm leading-6">
                    <dt className="text-[var(--muted)]">Наценка к себестоимости</dt>
                    <dd className="font-semibold text-[var(--text)]">{multiplier(markup)}</dd>
                  </div>
                </div>
              ) : null}
            </dl>

            <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-1 text-[var(--accent)]" size={18} strokeWidth={1.8} />
                <div className="min-w-0 text-sm leading-7 text-[var(--muted)]">
                  <p className="font-semibold text-[var(--text)]">Как рассчитывается цена</p>
                  <p className="mt-1">
                    Цена продажи = итоговая себестоимость <DivisionSign /> доля себестоимости.
                  </p>
                  <p className="mt-1">
                    Пример: 173,70 ₽ <DivisionSign /> 0,22 = 789,55 ₽.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
