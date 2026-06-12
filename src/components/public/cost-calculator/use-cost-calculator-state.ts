'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  calculateAdditionalCostRow,
  calculateCostSummary,
  type CalculatorAdditionalCost as AdditionalCost,
  type CalculatorIngredient as Ingredient,
  type CalculatorDrinkParams,
  type CalculatorPricingMode as PricingMode,
  type CalculatorRoundingMode as RoundingMode,
} from '@/lib/calculator/cost-calculator';
import {
  buildCalculatorExportFilename,
  buildCalculatorExportPayload,
  buildCalculatorShareUrl,
  createCalculatorSharePayload,
  parseCalculatorSharePayload
} from '@/lib/calculator/cost-calculator-share';
import { money, percent } from './format';

const STORAGE_KEY = 'barsynergy-calculator-v1';

type StoredState = {
  itemName?: string;
  foodCostPercent?: string;
  pricingMode?: PricingMode;
  salePrice?: string;
  roundingMode?: RoundingMode;
  customMarkupPercent?: string;
  ingredients?: Ingredient[];
  additionalCosts?: AdditionalCost[];
  drinkParams?: CalculatorDrinkParams;
};

function loadFromStorage(): StoredState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredState) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable
  }
}

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
  { id: 'ingredient-3', name: 'Ванильный сироп', packagePrice: '650', packageAmount: '1', packageUnit: 'l', recipeAmount: '15', recipeUnit: 'ml' },
];

const demoAdditionalCosts: AdditionalCost[] = [
  { id: 'ac-1', name: 'Аренда и коммунальные', amount: '12' },
  { id: 'ac-2', name: 'Зарплата бариста', amount: '18' },
  { id: 'ac-3', name: 'Расходные материалы', amount: '5' },
];

function createEmptyIngredient(id = `ingredient-${Date.now()}`): Ingredient {
  return {
    id,
    name: '',
    packagePrice: '',
    packageAmount: '',
    packageUnit: 'ml',
    recipeAmount: '',
    recipeUnit: 'ml',
  };
}

function createEmptyAdditionalCost(id = `ac-${Date.now()}`): AdditionalCost {
  return { id, name: '', amount: '' };
}

export type IngredientUpdate = (id: string, field: keyof Ingredient, value: string) => void;

const EMPTY_DRINK_PARAMS: CalculatorDrinkParams = {
  drinkVolume: '',
  drinkYield: '',
  prepMethod: 'espresso',
};

export function useCostCalculatorState() {
  const [itemName, setItemName] = useState('Ванильный латте');
  const [foodCostPercent, setFoodCostPercent] = useState('30');
  const [pricingMode, setPricingMode] = useState<PricingMode>('auto');
  const [salePrice, setSalePrice] = useState('');
  const [_roundingMode, _setRoundingMode] = useState<RoundingMode>('none');
  function setRoundingMode(value: string) {
    _setRoundingMode(value as RoundingMode);
  }
  const roundingMode = _roundingMode;
  const [customMarkupPercent, setCustomMarkupPercent] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>(demoIngredients);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>(demoAdditionalCosts);
  const [drinkParams, setDrinkParams] = useState<CalculatorDrinkParams>(EMPTY_DRINK_PARAMS);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const copyResetTimerRef = useRef<number | null>(null);
  const presetAppliedRef = useRef(false);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!restoredRef.current) {
      restoredRef.current = true;
      const saved = loadFromStorage();
      if (saved) {
        if (saved.itemName !== undefined) setItemName(saved.itemName);
        if (saved.foodCostPercent !== undefined) setFoodCostPercent(saved.foodCostPercent);
        if (saved.pricingMode !== undefined) setPricingMode(saved.pricingMode);
        if (saved.salePrice !== undefined) setSalePrice(saved.salePrice);
        if (saved.roundingMode !== undefined) _setRoundingMode(saved.roundingMode);
        if (saved.customMarkupPercent !== undefined) setCustomMarkupPercent(saved.customMarkupPercent);
        if (saved.ingredients !== undefined) setIngredients(saved.ingredients);
        if (saved.additionalCosts !== undefined) setAdditionalCosts(saved.additionalCosts);
        if (saved.drinkParams !== undefined) setDrinkParams(saved.drinkParams);
      }
    }
  }, []);

  useEffect(() => {
    saveToStorage({ itemName, foodCostPercent, pricingMode, salePrice, roundingMode: _roundingMode, customMarkupPercent, ingredients, additionalCosts, drinkParams });
    setLastSavedAt(new Date());
  }, [itemName, foodCostPercent, pricingMode, salePrice, _roundingMode, customMarkupPercent, ingredients, additionalCosts, drinkParams]);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (presetAppliedRef.current || typeof window === 'undefined') {
      return;
    }

    presetAppliedRef.current = true;

    const preset = new URL(window.location.href).searchParams.get('preset');
    if (!preset) {
      return;
    }

    const parsed = parseCalculatorSharePayload(preset);
    if (!parsed) {
      return;
    }

    setItemName(parsed.itemName);
    setFoodCostPercent(parsed.foodCostPercent);
    setPricingMode(parsed.pricingMode);
    setSalePrice(parsed.salePrice);
    setRoundingMode(parsed.roundingMode);
    setCustomMarkupPercent(parsed.customMarkupPercent);
    setIngredients(parsed.ingredients.length > 0 ? parsed.ingredients : [createEmptyIngredient('ingredient-empty')]);
    setAdditionalCosts(parsed.additionalCosts.length > 0 ? parsed.additionalCosts : [createEmptyAdditionalCost('ac-empty')]);
    setDrinkParams(parsed.drinkParams);
    setCopyState('idle');
  }, []);

  const summary = useMemo(
    () =>
      calculateCostSummary({
        additionalCosts,
        customMarkupPercent,
        foodCostPercent,
        ingredients,
        pricingMode,
        roundingMode,
        salePrice,
      }),
    [additionalCosts, customMarkupPercent, foodCostPercent, ingredients, pricingMode, roundingMode, salePrice],
  );

  const additionalCostRows = useMemo(
    () => additionalCosts.map((ac) => calculateAdditionalCostRow(ac)),
    [additionalCosts],
  );

  const {
    activeSalePrice,
    additionalCostTotal,
    actualFoodCostPercent,
    breakdown,
    canShowRecommendedPrice,
    canShowSalePrice,
    completedRows,
    foodCost,
    foodCostError,
    grossMargin,
    grossProfit,
    hasPartialRows,
    ingredientCost,
    isManualMode,
    markupPercent,
    recommendedPrice,
    roundedSalePrice,
    rowErrors,
    rows,
    salePriceError,
    totalCost,
  } = summary;

  const hasAnyInput = Boolean(
    itemName.trim() ||
      foodCostPercent.trim() ||
      salePrice.trim() ||
      customMarkupPercent.trim() ||
      drinkParams.drinkVolume.trim() ||
      drinkParams.drinkYield.trim() ||
      rows.some((ingredient) =>
        [ingredient.name, ingredient.packagePrice, ingredient.packageAmount, ingredient.recipeAmount].some(
          (value) => value.trim().length > 0,
        ),
      ) ||
      additionalCosts.some((cost) => cost.name.trim() || cost.amount.trim()),
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

  const resultMessageKind: 'error' | 'info' | null = rowErrors.length || salePriceError || (foodCostError && !isManualMode) ? 'error' : resultMessage ? 'info' : null;

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
    setIngredients((current) =>
      current.map((ingredient) => (ingredient.id === id ? { ...ingredient, [field]: value } : ingredient)),
    );
  }

  function addIngredient() {
    setIngredients((current) => {
      if (current.length === 1) {
        const only = current[0];
        const isEmpty = !only.name.trim() && !only.packagePrice.trim() && !only.packageAmount.trim() && !only.recipeAmount.trim();
        if (isEmpty) return current;
      }
      return [...current, createEmptyIngredient()];
    });
  }

  function duplicateIngredient(id: string) {
    setIngredients((current) => {
      const source = current.find((ingredient) => ingredient.id === id);
      if (!source) return current;
      return [...current, { ...source, id: `ingredient-${Date.now()}` }];
    });
  }

  function removeIngredient(id: string) {
    setIngredients((current) => (current.length === 1 ? current : current.filter((i) => i.id !== id)));
  }

  function updateAdditionalCost(id: string, field: 'name' | 'amount', value: string) {
    setAdditionalCosts((current) =>
      current.map((cost) => (cost.id === id ? { ...cost, [field]: value } : cost)),
    );
  }

  function addAdditionalCost() {
    setAdditionalCosts((current) => {
      if (current.length === 1) {
        const only = current[0];
        if (!only.name.trim() && !only.amount.trim()) return current;
      }
      return [...current, createEmptyAdditionalCost()];
    });
  }

  function removeAdditionalCost(id: string) {
    setAdditionalCosts((current) => (current.length === 1 ? current : current.filter((c) => c.id !== id)));
  }

  function updateDrinkParam(field: keyof CalculatorDrinkParams, value: string) {
    setDrinkParams((current) => ({ ...current, [field]: value }));
  }

  function clearCalculator() {
    setItemName('');
    setFoodCostPercent('');
    setPricingMode('auto');
    setSalePrice('');
    setRoundingMode('none');
    setCustomMarkupPercent('');
    setIngredients([createEmptyIngredient('ingredient-empty')]);
    setAdditionalCosts([createEmptyAdditionalCost('ac-empty')]);
    setDrinkParams({ drinkVolume: '', drinkYield: '', prepMethod: 'espresso' });
    setCopyState('idle');
  }

  function fillDemo() {
    setItemName('Ванильный латте');
    setFoodCostPercent('30');
    setPricingMode('auto');
    setSalePrice('');
    setRoundingMode('none');
    setCustomMarkupPercent('');
    setIngredients(demoIngredients);
    setAdditionalCosts(demoAdditionalCosts);
    setDrinkParams({ drinkVolume: '200', drinkYield: '36', prepMethod: 'espresso' });
    setCopyState('idle');
  }

  function getSharePayload() {
    return createCalculatorSharePayload({
      itemName,
      foodCostPercent,
      pricingMode,
      salePrice,
      roundingMode,
      customMarkupPercent,
      ingredients,
      additionalCosts,
      drinkParams
    });
  }

  async function copyResult() {
    if (!canShowSalePrice) return;

    const displayPrice = roundingMode !== 'none' ? roundedSalePrice : activeSalePrice;
    const resultText = [
      `Позиция: ${itemName.trim() || 'Позиция меню'}`,
      `Себестоимость: ${money(totalCost)}`,
      `  · Ингредиенты: ${money(ingredientCost)}`,
      additionalCostTotal > 0 ? `  · Доп. расходы: ${money(additionalCostTotal)}` : null,
      isManualMode
        ? `Цена продажи задана вручную: ${money(displayPrice)}`
        : `Цена продажи по целевой доле: ${money(displayPrice)}`,
      roundingMode !== 'none' ? `  (округление: вкл)` : null,
      canShowRecommendedPrice ? `Рекомендованная цена по цели: ${money(recommendedPrice)}` : null,
      `Доля себестоимости: ${percent(actualFoodCostPercent)}`,
      foodCost > 0 ? `Целевая доля себестоимости: ${percent(foodCost * 100)}` : null,
      `Валовая прибыль: ${money(grossProfit)}`,
      `Маржа: ${percent(grossMargin)}`,
      `Наценка: ${percent(markupPercent)}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(resultText);
      setCopyState('copied');
      scheduleCopyReset('idle', 1800);
    } catch {
      setCopyState('failed');
      scheduleCopyReset('idle', 2200);
    }
  }

  async function shareRecipe() {
    if (typeof window === 'undefined') {
      return 'failed' as const;
    }

    const url = buildCalculatorShareUrl(window.location.href, getSharePayload());

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: itemName.trim() || 'Рецепт напитка',
          text: 'Рецепт и расчёт себестоимости из BARSYNERGY',
          url
        });
        return 'shared' as const;
      }

      await navigator.clipboard.writeText(url);
      return 'copied' as const;
    } catch {
      return 'failed' as const;
    }
  }

  function exportRecipe() {
    if (typeof window === 'undefined') {
      return false;
    }

    const payload = buildCalculatorExportPayload(getSharePayload());
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = buildCalculatorExportFilename(itemName);
    link.click();
    URL.revokeObjectURL(href);
    return true;
  }

  return {
    addAdditionalCost,
    addIngredient,
    additionalCostRows,
    additionalCosts,
    additionalCostTotal,
    breakdown,
    clearCalculator,
    copyResult,
    copyState,
    customMarkupPercent,
    drinkParams,
    duplicateIngredient,
    fillDemo,
    foodCostError,
    foodCostPercent,
    hasAnyInput,
    ingredientCost,
    isManualMode,
    itemName,
    markupPercent,
    pricingMode,
    recommendedPrice,
    removeAdditionalCost,
    removeIngredient,
    resultMessage,
    resultMessageKind,
    roundingMode,
    roundedSalePrice,
    rowStatusText,
    rows,
    salePrice,
    salePriceError,
    setCustomMarkupPercent,
    setFoodCostPercent,
    setItemName,
    setPricingMode,
    setRoundingMode,
    setSalePrice,
    summary,
    totalCost,
    updateAdditionalCost,
    updateDrinkParam,
    updateIngredient,
    grossProfit,
    grossMargin,
    lastSavedAt,
    shareRecipe,
    exportRecipe,
  };
}
