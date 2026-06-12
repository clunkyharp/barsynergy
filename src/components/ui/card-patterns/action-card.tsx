import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type ActionCardAction = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

type ActionCardProps = {
  title: string;
  description?: string;
  actions: ActionCardAction[];
  className?: string;
};

export function ActionCard({
  title,
  description,
  actions,
  className
}: ActionCardProps) {
  return (
    <div className={cn(
      'rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-5',
      className
    )}>
      <h3 className={cn(displayFont.className, 'text-[1.15rem] font-semibold leading-[1.2] text-[var(--text)]')}>
        {title}
      </h3>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      ) : null}
      {actions.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2.5">
          {actions.map((action) => (
            <Button
              className="w-full rounded-[var(--radius-md)]"
              href={action.href}
              key={`${action.href}-${action.label}`}
              size="sm"
              variant={action.variant ?? 'primary'}
            >
              {action.label}
              <ArrowUpRight size={16} />
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
