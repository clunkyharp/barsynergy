import { parseCalculatorNumberInput } from './number-input.ts';

export type CalculatorUnit = 'ml' | 'l' | 'g' | 'kg' | 'pcs';
export type CalculatorUnitKind = 'volume' | 'weight' | 'piece';
export type CalculatorPricingMode = 'auto' | 'manual';

export type CalculatorIngredient = {
  id: string;
  name: string;
  packagePrice: string;
  packageAmount: string;
  packageUnit: CalculatorUnit;
  recipeAmount: string;
  recipeUnit: CalculatorUnit;
};

export type CalculatorIngredientRow = CalculatorIngredient & {
  cost: number | null;
  error: string | null;
  note: string | null;
  isComplete: boolean;
};

export const calculatorUnitOptions: { value: CalculatorUnit; label: string; kind: CalculatorUnitKind; factor: number }[] = [
  { value: 'ml', label: 'мл', kind: 'volume', factor: 1 },
  { value: 'l', label: 'л', kind: 'volume', factor: 1000 },
  { value: 'g', label: 'г', kind: 'weight', factor: 1 },
  { value: 'kg', label: 'кг', kind: 'weight', factor: 1000 },
  { value: 'pcs', label: 'шт', kind: 'piece', factor: 1 }
];

export function getCalculatorUnitKind(unit: CalculatorUnit) {
  return calculatorUnitOptions.find((option) => option.value === unit)?.kind ?? 'volume';
}

export function normalizeCalculatorAmount(value: number, unit: CalculatorUnit) {
  const option = calculatorUnitOptions.find((item) => item.value === unit);
  return value * (option?.factor ?? 1);
}

export function areCalculatorUnitsCompatible(packageUnit: CalculatorUnit, recipeUnit: CalculatorUnit) {
  return getCalculatorUnitKind(packageUnit) === getCalculatorUnitKind(recipeUnit);
}

export function calculateIngredientCost(ingredient: CalculatorIngredient): CalculatorIngredientRow {
  const packagePrice = parseCalculatorNumberInput(ingredient.packagePrice);
  const packageAmount = parseCalculatorNumberInput(ingredient.packageAmount);
  const recipeAmount = parseCalculatorNumberInput(ingredient.recipeAmount);
  const unitsMatch = areCalculatorUnitsCompatible(ingredient.packageUnit, ingredient.recipeUnit);

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

  const normalizedPackageAmount = normalizeCalculatorAmount(packageAmount, ingredient.packageUnit);
  const normalizedRecipeAmount = normalizeCalculatorAmount(recipeAmount, ingredient.recipeUnit);

  return {
    ...ingredient,
    cost: (packagePrice / normalizedPackageAmount) * normalizedRecipeAmount,
    error: null,
    note: recipeAmount === 0 ? 'В рецепте указано 0, строка даст 0 ₽.' : null,
    isComplete: true
  };
}

export type CalculatorSummaryInput = {
  foodCostPercent: string;
  ingredients: CalculatorIngredient[];
  pricingMode: CalculatorPricingMode;
  salePrice: string;
};

export type CalculatorSummary = {
  activeSalePrice: number;
  actualFoodCostPercent: number;
  canShowRecommendedPrice: boolean;
  canShowSalePrice: boolean;
  completedRows: number;
  foodCost: number;
  foodCostError: string | null;
  grossMargin: number;
  grossProfit: number;
  hasManualSalePrice: boolean;
  hasPartialRows: boolean;
  isManualMode: boolean;
  markupPercent: number;
  recommendedPrice: number;
  rowErrors: CalculatorIngredientRow[];
  rows: CalculatorIngredientRow[];
  salePriceError: string | null;
  totalCost: number;
};

export function calculateCostSummary({
  foodCostPercent,
  ingredients,
  pricingMode,
  salePrice
}: CalculatorSummaryInput): CalculatorSummary {
  const rows = ingredients.map((ingredient) => calculateIngredientCost(ingredient));
  const rowErrors = rows.filter((ingredient) => ingredient.error);
  const totalCost = rows.reduce((sum, ingredient) => sum + (ingredient.cost ?? 0), 0);
  const foodCostInput = parseCalculatorNumberInput(foodCostPercent);
  const foodCostError = foodCostPercent.trim() && (foodCostInput === null || foodCostInput <= 0 || foodCostInput > 100)
    ? 'Целевая доля себестоимости должна быть больше 0 и не выше 100 %.'
    : null;
  const foodCost = foodCostInput && foodCostInput > 0 && foodCostInput <= 100 ? foodCostInput / 100 : 0;
  const isManualMode = pricingMode === 'manual';
  const manualSalePriceInput = parseCalculatorNumberInput(salePrice);
  const salePriceError = isManualMode && (salePrice.trim() === '' || manualSalePriceInput === null || manualSalePriceInput <= 0)
    ? 'В ручном режиме цена продажи должна быть больше нуля.'
    : null;
  const manualSalePrice = manualSalePriceInput && manualSalePriceInput > 0 ? manualSalePriceInput : 0;
  const hasManualSalePrice = isManualMode && manualSalePrice > 0 && !salePriceError;
  const canShowRecommendedPrice = rowErrors.length === 0 && totalCost > 0 && !foodCostError && foodCost > 0;
  const recommendedPrice = canShowRecommendedPrice ? totalCost / foodCost : 0;
  const activeSalePrice = isManualMode ? manualSalePrice : recommendedPrice;
  const canShowSalePrice = rowErrors.length === 0 && totalCost > 0 && (isManualMode ? hasManualSalePrice : canShowRecommendedPrice);
  const actualFoodCostPercent = canShowSalePrice ? (totalCost / activeSalePrice) * 100 : 0;
  const grossProfit = canShowSalePrice ? activeSalePrice - totalCost : 0;
  const grossMargin = canShowSalePrice && activeSalePrice > 0 ? (grossProfit / activeSalePrice) * 100 : 0;
  const markupPercent = canShowSalePrice && totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;
  const completedRows = rows.filter((ingredient) => ingredient.isComplete).length;
  const hasPartialRows = rows.some((ingredient) => {
    const filledFields = [ingredient.packagePrice, ingredient.packageAmount, ingredient.recipeAmount].filter((value) => value.trim()).length;
    return filledFields > 0 && !ingredient.isComplete && !ingredient.error;
  });

  return {
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
  };
}
