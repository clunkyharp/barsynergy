'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { SocialChannelVariant } from '@/components/public/social-channel-assets';
import { channelBackgrounds, channelAccentVars } from '@/components/public/social-channel-assets';
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
    <a
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[color-mix(in_srgb,var(--accent)_18%,transparent)] bg-[var(--editorial-dark-surface)] p-3 text-[var(--editorial-dark-text)] transition-[border-color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] motion-reduce:transition-none',
        className
      )}
      href={href}
      rel="noreferrer"
      style={style}
      target="_blank"
    >
      {media}
      <div className="flex flex-1 flex-col items-start gap-3 rounded-[20px] bg-[var(--editorial-dark-surface-muted)] p-5">
        {eyebrow ? (
          <span className="block text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[color-mix(in_srgb,var(--editorial-dark-text)_50%,transparent)]">
            {eyebrow}
          </span>
        ) : null}
        <span className="text-sm font-semibold leading-5 text-[var(--editorial-dark-text)]">
          {value}
        </span>
        {description ? (
          <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--editorial-dark-text)_60%,transparent)]">
            {description}
          </p>
        ) : null}
        <div className="mt-auto flex w-full flex-col gap-3 border-t border-[color-mix(in_srgb,var(--editorial-dark-text)_15%,transparent)] pt-4">
          {helper ? (
            <span className="text-[11px] font-semibold uppercase leading-4 tracking-[var(--tracking-eyebrow-sm)] text-[color-mix(in_srgb,var(--editorial-dark-text)_50%,transparent)]">
              {helper}
            </span>
          ) : null}
          <span className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--editorial-dark-surface)]">
            {actionLabel}
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2} />
          </span>
        </div>
      </div>
    </a>
  );
}
