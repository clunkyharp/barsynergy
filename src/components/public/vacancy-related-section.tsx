import { BadgeCheck } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { HighlightChip } from '@/components/ui/highlight-chip';
import { PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { VERIFIED_COMPANY_ARIA } from '@/lib/public/content/trust-labels';
import { titleInitials } from '@/components/public/published-content-section-builders';
import type { PublishedContentItem } from '@/lib/public/content/shared';

type VacancyRelatedSectionProps = {
  items: PublishedContentItem[];
  title?: string;
};

function metaValue(item: PublishedContentItem, label: string) {
  return item.metaGroups?.find((group) => group.label === label)?.value;
}

function RelatedVacancyCard({ item }: { item: PublishedContentItem }) {
  const city = metaValue(item, 'Город');
  const salary = metaValue(item, 'Оплата') ?? 'по договорённости';
  const employment = metaValue(item, 'Формат') ?? metaValue(item, 'График');

  return (
    <AppLink
      className="group flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      href={`/vacancies/${item.slug}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {item.imageUrl ? (
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)]">
              <span aria-hidden="true" className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${item.imageUrl}")` }} />
            </span>
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] text-[13px] font-bold text-[var(--muted)]">
              {titleInitials(item.subtitle ?? item.title)}
            </span>
          )}
          <div className="min-w-0">
            {item.subtitle ? (
              <div className="flex items-center gap-1.5 text-[0.95rem] font-semibold leading-5 text-[var(--text)]">
                <span className="truncate">{item.subtitle}</span>
                {item.isVerified ? (
                  <BadgeCheck aria-label={VERIFIED_COMPANY_ARIA} className="shrink-0 text-[var(--accent)]" size={15} strokeWidth={1.8} />
                ) : null}
              </div>
            ) : null}
            {city ? <span className="text-[12px] text-[var(--muted)]">{city}</span> : null}
          </div>
        </div>
        {item.isNew ? <HighlightChip variant="fresh">Новая</HighlightChip> : null}
      </div>

      <h3 className="text-[1.15rem] font-bold leading-[1.2] text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
        {item.title}
      </h3>

      <span className="tabular-nums text-[1.25rem] font-semibold text-[var(--accent)]">{salary}</span>

      {employment ? (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {[employment].filter(Boolean).map((chip) => (
            <span
              className="inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-wash)] px-2.5 py-1 text-[12px] font-medium text-[var(--text)]"
              key={chip}
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </AppLink>
  );
}

export function VacancyRelatedSection({
  items,
  title = 'Другие вакансии'
}: VacancyRelatedSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-10 md:py-14">
      <div className="container">
        <PublicEyebrow tone="accent">Дальше</PublicEyebrow>
        <PublicDisplayTitle className="mt-3">{title}</PublicDisplayTitle>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <RelatedVacancyCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
