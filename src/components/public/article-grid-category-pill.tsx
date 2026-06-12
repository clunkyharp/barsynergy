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
      className={cn(
        'inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-semibold leading-5 transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 motion-reduce:transition-none',
        active
          ? 'border border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
          : 'bg-[var(--surface-wash)] text-[var(--text)] hover:bg-[var(--surface-muted)]'
      )}
      href={href}
    >
      {children}
    </a>
  );
}
