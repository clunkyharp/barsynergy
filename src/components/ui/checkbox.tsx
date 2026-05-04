import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-[18px] w-[18px] shrink-0 rounded-[0.32rem] border border-[var(--border-strong)] bg-[var(--field-bg)] accent-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:border-[var(--accent)] focus-visible:!outline-none focus-visible:ring-0 focus-visible:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:border-[var(--border-subtle)] disabled:bg-[var(--surface-muted)] disabled:opacity-55 aria-[invalid=true]:outline aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-[var(--danger)]',
        className
      )}
      type="checkbox"
      {...props}
    />
  );
}
