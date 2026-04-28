import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-12 w-full rounded-[1rem] border border-black/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] px-4 text-[15px] leading-6 text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none transition placeholder:text-[color:rgba(95,86,75,0.82)] hover:border-black/30 hover:bg-white focus:border-[var(--graphite)] focus:bg-white focus-visible:border-[var(--graphite)] focus-visible:!outline-none focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(20,20,18,0.1)] active:border-[var(--graphite)] disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-[var(--surface-muted)] disabled:text-[var(--muted)] disabled:shadow-none disabled:file:bg-black/50 disabled:opacity-70 aria-[invalid=true]:border-[var(--danger)] aria-[invalid=true]:bg-white aria-[invalid=true]:shadow-[0_0_0_3px_rgba(159,47,47,0.08)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--graphite)] file:px-4 file:py-2 file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-white hover:file:bg-black',
        className
      )}
      {...props}
    />
  );
}
