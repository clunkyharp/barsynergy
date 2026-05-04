import { ArrowUpRight } from 'lucide-react';
import { PublicActionRow, PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';

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
  summaryHeading?: string;
  metrics: Metric[];
  rows: Row[];
  rowsHeading?: string;
  primaryLink: LinkItem;
  secondaryLink?: LinkItem;
};

export function EditorialPublicPage({
  eyebrow,
  title,
  description,
  summary,
  summaryHeading = 'Коротко',
  metrics,
  rows,
  rowsHeading = 'Что внутри',
  primaryLink,
  secondaryLink
}: EditorialPublicPageProps) {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--line)] py-10 md:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,var(--background)_45%,var(--surface-muted)_100%),radial-gradient(circle_at_82%_26%,var(--accent-soft),transparent_22%),radial-gradient(circle_at_74%_80%,rgba(20,20,18,0.05),transparent_24%)]"
        />
        <div className="container relative grid gap-8 xl:grid-cols-[1fr_0.58fr] xl:items-start">
          <div className="min-w-0 xl:pt-4">
            <PublicEyebrow tone="muted">{eyebrow}</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3 max-w-5xl break-words text-[32px] sm:text-[44px] md:text-[64px] xl:text-[78px]" size="section">
              {title}
            </PublicDisplayTitle>
            {metrics.length > 0 ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:max-w-4xl">
                {metrics.map((metric) => (
                  <div className="border-t border-[var(--line)] pt-3" key={`${metric.value}-${metric.label}`}>
                    <p className="text-[1.6rem] font-semibold leading-none text-[var(--text)]">{metric.value}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="min-w-0 border-t border-[var(--line)] pt-5 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-4">
            <PublicEyebrow tone="muted">{summaryHeading}</PublicEyebrow>
            <PublicBodyText className="mt-3 max-w-[36rem] text-[var(--text)]" size="md" tone="default">
              {description}
            </PublicBodyText>
            <PublicBodyText className="mt-5 max-w-[36rem]" size="sm">
              {summary}
            </PublicBodyText>
            <PublicActionRow>
              <Button
                className="min-h-12 w-full max-w-full rounded-[var(--radius-md)] px-5 leading-5 tracking-normal sm:w-auto"
                href={primaryLink.href}
              >
                {primaryLink.label}
                <ArrowUpRight size={18} />
              </Button>
              {secondaryLink ? (
                <Button
                  className="min-h-12 w-full max-w-full rounded-[var(--radius-md)] px-5 leading-5 tracking-normal sm:w-auto"
                  href={secondaryLink.href}
                  variant="secondary"
                >
                  {secondaryLink.label}
                </Button>
              ) : null}
            </PublicActionRow>
          </div>
        </div>
      </section>

      {rows.length > 0 ? (
        <section className="border-b border-[var(--line)] py-8 md:py-10">
          <div className="container grid gap-6 xl:grid-cols-[minmax(14rem,0.36fr)_minmax(0,1fr)]">
            <div>
              <PublicEyebrow>{rowsHeading}</PublicEyebrow>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {rows.map((row) => (
                <Panel className="border-[var(--border-default)] bg-[var(--surface-wash)]" key={`${row.label}-${row.title}`} padding="lg">
                  <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" variant="filter">
                    {row.label}
                  </MetaChip>
                  <h2 className="mt-4 text-[1.1rem] font-semibold leading-7 text-[var(--text)]">{row.title}</h2>
                  <PublicBodyText className="mt-3">{row.description}</PublicBodyText>
                </Panel>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
