import { ArrowLeft, ArrowUpRight } from 'lucide-react';
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
  const paragraphs = paragraphsFromBody(body);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-black/20 py-10 md:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(153,44,38,0.08),transparent_18%),radial-gradient(circle_at_82%_24%,rgba(255,255,255,0.58),transparent_18%),radial-gradient(circle_at_74%_82%,rgba(20,20,18,0.05),transparent_24%)]"
        />
        <div className="container relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div className="min-w-0">
            <InlineLink className="inline-flex items-center gap-2 text-sm" href={backHref}>
              <ArrowLeft size={16} />
              {backLabel}
            </InlineLink>
            <PublicEyebrow className="mt-5">{eyebrow}</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-3 max-w-5xl break-words text-[32px] sm:text-[44px] md:text-[64px]" size="section">
              {title}
            </PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-3xl" size="md" tone="default">
              {summary}
            </PublicBodyText>
            {label || meta.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {label ? <MetaChip variant="selected">{label}</MetaChip> : null}
                {meta.map((entry) => (
                  <MetaChip key={entry} variant="filter">
                    {entry}
                  </MetaChip>
                ))}
              </div>
            ) : null}
            {primaryLink || secondaryLink ? (
              <PublicActionRow>
                {primaryLink ? (
                  <Button
                    className="min-h-12 rounded-full px-6 tracking-[0.08em]"
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
                    className="min-h-12 rounded-full px-6 tracking-[0.08em]"
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
            <div
              aria-hidden="true"
              className="min-h-[260px] rounded-[var(--radius-lg)] border border-black/15 bg-cover bg-center shadow-[0_18px_60px_rgba(20,20,18,0.08)] md:min-h-[360px]"
              style={{ backgroundImage: `url("${imageUrl}")` }}
            />
          ) : (
            <Panel className="min-h-[260px] border-dashed md:min-h-[360px]" padding="lg">
              <PublicEyebrow tone="muted">Материал</PublicEyebrow>
              <PublicBodyText className="mt-4 max-w-md">
                Для этой записи пока нет отдельного изображения. Основной контент и действия доступны ниже.
              </PublicBodyText>
            </Panel>
          )}
        </div>
      </section>

      <section className="border-b border-black/20 py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[0.95fr_0.45fr]">
          <div className="space-y-4">
            <PublicDisplayTitle size="card">Подробности</PublicDisplayTitle>
            {paragraphs.length > 0 ? (
              <div className="grid gap-4">
                {paragraphs.map((paragraph) => (
                  <PublicBodyText className="max-w-3xl text-[var(--text)]" key={paragraph} size="md" tone="default">
                    {paragraph}
                  </PublicBodyText>
                ))}
              </div>
            ) : (
              <PublicBodyText className="max-w-3xl text-[var(--text)]" size="md" tone="default">
                Дополнительный текст для этой записи пока не опубликован. Используйте метаданные и действия справа, чтобы перейти к
                следующему шагу.
              </PublicBodyText>
            )}
          </div>

          <div className="space-y-4">
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
                  Для этой записи пока нет отдельного набора фактов. Основная информация дана в описании и метках выше.
                </PublicBodyText>
              )}
            </Panel>
          </div>
        </div>
      </section>
    </div>
  );
}
