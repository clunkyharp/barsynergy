import Image from 'next/image';
import type { PublicContentImage } from '@/modules/content/shared/detail-helpers';
import { PublicBreadcrumbs } from '@/components/public/public-primitives';
import { displayFont } from '@/lib/fonts';

type SupplierDetailHeroProps = {
  title: string;
  summary: string;
  companyName?: string;
  label?: string;
  cityName?: string;
  serviceArea?: string;
  contactLabel?: string;
  image?: PublicContentImage;
  isVerified: boolean;
  externalUrl?: string;
  externalUrlLabel?: string;
};

export function SupplierDetailHero({
  title,
  summary,
  companyName,
  label,
  cityName,
  serviceArea,
  contactLabel,
  image,
  isVerified,
  externalUrl,
  externalUrlLabel,
}: SupplierDetailHeroProps) {
  return (
    <section className="background-zone background-zone-graphite relative overflow-hidden border-b border-[var(--line)] py-7 md:py-9">
      <div className="container">
        <PublicBreadcrumbs
          current={title}
          items={[
            { href: '/', label: 'Главная' },
            { href: '/suppliers', label: 'Поставщики' }
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                Проверенный поставщик
              </span>
            ) : null}

            <h1
              className={`${displayFont.className} mt-4 max-w-[22ch] text-pretty text-[clamp(1.8rem,3.2vw,3rem)] font-semibold leading-[1.20] text-balance tracking-normal text-[var(--text)] [overflow-wrap:normal] [text-wrap:pretty] [word-break:normal] max-[480px]:max-w-full`}
            >
              {title}
            </h1>

            {companyName && companyName !== title ? (
              <p className="mt-1 text-base leading-6 text-[var(--muted)]">{companyName}</p>
            ) : null}

            {label || cityName || serviceArea ? (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm leading-6 text-[var(--muted)]">
                {label ? <span className="text-[var(--accent)]">{label}</span> : null}
                {cityName ? <span>{cityName}</span> : null}
                {serviceArea ? <span>География: {serviceArea}</span> : null}
              </div>
            ) : null}

            {contactLabel ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Контакт: <span className="text-[var(--text)]">{contactLabel}</span>
              </p>
            ) : null}

            {summary ? (
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--muted)] md:text-base">
                {summary}
              </p>
            ) : null}

            {externalUrl ? (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-transparent px-5 text-sm font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-wash)]"
                  href={externalUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {externalUrlLabel ?? 'Сайт компании'}
                </a>
              </div>
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
