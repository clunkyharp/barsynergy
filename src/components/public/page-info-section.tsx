import type { ReactNode } from 'react';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { AppLink } from '@/components/ui/app-link';

type PageInfoSectionLink = {
  href: string;
  label: string;
};

type PageInfoSectionProps = {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  sidebarLinks?: PageInfoSectionLink[];
  sidebarLabel?: string;
};

export function PageInfoSection({
  eyebrow,
  title,
  children,
  sidebarLinks,
  sidebarLabel = 'Полезные ссылки',
}: PageInfoSectionProps) {
  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-10 md:py-14">
      <div className="container">
        <div className="mx-auto max-w-5xl rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-start">
            <div className="min-w-0">
              {eyebrow ? (
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">
                  {eyebrow}
                </span>
              ) : null}
              <h2 className={cn(displayFont.className, 'mt-2 text-2xl font-semibold text-[var(--text)] md:text-3xl')}>
                {title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-6 text-[var(--muted)]">
                {children}
              </div>
            </div>
            {sidebarLinks && sidebarLinks.length > 0 ? (
              <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-wash)] p-5">
                <span className="text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">
                  {sidebarLabel}
                </span>
                <ul className="mt-4 flex flex-col gap-3">
                  {sidebarLinks.map((link) => (
                    <li key={link.href}>
                      <AppLink
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                        href={link.href}
                      >
                        {link.label}
                      </AppLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
