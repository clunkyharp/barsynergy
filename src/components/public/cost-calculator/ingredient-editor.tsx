'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CalculatorIngredientRow } from '@/lib/calculator/cost-calculator';
import type { IngredientUpdate } from './use-cost-calculator-state';
import {
  IngredientRow,
  MobileIngredientCard,
  ingredientDesktopGridClassName,
} from './ingredient-editor-internal';

export {
  ingredientDesktopGridClassName,
  UnitField,
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
  onDuplicate,
  onRemove,
  onUpdate,
  rowStatusText,
  rows,
}: {
  hasAnyInput: boolean;
  onAddIngredient: () => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: IngredientUpdate;
  rowStatusText: string;
  rows: CalculatorIngredientRow[];
}) {
  const hasOnlyPlaceholderRow =
    rows.length === 1 &&
    rows.every((row) => !row.name.trim() && !row.packagePrice.trim() && !row.packageAmount.trim() && !row.recipeAmount.trim());

  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (hasAnyInput || !hasOnlyPlaceholderRow) setRevealed(true);
  }, [hasAnyInput, hasOnlyPlaceholderRow]);

  const showEmptyState = !hasAnyInput && hasOnlyPlaceholderRow && !revealed;

  function handleAdd() {
    setRevealed(true);
    onAddIngredient();
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-tight text-[var(--text)]">Ингредиенты</h3>
          <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">{rowStatusText}</p>
        </div>
      </div>

      {showEmptyState ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-wash)] p-5">
          <p className="text-sm font-semibold text-[var(--text)]">Рецепт пока пуст</p>
          <p className="mt-1.5 text-[13px] leading-6 text-[var(--muted)]">
            Добавьте ингредиент вручную или заполните примером. После этого появится себестоимость и цена продажи.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              className="min-h-10 rounded-[var(--radius-sm)] px-3 text-sm"
              onClick={handleAdd}
              type="button"
              variant="secondary"
            >
              <Plus size={15} strokeWidth={1.8} />
              Добавить ингредиент
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)] bg-transparent">
          <div
            className={cn(
              'hidden gap-2 border-b border-[var(--line)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)] md:px-5 lg:grid',
              ingredientDesktopGridClassName,
            )}
          >
            <span>Ингредиент</span>
            <span className="text-right">Цена, ₽</span>
            <span>Упаковка</span>
            <span>В рецепте</span>
            <span className="text-right">Стоимость</span>
            <span />
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
      )}

      {!showEmptyState ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Button
            className="min-h-10 rounded-[var(--radius-sm)] px-3 text-sm"
            onClick={handleAdd}
            type="button"
            variant="secondary"
          >
            <Plus size={15} strokeWidth={1.8} />
            Добавить ингредиент
          </Button>
          <p className="max-w-xl text-xs leading-5 text-[var(--muted)]">
            Пример: <span className="font-semibold text-[var(--text)]">Зерно · 2{'\u00a0'}400 ₽ · 1 кг · 18 г → 43,20 ₽</span>
          </p>
        </div>
      ) : null}
    </>
  );
}
