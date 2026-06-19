import { cn } from '@/lib/utils';

export function CategoryPill({
  href,
  active,
  children
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <a
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-[13px] font-semibold leading-5 transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] [scroll-snap-align:start] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 motion-reduce:transition-none',
        active
          ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
          : 'border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--text)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface-muted)]'
      )}
      href={href}
    >
      {children}
    </a>
  );
}
