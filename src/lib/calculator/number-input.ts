const DECIMAL_NUMBER_PATTERN = /^\d+(?:[.,]\d+)?$/;

export function parseCalculatorNumberInput(value: string): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const normalized = trimmedValue.replace(/[\s\u00a0\u202f\u2009]/g, '');

  if (!DECIMAL_NUMBER_PATTERN.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}
