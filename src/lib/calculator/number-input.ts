const DECIMAL_NUMBER_PATTERN = /^\d+(?:[.,]\d+)?$/;

export function parseCalculatorNumberInput(value: string): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (!DECIMAL_NUMBER_PATTERN.test(trimmedValue)) {
    return null;
  }

  const parsed = Number(trimmedValue.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}
