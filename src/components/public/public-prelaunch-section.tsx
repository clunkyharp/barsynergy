import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';

type PrelaunchCard = {
  title: string;
  description: string;
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
    <section className="border-b border-[var(--line)] bg-[var(--surface)] py-10 md:py-14" id={id}>
      <div className="container grid gap-8 xl:grid-cols-[minmax(16rem,0.62fr)_minmax(0,1.38fr)] xl:gap-10">
        <div className="xl:sticky xl:top-24 xl:self-start">
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
          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Button
                className="min-h-12 rounded-[var(--radius-md)] px-5 tracking-normal"
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.08fr_0.92fr]">
          {cards.map((card) => (
            <Panel
              className="flex min-h-[180px] flex-col justify-between border-[var(--border-default)] bg-[var(--surface-wash)]"
              key={card.title}
              padding="lg"
            >
              <div>
                <span aria-hidden="true" className="block h-px w-12 bg-[var(--accent)]/45" />
                <h3 className="mt-5 text-[1.2rem] font-semibold leading-7 text-[var(--text)] md:text-[1.45rem] md:leading-8">
                  {card.title}
                </h3>
              </div>
              <PublicBodyText className="mt-5 max-w-[34ch]">{card.description}</PublicBodyText>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}
