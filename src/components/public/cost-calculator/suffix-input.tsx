'use client';

import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SuffixInputProps = InputHTMLAttributes<HTMLInputElement> & {
  suffix: string;
  containerClassName?: string;
  label?: string;
};

export function SuffixInput({
  className,
  containerClassName,
  label,
  suffix,
  id,
  ...inputProps
}: SuffixInputProps) {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label ? (
        <label className="block text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className="grid grid-cols-[minmax(0,1fr)_64px] gap-2">
        <input
          className={cn(
            'h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 text-right text-lg tabular-nums text-[var(--text)] outline-none transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20',
            className
          )}
          id={id}
          {...inputProps}
        />
        <span className="flex items-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-2 text-[11px] font-semibold text-[var(--muted)]">
          {suffix}
        </span>
      </div>
    </div>
  );
}
