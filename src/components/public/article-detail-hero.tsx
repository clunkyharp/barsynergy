import Image from 'next/image';
import type { PublicContentImage } from '@/modules/content/shared/detail-helpers';
import { PublicBodyText, PublicBreadcrumbs } from '@/components/public/public-primitives';
import { displayFont } from '@/lib/fonts';

type ArticleDetailHeroProps = {
  slug: string;
  title: string;
  summary: string;
  label?: string;
  authorName?: string;
  readingTime?: string;
  cityName?: string;
  publishedAtIso?: string;
  tags: string[];
  image?: PublicContentImage;
};

export function ArticleDetailHero({
  slug: _slug,
  title,
  summary,
  label,
  authorName,
  readingTime,
  cityName,
  publishedAtIso,
  tags,
  image
}: ArticleDetailHeroProps) {
  const hasMeta = Boolean(authorName || readingTime || cityName || publishedAtIso);
  const publishedDate = publishedAtIso
    ? new Date(publishedAtIso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : undefined;

  return (
    <section className="background-zone background-zone-graphite relative overflow-hidden border-b border-[var(--line)] py-7 md:py-9">
      <div className="container">
        <PublicBreadcrumbs
          current={title}
          items={[
            { href: '/', label: 'Главная' },
            { href: '/articles', label: 'Материалы' }
          ]}
        />

        {label ? (
          <span className="mt-5 inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent-contrast)]">
            {label}
          </span>
        ) : null}

        <h1
          className={`${displayFont.className} mt-4 max-w-[20ch] text-pretty text-[clamp(2rem,4vw,3.75rem)] font-semibold leading-[1.02] tracking-normal text-[var(--text)] [overflow-wrap:normal] [text-wrap:pretty] [word-break:normal] max-[480px]:max-w-full max-[480px]:text-[clamp(1.6rem,6.5vw,2rem)]`}
        >
          {title}
        </h1>

        {summary ? (
          <PublicBodyText className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--muted)] md:text-base" size="md" tone="muted">
            {summary}
          </PublicBodyText>
        ) : null}

        {hasMeta ? (
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] leading-6 text-[var(--muted)]">
            {authorName ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-[var(--accent)]">✎</span>
                {authorName}
              </span>
            ) : null}
            {readingTime ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-[var(--accent)]">◷</span>
                {readingTime}
              </span>
            ) : null}
            {cityName ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-[var(--accent)]">●</span>
                {cityName}
              </span>
            ) : null}
            {publishedDate ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-[var(--accent)]">▸</span>
                {publishedDate}
              </span>
            ) : null}
          </div>
        ) : null}

        {tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                className="inline-flex items-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-wash)] px-2.5 py-1 text-[12px] font-medium leading-[16px] text-[var(--text)]"
                key={tag}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {image?.src ? (
          <figure className="relative mt-7 aspect-[2/1] overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-muted)] md:aspect-[2.4/1]">
            <Image
              alt={image.alt}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 92vw, 100vw"
              src={image.src}
            />
          </figure>
        ) : null}
      </div>
    </section>
  );
}
