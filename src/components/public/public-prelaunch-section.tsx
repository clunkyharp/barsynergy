import { ArrowUpRight } from 'lucide-react';
import { FeatureCard } from '@/components/public/public-card-patterns';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
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
      <div className="container grid gap-6 md:gap-8 xl:grid-cols-[minmax(16rem,0.62fr)_minmax(0,1.38fr)] xl:gap-10">
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

        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)] md:grid md:grid-cols-2 md:gap-4 md:divide-y-0 md:border-y-0 lg:grid-cols-3">
          {cards.map((card, index) => (
            <FeatureCard
              action={card.action}
              className="border-0 bg-transparent py-4 hover:bg-transparent md:min-h-[22rem] md:border md:bg-[var(--surface-wash)] md:hover:bg-[var(--surface-wash-strong)]"
              code={String(index + 1).padStart(2, '0')}
              description={card.description}
              details={card.details}
              footer={card.hint}
              key={card.title}
              title={card.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
