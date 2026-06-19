'use client';

import type { CostBreakdownItem } from '@/lib/calculator/cost-calculator';
import { money, percent } from './format';

const CATEGORY_COLORS: Record<string, string> = {
  coffee: '#8f5a3d',
  milk: '#c8bfb4',
  syrups: '#d4a04a',
  cups: '#6b8fa3',
  consumables: '#7a9a7d',
  additional: '#9a7ba3',
  other: '#b0b3b8',
};

export function CostBreakdown({ breakdown }: { breakdown: CostBreakdownItem[] }) {
  if (breakdown.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--surface-wash)] p-4">
        <p className="text-sm text-[var(--muted)]">
          Данные себестоимости появится после заполнения ингредиентов и дополнительных расходов.
        </p>
      </div>
    );
  }

  const segments = breakdown.map((item) => ({
    ...item,
    color: CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other,
  }));

  const allZero = segments.every((s) => s.amount === 0);

  return (
    <div className="grid gap-3">
      <DonutRing segments={segments} />
      <div className="min-w-0 grid gap-1.5">
        {segments.map((segment) => (
          <div
            key={segment.category}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-baseline gap-x-2 rounded-[var(--radius-sm)] px-1 py-1"
          >
            <span
              aria-hidden="true"
              className="size-2.5 self-center rounded-[3px]"
              style={{ backgroundColor: segment.color }}
            />
            <span className="min-w-0 text-[12px] leading-5 text-[var(--text)]">
              {segment.label}
            </span>
            <span className="whitespace-nowrap text-right text-[12px] font-semibold tabular-nums text-[var(--text)]">
              {money(segment.amount)}
            </span>
            <span className="whitespace-nowrap text-right text-[11px] font-semibold tabular-nums text-[var(--muted)]">
              {allZero ? '—' : percent(segment.percentage)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutRing({ segments }: { segments: (CostBreakdownItem & { color: string })[] }) {
  const total = segments.reduce((sum, s) => sum + s.amount, 0);
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;

  if (total === 0) {
    return (
      <div className="mx-auto w-fit">
        <svg
          aria-hidden="true"
          className="block opacity-30"
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          width={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke="var(--border-default)"
            strokeWidth={strokeWidth}
          />
        </svg>
      </div>
    );
  }

  let cumulativeAngle = -Math.PI / 2;

  return (
    <div className="mx-auto w-fit">
      <svg
        aria-label="Структура себестоимости"
        height={size}
        role="img"
        viewBox={`0 0 ${size} ${size}`}
        width={size}
      >
        {segments.map((segment) => {
          const sliceAngle = (segment.amount / total) * 2 * Math.PI;
          if (sliceAngle <= 0) return null;

          const startX = size / 2 + radius * Math.cos(cumulativeAngle);
          const startY = size / 2 + radius * Math.sin(cumulativeAngle);
          const endAngle = cumulativeAngle + sliceAngle;
          const endX = size / 2 + radius * Math.cos(endAngle);
          const endY = size / 2 + radius * Math.sin(endAngle);

          const largeArc = sliceAngle > Math.PI ? 1 : 0;
          const pathData = [
            `M ${startX.toFixed(2)} ${startY.toFixed(2)}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`,
          ].join(' ');

          const result = (
            <path
              key={segment.category}
              aria-label={`${segment.label}: ${money(segment.amount)} (${percent(segment.percentage)})`}
              d={pathData}
              fill="none"
              stroke={segment.color}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
            />
          );

          cumulativeAngle = endAngle;
          return result;
        })}
      </svg>
    </div>
  );
}
