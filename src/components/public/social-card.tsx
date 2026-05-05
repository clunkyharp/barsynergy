import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';

const variantStyles = {
  telegram: {
    label: 'TELEGRAM',
    accent: '#2a86d9'
  },
  whatsapp: {
    label: 'WHATSAPP',
    accent: '#238c46'
  },
  instagram: {
    label: 'INSTAGRAM',
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
        <div className="flex items-start justify-between gap-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{styles.label}</p>
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
