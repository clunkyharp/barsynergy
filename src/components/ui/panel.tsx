import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  tone?: 'default' | 'elevated' | 'inverse';
  padding?: 'sm' | 'md' | 'lg';
};

export function Panel({ className, tone = 'default', padding = 'md', ...props }: PanelProps) {
  return (
    <div
      className={cn(
        'inset-panel',
        tone === 'elevated' && 'bg-[var(--surface-elevated)] shadow-[var(--shadow-panel)]',
        tone === 'inverse' && 'border-[var(--border-inverse)] bg-[var(--surface-inverse)] text-white',
        padding === 'sm' && 'px-4 py-4',
        padding === 'md' && 'px-5 py-5',
        padding === 'lg' && 'px-6 py-6',
        className
      )}
      {...props}
    />
  );
}
