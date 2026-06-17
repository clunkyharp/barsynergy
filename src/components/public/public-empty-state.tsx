import { ArrowUpRight } from 'lucide-react';
import { Button, type ButtonVariant } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
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
};

export function PublicEmptyState({
  eyebrow,
  title,
  description,
  actions = [],
  className,
  compact = false
}: PublicEmptyStateProps) {
  return (
    <Panel
      className={cn(
        'public-empty-state public-missing-state border-[var(--border-default)] bg-[var(--surface-wash)]',
        compact ? 'space-y-3' : 'space-y-4',
        className
      )}
      padding={compact ? 'md' : 'lg'}
    >
      <div className="max-w-2xl">
        {eyebrow ? <PublicEyebrow tone="muted">{eyebrow}</PublicEyebrow> : null}
        <h3 className={cn('font-semibold text-[var(--text)]', eyebrow ? 'mt-3' : '', compact ? 'text-xl leading-7' : 'text-2xl leading-8')}>
          {title}
        </h3>
      </div>
      <PublicBodyText className="max-w-2xl" size={compact ? 'sm' : 'md'}>
        {description}
      </PublicBodyText>
      {actions.length > 0 ? (
        <div className="flex flex-wrap gap-3">
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
      ) : null}
    </Panel>
  );
}
