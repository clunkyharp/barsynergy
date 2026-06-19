'use client';

import { type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  type CalculatorSummary,
  type CostBreakdownItem,
} from '@/lib/calculator/cost-calculator';
import { cn } from '@/lib/utils';
import { money, percent } from './format';
import { CostBreakdown } from './cost-breakdown';

export function CalculatorResultRail({
  breakdown,
  copyState,
  onCopyResult,
  resultMessage,
  resultMessageKind,
  summary,
}: {
  breakdown: CostBreakdownItem[];
  copyState: 'idle' | 'copied' | 'failed';
  onCopyResult: () => void;
  resultMessage: string | null;
  resultMessageKind: 'error' | 'info' | null;
  summary: CalculatorSummary;
}) {
  const {
    activeSalePrice,
    actualFoodCostPercent,
    canShowSalePrice,
    foodCostError,
    grossMargin,
    grossProfit,
    isManualMode,
    markupPercent,
    roundedSalePrice,
    rowErrors,
    salePriceError,
    totalCost,
  } = summary;

  const displayPrice = roundedSalePrice > 0 ? roundedSalePrice : activeSalePrice;
  const resultState = rowErrors.length || foodCostError || salePriceError ? 'error' : canShowSalePrice ? 'calculated' : 'empty';

  return (
    <aside className="order-first xl:order-none">
      <div
        aria-invalid={resultState === 'error' ? true : undefined}
        className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]"
        data-calculator-result-state={resultState}
      >
        {/* Dark accent header */}
        <div className="bg-[var(--editorial-dark-surface-muted)] px-5 py-4" data-theme="dark">
          <p className="text-[10px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--editorial-dark-label)]">
            {resultState === 'error' ? 'Проверьте данные' : canShowSalePrice ? 'Итоговый расчёт' : 'Новый расчёт'}
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-[11px] font-medium text-[var(--editorial-dark-muted)]">Себестоимость</span>
            <span className="text-[1.6rem] font-bold leading-none tabular-nums text-[var(--editorial-dark-text)]">
              {totalCost > 0 ? money(totalCost) : '—'}
            </span>
          </div>
          {canShowSalePrice ? (
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-[11px] font-medium text-[var(--editorial-dark-muted)]">{isManualMode ? 'Цена' : 'Рек. цена'}</span>
              <span className="text-[2.2rem] font-bold leading-none tabular-nums text-[var(--accent)]">
                {money(displayPrice)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="px-5 py-4">
          {/* 3 metric rows */}
          <dl className="divide-y divide-[var(--line)] rounded-[var(--radius-sm)] border border-[var(--accent)]/25 bg-[var(--accent-soft)]/15">
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <dt className="text-[11px] font-semibold text-[var(--muted)]">Себестоимость</dt>
              <dd className="text-[1.05rem] font-bold tabular-nums text-[var(--accent)]">{money(totalCost)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <dt className="text-[11px] font-semibold text-[var(--muted)]">{isManualMode ? 'Цена продажи' : 'Рек. цена'}</dt>
              <dd className="text-[1.05rem] font-bold tabular-nums text-[var(--text)]">{canShowSalePrice ? money(displayPrice) : '—'}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <dt className="text-[11px] font-semibold text-[var(--muted)]">Наценка</dt>
              <dd className="text-[1.05rem] font-bold tabular-nums text-[var(--text)]">{canShowSalePrice ? percent(markupPercent) : '—'}</dd>
            </div>
          </dl>

          <CalculatorResultMessage resultMessage={resultMessage} resultMessageKind={resultMessageKind} />

          {/* Donut breakdown */}
          {totalCost > 0 && (
            <div className="mt-4 border-t border-[var(--line)] pt-4">
              <h3 className="text-xs font-bold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]">Структура затрат</h3>
              <div className="mt-3">
                <CostBreakdown breakdown={breakdown} />
              </div>
            </div>
          )}

          {/* Secondary metrics */}
          {canShowSalePrice && (
            <dl className="mt-4 grid grid-cols-2 gap-2">
              <SecondaryMetricCard label="Прибыль с порции" value={money(grossProfit)} />
              <SecondaryMetricCard label="Маржа" value={percent(grossMargin)} />
            </dl>
          )}

          <div className="mt-4">
            <Button
              className="calculator-copy-button min-h-10 w-full rounded-[var(--radius-sm)] text-sm"
              disabled={!canShowSalePrice}
              onClick={onCopyResult}
              type="button"
            >
              {copyState === 'copied' ? <Check size={15} strokeWidth={1.8} /> : <Copy size={15} strokeWidth={1.8} />}
              {copyState === 'copied' ? 'Скопировано' : 'Скопировать'}
            </Button>
            {copyState === 'failed' ? (
              <p className="mt-1.5 text-xs leading-5 text-[var(--danger)]">
                Не удалось скопировать.
              </p>
            ) : null}
          </div>

          {canShowSalePrice ? (
            <p className="mt-3 text-[11px] leading-5 text-[var(--muted)]">
              {isManualMode
                ? `Доля себестоимости ${percent(actualFoodCostPercent)}.`
                : `Целевая доля себестоимости ${percent(summary.foodCost * 100)}.`}
            </p>
          ) : !totalCost ? (
            <p className="mt-3 text-[11px] leading-5 text-[var(--muted)]">
              Добавьте ингредиенты, чтобы увидеть расчёт себестоимости и цены.
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}


function SecondaryMetricCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-2.5">
      <dt className="text-[11px] font-semibold leading-4 text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-base font-bold leading-6 tabular-nums text-[var(--text)]">{value}</dd>
    </div>
  );
}

function CalculatorResultMessage({ resultMessage, resultMessageKind }: { resultMessage: string | null; resultMessageKind: 'error' | 'info' | null }) {
  if (!resultMessage) return null;

  return (
    <div
      className={cn(
        'mt-4 rounded-[12px] border px-3 py-2.5 text-[13px] leading-5',
        resultMessageKind === 'error'
          ? 'border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]'
          : 'border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--muted)]',
      )}
    >
      {resultMessage}
    </div>
  );
}
