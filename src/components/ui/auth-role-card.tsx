import type { ReactNode } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

type AuthRoleCardProps = {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  href: string;
  selected?: boolean;
  disabled?: boolean;
  restrictionLabel?: string;
  className?: string;
};

export function AuthRoleCard({
  eyebrow = 'Роль',
  title,
  description,
  href,
  selected = false,
  disabled = false,
  restrictionLabel,
  className
}: AuthRoleCardProps) {
  return (
    <AppLink
      aria-current={selected ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        'group relative block min-h-[126px] overflow-hidden rounded-[var(--radius-md)] border px-5 py-5 transition-[background-color,border-color,box-shadow,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none',
        selected
          ? 'border-2 border-[var(--accent)] bg-[var(--accent-soft)] shadow-none'
          : 'border border-[var(--border-default)] bg-transparent hover:border-[var(--border-strong)]',
        disabled && 'pointer-events-none border-[var(--border-default)] bg-[var(--surface-muted)] text-[var(--muted)] opacity-70',
        className
      )}
      data-auth-role-card=""
      data-state={disabled ? 'disabled' : selected ? 'selected' : 'idle'}
      href={href}
      tabIndex={disabled ? -1 : undefined}
    >
      <div className="pr-8">
        <p className={cn('text-xs font-semibold leading-[15px] text-[var(--muted)]', selected && 'text-[color-mix(in_oklab,var(--accent)_34%,var(--muted))]')}>
          {eyebrow}
        </p>
        <p className={cn('mt-3 text-lg leading-[23px] text-[var(--text)]', selected ? 'font-semibold' : 'font-medium')}>{title}</p>
        <p className="mt-2 text-sm leading-[19px] text-[var(--muted)]">{description}</p>
      </div>
      {selected ? (
        <span
          aria-hidden="true"
          className="absolute right-5 top-5 h-3 w-3 rounded-full bg-[var(--accent)]"
        />
      ) : null}
      {restrictionLabel ? (
        <span className="absolute bottom-5 right-5 inline-flex min-h-[27px] items-center rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 text-[11px] font-medium leading-[14px] text-[var(--muted)]">
          {restrictionLabel}
        </span>
      ) : null}
    </AppLink>
  );
}
