'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CalculatorAdditionalCostRow } from '@/lib/calculator/cost-calculator';
import { cn } from '@/lib/utils';
import { money } from './format';

export function AdditionalCostsEditor({
  costs,
  onAdd,
  onRemove,
  onUpdate,
  total,
}: {
  costs: readonly CalculatorAdditionalCostRow[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'name' | 'amount', value: string) => void;
  total: number;
}) {
  const completedCount = costs.filter((c) => c.isComplete && c.cost !== null && c.cost > 0).length;

  return (
    <div className="calculator-subpanel">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-tight text-[var(--text)]">Дополнительные расходы</h3>
          <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
            {completedCount > 0
              ? `${completedCount} ${pluralRu(completedCount, 'расход учтён', 'расхода учтены', 'расходов учтено')} · итого ${money(total)}`
              : 'Аренда, зарплата, коммунальные услуги и другие расходы на порцию.'}
          </p>
        </div>
        <Button
          className="min-h-10 rounded-[var(--radius-sm)] px-3 text-sm"
          onClick={onAdd}
          size="sm"
          type="button"
          variant="secondary"
        >
          <Plus size={15} strokeWidth={1.8} />
          Добавить расход
        </Button>
      </div>

      {costs.length === 0 || costs.every((c) => !c.name.trim() && !c.amount.trim()) ? (
        <div className="mx-1 mt-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--surface-wash)] p-3">
          <p className="text-xs leading-5 text-[var(--muted)]">
            Укажите дополнительные расходы на порцию напитка. Например: аренда, зарплата бариста, амортизация оборудования.
          </p>
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)]">
          <div className="hidden gap-3 border-b border-[var(--line)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.11em] text-[var(--muted)] md:flex md:px-5">
            <span className="min-w-0 flex-1">Статья расхода</span>
            <span className="w-[140px]">Сумма на порцию</span>
            <span className="w-8" />
          </div>
          <div className="divide-y divide-[var(--line)]">
            {costs.map((cost) => (
              <AdditionalCostRow
                key={cost.id}
                cost={cost}
                onRemove={onRemove}
                onUpdate={onUpdate}
                canRemove={costs.length > 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdditionalCostRow({
  cost,
  canRemove,
  onRemove,
  onUpdate,
}: {
  cost: CalculatorAdditionalCostRow;
  canRemove: boolean;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'name' | 'amount', value: string) => void;
}) {
  const fieldId = (name: string) => `ac-${cost.id}-${name}`;

  return (
    <div className="flex items-center gap-3 px-4 py-3 md:px-5 md:py-3.5">
      <Input
        autoComplete="off"
        className="h-10 min-w-0 flex-1 text-sm"
        id={fieldId('name')}
        onChange={(e) => onUpdate(cost.id, 'name', e.target.value)}
        placeholder="Аренда"
        value={cost.name}
      />
      <div className="flex w-[140px] items-center gap-2">
        <Input
          aria-invalid={cost.error ? true : undefined}
          className="h-10 min-w-0 flex-1 text-right text-sm tabular-nums"
          id={fieldId('amount')}
          inputMode="decimal"
          onChange={(e) => onUpdate(cost.id, 'amount', e.target.value)}
          placeholder="15"
          value={cost.amount}
        />
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-[var(--muted)]">₽</span>
      </div>
      <button
        aria-label={`Удалить расход: ${cost.name || 'без названия'}`}
        className={cn(
          'inline-flex h-9 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted)] transition hover:text-[var(--danger)]',
          !canRemove && 'pointer-events-none opacity-40',
        )}
        disabled={!canRemove}
        onClick={() => onRemove(cost.id)}
        type="button"
      >
        <Trash2 size={15} strokeWidth={1.8} />
      </button>
    </div>
  );
}

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
