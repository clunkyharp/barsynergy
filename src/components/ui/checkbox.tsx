import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-4 w-4 shrink-0 rounded border-[var(--line)] accent-[var(--graphite)] transition focus-visible:!outline-none focus-visible:ring-0 focus-visible:shadow-[0_0_0_2px_rgba(20,20,18,0.22)] disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:outline aria-[invalid=true]:outline-2 aria-[invalid=true]:outline-[var(--danger)]',
        className
      )}
      type="checkbox"
      {...props}
    />
  );
}
