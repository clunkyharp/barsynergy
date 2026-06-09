import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { PublicActionRow, PublicBodyText, PublicBreadcrumbs, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { cn } from '@/lib/utils';

type Metric = {
  value: string;
  label: string;
};

type Row = {
  label: string;
  title: string;
  description: string;
};

type LinkItem = {
  label: string;
  href: string;
};

type EditorialPublicPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
  path?: string;
  breadcrumbLabel?: string;
  chips?: string[];
  density?: 'editorial' | 'compact' | 'task' | 'offer';
  summaryHeading?: string;
  heroSummaryVariant?: 'default' | 'expanded';
  heroVariant?: 'minimal' | 'split' | 'cover';
  showHeroSummary?: boolean;
  metrics: Metric[];
  rows: Row[];
  rowsHeading?: string;
  primaryLink?: LinkItem;
  secondaryLink?: LinkItem;
  accentGradient?: string;
  accentIcon?: LucideIcon;
};

export function EditorialPublicPage({
  eyebrow,
  title,
  description,
  summary,
  path,
  breadcrumbLabel,
  chips,
  density = 'editorial',
  summaryHeading = 'Коротко',
  heroVariant = 'minimal',
  showHeroSummary = true,
  metrics,
  rows,
  rowsHeading = 'Разделы',
  primaryLink,
  secondaryLink,
  accentGradient,
  accentIcon: AccentIcon
}: EditorialPublicPageProps) {
  const hasDetails = metrics.length > 0 || rows.length > 0;
  const detailsTitle = rowsHeading === 'Разделы' ? 'Направления' : rowsHeading;
  const isCompact = density !== 'editorial';
  const useSplitHero = showHeroSummary && heroVariant === 'split';
  const isCoverHero = heroVariant === 'cover';
  const actionRow = primaryLink || secondaryLink ? (
    <PublicActionRow className={cn(isCompact ? '' : 'mt-6', 'shrink-0')}>
      {primaryLink ? (
        <Button
          className={cn(
            'w-full max-w-full rounded-[var(--radius-md)] leading-5 tracking-normal sm:w-auto',
            isCompact ? 'min-h-10 px-4 text-sm' : 'min-h-12 px-5'
          )}
          href={primaryLink.href}
        >
          {primaryLink.label}
          <ArrowUpRight size={isCompact ? 16 : 18} />
        </Button>
      ) : null}
      {secondaryLink ? (
        <Button
          className={cn(
            'w-full max-w-full rounded-[var(--radius-md)] leading-5 tracking-normal sm:w-auto',
            isCompact ? 'min-h-10 px-4 text-sm' : 'min-h-12 px-5'
          )}
          href={secondaryLink.href}
          variant="secondary"
        >
          {secondaryLink.label}
        </Button>
      ) : null}
    </PublicActionRow>
  ) : null;

  return (
    <div>
      {path ? <JsonLd data={buildStaticPageBreadcrumbJsonLd(path, breadcrumbLabel ?? eyebrow)} /> : null}
      <section
        className={cn(
          'background-zone background-zone-hero border-b border-[var(--line)]',
          isCompact ? 'pt-3 pb-7 md:pt-3 md:pb-10' : 'pt-3 pb-10 md:pt-3 md:pb-14',
          isCoverHero && 'relative isolate overflow-hidden bg-[var(--editorial-dark-surface)] text-[var(--editorial-dark-text)]',
          accentGradient && !isCoverHero && 'relative overflow-hidden'
        )}
      >
        {isCoverHero ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(150,112,30,0.2),transparent_24rem),linear-gradient(135deg,rgba(17,16,14,0.98),rgba(23,19,17,0.82)_58%,rgba(95,18,18,0.34))]"
          />
        ) : accentGradient ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: accentGradient }} />
        ) : null}
        <div className="container relative">
          {isCompact && !useSplitHero ? (
            <>
              <div className="flex items-center gap-3">
                {AccentIcon ? (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-white">
                    <AccentIcon size={17} strokeWidth={1.8} />
                  </span>
                ) : null}
                <PublicBreadcrumbs current={breadcrumbLabel ?? eyebrow} />
              </div>
              <PublicDisplayTitle
                as="h1"
                className="mt-3 max-w-3xl break-words text-[32px] sm:text-[38px] md:text-[44px] xl:text-[50px]"
                size="section"
              >
                {title}
              </PublicDisplayTitle>
              {chips && chips.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex cursor-default items-center rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--muted)] transition-opacity hover:opacity-80"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-5 border-t border-[var(--line)] pt-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <PublicBodyText className="max-w-2xl text-[var(--text)]" size="sm" tone="default">
                    {description}
                  </PublicBodyText>
                  {actionRow}
                </div>
              </div>
            </>
          ) : (
            <div className={useSplitHero ? 'grid gap-7 xl:grid-cols-[minmax(0,0.82fr)_minmax(20rem,0.5fr)] xl:items-end' : undefined}>
              <div className={cn('min-w-0', 'xl:pt-4')}>
                <PublicBreadcrumbs current={breadcrumbLabel ?? eyebrow} />
                <PublicDisplayTitle
                  as="h1"
                  className="mt-5 max-w-4xl break-words text-[32px] sm:text-[44px] md:text-[58px] xl:text-[68px]"
                  size="section"
                >
                  {title}
                </PublicDisplayTitle>
                <div className="mt-5 flex max-w-5xl flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <PublicBodyText className="max-w-3xl text-[var(--text)]" size="md" tone="default">
                    {description}
                  </PublicBodyText>
                  {useSplitHero ? null : actionRow}
                </div>
              </div>
              {useSplitHero ? (
                <div className="min-w-0 border-t border-[var(--line)] pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                  <PublicEyebrow tone="muted">{summaryHeading}</PublicEyebrow>
                  <PublicBodyText className="mt-3 max-w-none" size="sm">
                    {summary}
                  </PublicBodyText>
                  {actionRow}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
      {hasDetails ? (
        <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-8 md:py-10">
          <div className="container">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <PublicEyebrow tone="muted">{summaryHeading}</PublicEyebrow>
                <PublicDisplayTitle as="h2" className="mt-3 max-w-3xl !text-[clamp(1.85rem,3vw,2.8rem)]" size="card">
                  {detailsTitle}
                </PublicDisplayTitle>
              </div>
              {metrics.length > 0 ? (
                <dl className="flex max-w-3xl flex-wrap gap-2">
                  {metrics.map((metric) => (
                    <div
                      className="public-card-shell min-w-[9rem] px-3 py-2"
                      key={`${metric.value}-${metric.label}`}
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">{metric.label}</dt>
                      <dd className="mt-1 text-lg font-semibold leading-6 text-[var(--text)]">{metric.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            {rows.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-3">
                {rows.map((row) => (
                  <article
                    className="public-card-shell flex min-h-[12rem] flex-col p-4"
                    key={`${row.label}-${row.title}`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{row.label}</p>
                    <h2 className="mt-4 text-lg font-semibold leading-7 text-[var(--text)]">{row.title}</h2>
                    <PublicBodyText className="mt-2 max-w-3xl" size="sm">
                      {row.description}
                    </PublicBodyText>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
