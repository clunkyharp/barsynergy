import { ArrowUpRight } from 'lucide-react';
import { PublicActionRow, PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';

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
  rowsHeading = 'Разделы',
  primaryLink,
  secondaryLink
}: EditorialPublicPageProps) {
  const hasDetails = metrics.length > 0 || rows.length > 0;
  const detailsTitle = rowsHeading === 'Разделы' ? 'Что здесь можно сделать' : rowsHeading;

  return (
    <div>
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-10 md:py-14">
        <div className="container relative grid gap-8 xl:grid-cols-[1fr_0.58fr] xl:items-start">
          <div className="min-w-0 xl:pt-4">
            <PublicEyebrow tone="muted">{eyebrow}</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3 max-w-5xl break-words text-[32px] sm:text-[44px] md:text-[64px] xl:text-[78px]" size="section">
              {title}
            </PublicDisplayTitle>
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
                      className="min-w-[9rem] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-2"
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
                    className="flex min-h-[12rem] flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4"
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
