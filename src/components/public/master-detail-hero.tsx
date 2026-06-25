import Image from 'next/image';
import type { PublicContentImage } from '@/modules/content/shared/detail-helpers';
import { PublicBreadcrumbs } from '@/components/public/public-primitives';
import { displayFont } from '@/lib/fonts';

type MasterDetailHeroProps = {
  title: string;
  summary: string;
  displayName?: string;
  label?: string;
  cityName?: string;
  serviceArea?: string;
  contactLabel?: string;
  image?: PublicContentImage;
  isVerified: boolean;
  entityLabel: string;
};

export function MasterDetailHero({
  title,
  summary,
  displayName,
  label,
  cityName,
  serviceArea,
  contactLabel,
  image,
  isVerified,
  entityLabel
}: MasterDetailHeroProps) {
  const heading = displayName ?? title;
  // title often embeds the name ("Имя — услуга"); strip the name prefix so the
  // subtitle reads only the service and doesn't repeat the H1.
  const taglineRaw = displayName && title.startsWith(displayName)
    ? title.slice(displayName.length).replace(/^\s*[—–-]\s*/, '').trim()
    : title;
  const tagline = taglineRaw && taglineRaw !== heading ? taglineRaw : null;
  return (
    <section className="background-zone background-zone-graphite relative overflow-hidden border-b border-[var(--line)] py-7 md:py-9">
      <div className="container">
        <PublicBreadcrumbs
          current={displayName ?? title}
          items={[
            { href: '/', label: 'Главная' },
            { href: '/masters', label: 'Мастера' }
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="min-w-0">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                Проверенный мастер
              </span>
            ) : null}

            <h1 className={`${displayFont.className} mt-4 max-w-[22ch] text-pretty text-[clamp(1.8rem,3.2vw,3rem)] font-semibold leading-[1.20] text-balance tracking-normal text-[var(--text)] [overflow-wrap:normal] [text-wrap:pretty] [word-break:normal] max-[480px]:max-w-full`}>
              {heading}
            </h1>

            {tagline ? (
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--muted)] md:text-base">{tagline}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm leading-6 text-[var(--muted)]">
              <span className="text-[var(--accent)]">{entityLabel}</span>
              {label ? <span>{label}</span> : null}
              {cityName ? <span>{cityName}</span> : null}
              {serviceArea ? <span>География: {serviceArea}</span> : null}
            </div>

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
