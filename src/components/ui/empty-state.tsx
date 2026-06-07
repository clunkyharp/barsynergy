import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type EmptyStateAction = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: EmptyStateAction[];
  /** @deprecated use actions[] */
  actionLabel?: string;
  /** @deprecated use actions[] */
  actionHref?: string;
  context?: string;
};

export function EmptyState({ title, description, icon: Icon, actions, actionLabel, actionHref, context }: EmptyStateProps) {
  const resolvedActions: EmptyStateAction[] = actions ?? (actionLabel && actionHref ? [{ label: actionLabel, href: actionHref }] : []);

  if (Icon) {
    return (
      <div className="flex max-w-xl flex-col items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-card)]">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon aria-hidden size={20} strokeWidth={1.8} />
        </span>
        <div>
          <h2 className="text-xl font-semibold leading-7 text-[var(--text)]">{title}</h2>
          {description ? <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
        </div>
        {resolvedActions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {resolvedActions.map((action) => (
              <Button href={action.href} key={action.href}>
                {action.icon ? <action.icon aria-hidden size={15} strokeWidth={1.8} /> : null}
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return <ContextualEmptyState title={title} description={description} actions={resolvedActions} context={context} />;
}

export function ContextualEmptyState({
  title,
  description,
  actions,
  actionLabel,
  actionHref,
  context = 'Список'
}: Omit<EmptyStateProps, 'icon'>) {
  const resolvedActions: EmptyStateAction[] = actions ?? (actionLabel && actionHref ? [{ label: actionLabel, href: actionHref }] : []);

  return (
    <Card className="border-l-[3px] border-l-[var(--accent)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{context}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
        </div>
        {resolvedActions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {resolvedActions.map((action) => (
              <Button className="w-full sm:w-auto" href={action.href} key={action.href}>
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
