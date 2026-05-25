import Image from 'next/image';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { InlineLink } from '@/components/ui/inline-link';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import type { PublicContentDetailFact, PublicContentDetailSection, PublicContentImage } from '@/lib/public/content-details';

type DetailLink = {
  href: string;
  label: string;
  external?: boolean;
};

type PublicContentDetailPageProps = {
  eyebrow: string;
  backHref: string;
  backLabel: string;
  title: string;
  summary: string;
  label?: string;
  meta?: string[];
  body?: string;
  imageUrl?: string | PublicContentImage;
  facts?: PublicContentDetailFact[];
  sections?: PublicContentDetailSection[];
  primaryLink?: DetailLink;
  secondaryLink?: DetailLink;
};

type DetailKind = 'article' | 'event' | 'course' | 'vacancy' | 'supplier' | 'partner';

function paragraphsFromBody(body?: string) {
  if (!body) {
    return [];
  }

  return body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function normalizeImage(value: string | PublicContentImage | undefined, fallbackAlt: string): PublicContentImage | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    return {
      src: value,
      alt: fallbackAlt
    };
  }

  return {
    src: value.src,
    alt: value.alt.trim() || fallbackAlt
  };
}

function fallbackImage(backHref: string, fallbackAlt: string): PublicContentImage {
  if (backHref === '/events') {
    return {
      src: '/images/generated/program-events.jpg',
      alt: fallbackAlt
    };
  }

  if (backHref === '/education') {
    return {
      src: '/images/generated/program-intensive.jpg',
      alt: fallbackAlt
    };
  }

  if (backHref === '/vacancies') {
    return {
      src: '/images/home/audience-specialists-coffee.jpg',
      alt: fallbackAlt
    };
  }

  if (backHref === '/suppliers') {
    return {
      src: '/images/generated/hustle-brew-lineup-v1.png',
      alt: fallbackAlt
    };
  }

  if (backHref === '/partners') {
    return {
      src: '/images/generated/sponsorship-coffee-bar.jpg',
      alt: fallbackAlt
    };
  }

  return {
    src: '/images/generated/content-guide.jpg',
    alt: fallbackAlt
  };
}

function detailKindFromBackHref(backHref: string): DetailKind {
  if (backHref === '/events') {
    return 'event';
  }

  if (backHref === '/education') {
    return 'course';
  }

  if (backHref === '/vacancies') {
    return 'vacancy';
  }

  if (backHref === '/suppliers') {
    return 'supplier';
  }

  if (backHref === '/partners') {
    return 'partner';
  }

  return 'article';
}

function detailCopy(kind: DetailKind) {
  const copy: Record<
    DetailKind,
    {
      bodyLabel: string;
      contextLabel: string;
      fallbackBody: string;
      factsFallback: string;
    }
  > = {
    article: {
      bodyLabel: 'Текст материала',
      contextLabel: 'Материал',
      fallbackBody: 'Основная информация собрана в кратком описании и метках материала.',
      factsFallback: 'Источник, автор и дата указаны в описании материала.'
    },
    event: {
      bodyLabel: 'О событии',
      contextLabel: 'Событие',
      fallbackBody: 'Основная информация собрана в описании, фактах и форме записи.',
      factsFallback: 'Дата, место и формат указаны в описании события.'
    },
    course: {
      bodyLabel: 'Программа обучения',
      contextLabel: 'Программа',
      fallbackBody: 'Программа и условия собраны в фактах и блоках ниже.',
      factsFallback: 'Формат, уровень и условия указаны в описании программы.'
    },
    vacancy: {
      bodyLabel: 'О роли',
      contextLabel: 'Вакансия',
      fallbackBody: 'Условия роли собраны в фактах и блоке отклика.',
      factsFallback: 'Компания, позиция и условия указаны в описании вакансии.'
    },
    supplier: {
      bodyLabel: 'Профиль компании',
      contextLabel: 'Поставщик',
      fallbackBody: 'Профиль поставщика собран в фактах и контактном действии.',
      factsFallback: 'Категория, город и условия контакта указаны в профиле.'
    },
    partner: {
      bodyLabel: 'Формат партнёрства',
      contextLabel: 'Партнёр',
      fallbackBody: 'Формат партнёрства собран в описании и контактном действии.',
      factsFallback: 'Компания и тип партнёрства указаны в профиле.'
    }
  };

  return copy[kind];
}

export function PublicContentDetailPage({
  eyebrow,
  backHref,
  backLabel,
  title,
  summary,
  label,
  meta = [],
  body,
  imageUrl,
  facts = [],
  sections = [],
  primaryLink,
  secondaryLink
}: PublicContentDetailPageProps) {
  const rawParagraphs = paragraphsFromBody(body);
  const paragraphs =
    rawParagraphs.length > 0 && normalizeText(rawParagraphs[0]) === normalizeText(summary) ? rawParagraphs.slice(1) : rawParagraphs;
  const image = normalizeImage(imageUrl, title) ?? fallbackImage(backHref, title);
  const detailKind = detailKindFromBackHref(backHref);
  const copy = detailCopy(detailKind);
  const heroMeta = [label, ...meta].filter((entry): entry is string => Boolean(entry));

  return (
    <div className="public-detail-page" data-detail-kind={detailKind}>
      <section className="background-zone background-zone-graphite relative overflow-hidden border-b border-[var(--line)] py-7 md:py-9">
        <div className="container relative">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-5">
            <InlineLink className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)]" href={backHref}>
              <ArrowLeft size={16} />
              {backLabel}
            </InlineLink>
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] md:block">
              {eyebrow} / {copy.contextLabel}
            </p>
          </div>

          <Panel className="mt-6 overflow-hidden border-[var(--border-default)] bg-[var(--surface)] p-0" padding="none">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.55fr)] lg:items-stretch">
              <div className="grid min-w-0 content-center px-5 py-8 sm:px-7 md:px-8 md:py-10 xl:px-9">
                <div className="flex flex-wrap gap-2">
                  <MetaChip variant="selected">{eyebrow}</MetaChip>
                  {heroMeta.slice(0, 5).map((entry, index) => (
                    <MetaChip key={`${entry}-${index}`} variant="default">
                      {entry}
                    </MetaChip>
                  ))}
                </div>

                <PublicDisplayTitle
                  as="h1"
                  className="public-detail-hero-title mt-6 max-w-[22ch] text-pretty text-[clamp(2.25rem,4vw,4.1rem)] leading-[1.02] text-[var(--text)] [overflow-wrap:normal] [text-wrap:pretty] [word-break:normal] max-[480px]:max-w-full max-[480px]:text-[clamp(1.82rem,7.2vw,2.2rem)]"
                  size="section"
                >
                  {title}
                </PublicDisplayTitle>

                <PublicBodyText className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--text)] md:text-base" size="md" tone="default">
                  {summary}
                </PublicBodyText>

                {primaryLink || secondaryLink ? (
                  <div className="mt-7 flex flex-wrap gap-3">
                    {primaryLink ? (
                      <Button
                        className="min-h-11 rounded-[var(--radius-sm)] px-5 tracking-normal"
                        href={primaryLink.href}
                        rel={primaryLink.external ? 'noreferrer noopener' : undefined}
                        target={primaryLink.external ? '_blank' : undefined}
                      >
                        {primaryLink.label}
                        <ArrowUpRight size={16} />
                      </Button>
                    ) : null}
                    {secondaryLink ? (
                      <Button
                        className="min-h-11 rounded-[var(--radius-sm)] px-5 tracking-normal"
                        href={secondaryLink.href}
                        rel={secondaryLink.external ? 'noreferrer noopener' : undefined}
                        target={secondaryLink.external ? '_blank' : undefined}
                        variant="secondary"
                      >
                        {secondaryLink.label}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <figure className="relative min-h-[240px] overflow-hidden border-t border-[var(--border-default)] bg-[var(--surface-muted)] sm:min-h-[320px] lg:min-h-[440px] lg:border-l lg:border-t-0">
                <Image
                  alt={image.alt}
                  className="object-cover"
                  fill
                  priority
                  sizes="(min-width: 1024px) 30vw, 92vw"
                  src={image.src}
                />
              </figure>
            </div>
          </Panel>
        </div>
      </section>

      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-9 md:py-12">
        <div className="container grid gap-7 xl:grid-cols-[minmax(14rem,0.36fr)_minmax(0,1fr)_minmax(14rem,0.38fr)]">
          <aside className="order-2 xl:order-1">
            <div className="space-y-4 xl:sticky xl:top-28">
              <Panel className="bg-[var(--surface-wash-strong)]" padding="lg">
                <PublicEyebrow tone="muted">{copy.contextLabel}</PublicEyebrow>
                {facts.length > 0 ? (
                  <dl className="mt-5 grid gap-4">
                    {facts.map((fact) => (
                      <div className="border-b border-[var(--line)] pb-3 last:border-b-0 last:pb-0" key={`${fact.label}-${fact.value}`}>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{fact.label}</dt>
                        <dd className="mt-2 text-sm leading-7 text-[var(--text)]">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <PublicBodyText className="mt-4">
                    {copy.factsFallback}
                  </PublicBodyText>
                )}

                {primaryLink ? (
                  <Button
                    className="mt-5 w-full min-w-0 justify-center rounded-[var(--radius-sm)] px-4 !whitespace-normal leading-5"
                    href={primaryLink.href}
                    rel={primaryLink.external ? 'noreferrer noopener' : undefined}
                    target={primaryLink.external ? '_blank' : undefined}
                  >
                    <span className="min-w-0 break-words">{primaryLink.label}</span>
                  </Button>
                ) : null}
              </Panel>
            </div>
          </aside>

          <div className="order-1 xl:order-2">
            <div className="mx-auto max-w-3xl">
              <PublicEyebrow tone="muted">{copy.bodyLabel}</PublicEyebrow>
              <div className="mt-5 border-t border-[var(--line)] pt-6">
                <h2 className="max-w-2xl text-[24px] font-semibold leading-[1.26] tracking-normal text-[var(--text)] md:text-[30px]">
                  {summary}
                </h2>
              </div>

              {paragraphs.length > 0 ? (
                <div className="mt-8 grid gap-5">
                  {paragraphs.map((paragraph) => (
                    <PublicBodyText
                      className="max-w-none text-[15px] leading-8 text-[var(--text)] md:text-base"
                      key={paragraph}
                      size="md"
                      tone="default"
                    >
                      {paragraph}
                    </PublicBodyText>
                  ))}
                </div>
              ) : (
                <PublicBodyText className="mt-8 max-w-none text-[var(--text)]" size="md" tone="default">
                  {copy.fallbackBody}
                </PublicBodyText>
              )}

              {sections.length > 0 ? (
                <div className="public-detail-section-grid mt-9 grid gap-4">
                  {sections.map((section) => (
                    <Panel className="public-detail-section-card border-[var(--border-default)] bg-[var(--surface-wash-strong)]" key={section.title} padding="lg">
                      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{section.title}</h2>
                      <ul className="mt-5 grid gap-3">
                        {section.items.map((item) => (
                          <li className="grid grid-cols-[0.7rem_minmax(0,1fr)] gap-3 text-sm leading-7 text-[var(--text)]" key={item}>
                            <span className="mt-[0.7rem] h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </Panel>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <aside className="order-3">
            <div className="space-y-4 xl:sticky xl:top-28">
              <Panel className="bg-[var(--surface-wash)]" padding="lg">
                <PublicEyebrow tone="muted">Действия</PublicEyebrow>
                <div className="mt-4 grid gap-3">
                  {secondaryLink ? (
                    <Button
                      className="w-full min-w-0 justify-center rounded-[var(--radius-sm)] px-4 !whitespace-normal leading-5"
                      href={secondaryLink.href}
                      rel={secondaryLink.external ? 'noreferrer noopener' : undefined}
                      target={secondaryLink.external ? '_blank' : undefined}
                      variant="secondary"
                    >
                      <span className="min-w-0 break-words">{secondaryLink.label}</span>
                    </Button>
                  ) : null}
                  <Button
                    className="w-full min-w-0 justify-center rounded-[var(--radius-sm)] px-4 !whitespace-normal leading-5"
                    href={backHref}
                    variant="secondary"
                  >
                    <span className="min-w-0 break-words">{backLabel}</span>
                  </Button>
                </div>
              </Panel>

              {heroMeta.length > 0 ? (
                <Panel padding="lg">
                  <PublicEyebrow tone="muted">Метки</PublicEyebrow>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {heroMeta.slice(0, 6).map((entry, index) => (
                      <MetaChip key={`${entry}-${index}`} variant="filter">
                        {entry}
                      </MetaChip>
                    ))}
                  </div>
                </Panel>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
