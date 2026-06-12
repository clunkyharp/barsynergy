import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type { CardAction } from './card-types';

type ActionCardVariant = 'plain' | 'accent';

type ActionCardProps = {
  title: string;
  description?: string;
  actions?: CardAction[];
  variant?: ActionCardVariant;
  children?: React.ReactNode;
  className?: string;
};

export function ActionCard({
  title,
  description,
  actions,
  variant = 'plain',
  children,
  className
}: ActionCardProps) {
  const isAccent = variant === 'accent';

  return (
    <div className={cn(
      'rounded-[var(--radius-lg)] border p-5',
      isAccent
        ? 'border-[var(--accent)]/30 bg-gradient-to-b from-[var(--accent)]/[0.04] to-transparent'
        : 'border-[var(--border-default)] bg-[var(--surface-wash)]',
      className
    )}>
      <h3 className={cn(displayFont.className, 'text-[1.15rem] font-semibold leading-[1.2] text-[var(--text)]')}>
        {title}
      </h3>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
      ) : null}
      {actions && actions.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2.5">
          {actions.map((action) => (
            <Button
              className="w-full rounded-[var(--radius-md)]"
              href={action.href}
              key={`${action.href}-${action.label}`}
              size="sm"
              variant={action.variant ?? (isAccent ? 'primary' : 'secondary')}
            >
              {action.label}
              <ArrowUpRight size={16} />
            </Button>
          ))}
        </div>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
