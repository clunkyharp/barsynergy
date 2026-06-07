'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  calculateCostSummary,
  type CalculatorIngredient as Ingredient,
  type CalculatorPricingMode as PricingMode
} from '@/lib/calculator/cost-calculator';
import { money, percent } from './format';

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

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

export type IngredientUpdate = (id: string, field: keyof Ingredient, value: string) => void;

export function useCostCalculatorState() {
  const [itemName, setItemName] = useState('Ванильный латте');
  const [foodCostPercent, setFoodCostPercent] = useState('30');
  const [pricingMode, setPricingMode] = useState<PricingMode>('auto');
  const [salePrice, setSalePrice] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>(demoIngredients);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copyResetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

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
      : `${completedRows.toLocaleString('ru-RU')} ${pluralRu(completedRows, 'строка участвует', 'строки участвуют', 'строк участвуют')} в расчёте.`;
  const salePriceTone = hasManualSalePrice ? 'Задана вручную' : 'Рассчитана по целевой доле';

  function scheduleCopyReset(state: 'idle', delay: number) {
    if (copyResetTimerRef.current !== null) {
      window.clearTimeout(copyResetTimerRef.current);
    }

    copyResetTimerRef.current = window.setTimeout(() => {
      setCopyState(state);
      copyResetTimerRef.current = null;
    }, delay);
  }

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
      scheduleCopyReset('idle', 1800);
    } catch {
      setCopyState('failed');
      scheduleCopyReset('idle', 2200);
    }
  }

  return {
    addIngredient,
    clearCalculator,
    copyResult,
    copyState,
    fillDemo,
    foodCostError,
    foodCostPercent,
    hasAnyInput,
    isManualMode,
    itemName,
    pricingMode,
    recommendedPrice,
    removeIngredient,
    resultMessage,
    rowStatusText,
    rows,
    salePrice,
    salePriceError,
    salePriceTone,
    setFoodCostPercent,
    setItemName,
    setPricingMode,
    setSalePrice,
    summary,
    updateIngredient,
    duplicateIngredient
  };
}
