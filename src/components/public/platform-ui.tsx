import type { ComponentType } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
import { CardActionRow, IconBadge } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type LinkAction = {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse';
};

export type PlatformActionCardProps = {
  eyebrow: string;
  title: string;
  description?: string;
  steps: string[];
  action: LinkAction;
  secondaryAction?: LinkAction;
  className?: string;
};

export function PlatformActionCard({
  eyebrow,
  title,
  description,
  steps,
  action,
  secondaryAction,
  className
}: PlatformActionCardProps) {
  return (
    <Panel className={cn('overflow-hidden border-[var(--border-default)] bg-[var(--surface-wash)] p-0', className)}>
      <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(18rem,0.58fr)] xl:p-7">
        <div className="min-w-0">
          <PublicEyebrow>{eyebrow}</PublicEyebrow>
          <h3 className={`${displayFont.className} mt-4 max-w-2xl text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.6rem]`}>
            {title}
          </h3>
          {description ? (
            <PublicBodyText className="mt-4 max-w-xl" size="md">
              {description}
            </PublicBodyText>
          ) : null}
        </div>

        <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Шаги</p>
          <ol className="mt-4 grid gap-0">
            {steps.map((step, index) => (
              <li className="grid min-h-[3.7rem] grid-cols-[2rem_minmax(0,1fr)] gap-3" key={step}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/8 text-[11px] font-semibold tabular-nums text-[var(--accent)]">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm leading-6 text-[var(--text)]">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button className="rounded-[var(--radius-md)] px-5" href={action.href} size="sm" variant={action.variant ?? 'primary'}>
              {action.label}
              <ArrowUpRight size={16} />
            </Button>
            {secondaryAction ? (
              <Button
                className="rounded-[var(--radius-md)] px-5"
                href={secondaryAction.href}
                size="sm"
                variant={secondaryAction.variant ?? 'secondary'}
              >
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export type PlatformFormatCardProps = {
  label: string;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  audience?: string;
  outcome?: string;
  status?: string;
  meta?: readonly string[];
  action?: LinkAction;
  className?: string;
};

export function PlatformFormatCard({
  label,
  title,
  description,
  icon,
  audience,
  outcome,
  status,
  meta = [],
  action,
  className
}: PlatformFormatCardProps) {
  return (
    <Panel
      className={cn('flex min-h-[236px] flex-col justify-between border-[var(--border-default)] bg-[var(--surface-wash)]', className)}
      padding="lg"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <PublicEyebrow>{label}</PublicEyebrow>
          {icon ? <IconBadge icon={icon} size="sm" tone="soft" /> : null}
        </div>
        <h3 className={`${displayFont.className} mt-5 text-[1.7rem] font-semibold leading-none text-[var(--text)]`}>{title}</h3>
        <PublicBodyText className="mt-4 max-w-[34ch]">{description}</PublicBodyText>
        {(audience || outcome) ? (
          <div className="mt-5 grid gap-3">
            {audience ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Для кого</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text)]">{audience}</p>
              </div>
            ) : null}
            {outcome ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Что даёт</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text)]">{outcome}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="mt-7">
        {meta.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {meta.map((item) => (
              <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" key={item} variant="filter">
                {item}
              </MetaChip>
            ))}
          </div>
        ) : null}
        {action ? (
          <CardActionRow className="mt-5 pt-4">
            <span className="rounded-[var(--radius-sm)] border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              {status ?? 'Заявки принимаются'}
            </span>
            <Button className="px-0 text-[11px] tracking-[0.14em]" href={action.href} size="sm" variant={action.variant ?? 'link'}>
              {action.label}
              <ArrowUpRight size={14} />
            </Button>
          </CardActionRow>
        ) : null}
      </div>
    </Panel>
  );
}

export type { LogoGridItem } from './platform-ui-logo-grid';
export { LogoGrid } from './platform-ui-logo-grid';
export { DateBlock } from './platform-ui-date-block';
export type { ToolTeaserContent } from './platform-ui-tool-teaser';
export { ToolTeaser } from './platform-ui-tool-teaser';
export { EventAgendaSection } from './platform-ui-event-agenda';
