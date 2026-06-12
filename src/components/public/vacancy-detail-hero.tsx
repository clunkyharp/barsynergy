import Image from 'next/image';
import type { PublicContentImage } from '@/modules/content/shared/detail-helpers';
import { PublicBreadcrumbs } from '@/components/public/public-primitives';
import { MetaChip } from '@/components/ui/meta-chip';
import { displayFont } from '@/lib/fonts';

type VacancyDetailHeroProps = {
  title: string;
  summary: string;
  label?: string;
  companyName?: string;
  cityName?: string;
  salaryLabel?: string;
  employmentTypeLabel?: string;
  experienceLabel?: string;
  positionLabel?: string;
  image?: PublicContentImage;
};

export function VacancyDetailHero({
  title,
  summary,
  label,
  companyName,
  cityName,
  salaryLabel,
  employmentTypeLabel,
  experienceLabel,
  positionLabel,
  image,
}: VacancyDetailHeroProps) {
  return (
    <section className="background-zone background-zone-graphite relative overflow-hidden border-b border-[var(--line)] py-7 md:py-9">
      <div className="container">
        <PublicBreadcrumbs
          current={title}
          items={[
            { href: '/', label: 'Главная' },
            { href: '/vacancies', label: 'Вакансии' }
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0">
            {label ? (
              <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent-contrast)]">
                {label}
              </span>
            ) : null}

            <h1
              className={`${displayFont.className} mt-3 max-w-[22ch] text-pretty text-[clamp(1.8rem,3.2vw,3rem)] font-semibold leading-[1.05] tracking-normal text-[var(--text)] [overflow-wrap:normal] [text-wrap:pretty] [word-break:normal] max-[480px]:max-w-full`}
            >
              {title}
            </h1>

            {companyName || positionLabel ? (
              <p className="mt-2 text-base leading-6 text-[var(--muted)]">
                {companyName ? <span className="font-medium text-[var(--text)]">{companyName}</span> : null}
                {companyName && positionLabel ? <span className="mx-2 text-[var(--muted)]">·</span> : null}
                {positionLabel ? <span>{positionLabel}</span> : null}
                {cityName ? <span className="ml-2 text-[var(--muted)]">— {cityName}</span> : null}
              </p>
            ) : null}

            {salaryLabel ? (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Зарплата</p>
                <p className={`${displayFont.className} mt-1 text-[clamp(1.5rem,2.5vw,2.2rem)] font-semibold leading-none text-[var(--accent)]`}>
                  {salaryLabel}
                </p>
              </div>
            ) : null}

            {employmentTypeLabel || experienceLabel ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {employmentTypeLabel ? (
                  <MetaChip variant="filter">{employmentTypeLabel}</MetaChip>
                ) : null}
                {experienceLabel ? (
                  <MetaChip variant="filter">{experienceLabel}</MetaChip>
                ) : null}
              </div>
            ) : null}

            {summary ? (
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--muted)] md:text-base">
                {summary}
              </p>
            ) : null}

          </div>

          {image?.src ? (
            <figure className="relative aspect-[4/3] w-full max-w-[26rem] overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-muted)] lg:aspect-[3/2]">
              <Image
                alt={image.alt}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1024px) 26rem, 92vw"
                src={image.src}
              />
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  );
}
