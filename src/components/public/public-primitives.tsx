import type { HTMLAttributes } from 'react';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type PublicEyebrowTone = 'accent' | 'muted' | 'inverse';
type PublicDisplayTitleSize = 'hero' | 'section' | 'card' | 'legal';
type PublicBodyTone = 'default' | 'muted' | 'inverse';
type PublicBodySize = 'sm' | 'md';

export function PublicEyebrow({
  className,
  tone = 'accent',
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  tone?: PublicEyebrowTone;
}) {
  return (
    <p
      className={cn(
        'text-[11px] font-semibold uppercase tracking-[0.16em]',
        tone === 'accent' && 'text-[var(--accent)]',
        tone === 'muted' && 'text-[var(--muted)]',
        tone === 'inverse' && 'text-white/58',
        className
      )}
      {...props}
    />
  );
}

export function PublicDisplayTitle({
  as = 'h2',
  className,
  size = 'section',
  ...props
}: HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3';
  size?: PublicDisplayTitleSize;
}) {
  const Component = as;

  return (
    <Component
      className={cn(
        displayFont.className,
        'display-tight',
        size === 'hero' && 'max-w-6xl text-[clamp(2.7rem,5vw,5.5rem)]',
        size === 'section' && 'text-[44px] md:text-[58px]',
        size === 'card' && 'text-[34px] md:text-[44px]',
        size === 'legal' && 'max-w-3xl break-words text-[34px] sm:text-[42px] md:text-[44px]',
        className
      )}
      {...props}
    />
  );
}

export function PublicBodyText({
  className,
  size = 'sm',
  tone = 'muted',
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  size?: PublicBodySize;
  tone?: PublicBodyTone;
}) {
  return (
    <p
      className={cn(
        size === 'md' ? 'text-base leading-7' : 'text-sm leading-7',
        tone === 'default' && 'text-[var(--text)]',
        tone === 'muted' && 'text-[var(--muted)]',
        tone === 'inverse' && 'text-white/72',
        className
      )}
      {...props}
    />
  );
}

export function PublicActionRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-8 flex flex-wrap gap-4', className)} {...props} />;
}
