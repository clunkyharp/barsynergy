import type { ReactNode } from 'react';
import { Panel } from '@/components/ui/panel';
import { cn } from '@/lib/utils';

type AdminPageIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function AdminPageIntro({ eyebrow, title, description, action, className }: AdminPageIntroProps) {
  return (
    <Panel className={cn('grid gap-4 md:grid-cols-[1fr_auto] md:items-end', className)} padding="lg" tone="elevated">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      </div>
      {action ? <div className="md:justify-self-end">{action}</div> : null}
    </Panel>
  );
}
