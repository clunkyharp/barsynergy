'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ToggleProps = {
  onPressedChange: (pressed: boolean) => void;
  pressed: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed' | 'onClick'>;

type SwitchProps = {
  checked: boolean;
  description?: ReactNode;
  label: ReactNode;
  onCheckedChange: (checked: boolean) => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-checked' | 'onClick' | 'role'>;

export function Toggle({ children, className, disabled, onPressedChange, pressed, ...props }: ToggleProps) {
  return (
    <button
      aria-pressed={pressed}
      className={cn(
        'inline-flex min-h-10 items-center justify-center rounded-[var(--radius-sm)] border px-4 text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none',
        pressed
          ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
          : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]',
        disabled && 'cursor-not-allowed opacity-50 hover:border-[var(--line)] hover:bg-[var(--surface)]',
        className
      )}
      disabled={disabled}
      onClick={() => onPressedChange(!pressed)}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function Switch({ checked, className, description, disabled, label, onCheckedChange, ...props }: SwitchProps) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        'flex min-h-11 w-full items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-left transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none',
        disabled && 'cursor-not-allowed opacity-50 hover:border-[var(--line)] hover:bg-[var(--surface)]',
        className
      )}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      role="switch"
      type="button"
      {...props}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5 text-[var(--text)]">{label}</span>
        {description ? <span className="mt-1 block text-sm leading-5 text-[var(--muted)]">{description}</span> : null}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
          checked ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--line)] bg-[var(--surface-muted)]'
        )}
      >
        <span
          className={cn(
            'absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[var(--surface)] shadow-[var(--shadow-card)] transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] motion-reduce:transition-none',
            checked && 'translate-x-[18px]'
          )}
        />
      </span>
    </button>
  );
}
