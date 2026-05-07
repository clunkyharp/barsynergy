import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  context?: string;
};

export function ContextualEmptyState({ actionHref, actionLabel, context = 'Список', description, title }: EmptyStateProps) {
  return (
    <Card className="border-l-[3px] border-l-[var(--accent)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{context}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
        </div>
        {actionLabel && actionHref ? (
          <Button className="w-full sm:w-auto" href={actionHref}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

export function EmptyState(props: EmptyStateProps) {
  return <ContextualEmptyState {...props} />;
}
