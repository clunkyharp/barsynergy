import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { SectionIcon, type SectionIconType } from '@/components/public/section-icon';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

const STEP_TONES = ['search', 'contact', 'growth'] as const;

export type PrelaunchCard = {
  title: string;
  description: string;
  details?: {
    label: string;
    value: string;
  }[];
  hint?: string;
  action?: PrelaunchAction;
  icon?: SectionIconType;
};

export type PrelaunchAction = {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse';
};

type PublicPrelaunchSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  cards: PrelaunchCard[];
  actions?: PrelaunchAction[];
  badges?: string[];
  compact?: boolean;
  id?: string;
  /** 'list' (default) = compact numbered rows; 'visualSteps' = card with visual top band. */
  presentation?: 'list' | 'visualSteps';
  /** Cycle accent tone per card (visualSteps only) so pages differ without local copy-paste. */
  toneByIndex?: boolean;
};

export function PublicPrelaunchSection({
  eyebrow,
  title,
  description,
  cards,
  actions = [],
  badges = [],
  compact = false,
  presentation = 'list',
  toneByIndex = false,
  id
}: PublicPrelaunchSectionProps) {
  const isVisualSteps = presentation === 'visualSteps';
  return (
    <section className="background-zone background-zone-gray border-b border-[var(--line)] py-8 md:py-12" id={id}>
      <div className="container grid gap-7 md:gap-8 xl:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)] xl:items-center xl:gap-10">
        <div className="xl:self-start">
          <PublicEyebrow>{eyebrow}</PublicEyebrow>
          {compact ? (
            <h2 className={cn(displayFont.className, 'mt-4 text-[1.7rem] font-semibold leading-[1.1] text-[var(--text)] md:text-[2.1rem]')}>{title}</h2>
          ) : (
            <PublicDisplayTitle className="mt-4 max-w-[12ch] text-[clamp(2.6rem,5.4vw,5.2rem)] leading-[0.96]">{title}</PublicDisplayTitle>
          )}
          <PublicBodyText className="mt-5 max-w-lg" size="md">
            {description}
          </PublicBodyText>
          {badges.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <MetaChip className="border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--text)]" key={badge} variant="filter">
                  {badge}
                </MetaChip>
              ))}
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3 md:mt-8">
            {actions.map((action) => (
              <Button
                className="min-h-12 w-full rounded-[var(--radius-md)] px-5 tracking-normal sm:w-auto"
                href={action.href}
                key={`${action.href}-${action.label}`}
                variant={action.variant ?? 'primary'}
              >
                {action.label}
                <ArrowUpRight size={16} />
              </Button>
            ))}
          </div>
        </div>

        <ol className={isVisualSteps ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-3'}>
          {cards.map((card, idx) => {
            const textBlock = (
              <>
                <h3 className={`${displayFont.className} text-xl font-semibold leading-7 text-[var(--text)] md:text-[1.35rem] md:leading-8`}>{card.title}</h3>
                {card.hint ? <p className="mt-1 text-[12px] font-semibold uppercase tracking-[var(--tracking-marker)] text-[var(--accent)]">{card.hint}</p> : null}
                <p className="mt-2 text-sm leading-6 text-[var(--muted)] md:text-[15px]">{card.description}</p>
                {card.details && card.details.length > 0 ? (
                  <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                    {card.details.map((detail) => (
                      <div className="rounded-[var(--radius-sm)] bg-[var(--surface-wash)] px-3 py-2" key={`${detail.label}-${detail.value}`}>
                        <dt className="text-[10px] font-semibold uppercase tracking-[var(--tracking-marker)] text-[var(--muted)]">{detail.label}</dt>
                        <dd className="mt-1 text-sm leading-5 text-[var(--text)]">{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </>
            );
            const action = card.action ? (
              <AppLink
                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                href={card.action.href}
              >
                {card.action.label}
                <ArrowUpRight size={16} />
              </AppLink>
            ) : null;

            if (isVisualSteps) {
              const tone = toneByIndex ? STEP_TONES[idx % STEP_TONES.length] : 'search';
              const stepLabel = String(idx + 1).padStart(2, '0');
              return (
                <li
                  className="home-step-card flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]"
                  data-step-tone={tone}
                  key={card.title}
                >
                  <span className="home-step-card-visual flex items-center gap-4 border-b border-[var(--border-default)] p-5">
                    {card.icon ? (
                      <span className="text-[var(--home-step-accent)]">
                        <SectionIcon size={28} type={card.icon} />
                      </span>
                    ) : null}
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
                      {stepLabel}
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-5 pt-4">
                    {textBlock}
                    {action ? <span className="mt-4">{action}</span> : null}
                  </span>
                </li>
              );
            }

            return (
              <li key={card.title}>
                <article className="group relative grid gap-3 rounded-[var(--radius-md)] border border-transparent bg-[var(--surface-card)] p-4 transition-colors hover:border-[var(--accent)]/24 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start md:gap-4 md:p-5">
                  <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--surface-wash)] text-[13px] font-semibold tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)] tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">{textBlock}</div>
                  {action ? <div className="md:justify-self-end">{action}</div> : null}
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
