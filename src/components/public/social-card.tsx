import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export type SocialCardProps = {
  title: string;
  description: string;
  helperText: string;
  buttonLabel: string;
  href: string;
  logoSrc: string;
  variant: keyof typeof variantStyles;
};

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

export function SocialCard({ title, description, helperText, buttonLabel, href, logoSrc, variant }: SocialCardProps) {
  const styles = variantStyles[variant];
  const accentStyle = { '--platform-accent': styles.accent } as CSSProperties;

  return (
    <article
      aria-label={title}
      className="social-card group relative min-h-[318px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/32 hover:bg-[var(--surface-wash-strong)] focus-within:border-[var(--accent)]/42 md:min-h-[338px]"
      style={accentStyle}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--platform-accent)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/grain.svg')] opacity-[0.045]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[color-mix(in_srgb,var(--platform-accent)_12%,transparent)] blur-3xl" />

      <div className="relative z-[1] flex h-full flex-col p-5 sm:p-6 md:p-7">
        <div className="flex justify-end">
          <span className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--platform-accent)_24%,var(--border-default))] bg-[color-mix(in_srgb,var(--platform-accent)_10%,transparent)] p-2.5">
            <Image alt="" aria-hidden="true" className="h-full w-full object-contain" height={64} src={logoSrc} width={64} />
          </span>
        </div>

        <div className="mt-8 min-w-0">
          <h3 className={`${displayFont.className} display-tight text-[31px] font-semibold leading-[1.02] text-[var(--text)] md:text-[34px]`}>
            {title}
          </h3>
          <p className="mt-4 max-w-[29rem] text-sm leading-7 text-[var(--muted)]">{description}</p>
        </div>

        <div className="mt-auto pt-7">
          <p className="border-t border-[var(--line)] pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {helperText}
          </p>
          <Button
            className="mt-5 w-full max-w-[220px] rounded-[var(--radius-md)] px-5"
            href={href}
            rel="noreferrer"
            size="md"
            target="_blank"
            variant="primary"
          >
            <span>{buttonLabel}</span>
            <ArrowUpRight className="shrink-0" size={16} />
          </Button>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute bottom-5 right-5 hidden opacity-[0.035] md:block">
        <Image
          alt=""
          aria-hidden="true"
          className="h-28 w-28 object-contain"
          height={256}
          src={logoSrc}
          width={256}
        />
      </div>
    </article>
  );
}
