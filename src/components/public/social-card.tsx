import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

const variantStyles = {
  telegram: {
    accent: '#2a86d9'
  },
  whatsapp: {
    accent: '#238c46'
  },
  instagram: {
    accent: '#c14f7a'
  }
} as const;

export type SocialLinkCardProps = {
  actionLabel?: string;
  className?: string;
  description: string;
  helperText?: string;
  href: string;
  logoSrc: string;
  serviceName: string;
  title: string;
  typeLabel: string;
  variant: keyof typeof variantStyles;
};

export function SocialLinkCard({
  actionLabel = 'Открыть канал',
  className,
  description,
  helperText,
  href,
  logoSrc,
  serviceName,
  title,
  typeLabel,
  variant
}: SocialLinkCardProps) {
  const styles = variantStyles[variant];
  const accentStyle = { '--platform-accent': styles.accent } as CSSProperties;

  return (
    <a
      className={cn(
        'group relative flex h-full min-h-[13.5rem] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 transition duration-200 hover:border-[color-mix(in_srgb,var(--platform-accent)_34%,var(--border-default))] hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--field-focus-ring)] md:p-5',
        className
      )}
      href={href}
      rel="noreferrer"
      style={accentStyle}
      target="_blank"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--platform-accent)]" />
      <span className="flex items-start justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{typeLabel}</span>
          <span className="mt-1 block text-sm font-semibold leading-5 text-[var(--text)]">{serviceName}</span>
        </span>
        <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--platform-accent)_24%,var(--border-default))] bg-[color-mix(in_srgb,var(--platform-accent)_9%,var(--surface-wash))] p-2.5">
          <Image alt="" aria-hidden="true" className="h-full w-full object-contain" height={64} src={logoSrc} width={64} />
        </span>
      </span>
      <span className={`${displayFont.className} mt-5 block text-[1.8rem] font-semibold leading-none text-[var(--text)] group-hover:text-[var(--accent)]`}>
        {title}
      </span>
      <span className="mt-3 block text-sm leading-6 text-[var(--muted)]">{description}</span>
      {helperText ? (
        <span className="mt-4 block border-t border-[var(--line)] pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {helperText}
        </span>
      ) : null}
      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[var(--platform-accent)]">
        {actionLabel}
        <ArrowUpRight className="transition-transform group-hover:translate-x-1" size={16} strokeWidth={1.8} />
      </span>
    </a>
  );
}
