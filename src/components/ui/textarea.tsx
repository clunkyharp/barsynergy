import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-32 w-full resize-none rounded-[1.15rem] border border-black/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.82))] px-4 py-3.5 text-[15px] leading-7 text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none transition placeholder:text-[color:rgba(95,86,75,0.82)] hover:border-black/30 hover:bg-white focus:border-[var(--graphite)] focus:bg-white focus-visible:border-[var(--graphite)] focus-visible:!outline-none focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(20,20,18,0.1)] active:border-[var(--graphite)] disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-[var(--surface-muted)] disabled:text-[var(--muted)] disabled:shadow-none disabled:opacity-70 aria-[invalid=true]:border-[var(--danger)] aria-[invalid=true]:bg-white aria-[invalid=true]:shadow-[0_0_0_3px_rgba(159,47,47,0.08)]',
        className
      )}
      {...props}
    />
  );
}
