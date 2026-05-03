'use client';

import { useMemo, useState } from 'react';
import { Calculator, Info, Plus, Trash2 } from 'lucide-react';
import { IconBadge } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Ingredient = {
  id: string;
  name: string;
  packagePrice: string;
  packageAmount: string;
  recipeAmount: string;
};

function numberValue(value: string) {
  const parsed = Number.parseFloat(value.replace(',', '.').trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function money(value: number) {
  const safeValue = Number.isFinite(value) && value > 0 ? value : 0;

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

function ingredientCost(ingredient: Ingredient) {
  const packagePrice = numberValue(ingredient.packagePrice);
  const packageAmount = numberValue(ingredient.packageAmount);
  const recipeAmount = numberValue(ingredient.recipeAmount);

  if (!packagePrice || !packageAmount || !recipeAmount) {
    return 0;
  }

  return (packagePrice / packageAmount) * recipeAmount;
}

export function CostCalculatorClient() {
  const [itemName, setItemName] = useState('Классический Негрони');
  const [foodCostPercent, setFoodCostPercent] = useState('22');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 'ingredient-1', name: 'Джин', packagePrice: '1890', packageAmount: '700', recipeAmount: '30' },
    { id: 'ingredient-2', name: 'Красный вермут', packagePrice: '2250', packageAmount: '1000', recipeAmount: '30' },
    { id: 'ingredient-3', name: 'Кампари', packagePrice: '1650', packageAmount: '1000', recipeAmount: '30' }
  ]);

  const rows = useMemo(
    () =>
      ingredients.map((ingredient) => ({
        ...ingredient,
        cost: ingredientCost(ingredient)
      })),
    [ingredients]
  );
  const totalCost = rows.reduce((sum, ingredient) => sum + ingredient.cost, 0);
  const foodCost = numberValue(foodCostPercent) / 100;
  const recommendedPrice = foodCost > 0 ? totalCost / foodCost : 0;
  const grossProfit = recommendedPrice > totalCost ? recommendedPrice - totalCost : 0;
  const grossMargin = recommendedPrice > 0 ? (grossProfit / recommendedPrice) * 100 : 0;
  const markup = totalCost > 0 ? recommendedPrice / totalCost : 0;
  const completedRows = rows.filter((ingredient) => ingredient.cost > 0).length;
  const hasPartialRows = rows.some((ingredient) => {
    const filledFields = [ingredient.packagePrice, ingredient.packageAmount, ingredient.recipeAmount].filter((value) => value.trim()).length;
    return filledFields > 0 && ingredient.cost === 0;
  });

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
        recipeAmount: ''
      }
    ]);
  }

  function removeIngredient(id: string) {
    setIngredients((current) => (current.length === 1 ? current : current.filter((ingredient) => ingredient.id !== id)));
  }

  return (
    <section className="border-b border-black/20 py-10 md:py-14">
      <div className="container grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.42fr)] xl:items-start">
        <div className="min-w-0 rounded-[28px] border border-black/10 bg-[rgba(255,250,244,0.78)]">
          <div className="border-b border-black/10 p-5 md:p-6">
            <h2 className="text-xl font-semibold uppercase leading-7 text-[var(--text)]">1. Информация о позиции</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <FormField htmlFor="calculatorItemName" label="Название позиции">
                <Input
                  autoComplete="off"
                  id="calculatorItemName"
                  maxLength={120}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder="Например, классический Негрони"
                  value={itemName}
                />
              </FormField>
              <FormField htmlFor="calculatorFoodCost" hint="Рекомендуемый диапазон: 18-28%." label="Целевой food cost, %">
                <Input
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
            <h2 className="text-xl font-semibold uppercase leading-7 text-[var(--text)]">2. Состав рецепта</h2>
            <div className="mt-6 hidden grid-cols-[minmax(10rem,1.15fr)_repeat(4,minmax(7rem,0.72fr))_3rem] gap-3 border-b border-black/10 pb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] lg:grid">
              <span>Ингредиент</span>
              <span>Цена упаковки, ₽</span>
              <span>Объём / вес</span>
              <span>Количество</span>
              <span>Себестоимость</span>
              <span className="sr-only">Удалить</span>
            </div>

            <div className="grid gap-4 lg:gap-0">
              {rows.map((ingredient, index) => (
                <div
                  className="grid gap-3 rounded-[22px] border border-black/10 bg-white/42 p-4 lg:grid-cols-[minmax(10rem,1.15fr)_repeat(4,minmax(7rem,0.72fr))_3rem] lg:items-end lg:border-0 lg:border-b lg:bg-transparent lg:p-0 lg:py-4"
                  key={ingredient.id}
                >
                  <FormField className="lg:[&>label]:sr-only" htmlFor={`${ingredient.id}-name`} label="Ингредиент">
                    <Input
                      autoComplete="off"
                      id={`${ingredient.id}-name`}
                      onChange={(event) => updateIngredient(ingredient.id, 'name', event.target.value)}
                      placeholder={index === 0 ? 'Джин, сироп, сок...' : 'Ингредиент'}
                      value={ingredient.name}
                    />
                  </FormField>
                  <FormField className="lg:[&>label]:sr-only lg:[&>p]:sr-only" htmlFor={`${ingredient.id}-packagePrice`} hint="В рублях" label="Цена упаковки, ₽">
                    <Input
                      id={`${ingredient.id}-packagePrice`}
                      inputMode="decimal"
                      onChange={(event) => updateIngredient(ingredient.id, 'packagePrice', event.target.value)}
                      placeholder="1200"
                      value={ingredient.packagePrice}
                    />
                  </FormField>
                  <FormField className="lg:[&>label]:sr-only lg:[&>p]:sr-only" htmlFor={`${ingredient.id}-packageAmount`} hint="Мл, г или шт." label="Объём или вес упаковки">
                    <Input
                      id={`${ingredient.id}-packageAmount`}
                      inputMode="decimal"
                      onChange={(event) => updateIngredient(ingredient.id, 'packageAmount', event.target.value)}
                      placeholder="1000"
                      value={ingredient.packageAmount}
                    />
                  </FormField>
                  <FormField className="lg:[&>label]:sr-only lg:[&>p]:sr-only" htmlFor={`${ingredient.id}-recipeAmount`} hint="На одну порцию." label="Количество в рецепте">
                    <Input
                      id={`${ingredient.id}-recipeAmount`}
                      inputMode="decimal"
                      onChange={(event) => updateIngredient(ingredient.id, 'recipeAmount', event.target.value)}
                      placeholder="45"
                      value={ingredient.recipeAmount}
                    />
                  </FormField>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] lg:sr-only">Себестоимость</p>
                    <p className="mt-1 min-h-11 rounded-[var(--radius-lg)] border border-black/10 bg-[rgba(255,252,248,0.86)] px-4 py-2.5 text-sm font-semibold leading-6 text-[var(--text)] lg:mt-0">
                      {money(ingredient.cost)}
                    </p>
                  </div>
                  <button
                    aria-label="Удалить ингредиент"
                    className={cn(
                      'inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 px-4 text-[var(--muted)] transition hover:border-[var(--accent)]/30 hover:text-[var(--accent)] lg:px-0',
                      rows.length === 1 && 'pointer-events-none opacity-45'
                    )}
                    disabled={rows.length === 1}
                    onClick={() => removeIngredient(ingredient.id)}
                    type="button"
                  >
                    <Trash2 size={17} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Button className="rounded-full px-5" onClick={addIngredient} type="button" variant="secondary">
                <Plus size={17} strokeWidth={1.8} />
                Добавить ингредиент
              </Button>
              <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
                {hasPartialRows
                  ? 'В одной из строк не хватает числа, поэтому она пока не входит в итог.'
                  : `${completedRows} ${completedRows === 1 ? 'строка участвует' : 'строк участвуют'} в расчёте.`}
              </p>
            </div>
          </div>
        </div>

        <aside className="xl:sticky xl:top-28">
          <div className="rounded-[28px] border border-black/10 bg-[rgba(255,250,244,0.86)] p-5 shadow-[0_18px_50px_rgba(20,20,18,0.05)] md:p-6">
            <div className="flex items-center gap-3">
              <IconBadge icon={Calculator} size="md" tone="accent" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Результаты расчёта</p>
                <h2 className="mt-1 text-xl font-semibold uppercase leading-7 text-[var(--text)]">{itemName.trim() || 'Позиция меню'}</h2>
              </div>
            </div>

            <dl className="mt-6 grid gap-4">
              <div className="rounded-[22px] border border-black/10 bg-[rgba(255,252,248,0.72)] p-5">
                <dt className="text-sm leading-6 text-[var(--muted)]">Себестоимость порции</dt>
                <dd className="mt-2 text-[2rem] font-semibold leading-none text-[var(--text)]">{money(totalCost)}</dd>
              </div>
              <div className="rounded-[22px] border border-black/10 bg-[rgba(255,252,248,0.72)] p-5">
                <dt className="text-sm leading-6 text-[var(--muted)]">Целевой food cost</dt>
                <dd className="mt-2 text-[2rem] font-semibold leading-none text-[var(--text)]">{percent(foodCost * 100)}</dd>
              </div>
              <div className="rounded-[22px] border border-[rgba(191,168,143,0.46)] bg-[linear-gradient(135deg,rgba(236,224,206,0.72),rgba(255,252,248,0.78))] p-5">
                <dt className="text-sm leading-6 text-[var(--muted)]">Рекомендованная цена продажи</dt>
                <dd className="mt-2 text-[2.2rem] font-semibold leading-none text-[var(--text)]">{money(recommendedPrice)}</dd>
              </div>
              <div className="grid gap-3 border-t border-black/10 pt-4">
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
            </dl>

            <div className="mt-6 rounded-[20px] border border-black/10 bg-[rgba(255,252,248,0.72)] p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-1 text-[var(--accent)]" size={18} strokeWidth={1.8} />
                <div className="min-w-0 text-sm leading-7 text-[var(--muted)]">
                  <p className="font-semibold text-[var(--text)]">Как рассчитывается цена</p>
                  <p className="mt-1">Цена продажи = себестоимость / food cost.</p>
                  <p className="mt-1">Пример: 218 ₽ / 22% = 990 ₽.</p>
                </div>
              </div>
            </div>

            {foodCost <= 0 ? (
              <p className="mt-4 text-sm leading-6 text-[var(--danger)]">Укажите food cost больше нуля, чтобы увидеть цену.</p>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
