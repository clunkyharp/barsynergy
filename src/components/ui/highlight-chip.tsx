import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type HighlightChipVariant = 'fresh' | 'editor';
type HighlightChipSurface = 'surface' | 'image';

type HighlightChipProps = HTMLAttributes<HTMLSpanElement> & {
  surface?: HighlightChipSurface;
  variant?: HighlightChipVariant;
};

export function HighlightChip({
  className,
  surface = 'surface',
  variant = 'fresh',
  ...props
}: HighlightChipProps) {
  const isImage = surface === 'image';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[var(--tracking-marker)]',
        variant === 'editor' && 'px-3 py-1 text-[11px]',
        isImage
          ? 'rounded-[var(--radius-sm)] bg-black/70 text-white backdrop-blur-sm'
          : 'bg-[var(--accent)] text-[var(--accent-contrast)]',
        className
      )}
      data-variant={variant}
      {...props}
    />
  );
}
