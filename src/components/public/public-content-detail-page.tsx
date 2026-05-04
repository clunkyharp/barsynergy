import { ArrowLeft, ArrowUpRight, ChevronRight } from 'lucide-react';
import { PublicActionRow, PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { InlineLink } from '@/components/ui/inline-link';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import type { PublicContentDetailFact } from '@/lib/public/content-details';

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
  imageUrl?: string;
  facts?: PublicContentDetailFact[];
  primaryLink?: DetailLink;
  secondaryLink?: DetailLink;
};

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
  primaryLink,
  secondaryLink
}: PublicContentDetailPageProps) {
  const rawParagraphs = paragraphsFromBody(body);
  const paragraphs =
    rawParagraphs.length > 0 && normalizeText(rawParagraphs[0]) === normalizeText(summary) ? rawParagraphs.slice(1) : rawParagraphs;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-black/20 py-10 md:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(153,44,38,0.08),transparent_18%),radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.62),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent_56%),radial-gradient(circle_at_74%_82%,rgba(20,20,18,0.04),transparent_26%)]"
        />
        <div className="container relative">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-5">
            <InlineLink className="inline-flex items-center gap-2 text-sm" href={backHref}>
              <ArrowLeft size={16} />
              {backLabel}
            </InlineLink>
            <div className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] md:flex">
              <span>Главная</span>
              <ChevronRight size={12} />
              <span>{eyebrow}</span>
              <ChevronRight size={12} />
              <span>{label ?? 'Материал'}</span>
            </div>
          </div>

          <div className="mx-auto max-w-5xl px-0 py-10 text-center md:py-14">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PublicEyebrow>{eyebrow}</PublicEyebrow>
              {label ? <MetaChip variant="selected">{label}</MetaChip> : null}
            </div>

            <PublicDisplayTitle
              as="h1"
              className="mx-auto mt-5 max-w-4xl break-words text-[34px] sm:text-[48px] md:text-[72px] md:leading-[0.94]"
              size="section"
            >
              {title}
            </PublicDisplayTitle>

            {meta.length > 0 ? (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                {meta.map((entry, index) => (
                  <span className="inline-flex items-center gap-4" key={entry}>
                    {index > 0 ? <span className="hidden h-1 w-1 rounded-full bg-black/30 sm:block" /> : null}
                    <span>{entry}</span>
                  </span>
                ))}
              </div>
            ) : null}

            <PublicBodyText className="mx-auto mt-6 max-w-3xl text-[15px] leading-8 text-[var(--text)] md:text-[17px]" size="md" tone="default">
              {summary}
            </PublicBodyText>

            {primaryLink || secondaryLink ? (
              <PublicActionRow className="justify-center">
                {primaryLink ? (
                  <Button
                    className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal"
                    href={primaryLink.href}
                    rel={primaryLink.external ? 'noreferrer noopener' : undefined}
                    target={primaryLink.external ? '_blank' : undefined}
                  >
                    {primaryLink.label}
                    <ArrowUpRight size={18} />
                  </Button>
                ) : null}
                {secondaryLink ? (
                  <Button
                    className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal"
                    href={secondaryLink.href}
                    rel={secondaryLink.external ? 'noreferrer noopener' : undefined}
                    target={secondaryLink.external ? '_blank' : undefined}
                    variant="secondary"
                  >
                    {secondaryLink.label}
                  </Button>
                ) : null}
              </PublicActionRow>
            ) : null}
          </div>

          {imageUrl ? (
            <div className="mx-auto max-w-5xl">
              <div
                aria-hidden="true"
                className="min-h-[260px] overflow-hidden rounded-[var(--radius-lg)] border border-black/12 bg-cover bg-center shadow-[0_24px_80px_rgba(20,20,18,0.08)] md:min-h-[420px] xl:min-h-[520px]"
                style={{ backgroundImage: `url("${imageUrl}")` }}
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-10 xl:grid-cols-[minmax(17rem,0.32fr)_minmax(0,1fr)]">
          <aside className="order-2 xl:order-1">
            <div className="space-y-4 xl:sticky xl:top-28">
              <Panel padding="lg">
                <PublicEyebrow tone="muted">Навигация</PublicEyebrow>
                <InlineLink className="mt-4 inline-flex items-center gap-2 text-sm" href={backHref}>
                  <ArrowLeft size={16} />
                  {backLabel}
                </InlineLink>
                {primaryLink || secondaryLink ? (
                  <div className="mt-5 grid gap-3">
                    {primaryLink ? (
                      <Button
                        className="w-full min-w-0 justify-center rounded-[var(--radius-md)] px-4 !whitespace-normal leading-5"
                        href={primaryLink.href}
                        rel={primaryLink.external ? 'noreferrer noopener' : undefined}
                        target={primaryLink.external ? '_blank' : undefined}
                      >
                        <span className="min-w-0 break-words">{primaryLink.label}</span>
                        <ArrowUpRight size={18} />
                      </Button>
                    ) : null}
                    {secondaryLink ? (
                      <Button
                        className="w-full min-w-0 justify-center rounded-[var(--radius-md)] px-4 !whitespace-normal leading-5"
                        href={secondaryLink.href}
                        rel={secondaryLink.external ? 'noreferrer noopener' : undefined}
                        target={secondaryLink.external ? '_blank' : undefined}
                        variant="secondary"
                      >
                        <span className="min-w-0 break-words">{secondaryLink.label}</span>
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </Panel>

              <Panel padding="lg">
                <PublicEyebrow tone="muted">Что важно</PublicEyebrow>
                {facts.length > 0 ? (
                  <dl className="mt-5 grid gap-4">
                    {facts.map((fact) => (
                      <div className="border-b border-black/10 pb-3 last:border-b-0 last:pb-0" key={`${fact.label}-${fact.value}`}>
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{fact.label}</dt>
                        <dd className="mt-2 text-sm leading-7 text-[var(--text)]">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <PublicBodyText className="mt-4">
                    Отдельного блока с фактами пока нет. Главное уже указано в описании и метках выше.
                  </PublicBodyText>
                )}
              </Panel>
            </div>
          </aside>

          <div className="order-1 xl:order-2">
            <div className="mx-auto max-w-3xl">
              <PublicEyebrow tone="muted">Подробности</PublicEyebrow>
              <div className="mt-5 border-t border-black/10 pt-6">
                <p className="max-w-2xl text-[24px] font-semibold leading-[1.34] tracking-normal text-[var(--text)] md:text-[30px]">
                  {summary}
                </p>
              </div>

              {paragraphs.length > 0 ? (
                <div className="mt-8 grid gap-6">
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
                  Подробный текст пока не добавлен. Основная информация уже есть выше, вместе с метками и ссылками.
                </PublicBodyText>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
