'use client';

import { Select } from '@/components/ui/select';
import {
  calculatorRoundingOptions,
} from '@/lib/calculator/cost-calculator';
import { money, percent } from './format';

export function MarkupPricing({
  grossProfit,
  markupPercent,
  onMarkupChange,
  onRoundingChange,
  roundingMode,
  totalCost,
  customMarkupPercent,
}: {
  grossProfit: number;
  markupPercent: number;
  onMarkupChange: (value: string) => void;
  onRoundingChange: (value: string) => void;
  roundingMode: string;
  totalCost: number;
  customMarkupPercent: string;
}) {
  return (
    <div className="calculator-subpanel">
      <h3 className="text-base font-bold leading-tight text-[var(--text)]">Наценка и цена</h3>
      <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
        Управляйте наценкой и правилами округления цены продажи.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]">
            Наценка
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[200, 250, 300].map((pct) => (
              <button
                key={pct}
                className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-2 text-center text-[13px] font-semibold text-[var(--text)] transition hover:border-[var(--accent)] data-[active=true]:border-[var(--accent)] data-[active=true]:bg-[var(--accent-soft)]"
                data-active={customMarkupPercent === String(pct) ? 'true' : 'false'}
                onClick={() => onMarkupChange(String(pct))}
                type="button"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]">
            Округление цены
          </label>
          <Select
            className="h-10 w-full text-sm"
            onChange={(e) => onRoundingChange(e.target.value)}
            value={roundingMode}
          >
            {calculatorRoundingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {totalCost > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MetricPill label="Себестоимость" value={money(totalCost)} />
          <MetricPill label="Наценка" value={percent(markupPercent)} />
          <MetricPill label="Прибыль с порции" value={money(grossProfit)} />
        </div>
      ) : null}
    </div>
  );
}

function MetricPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-2.5 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-base font-bold tabular-nums text-[var(--text)]">{value}</p>
    </div>
  );
}
