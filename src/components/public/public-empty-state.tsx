import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button, type ButtonVariant } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
import { SectionIcon, type SectionIconType } from '@/components/public/section-icon';
import { cn } from '@/lib/utils';

type EmptyStateAction = {
  href: string;
  label: string;
  variant?: ButtonVariant;
};

type PublicEmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  className?: string;
  compact?: boolean;
  icon?: SectionIconType;
  children?: ReactNode;
};

export function PublicEmptyState({
  eyebrow,
  title,
  description,
  actions = [],
  className,
  compact = false,
  icon,
  children
}: PublicEmptyStateProps) {
  const actionButtons =
    actions.length > 0 ? (
      <div className={cn('flex flex-wrap gap-3', compact ? '' : 'justify-center')}>
        {actions.map((action) => (
          <Button
            className="min-h-11 rounded-[var(--radius-md)] px-5 tracking-normal"
            href={action.href}
            key={`${action.href}-${action.label}`}
            size={compact ? 'sm' : 'md'}
            variant={action.variant ?? 'primary'}
          >
            {action.label}
            {action.variant === 'link' ? <ArrowUpRight size={14} /> : null}
          </Button>
        ))}
      </div>
    ) : null;

  if (compact) {
    return (
      <Panel
        className={cn(
          'public-empty-state public-missing-state space-y-3 border-[var(--border-default)] bg-[var(--surface-wash)]',
          className
        )}
        padding="md"
      >
        <div className="max-w-2xl">
          {eyebrow ? <PublicEyebrow tone="muted">{eyebrow}</PublicEyebrow> : null}
          <h3 className={cn('text-xl font-semibold leading-7 text-[var(--text)]', eyebrow ? 'mt-3' : '')}>{title}</h3>
        </div>
        <PublicBodyText className="max-w-2xl" size="sm">
          {description}
        </PublicBodyText>
        {actionButtons}
        {children ? <div className="pt-2">{children}</div> : null}
      </Panel>
    );
  }

  return (
    <Panel
      className={cn(
        'public-empty-state public-missing-state flex flex-col items-center border-[var(--border-default)] bg-[var(--surface-wash)] py-12 text-center md:py-16',
        className
      )}
      padding="lg"
    >
      {icon ? (
        <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)]">
          <SectionIcon size={36} type={icon} />
        </span>
      ) : null}
      {eyebrow ? <PublicEyebrow tone="muted">{eyebrow}</PublicEyebrow> : null}
      <h3 className={cn('text-2xl font-semibold leading-8 text-[var(--text)]', eyebrow ? 'mt-3' : '')}>{title}</h3>
      <PublicBodyText className="mx-auto mt-3 max-w-xl" size="md">
        {description}
      </PublicBodyText>
      {actionButtons ? <div className="mt-6">{actionButtons}</div> : null}
      {children ? <div className="mt-6 w-full max-w-md">{children}</div> : null}
    </Panel>
  );
}
