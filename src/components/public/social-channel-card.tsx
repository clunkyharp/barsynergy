'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Copy } from 'lucide-react';
import type { SocialChannelVariant } from '@/components/public/social-channel-assets';
import { channelBackgrounds, channelAccentVars } from '@/components/public/social-channel-assets';
import { useCopy } from '@/lib/hooks/use-copy';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type BaseSocialChannelCardProps = {
  variant: SocialChannelVariant;
  eyebrow?: string;
  href: string;
  actionLabel: string;
  className?: string;
};

type SocialChannelCardLinkMode = BaseSocialChannelCardProps & {
  mode: 'link';
  title: string;
};

type SocialChannelCardContactMode = BaseSocialChannelCardProps & {
  mode: 'contact';
  value: string;
  description?: string;
  helper?: string;
};

export type SocialChannelCardProps = SocialChannelCardLinkMode | SocialChannelCardContactMode;

export function SocialChannelCard(props: SocialChannelCardProps) {
  const { mode, variant, eyebrow, href, actionLabel, className } = props;
  const { copy } = useCopy();
  const bgSrc = channelBackgrounds[variant];
  const accentVar = channelAccentVars[variant];
  const style = { '--channel-accent': accentVar } as CSSProperties;

  const media = (
    <div className="flex items-center justify-center px-6 py-10">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px]">
        {bgSrc ? (
          <Image
            alt=""
            className="object-cover brightness-[0.7] saturate-[0.6]"
            fill
            sizes="(min-width: 1024px) 32rem, (min-width: 640px) 24rem, 100vw"
            src={bgSrc}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--editorial-dark-surface)] via-[var(--editorial-dark-surface)]/40 to-transparent" />
      </div>
    </div>
  );

  if (mode === 'link') {
    const { title } = props;

    return (
      <a
        className={cn(
          'group relative flex min-h-[22rem] flex-col overflow-hidden rounded-[28px] border border-[color-mix(in_srgb,var(--accent)_18%,transparent)] bg-[var(--editorial-dark-surface)] p-3 text-[var(--editorial-dark-text)] transition-[border-color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] motion-reduce:transition-none',
          className
        )}
        href={href}
        rel="noreferrer"
        style={style}
        target="_blank"
      >
        {media}
        <div className="flex flex-col items-start gap-4 rounded-[20px] bg-[var(--editorial-dark-surface-muted)] p-5">
          {eyebrow ? (
            <span className="block text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[color-mix(in_srgb,var(--editorial-dark-text)_50%,transparent)]">
              {eyebrow}
            </span>
          ) : null}
          <span className={cn(displayFont.className, 'block text-[clamp(1.25rem,1.6vw,1.6rem)] font-semibold uppercase leading-[1.05] tracking-tight text-[var(--accent-strong,var(--accent))]')}>
            {title}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--editorial-dark-surface)] transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none">
            {actionLabel}
            <ArrowRight size={16} strokeWidth={2} />
          </span>
        </div>
      </a>
    );
  }

  const { value, description, helper } = props;

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[28px] border border-[color-mix(in_srgb,var(--accent)_18%,transparent)] bg-[var(--editorial-dark-surface)] p-3 text-[var(--editorial-dark-text)] transition-[border-color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] motion-reduce:transition-none',
        className
      )}
      style={style}
    >
      {media}
      <div className="flex flex-col items-start gap-3 rounded-[20px] bg-[var(--editorial-dark-surface-muted)] p-5">
        {eyebrow ? (
          <span className="block text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[color-mix(in_srgb,var(--editorial-dark-text)_50%,transparent)]">
            {eyebrow}
          </span>
        ) : null}
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="break-all text-sm font-semibold leading-5 text-[var(--editorial-dark-text)]">
            {value}
          </span>
          <button
            aria-label={`Копировать ${value}`}
            className="inline-grid size-7 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--editorial-dark-text)_18%,transparent)] bg-[color-mix(in_srgb,var(--editorial-dark-surface)_82%,transparent)] text-[color-mix(in_srgb,var(--editorial-dark-text)_55%,transparent)] transition-colors duration-150 ease-in-out hover:border-[color-mix(in_srgb,var(--channel-accent)_42%,transparent)] hover:text-[var(--editorial-dark-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void copy(value);
            }}
            type="button"
          >
            <Copy aria-hidden="true" size={13} strokeWidth={1.8} />
          </button>
        </div>
        {description ? (
          <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--editorial-dark-text)_60%,transparent)]">
            {description}
          </p>
        ) : null}
        <div className="flex w-full items-center justify-between gap-3 border-t border-[color-mix(in_srgb,var(--editorial-dark-text)_15%,transparent)] pt-4">
          {helper ? (
            <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[color-mix(in_srgb,var(--editorial-dark-text)_50%,transparent)]">
              {helper}
            </span>
          ) : null}
          <a
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--editorial-dark-surface)] transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] hover:translate-x-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
            href={href}
            rel="noreferrer"
            target="_blank"
          >
            {actionLabel}
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2} />
          </a>
        </div>
      </div>
    </article>
  );
}
