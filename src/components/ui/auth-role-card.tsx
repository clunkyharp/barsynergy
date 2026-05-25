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
        'group relative block min-h-[126px] overflow-hidden rounded-[8px] border px-5 py-5 transition-[background-color,border-color,box-shadow,color] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none',
        selected
          ? 'border-[color-mix(in_oklab,var(--accent)_18%,var(--border-default))] bg-[color-mix(in_oklab,var(--accent-soft)_52%,var(--surface))] shadow-[0_10px_24px_-8px_rgba(64,31,18,0.14)]'
          : 'border-[var(--border-default)] bg-[var(--surface)] hover:border-[var(--border-strong)]',
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
        <p className="mt-3 text-lg font-semibold leading-[23px] text-[var(--text)]">{title}</p>
        <p className="mt-2 text-sm leading-[19px] text-[var(--muted)]">{description}</p>
      </div>
      {selected ? (
        <span
          aria-hidden="true"
          className="absolute right-5 top-5 h-[11px] w-[11px] rounded-full bg-[color-mix(in_oklab,var(--text)_62%,var(--muted))]"
        />
      ) : null}
      {restrictionLabel ? (
        <span className="absolute bottom-5 right-5 inline-flex min-h-[27px] items-center rounded-[14px] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 text-[11px] font-medium leading-[14px] text-[var(--muted)]">
          {restrictionLabel}
        </span>
      ) : null}
    </AppLink>
  );
}
