import { ArrowUpRight } from 'lucide-react';
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
  routeLabel: string;
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
  routeLabel,
  summary,
  metrics,
  rows,
  primaryLink,
  secondaryLink
}: EditorialPublicPageProps) {
  return (
    <div>
      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.28fr_0.92fr_0.5fr] xl:items-end">
          <div className="hidden h-full border-l border-black/20 pl-4 xl:flex xl:flex-col xl:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{eyebrow}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{routeLabel}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)] xl:hidden">{eyebrow}</p>
            <h1 className={`${displayFont.className} display-tight mt-3 max-w-5xl break-words text-[34px] sm:text-[48px] md:text-[76px] xl:text-[96px]`}>
              {title}
            </h1>
          </div>
          <div className="min-w-0 border-l border-black/20 pl-5">
            <p className="max-w-[19rem] text-base leading-7 text-[var(--muted)] sm:max-w-full md:max-w-md">{description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                className="inline-flex min-h-12 w-full max-w-full items-center justify-center gap-3 border border-[var(--graphite)] bg-[var(--graphite)] px-5 text-center text-sm font-semibold uppercase leading-5 tracking-[0.06em] text-white transition hover:bg-black sm:w-auto"
                href={primaryLink.href}
              >
                {primaryLink.label}
                <ArrowUpRight size={18} />
              </a>
              {secondaryLink ? (
                <a
                  className="inline-flex min-h-12 w-full max-w-full items-center justify-center gap-3 border border-black/25 px-5 text-center text-sm font-semibold uppercase leading-5 tracking-[0.06em] transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:w-auto"
                  href={secondaryLink.href}
                >
                  {secondaryLink.label}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <div>
            <h2 className={`${displayFont.className} display-tight text-[52px] md:text-[72px]`}>Контекст</h2>
            <p className="mt-5 max-w-[20rem] text-sm leading-7 text-[var(--muted)] sm:max-w-md">{summary}</p>
          </div>
          <div className="grid gap-0 border border-black/20 md:grid-cols-3">
            {metrics.map((metric) => (
              <div className="border-b border-black/20 p-5 md:border-b-0 md:border-r md:last:border-r-0" key={metric.label}>
                <p className={`${displayFont.className} display-face text-[52px] leading-none text-[var(--accent)]`}>
                  {metric.value}
                </p>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.06em]">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-grid border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <h2 className={`${displayFont.className} display-tight text-[52px] md:text-[72px]`}>Разделы</h2>
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
