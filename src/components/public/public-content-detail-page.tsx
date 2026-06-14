import Image from 'next/image';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { RichTextContent } from '@/components/public/rich-text-content';
import { ActionCard } from '@/components/ui/cards';
import { Button } from '@/components/ui/button';
import { InlineLink } from '@/components/ui/inline-link';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import {
  type PublicContentDetailPageProps,
  detailKindFromBackHref,
  detailCopy,
  fallbackImage,
  normalizeImage,
  paragraphsFromBody,
  normalizeText,
} from './public-content-detail-page-helpers';

export type { DetailLink, PublicContentDetailPageProps } from './public-content-detail-page-helpers';
export { paragraphsFromBody, normalizeText, normalizeImage, fallbackImage, detailKindFromBackHref, detailCopy } from './public-content-detail-page-helpers';

export function PublicContentDetailPage({
  eyebrow: _eyebrow,
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
  secondaryLink,
  actionsSlot,
  actionsBottomSlot,
  metaSlot,
  sourceReferences
}: PublicContentDetailPageProps) {
  const rawParagraphs = paragraphsFromBody(body);
  const dedupParagraphs =
    rawParagraphs.length > 0 && normalizeText(rawParagraphs[0]) === normalizeText(summary) ? rawParagraphs.slice(1) : rawParagraphs;
  const effectiveBody = dedupParagraphs.length < rawParagraphs.length ? dedupParagraphs.join('\n\n') : body ?? '';
  const hasEffectiveBody = dedupParagraphs.length > 0;
  const image = normalizeImage(imageUrl, title) ?? fallbackImage(backHref, title);
  const detailKind = detailKindFromBackHref(backHref);
  const copy = detailCopy(detailKind);
  const heroMeta = [label, ...meta].filter((entry): entry is string => Boolean(entry));

  return (
    <div className="public-detail-page" data-detail-kind={detailKind}>
      <section className="background-zone background-zone-graphite relative overflow-hidden border-b border-[var(--line)] py-7 md:py-9">
        <div className="container relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <InlineLink className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)]" href={backHref}>
              <ArrowLeft size={16} />
              {backLabel}
            </InlineLink>
          </div>

          <Panel className="mt-5 overflow-hidden border-[var(--border-default)] bg-[var(--surface)] p-0 md:mt-6" padding="none">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.55fr)] lg:items-stretch">
              <div className="grid min-w-0 content-center px-5 py-8 sm:px-7 md:px-8 md:py-10 xl:px-9">
                <PublicDisplayTitle
                  as="h1"
                  className="public-detail-hero-title mt-0 max-w-[22ch] text-pretty text-[clamp(2.25rem,4vw,4.1rem)] leading-[1.02] text-[var(--text)] [overflow-wrap:normal] [text-wrap:pretty] [word-break:normal] max-[480px]:max-w-full max-[480px]:text-[clamp(1.82rem,7.2vw,2.2rem)]"
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
        <div className="container grid gap-7 xl:grid-cols-[minmax(16rem,0.36fr)_minmax(0,1fr)_minmax(18rem,0.38fr)]">
          <aside className="order-2 xl:order-1 xl:self-start">
            <div className="space-y-4">
              <Panel className="bg-[var(--surface-wash-strong)]" padding="lg">
                <PublicEyebrow tone="muted">{copy.contextLabel}</PublicEyebrow>
                {facts.length > 0 ? (
                  <dl className="mt-5 grid gap-4">
                    {facts.map((fact) => (
                      <div className="border-b border-[var(--line)] pb-3 last:border-b-0 last:pb-0" key={`${fact.label}-${fact.value}`}>
                        <dt className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">{fact.label}</dt>
                        <dd className="mt-2 text-sm leading-7 text-[var(--text)]">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <PublicBodyText className="mt-4">
                    {copy.factsFallback}
                  </PublicBodyText>
                )}

              </Panel>
            </div>
          </aside>

          <div className="order-1 xl:order-2">
            <div className="mx-auto max-w-3xl">
              <PublicEyebrow tone="muted">{copy.bodyLabel}</PublicEyebrow>
              {hasEffectiveBody ? (
                <div className="mt-8">
                  <RichTextContent markdown={effectiveBody} />
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
                      <h2 className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">{section.title}</h2>
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

              {sourceReferences ? (
                <Panel className="mt-9 border-[var(--border-default)] bg-[var(--surface-wash-strong)]" padding="lg">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">Источники и дополнительное чтение</h2>
                  <div className="mt-5">
                    <RichTextContent markdown={sourceReferences} />
                  </div>
                </Panel>
              ) : null}
            </div>
          </div>

          <aside className="order-3 xl:self-start">
            <div className="space-y-4">
              {(actionsSlot || secondaryLink || actionsBottomSlot) ? (
                <ActionCard title="Действия" variant="plain">
                  <div className="grid gap-3">
                    {actionsSlot ? <>{actionsSlot}</> : null}
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
                    {actionsBottomSlot ? <div className="border-t border-[var(--line)] pt-3">{actionsBottomSlot}</div> : null}
                  </div>
                </ActionCard>
              ) : null}

              {metaSlot !== undefined ? metaSlot : (heroMeta.length > 0 && detailKind !== 'vacancy' ? (
                <Panel padding="lg">
                  <PublicEyebrow tone="muted">{copy.metaLabel}</PublicEyebrow>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {heroMeta.slice(0, 6).map((entry, index) => (
                      <MetaChip key={`${entry}-${index}`} variant="filter">
                        {entry}
                      </MetaChip>
                    ))}
                  </div>
                </Panel>
              ) : null)}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
