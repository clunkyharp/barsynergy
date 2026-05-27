export function money(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
    currency: 'RUB'
  }).format(safeValue);
}

export function percent(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toLocaleString('ru-RU', { maximumFractionDigits: 1, minimumFractionDigits: 0 })} %`;
}

export function decimal(value: number) {
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}
