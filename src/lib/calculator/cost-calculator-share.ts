import type {
  CalculatorAdditionalCost,
  CalculatorDrinkParams,
  CalculatorIngredient,
  CalculatorPricingMode,
  CalculatorRoundingMode
} from './cost-calculator';

export type CalculatorSharePayload = {
  version: 1;
  itemName: string;
  foodCostPercent: string;
  pricingMode: CalculatorPricingMode;
  salePrice: string;
  roundingMode: CalculatorRoundingMode;
  customMarkupPercent: string;
  ingredients: CalculatorIngredient[];
  additionalCosts: CalculatorAdditionalCost[];
  drinkParams: CalculatorDrinkParams;
};

type CalculatorShareInput = Omit<CalculatorSharePayload, 'version'>;

const VALID_PRICING_MODES = new Set<CalculatorPricingMode>(['auto', 'manual']);
const VALID_ROUNDING_MODES = new Set<CalculatorRoundingMode>(['none', 'ruble', 'five', 'ten', 'kopek10']);
const VALID_PREP_METHODS = new Set<CalculatorDrinkParams['prepMethod']>(['espresso', 'filter', 'alternative', 'cocktail', 'other']);
const VALID_UNITS = new Set<CalculatorIngredient['packageUnit']>(['ml', 'l', 'g', 'kg', 'pcs']);

function encodeBase64Url(value: string) {
  if (typeof globalThis.btoa !== 'function') {
    throw new Error('Base64 encoding is not available in this runtime.');
  }

  const base64 = globalThis.btoa(unescape(encodeURIComponent(value)));

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value: string) {
  if (typeof globalThis.atob !== 'function') {
    throw new Error('Base64 decoding is not available in this runtime.');
  }

  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
  const decoded = decodeURIComponent(escape(globalThis.atob(padded)));

  return decoded;
}

function sanitizeIngredient(value: unknown): CalculatorIngredient | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Record<string, unknown>;
  const packageUnit = typeof candidate.packageUnit === 'string' && VALID_UNITS.has(candidate.packageUnit as CalculatorIngredient['packageUnit'])
    ? candidate.packageUnit as CalculatorIngredient['packageUnit']
    : null;
  const recipeUnit = typeof candidate.recipeUnit === 'string' && VALID_UNITS.has(candidate.recipeUnit as CalculatorIngredient['recipeUnit'])
    ? candidate.recipeUnit as CalculatorIngredient['recipeUnit']
    : null;

  if (!packageUnit || !recipeUnit) return null;

  return {
    id: typeof candidate.id === 'string' ? candidate.id : `ingredient-${Date.now()}`,
    name: typeof candidate.name === 'string' ? candidate.name : '',
    packagePrice: typeof candidate.packagePrice === 'string' ? candidate.packagePrice : '',
    packageAmount: typeof candidate.packageAmount === 'string' ? candidate.packageAmount : '',
    packageUnit,
    recipeAmount: typeof candidate.recipeAmount === 'string' ? candidate.recipeAmount : '',
    recipeUnit
  };
}

function sanitizeAdditionalCost(value: unknown): CalculatorAdditionalCost | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Record<string, unknown>;

  return {
    id: typeof candidate.id === 'string' ? candidate.id : `ac-${Date.now()}`,
    name: typeof candidate.name === 'string' ? candidate.name : '',
    amount: typeof candidate.amount === 'string' ? candidate.amount : ''
  };
}

export function createCalculatorSharePayload(input: CalculatorShareInput): CalculatorSharePayload {
  return {
    version: 1,
    ...input
  };
}

export function serializeCalculatorSharePayload(payload: CalculatorSharePayload) {
  return encodeBase64Url(JSON.stringify(payload));
}

export function parseCalculatorSharePayload(value: string): CalculatorSharePayload | null {
  try {
    const decoded = JSON.parse(decodeBase64Url(value)) as Record<string, unknown>;

    if (decoded.version !== 1) return null;
    if (typeof decoded.itemName !== 'string') return null;
    if (typeof decoded.foodCostPercent !== 'string') return null;
    if (typeof decoded.salePrice !== 'string') return null;
    if (typeof decoded.customMarkupPercent !== 'string') return null;
    if (typeof decoded.pricingMode !== 'string' || !VALID_PRICING_MODES.has(decoded.pricingMode as CalculatorPricingMode)) return null;
    if (typeof decoded.roundingMode !== 'string' || !VALID_ROUNDING_MODES.has(decoded.roundingMode as CalculatorRoundingMode)) return null;

    const drinkParamsCandidate = decoded.drinkParams;
    if (!drinkParamsCandidate || typeof drinkParamsCandidate !== 'object') return null;
    const drinkParamsRecord = drinkParamsCandidate as Record<string, unknown>;
    if (
      typeof drinkParamsRecord.drinkVolume !== 'string' ||
      typeof drinkParamsRecord.drinkYield !== 'string' ||
      typeof drinkParamsRecord.prepMethod !== 'string' ||
      !VALID_PREP_METHODS.has(drinkParamsRecord.prepMethod as CalculatorDrinkParams['prepMethod'])
    ) {
      return null;
    }

    const ingredients = Array.isArray(decoded.ingredients)
      ? decoded.ingredients.map(sanitizeIngredient).filter(Boolean) as CalculatorIngredient[]
      : [];
    const additionalCosts = Array.isArray(decoded.additionalCosts)
      ? decoded.additionalCosts.map(sanitizeAdditionalCost).filter(Boolean) as CalculatorAdditionalCost[]
      : [];

    return {
      version: 1,
      itemName: decoded.itemName,
      foodCostPercent: decoded.foodCostPercent,
      pricingMode: decoded.pricingMode as CalculatorPricingMode,
      salePrice: decoded.salePrice,
      roundingMode: decoded.roundingMode as CalculatorRoundingMode,
      customMarkupPercent: decoded.customMarkupPercent,
      ingredients,
      additionalCosts,
      drinkParams: {
        drinkVolume: drinkParamsRecord.drinkVolume,
        drinkYield: drinkParamsRecord.drinkYield,
        prepMethod: drinkParamsRecord.prepMethod as CalculatorDrinkParams['prepMethod']
      }
    };
  } catch {
    return null;
  }
}

export function buildCalculatorShareUrl(currentHref: string, payload: CalculatorSharePayload) {
  const url = new URL(currentHref);
  url.searchParams.set('preset', serializeCalculatorSharePayload(payload));
  return url.toString();
}

export function buildCalculatorExportPayload(payload: CalculatorSharePayload) {
  return {
    exportedAt: new Date().toISOString(),
    type: 'barsynergy-cost-calculator-preset',
    ...payload
  };
}

export function buildCalculatorExportFilename(itemName: string) {
  const normalized = itemName
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return `barsynergy-recipe-${normalized || 'preset'}.json`;
}
