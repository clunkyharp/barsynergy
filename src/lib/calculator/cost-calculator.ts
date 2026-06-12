import { parseCalculatorNumberInput } from './number-input.ts';

export type CalculatorUnit = 'ml' | 'l' | 'g' | 'kg' | 'pcs';
export type CalculatorUnitKind = 'volume' | 'weight' | 'piece';
export type CalculatorPricingMode = 'auto' | 'manual';
export type CalculatorRoundingMode = 'none' | 'ruble' | 'five' | 'ten' | 'kopek10';

export type CalculatorRoundModeOption = {
  value: CalculatorRoundingMode;
  label: string;
};

export const calculatorRoundingOptions: CalculatorRoundModeOption[] = [
  { value: 'none', label: 'Без округления' },
  { value: 'ruble', label: 'До 1 рубля' },
  { value: 'five', label: 'До 5 рублей' },
  { value: 'ten', label: 'До 10 рублей' },
  { value: 'kopek10', label: 'До 10 копеек' }
];

export function roundPrice(price: number, mode: CalculatorRoundingMode): number {
  if (!Number.isFinite(price) || price <= 0) return price;
  switch (mode) {
    case 'none':
      return price;
    case 'ruble':
      return Math.round(price);
    case 'five':
      return Math.round(price / 5) * 5;
    case 'ten':
      return Math.round(price / 10) * 10;
    case 'kopek10':
      return Math.round(price * 10) / 10;
    default:
      return price;
  }
}

export type CalculatorPrefMethod =
  | 'espresso'
  | 'filter'
  | 'alternative'
  | 'cocktail'
  | 'other';

export type CalculatorPrefMethodOption = {
  value: CalculatorPrefMethod;
  label: string;
};

export const calculatorPrepMethodOptions: CalculatorPrefMethodOption[] = [
  { value: 'espresso', label: 'Эспрессо' },
  { value: 'filter', label: 'Фильтр' },
  { value: 'alternative', label: 'Альтернатива' },
  { value: 'cocktail', label: 'Коктейль' },
  { value: 'other', label: 'Другое' }
];

export type CalculatorDrinkParams = {
  drinkVolume: string;
  drinkYield: string;
  prepMethod: CalculatorPrefMethod;
};

export type CalculatorAdditionalCost = {
  id: string;
  name: string;
  amount: string;
};

export type CalculatorAdditionalCostRow = CalculatorAdditionalCost & {
  cost: number | null;
  error: string | null;
  note: string | null;
  isComplete: boolean;
};

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

export function calculateAdditionalCostRow(cost: CalculatorAdditionalCost): CalculatorAdditionalCostRow {
  const amount = parseCalculatorNumberInput(cost.amount);

  if (cost.name.trim() === '' && cost.amount.trim() === '') {
    return { ...cost, cost: null, error: null, note: null, isComplete: false };
  }

  if (amount !== null && amount < 0) {
    return { ...cost, cost: null, error: 'Сумма не может быть отрицательной.', note: null, isComplete: false };
  }

  if (amount === null) {
    return { ...cost, cost: null, error: null, note: null, isComplete: false };
  }

  return { ...cost, cost: amount, error: null, note: null, isComplete: true };
}

export type CostBreakdownCategory = 'coffee' | 'milk' | 'syrups' | 'cups' | 'consumables' | 'additional' | 'other';

export type CostBreakdownItem = {
  category: CostBreakdownCategory;
  label: string;
  amount: number;
  percentage: number;
};

export function classifyIngredient(name: string): CostBreakdownCategory {
  const lower = name.toLowerCase();
  if (/зерн|кофе|coffee|эспрессо|espresso|дрип|фильтр|воронк|аэропресс|френч/.test(lower)) return 'coffee';
  if (/молок|milk|сливк|cream|латте|латте/.test(lower)) return 'milk';
  if (/сироп|syrup|топпинг|topping|шоколад|карамел|ванил|мед|сахар|sugar/.test(lower)) return 'syrups';
  if (/стакан|cup|крышк|крышка|lid|трубочк|straw|подстакан/.test(lower)) return 'cups';
  if (/салфетк|napkin|фильтр|filter|вода|water|лёд|ice/.test(lower)) return 'consumables';
  return 'other';
}

export function buildCostBreakdown(
  ingredientRows: CalculatorIngredientRow[],
  additionalCostRows: CalculatorAdditionalCostRow[]
): CostBreakdownItem[] {
  const categories: Map<CostBreakdownCategory, number> = new Map();

  for (const row of ingredientRows) {
    if (row.cost === null || row.cost <= 0) continue;
    const category = classifyIngredient(row.name);
    categories.set(category, (categories.get(category) ?? 0) + row.cost);
  }

  for (const row of additionalCostRows) {
    if (row.cost === null || row.cost <= 0) continue;
    categories.set('additional', (categories.get('additional') ?? 0) + row.cost);
  }

  const total = [...categories.values()].reduce((sum, v) => sum + v, 0);

  const categoryLabels: Record<CostBreakdownCategory, string> = {
    coffee: 'Кофе',
    milk: 'Молоко / сливки',
    syrups: 'Сиропы / топпинги',
    cups: 'Стакан / крышка',
    consumables: 'Расходники',
    additional: 'Доп. расходы',
    other: 'Прочее'
  };

  return [...categories.entries()]
    .map(([category, amount]) => ({
      category,
      label: categoryLabels[category],
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

export type CalculatorSummaryInput = {
  foodCostPercent: string;
  ingredients: CalculatorIngredient[];
  additionalCosts: CalculatorAdditionalCost[];
  pricingMode: CalculatorPricingMode;
  roundingMode: CalculatorRoundingMode;
  salePrice: string;
  customMarkupPercent: string;
};

export type CalculatorSummary = {
  activeSalePrice: number;
  actualFoodCostPercent: number;
  additionalCostTotal: number;
  breakdown: CostBreakdownItem[];
  canShowRecommendedPrice: boolean;
  canShowSalePrice: boolean;
  completedRows: number;
  foodCost: number;
  foodCostError: string | null;
  grossMargin: number;
  grossProfit: number;
  hasManualSalePrice: boolean;
  hasPartialRows: boolean;
  ingredientCost: number;
  isManualMode: boolean;
  markupPercent: number;
  recommendedPrice: number;
  roundedSalePrice: number;
  rowErrors: CalculatorIngredientRow[];
  rows: CalculatorIngredientRow[];
  salePriceError: string | null;
  totalCost: number;
};

export function calculateCostSummary({
  foodCostPercent,
  ingredients,
  additionalCosts,
  pricingMode,
  roundingMode,
  salePrice,
  customMarkupPercent
}: CalculatorSummaryInput): CalculatorSummary {
  const rows = ingredients.map((ingredient) => calculateIngredientCost(ingredient));
  const additionalCostRows = additionalCosts.map((cost) => calculateAdditionalCostRow(cost));
  const rowErrors = rows.filter((ingredient) => ingredient.error);
  const ingredientCost = rows.reduce((sum, ingredient) => sum + (ingredient.cost ?? 0), 0);
  const additionalCostTotal = additionalCostRows.reduce((sum, row) => sum + (row.cost ?? 0), 0);
  const totalCost = ingredientCost + additionalCostTotal;

  const foodCostInput = parseCalculatorNumberInput(foodCostPercent);
  const foodCostError = foodCostPercent.trim() && (foodCostInput === null || foodCostInput <= 0 || foodCostInput > 100)
    ? 'Целевая доля себестоимости должна быть больше 0 и не выше 100 %.'
    : null;
  const foodCost = foodCostInput && foodCostInput > 0 && foodCostInput <= 100 ? foodCostInput / 100 : 0;

  const isManualMode = pricingMode === 'manual';

  const manualSalePriceInput = parseCalculatorNumberInput(salePrice);
  const salePriceError = isManualMode && salePrice.trim() !== '' && (manualSalePriceInput === null || manualSalePriceInput <= 0)
    ? 'В ручном режиме цена продажи должна быть больше нуля.'
    : null;
  const manualSalePrice = manualSalePriceInput && manualSalePriceInput > 0 ? manualSalePriceInput : 0;
  const hasManualSalePrice = isManualMode && manualSalePrice > 0 && !salePriceError;

  const canShowRecommendedPrice = rowErrors.length === 0 && totalCost > 0 && !foodCostError && foodCost > 0;
  const recommendedPrice = canShowRecommendedPrice ? totalCost / foodCost : 0;

  const customMarkupInput = parseCalculatorNumberInput(customMarkupPercent);
  const useCustomMarkup = customMarkupInput !== null && customMarkupInput > 0 && !isManualMode;
  const markupBasedPrice = useCustomMarkup && totalCost > 0
    ? totalCost * (1 + customMarkupInput / 100)
    : recommendedPrice;

  const activeSalePrice = isManualMode ? manualSalePrice : markupBasedPrice;
  const roundedSalePrice = roundPrice(activeSalePrice, roundingMode);

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

  const breakdown = buildCostBreakdown(rows, additionalCostRows);

  return {
    activeSalePrice,
    actualFoodCostPercent,
    additionalCostTotal,
    breakdown,
    canShowRecommendedPrice,
    canShowSalePrice,
    completedRows,
    foodCost,
    foodCostError,
    grossMargin,
    grossProfit,
    hasManualSalePrice,
    hasPartialRows,
    ingredientCost,
    isManualMode,
    markupPercent,
    recommendedPrice,
    roundedSalePrice,
    rowErrors,
    rows,
    salePriceError,
    totalCost
  };
}
