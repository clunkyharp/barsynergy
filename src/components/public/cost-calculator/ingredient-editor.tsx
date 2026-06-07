'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CalculatorIngredientRow } from '@/lib/calculator/cost-calculator';
import type { IngredientUpdate } from './use-cost-calculator-state';
import {
  CalculatorActions,
  EmptyRecipeNotice,
  IngredientRow,
  MobileIngredientCard,
  ingredientDesktopGridClassName,
} from './ingredient-editor-internal';

export {
  ingredientDesktopGridClassName,
  UnitField,
  CalculatorActions,
  EmptyRecipeNotice,
  MobileIngredientCard,
  IngredientRow,
  IngredientFields,
  IngredientActionButtons,
  IngredientRowMessage,
} from './ingredient-editor-internal';

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
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-5">
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-tight text-[var(--text)]">Ингредиенты</h3>
          <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">{rowStatusText}</p>
        </div>
        <CalculatorActions hasAnyInput={hasAnyInput} onClear={onClear} onFillDemo={onFillDemo} />
      </div>

      {!hasAnyInput ? <EmptyRecipeNotice /> : null}

      <div className="mx-4 overflow-hidden rounded-[var(--radius-md)] border border-transparent bg-transparent md:mx-5 md:border-[var(--line)] md:bg-transparent">
        <div
          className={cn(
            'hidden gap-2 border-b border-[var(--line)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.11em] text-[var(--muted)] md:px-5 lg:grid',
            ingredientDesktopGridClassName
          )}
        >
          <span className="truncate">Ингредиент</span>
          <span className="truncate">Цена, ₽</span>
          <span className="truncate">Упаковка</span>
          <span className="truncate">В рецепте</span>
          <span className="truncate">Себестоимость</span>
          <span className="truncate text-center">Действия</span>
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

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-5">
        <Button className="min-h-10 rounded-[var(--radius-sm)] px-4 text-sm" onClick={onAddIngredient} type="button" variant="secondary">
          <Plus size={16} strokeWidth={1.8} />
          Добавить ингредиент
        </Button>
        <p className="max-w-xl text-xs leading-5 text-[var(--muted)]">
          Пример: <span className="font-semibold text-[var(--text)]">Зерно · 2{'\u00a0'}400 ₽ · 1 кг · 18 г → 43,20 ₽</span>
        </p>
      </div>
    </>
  );
}
