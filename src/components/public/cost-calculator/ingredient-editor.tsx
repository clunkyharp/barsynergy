'use client';

import { CopyPlus, Plus, RotateCcw, Trash2 } from 'lucide-react';
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

export function IngredientEditor({
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

      <div className="mx-4 overflow-hidden rounded-[var(--radius-lg)] border border-transparent bg-transparent md:mx-6 md:border-[var(--border-default)] md:bg-[var(--surface)]">
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
    <div className="grid grid-cols-2 gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-transparent p-3 lg:hidden">
      <div className="col-span-2 flex items-start justify-between gap-3">
        <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
          № {index + 1}
        </span>
        <span className="text-[17px] font-bold leading-none tabular-nums text-[var(--text)]">
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
