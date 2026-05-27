import type { ReactNode } from 'react';
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
    <section className={cn('admin-page-intro grid gap-4 md:grid-cols-[1fr_auto] md:items-end', className)}>
      <div className="min-w-0">
        <p className="admin-page-intro-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="md:justify-self-end">{action}</div> : null}
    </section>
  );
}
