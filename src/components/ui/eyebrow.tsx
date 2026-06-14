import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type EyebrowTone = 'accent' | 'muted' | 'inverse';

type EyebrowProps = HTMLAttributes<HTMLParagraphElement> & {
  tone?: EyebrowTone;
};

export function Eyebrow({ className, tone = 'accent', ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)]',
        tone === 'accent' && 'text-[var(--accent)]',
        tone === 'muted' && 'text-[var(--muted)]',
        tone === 'inverse' && 'text-[var(--editorial-dark-label)]',
        className
      )}
      {...props}
    />
  );
}
