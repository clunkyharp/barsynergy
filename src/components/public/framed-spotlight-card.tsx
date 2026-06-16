import type { CSSProperties, ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export type FramedSpotlightCardProps = {
  href: string;
  title: string;
  actionLabel: string;
  media: ReactNode;
  eyebrow?: string;
  external?: boolean;
  className?: string;
  style?: CSSProperties;
  mediaClassName?: string;
  minHeight?: string;
};

export function FramedSpotlightCard({
  href,
  title,
  actionLabel,
  media,
  eyebrow,
  external,
  className,
  style,
  mediaClassName,
  minHeight
}: FramedSpotlightCardProps) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  const linkProps = external
    ? { rel: 'noreferrer', target: '_blank' as const }
    : {};

  return (
    <a
      className={cn(
        'group relative flex h-full min-h-[var(--spotlight-min-h,22rem)] flex-col overflow-hidden rounded-[28px] border border-[color-mix(in_srgb,var(--accent)_18%,transparent)] bg-[var(--editorial-dark-surface)] p-3 text-[var(--editorial-dark-text)] transition-[border-color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] motion-reduce:transition-none',
        className
      )}
      href={href}
      style={{ '--spotlight-min-h': minHeight, ...style } as CSSProperties}
      {...linkProps}
    >
      <div
        className={cn(
          'flex flex-1 items-center justify-center px-6 py-10',
          mediaClassName
        )}
      >
        {media}
      </div>

      <div className="flex flex-col items-start gap-4 rounded-[20px] bg-[var(--editorial-dark-surface-muted)] p-5 text-[var(--editorial-dark-text)]">
        {eyebrow ? (
            <span className="block text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[color-mix(in_srgb,var(--editorial-dark-text)_50%,transparent)]">
            {eyebrow}
          </span>
        ) : null}
        <span
          className={cn(
            displayFont.className,
            'block text-[clamp(1.25rem,1.6vw,1.6rem)] font-semibold uppercase leading-[1.05] tracking-tight text-[var(--accent-strong,var(--accent))]'
          )}
        >
          {title}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--editorial-dark-surface)] transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none">
          {actionLabel}
          <Arrow size={16} strokeWidth={2} />
        </span>
      </div>
    </a>
  );
}
