import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';

type PrelaunchCard = {
  title: string;
  description: string;
  details?: {
    label: string;
    value: string;
  }[];
  hint?: string;
  action?: PrelaunchAction;
};

type PrelaunchAction = {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse';
};

type PublicPrelaunchSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  cards: PrelaunchCard[];
  actions: PrelaunchAction[];
  badges?: string[];
  id?: string;
};

export function PublicPrelaunchSection({
  eyebrow,
  title,
  description,
  cards,
  actions,
  badges = [],
  id
}: PublicPrelaunchSectionProps) {
  return (
    <section className="background-zone background-zone-gray border-b border-[var(--line)] py-8 md:py-14" id={id}>
      <div className="container grid gap-8 md:gap-10 xl:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.1fr)] xl:gap-12">
        <div className="xl:self-start">
          <PublicEyebrow>{eyebrow}</PublicEyebrow>
          <PublicDisplayTitle className="mt-4 max-w-[13ch]">{title}</PublicDisplayTitle>
          <PublicBodyText className="mt-5 max-w-md" size="md">
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

        <ol className="grid gap-3">
          {cards.map((card, idx) => (
            <li key={card.title}>
              <article className="group relative grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 transition-colors hover:border-[var(--accent)]/35 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start md:gap-6 md:p-6">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--surface-wash)] text-sm font-semibold tracking-[0.06em] text-[var(--accent)]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-7 text-[var(--text)] md:text-xl md:leading-8">{card.title}</h3>
                  {card.hint ? <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{card.hint}</p> : null}
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)] md:text-[15px] md:leading-7">{card.description}</p>
                  {card.details && card.details.length > 0 ? (
                    <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                      {card.details.map((detail) => (
                        <div className="rounded-[var(--radius-sm)] bg-[var(--surface-wash)] px-3 py-2" key={`${detail.label}-${detail.value}`}>
                          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{detail.label}</dt>
                          <dd className="mt-1 text-sm leading-5 text-[var(--text)]">{detail.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
                {card.action ? (
                  <AppLink
                    className="inline-flex min-h-11 w-fit items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:justify-self-end"
                    href={card.action.href}
                  >
                    {card.action.label}
                    <ArrowUpRight size={16} />
                  </AppLink>
                ) : null}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
