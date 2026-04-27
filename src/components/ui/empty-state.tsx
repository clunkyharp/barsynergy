import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">{description}</p>
      {actionLabel && actionHref ? (
        <div className="mt-6 flex justify-center">
          <Button href={actionHref}>{actionLabel}</Button>
        </div>
      ) : null}
    </Card>
  );
}
