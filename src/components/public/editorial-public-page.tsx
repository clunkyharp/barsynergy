import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';

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
  metrics: Metric[];
  rows: Row[];
  primaryLink: LinkItem;
  secondaryLink?: LinkItem;
};

export function EditorialPublicPage({
  eyebrow,
  title,
  description,
  summary,
  metrics,
  rows,
  primaryLink,
  secondaryLink
}: EditorialPublicPageProps) {
  return (
    <div>
      <section className="relative overflow-hidden editorial-grid border-b border-black/20 py-10 md:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(153,44,38,0.08),transparent_18%),radial-gradient(circle_at_82%_26%,rgba(255,255,255,0.54),transparent_18%),radial-gradient(circle_at_74%_80%,rgba(20,20,18,0.05),transparent_24%)]"
        />
        <div className="container relative grid gap-8 xl:grid-cols-[1.28fr_0.52fr] xl:items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{eyebrow}</p>
            <h1 className={`${displayFont.className} display-tight mt-3 max-w-5xl break-words text-[32px] sm:text-[44px] md:text-[64px] xl:text-[78px]`}>
              {title}
            </h1>
          </div>
          <div className="min-w-0 border-l border-black/20 pl-5">
            <p className="max-w-[19rem] text-base leading-7 text-[var(--muted)] sm:max-w-full md:max-w-md">{description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                className="min-h-12 w-full max-w-full rounded-none border-[var(--graphite)] bg-[var(--graphite)] px-5 leading-5 tracking-[0.06em] hover:bg-black sm:w-auto"
                href={primaryLink.href}
              >
                {primaryLink.label}
                <ArrowUpRight size={18} />
              </Button>
              {secondaryLink ? (
                <Button
                  className="min-h-12 w-full max-w-full rounded-none border-black/25 px-5 leading-5 tracking-[0.06em] sm:w-auto"
                  href={secondaryLink.href}
                  variant="secondary"
                >
                  {secondaryLink.label}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <div>
            <h2 className={`${displayFont.className} display-tight text-[44px] md:text-[58px]`}>Контекст</h2>
            <p className="mt-5 max-w-[20rem] text-sm leading-7 text-[var(--muted)] sm:max-w-md">{summary}</p>
          </div>
          <div className="grid gap-0 border border-black/20 md:grid-cols-3">
            {metrics.map((metric) => (
              <div className="border-b border-black/20 p-5 md:border-b-0 md:border-r md:last:border-r-0" key={metric.label}>
                <p className={`${displayFont.className} display-face text-[44px] leading-none text-[var(--text)] md:text-[52px]`}>
                  {metric.value}
                </p>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <h2 className={`${displayFont.className} display-tight text-[44px] md:text-[58px]`}>Разделы</h2>
          <div className="border-t border-black/20">
            {rows.map((row) => (
              <article className="grid gap-4 border-b border-black/20 py-6 md:grid-cols-[0.22fr_0.5fr_0.78fr]" key={row.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{row.label}</p>
                <h3 className="text-xl font-semibold uppercase leading-7">{row.title}</h3>
                <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">{row.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
