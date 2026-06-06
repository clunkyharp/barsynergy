import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { getChannelAccentVar, type ChannelAccentTone } from '@/components/public/channel-accent';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

type ContactActionRowProps = {
  typeLabel: string;
  serviceName: string;
  descriptor?: string;
  href?: string;
  actionLabel?: string;
  icon?: LucideIcon;
  iconSrc?: string;
  iconAlt?: string;
  className?: string;
  layout?: 'row' | 'card';
  tone?: ChannelAccentTone;
  wrapDescriptor?: boolean;
};

function inferTone({
  href,
  serviceName,
  tone,
  typeLabel
}: Pick<ContactActionRowProps, 'href' | 'serviceName' | 'tone' | 'typeLabel'>): ChannelAccentTone {
  if (tone) {
    return tone;
  }

  const text = `${typeLabel} ${serviceName} ${href ?? ''}`.toLocaleLowerCase('ru');

  if (text.includes('telegram') || text.includes('t.me')) {
    return 'telegram';
  }

  if (text.includes('whatsapp') || text.includes('wa.me')) {
    return 'whatsapp';
  }

  if (text.includes('instagram')) {
    return 'instagram';
  }

  if (text.includes('email') || text.includes('mailto:') || text.includes('почта')) {
    return 'email';
  }

  if (text.includes('телефон') || text.includes('tel:')) {
    return 'phone';
  }

  if (text.includes('сайт') || text.includes('http')) {
    return 'website';
  }

  return 'neutral';
}

function ServiceMarker({
  icon: Icon,
  iconAlt = '',
  iconSrc,
  serviceName
}: Pick<ContactActionRowProps, 'icon' | 'iconAlt' | 'iconSrc' | 'serviceName'>) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--contact-accent)_24%,var(--border-default))] bg-[color-mix(in_srgb,var(--contact-accent)_9%,var(--surface-wash))] p-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--contact-accent)] sm:size-10 sm:text-[11px]">
      {iconSrc ? (
        <Image alt={iconAlt} aria-hidden={iconAlt ? undefined : true} className="h-full w-full object-contain opacity-95" height={64} src={iconSrc} width={64} />
      ) : Icon ? (
        <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
      ) : (
        serviceName.slice(0, 2).toLocaleUpperCase('ru')
      )}
    </span>
  );
}

export function ContactActionRow({
  actionLabel,
  className,
  descriptor,
  href,
  icon,
  iconAlt,
  iconSrc,
  layout = 'row',
  serviceName,
  tone,
  typeLabel,
  wrapDescriptor = false
}: ContactActionRowProps) {
  const isExternal = href?.startsWith('http');
  const isActionable = Boolean(href);
  const isCard = layout === 'card';
  const accent = getChannelAccentVar(inferTone({ href, serviceName, tone, typeLabel }));
  const style = { '--contact-accent': accent } as CSSProperties;
  const content = (
    <>
      <ServiceMarker icon={icon} iconAlt={iconAlt} iconSrc={iconSrc} serviceName={serviceName} />
      <span
        className={cn(
          'grid min-w-0 gap-1.5',
          isCard
            ? 'self-start'
            : wrapDescriptor
              ? 'sm:items-start'
              : 'sm:grid-cols-[minmax(8.5rem,0.46fr)_minmax(0,0.54fr)] sm:items-center sm:gap-4'
        )}
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{typeLabel}</span>
          <span className="mt-0.5 block text-sm font-semibold leading-5 text-[var(--text)]">{serviceName}</span>
        </span>
        {descriptor ? (
          <span className={cn('block min-w-0 break-words text-sm leading-5 text-[var(--muted)]', !isCard && !wrapDescriptor && 'sm:truncate')}>
            {descriptor}
          </span>
        ) : null}
      </span>
      {isActionable ? (
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-2 justify-self-start text-[13px] font-semibold text-[var(--contact-accent)]',
            isCard ? 'col-span-2 mt-3 self-end' : 'col-start-2 sm:col-start-auto sm:justify-self-end sm:text-sm'
          )}
        >
          {actionLabel ?? 'Связаться'}
          <ArrowUpRight
            className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none"
            size={16}
            strokeWidth={1.8}
          />
        </span>
      ) : null}
    </>
  );

  const rowClassName = cn(
    'group relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
    isCard
      ? 'grid min-h-[9.5rem] grid-cols-[auto_minmax(0,1fr)] content-start items-start gap-3 px-4 py-4'
      : 'grid min-h-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 px-3 py-2.5 sm:min-h-14 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:py-3',
    isActionable &&
      'hover:border-[color-mix(in_srgb,var(--contact-accent)_34%,var(--border-default))] hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
    className
  );

  if (!href) {
    return (
      <div className={rowClassName} style={style}>
        {content}
      </div>
    );
  }

  return (
    <AppLink className={rowClassName} href={href} rel={isExternal ? 'noreferrer' : undefined} style={style} target={isExternal ? '_blank' : undefined}>
      {content}
    </AppLink>
  );
}
