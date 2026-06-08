'use client';

import { type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  type CalculatorIngredientRow,
  type CalculatorSummary
} from '@/lib/calculator/cost-calculator';
import { cn } from '@/lib/utils';
import { money, percent } from './format';

export function CalculatorResultRail({
  copyState,
  foodCost,
  onCopyResult,
  resultMessage,
  rowErrors,
  salePriceTone,
  summary
}: {
  copyState: 'idle' | 'copied' | 'failed';
  foodCost: number;
  onCopyResult: () => void;
  resultMessage: string | null;
  rowErrors: CalculatorIngredientRow[];
  salePriceTone: string;
  summary: CalculatorSummary;
}) {
  const {
    activeSalePrice,
    actualFoodCostPercent,
    canShowRecommendedPrice,
    canShowSalePrice,
    foodCostError,
    grossMargin,
    grossProfit,
    isManualMode,
    markupPercent,
    recommendedPrice,
    salePriceError,
    totalCost
  } = summary;

  const resultTitle = isManualMode ? 'Цена продажи' : 'Рекомендованная цена';
  const resultState = rowErrors.length || foodCostError || salePriceError ? 'error' : canShowSalePrice ? 'calculated' : 'empty';
  const resultDescription = canShowSalePrice
    ? isManualMode
      ? `Расчёт от вашей цены продажи и себестоимости ${money(totalCost)}.`
      : `Расчёт: себестоимость ${money(totalCost)} и целевая доля ${percent(foodCost * 100)}.`
    : 'Добавьте ингредиенты и параметры. После этого появится себестоимость и цена в меню.';
  const marginValue = canShowSalePrice ? percent(grossMargin) : '—';

  return (
    <aside className="order-first xl:order-none">
      <div
        aria-invalid={resultState === 'error' ? true : undefined}
        className="calculator-result-card cost-sheet lg:sticky lg:top-24"
        data-calculator-result-state={resultState}
      >
        <div className="calculator-result-badge">
          {resultState === 'error' ? 'Проверьте' : canShowSalePrice ? 'Итог' : 'Пока пусто'}
        </div>

        <div className="mt-3">
          <h2 className="text-sm font-bold leading-tight text-[var(--muted)]">{resultTitle}</h2>
          <p className="mt-1.5 text-[2rem] font-bold leading-none tabular-nums text-[var(--text)] md:text-[2.35rem]">
            {canShowSalePrice ? money(activeSalePrice) : '—'}
          </p>
          {canShowSalePrice ? (
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">{salePriceTone}</p>
          ) : null}
        </div>

        <CalculatorResultMessage foodCostError={foodCostError} resultMessage={resultMessage} rowErrors={rowErrors} salePriceError={salePriceError} />

        <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <ResultMetricCard tone="accent" label="Себестоимость" value={rowErrors.length ? '—' : money(totalCost)} />
          <ResultMetricCard label="Маржа" value={marginValue} />
        </dl>

        <div className="mt-3 grid gap-2">
          <Button className="calculator-copy-button min-h-10 w-full rounded-[var(--radius-sm)] text-sm" disabled={!canShowSalePrice} onClick={onCopyResult} type="button">
            {copyState === 'copied' ? <Check size={15} strokeWidth={1.8} /> : <Copy size={15} strokeWidth={1.8} />}
            {copyState === 'copied' ? 'Скопировано' : 'Скопировать'}
          </Button>
          {copyState === 'failed' ? (
            <p className="text-sm leading-6 text-[var(--danger)]">Не удалось скопировать автоматически. Выделите итог вручную.</p>
          ) : null}
        </div>

        <details className="calculator-result-details mt-4">
          <summary>Подробности</summary>
          <dl className="calculator-result-detail-list">
            <ResultDetailRow label="Доля себестоимости" value={canShowSalePrice ? percent(actualFoodCostPercent) : percent(foodCost * 100)} />
            <ResultDetailRow label="Наценка" value={canShowSalePrice ? percent(markupPercent) : '—'} />
            <ResultDetailRow label="Валовая прибыль" value={canShowSalePrice ? money(grossProfit) : '—'} />
            {isManualMode && canShowRecommendedPrice ? <ResultDetailRow label="Рекомендованная цена по цели" value={money(recommendedPrice)} /> : null}
          </dl>
          <p>{resultDescription}</p>
          <p>Расчёт ориентировочный. Перед запуском в меню проверьте формулу.</p>
        </details>
      </div>
    </aside>
  );
}

function ResultMetricCard({ label, tone, value }: { label: string; tone?: 'accent'; value: ReactNode }) {
  return (
    <div
      className={cn(
        'calculator-metric-card',
        tone === 'accent' ? 'calculator-metric-card-accent' : 'calculator-metric-card-neutral'
      )}
    >
      <dt className="text-[11px] font-semibold leading-4 text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-lg font-bold leading-6 tabular-nums text-[var(--text)]">{value}</dd>
    </div>
  );
}

function ResultDetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="calculator-result-detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function CalculatorResultMessage({
  foodCostError,
  resultMessage,
  rowErrors,
  salePriceError
}: {
  foodCostError: string | null;
  resultMessage: string | null;
  rowErrors: CalculatorIngredientRow[];
  salePriceError: string | null;
}) {
  if (!resultMessage) {
    return null;
  }

  return (
    <div className={cn('mt-4 rounded-[12px] border px-4 py-3 text-sm leading-6', rowErrors.length || foodCostError || salePriceError ? 'border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]' : 'border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--muted)]')}>
      {resultMessage}
    </div>
  );
}
