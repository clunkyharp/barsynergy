'use client';

import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  calculatorPrepMethodOptions,
  type CalculatorDrinkParams,
} from '@/lib/calculator/cost-calculator';

export function CalculatorParameters({
  params,
  onParamChange,
}: {
  params: CalculatorDrinkParams;
  onParamChange: (field: keyof CalculatorDrinkParams, value: string) => void;
}) {
  return (
    <div className="calculator-subpanel">
      <h3 className="text-base font-bold leading-tight text-[var(--text)]">Параметры напитка</h3>
      <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
        Необязательные поля для более точного расчёта и сравнения напитков.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <FormField htmlFor="drink-volume" label="Объём напитка">
          <div className="grid grid-cols-[minmax(0,1fr)_64px] gap-2">
            <Input
              className="h-10 text-right text-sm tabular-nums"
              id="drink-volume"
              inputMode="decimal"
              maxLength={6}
              onChange={(e) => onParamChange('drinkVolume', e.target.value)}
              placeholder="200"
              value={params.drinkVolume}
            />
            <span className="flex items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-2 text-[11px] font-semibold text-[var(--muted)]">
              мл
            </span>
          </div>
        </FormField>

        <FormField htmlFor="drink-yield" label="Выход напитка">
          <div className="grid grid-cols-[minmax(0,1fr)_64px] gap-2">
            <Input
              className="h-10 text-right text-sm tabular-nums"
              id="drink-yield"
              inputMode="decimal"
              maxLength={6}
              onChange={(e) => onParamChange('drinkYield', e.target.value)}
              placeholder="36"
              value={params.drinkYield}
            />
            <span className="flex items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-2 text-[11px] font-semibold text-[var(--muted)]">
              мл
            </span>
          </div>
        </FormField>

        <FormField htmlFor="prep-method" label="Метод приготовления">
          <Select
            className="h-10 text-sm"
            id="prep-method"
            onChange={(e) => onParamChange('prepMethod', e.target.value)}
            value={params.prepMethod}
          >
            {calculatorPrepMethodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
    </div>
  );
}
