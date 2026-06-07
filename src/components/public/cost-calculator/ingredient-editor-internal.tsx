'use client';

import { CopyPlus, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  calculatorUnitOptions,
  type CalculatorIngredientRow,
  type CalculatorUnit as Unit
} from '@/lib/calculator/cost-calculator';
import { cn } from '@/lib/utils';
import { money } from './format';
import type { IngredientUpdate } from './use-cost-calculator-state';

export const ingredientDesktopGridClassName =
  'lg:grid-cols-[minmax(178px,1.35fr)_78px_minmax(132px,0.86fr)_minmax(132px,0.86fr)_104px_88px]';

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
      <div className="grid grid-cols-[minmax(0,1fr)_84px] gap-2 lg:grid-cols-[minmax(60px,1fr)_64px]">
        <Input
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className="h-11 text-right text-sm tabular-nums lg:h-10"
          id={id}
          inputMode="decimal"
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        <Select
          aria-label={`${label}: единица`}
          className="h-11 px-3 pr-5 text-right text-sm tabular-nums lg:h-10 lg:px-2 lg:pr-5"
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
    <div className="calculator-mobile-ingredient-card grid grid-cols-2 gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-transparent p-3 lg:hidden">
      <div className="col-span-2 flex items-start justify-between gap-3">
        <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
          № {index + 1}
        </span>
        <span className="text-[17px] font-bold leading-none tabular-nums text-[var(--text)]">
          {ingredient.error ? '—' : ingredient.cost === null ? 'Пока нет' : money(ingredient.cost)}
        </span>
      </div>
      <IngredientFields ingredient={ingredient} index={index} onUpdate={onUpdate} scope="mobile" />
      <IngredientActionButtons ingredient={ingredient} index={index} onDuplicate={onDuplicate} onRemove={onRemove} rowCount={rowCount} />
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
    <div className={cn('hidden gap-2 px-4 py-3 md:px-5 md:py-4 lg:grid lg:items-start', ingredientDesktopGridClassName)}>
      <IngredientFields ingredient={ingredient} index={index} onUpdate={onUpdate} scope="desktop" />
      <div className="hidden min-h-10 items-center justify-start truncate text-left text-sm font-semibold tabular-nums text-[var(--text)] lg:flex">
        {ingredient.error ? '—' : ingredient.cost === null ? 'Пока нет' : money(ingredient.cost)}
      </div>
      <IngredientActionButtons ingredient={ingredient} index={index} onDuplicate={onDuplicate} onRemove={onRemove} rowCount={rowCount} />
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
          className="calculator-ingredient-name-input h-11 truncate text-sm lg:h-10"
          id={fieldId('name')}
          onChange={(event) => onUpdate(ingredient.id, 'name', event.target.value)}
          placeholder={index === 0 ? 'Зерно Ethiopia Yirgacheffe' : 'Ингредиент'}
          value={ingredient.name}
        />
      </FormField>

      <FormField className="col-span-2 sm:col-span-1 lg:[&>label]:sr-only lg:[&>p]:sr-only" htmlFor={fieldId('packagePrice')} hint="В рублях" label="Цена упаковки, ₽">
        <Input
          className="h-11 text-right text-sm tabular-nums lg:h-10"
          id={fieldId('packagePrice')}
          inputMode="decimal"
          onChange={(event) => onUpdate(ingredient.id, 'packagePrice', event.target.value)}
          placeholder="2400"
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
  ingredient,
  index,
  onDuplicate,
  onRemove,
  rowCount
}: {
  ingredient: CalculatorIngredientRow;
  index: number;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  rowCount: number;
}) {
  const duplicateLabel = `Дублировать ингредиент: ${ingredient.name || `строка ${index + 1}`}`;
  const removeLabel = `Удалить ингредиент: ${ingredient.name || `строка ${index + 1}`}`;

  return (
    <div className="col-span-2 grid grid-cols-2 gap-2 lg:col-span-1 lg:flex lg:justify-center">
      <button
        aria-label={duplicateLabel}
        className="inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 text-[var(--muted)] transition hover:border-[var(--accent)]/35 hover:text-[var(--accent)] lg:h-10 lg:min-w-10 lg:px-2"
        onClick={() => onDuplicate(ingredient.id)}
        title={duplicateLabel}
        type="button"
      >
        <CopyPlus size={16} strokeWidth={1.8} />
        <span className="ml-2 lg:sr-only">Дублировать</span>
      </button>
      <button
        aria-label={removeLabel}
        className={cn(
          'inline-flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 text-[var(--muted)] transition hover:border-[var(--accent)]/35 hover:text-[var(--accent)] lg:h-10 lg:min-w-10 lg:px-2',
          rowCount === 1 && 'pointer-events-none opacity-45'
        )}
        disabled={rowCount === 1}
        onClick={() => onRemove(ingredient.id)}
        title={removeLabel}
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

export {
  UnitField,
  CalculatorActions,
  EmptyRecipeNotice,
  MobileIngredientCard,
  IngredientRow,
  IngredientFields,
  IngredientActionButtons,
  IngredientRowMessage,
};
