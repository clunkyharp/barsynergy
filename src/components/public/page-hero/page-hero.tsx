import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  PublicBreadcrumbs,
  PublicBodyText,
  PublicDisplayTitle,
  PublicEyebrow
} from '@/components/public/public-primitives';
import { cn } from '@/lib/utils';
import { BottomSection } from './page-hero-bottom';
import type {
  Action,
  BottomSection as BottomSectionType,
  BreadcrumbItem,
  Media,
  PageHeroChip,
  PageHeroStat,
  PageHeroBenefit,
  PageHeroProps,
  PageHeroTone
} from './page-hero-types';

// --- Deprecated legacy props (mapped internally) ---
type PageHeroLegacyProps = {
  breadcrumbLabel?: string;
  breadcrumbItems?: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  subtitle?: string;
  subtitleNode?: ReactNode;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  actionsSlot?: ReactNode;
  chips?: PageHeroChip[];
  stats?: PageHeroStat[];
  benefits?: PageHeroBenefit[];
  imageSrc?: string;
  imageAlt?: string;
  mediaSlot?: ReactNode;
  tone?: PageHeroTone;
  density?: 'default' | 'compact';
};

function isLegacyProps(props: PageHeroProps | PageHeroLegacyProps): props is PageHeroLegacyProps {
  return 'breadcrumbLabel' in props || 'primaryCta' in props;
}

function mapLegacyToProps(legacy: PageHeroLegacyProps): PageHeroProps {
  const breadcrumbs: BreadcrumbItem[] = legacy.breadcrumbLabel
    ? (legacy.breadcrumbItems ?? [{ href: '/', label: 'Главная' }, { label: legacy.breadcrumbLabel }])
    : [];

  const actions: Action[] = [];
  if (legacy.primaryCta) {
    actions.push({ ...legacy.primaryCta, kind: 'primary' });
  }
  if (legacy.secondaryCta) {
    actions.push({ ...legacy.secondaryCta, kind: 'secondary' });
  }
  const limitedActions = actions.length > 0 ? (actions.slice(0, 2) as unknown as readonly [Action, Action?]) : undefined;

  let bottom: BottomSectionType | undefined;
  if (legacy.chips && legacy.chips.length > 0) {
    bottom = { kind: 'chips', items: legacy.chips };
  } else if (legacy.stats && legacy.stats.length > 0) {
    bottom = { kind: 'stats', items: legacy.stats };
  } else if (legacy.benefits && legacy.benefits.length > 0) {
    bottom = { kind: 'benefits', items: legacy.benefits };
  }

  let media: Media | undefined;
  if (legacy.mediaSlot) {
    media = { kind: 'slot', children: legacy.mediaSlot };
  } else if (legacy.imageSrc) {
    media = { kind: 'image', src: legacy.imageSrc, alt: legacy.imageAlt ?? '' };
  }

  return {
    breadcrumbs,
    eyebrow: legacy.eyebrow,
    title: legacy.title,
    subtitle: legacy.subtitle,
    actions: limitedActions,
    children: legacy.actionsSlot ?? undefined,
    bottom,
    media,
    tone: legacy.tone ?? 'dark',
    density: legacy.density ?? 'default',
  };
}

function ActionsRow({ actions, density, tone }: { actions: readonly [Action, Action?]; density: 'default' | 'compact'; tone?: PageHeroTone }) {
  const items = actions.filter(Boolean) as [Action, ...Action[]];
  if (items.length === 0) return null;

  const isDark = tone === 'dark';
  const isGraphite = tone === 'graphite';

  return (
    <div className={cn('flex flex-col gap-2.5 sm:flex-row', density === 'compact' ? 'mt-5' : 'mt-6')}>
      {items.map((action) => (
        <Button
          className={cn(
            'rounded-[var(--radius-md)] text-sm leading-5',
            density === 'compact' ? 'min-h-10 px-4' : 'min-h-11 px-5'
          )}
          href={action.href}
          key={`${action.href}-${action.label}`}
          variant={action.kind === 'secondary' ? (isDark || isGraphite ? 'on-dark' : 'secondary') : 'primary'}
        >
          {action.label}
          <ArrowUpRight size={16} />
        </Button>
      ))}
    </div>
  );
}

function SectionMedia({ media }: { media: Media }) {
  if (media.kind === 'image') {
    return (
      <>
        <Image
          alt={media.alt}
          className="pointer-events-none object-cover object-[65%_center] select-none"
          fill
          priority
          sizes="100vw"
          src={media.src}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(90deg, rgba(27,30,37,0.94) 0%, rgba(27,30,37,0.78) 34%, rgba(27,30,37,0.34) 62%, rgba(27,30,37,0.08) 100%), linear-gradient(180deg, rgba(27,30,37,0.18) 0%, transparent 28%, transparent 58%, rgba(27,30,37,0.74) 100%)'
          }}
        />
      </>
    );
  }

  if (media.kind === 'slot') {
    return <div className="min-w-0 shrink-0">{media.children}</div>;
  }

  return null;
}

function normalizeHeroText(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

export function PageHero(props: PageHeroProps | PageHeroLegacyProps) {
  const normalized = isLegacyProps(props) ? mapLegacyToProps(props) : props;
  const { breadcrumbs = [], eyebrow, title, subtitle, actions, children, bottom, media, tone, density = 'default' } = normalized;

  const isDark = tone === 'dark';
  const isGraphite = tone === 'graphite';
  const isCompact = density === 'compact';

  const heroClasses = cn(
    'relative isolate overflow-hidden border-b border-[var(--line)] pt-6 md:pt-8 max-sm:pt-14',
    isDark && 'bg-[var(--editorial-dark-surface)] text-[var(--editorial-dark-text)]',
    isGraphite && 'background-zone background-zone-graphite',
    !isDark && !isGraphite && 'background-zone background-zone-hero',
    !isDark && 'pb-6'
  );

  const graphiteStyle = isGraphite && media?.kind === 'image'
    ? {
        backgroundImage: [
          `linear-gradient(105deg, rgba(10,9,8,0.90) 0%, rgba(12,11,9,0.72) 50%, rgba(10,9,8,0.52) 100%)`,
          `url("${media.src}")`
        ].join(', '),
        backgroundSize: 'cover' as const,
        backgroundPosition: 'center' as const,
        backgroundRepeat: 'no-repeat' as const
      }
    : undefined;
  const normalizedTitle = normalizeHeroText(title);
  const normalizedEyebrow = normalizeHeroText(eyebrow);
  const lastBreadcrumbLabel = breadcrumbs[breadcrumbs.length - 1]?.label ?? '';
  const normalizedLastBreadcrumbLabel = normalizeHeroText(lastBreadcrumbLabel);
  const shouldRenderBreadcrumbs = breadcrumbs.length > 0 && !(breadcrumbs.length === 1 && normalizedLastBreadcrumbLabel === normalizedTitle);
  const shouldRenderEyebrow = Boolean(eyebrow) && normalizedEyebrow !== normalizedTitle;

  return (
    <section
      aria-labelledby="page-hero-title"
      className={heroClasses}
      style={graphiteStyle}
    >
      {isDark && media?.kind === 'image' ? <SectionMedia media={media} /> : null}

      <div className="relative z-[2]">
        <div className="container">
          <div className={cn(
            media?.kind === 'slot' ? 'grid items-center gap-8 xl:grid-cols-[minmax(0,1fr)_auto]' : ''
          )}>
            <div className={cn(
              'min-w-0',
              isCompact ? 'pb-7 md:pb-10' : 'pb-8 md:pb-10'
            )}>
              <div className="max-w-[42rem]">
                {shouldRenderBreadcrumbs ? (
                  <PublicBreadcrumbs
                    current={lastBreadcrumbLabel}
                    items={
                      breadcrumbs.length === 1 && breadcrumbs[0]?.href !== '/'
                        ? [{ href: '/', label: 'Главная' }, ...breadcrumbs.slice(0, -1)]
                        : breadcrumbs.slice(0, -1)
                    }
                  />
                ) : null}
                {shouldRenderEyebrow ? (
                  <PublicEyebrow className="mt-3" tone={isDark ? 'inverse' : 'accent'}>{eyebrow}</PublicEyebrow>
                ) : null}

                <PublicDisplayTitle
                  as="h1"
                  className={cn(
                    'break-words',
                    isCompact
                      ? 'mt-2 max-w-3xl text-[clamp(1.75rem,3.5vw,2.6rem)]'
                      : 'mt-3 max-w-3xl text-[clamp(2.2rem,4.4vw,3.4rem)]',
                  )}
                  id="page-hero-title"
                  size="section"
                >
                  {title}
                </PublicDisplayTitle>

                {subtitle ? (
                  <PublicBodyText
                    className={cn(
                      isCompact ? 'mt-2 max-w-lg text-sm leading-6' : 'mt-3 max-w-xl',
                      isDark ? 'text-[var(--editorial-dark-muted)]' : 'text-[var(--muted)]'
                    )}
                    size={isCompact ? 'sm' : 'md'}
                    tone={isDark ? 'inverse' : 'muted'}
                  >
                    {subtitle}
                  </PublicBodyText>
                ) : null}

                {actions && actions.length > 0 ? (
                  <ActionsRow actions={actions} density={density} tone={tone} />
                ) : null}

                {children ? (
                  <div className={cn(isCompact ? 'mt-4' : 'mt-5')}>{children}</div>
                ) : null}
              </div>
            </div>

            {media?.kind === 'slot' ? <SectionMedia media={media} /> : null}
          </div>
        </div>
      </div>

      {bottom ? <BottomSection bottom={bottom} tone={tone} /> : null}
    </section>
  );
}
