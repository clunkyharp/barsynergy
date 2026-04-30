import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ActionRowProps = HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'between';
};

export function ActionRow({ className, align = 'start', ...props }: ActionRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center',
        align === 'between' && 'sm:justify-between',
        className
      )}
      {...props}
    />
  );
}
