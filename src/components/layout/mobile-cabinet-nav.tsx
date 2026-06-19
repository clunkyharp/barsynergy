'use client';

import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bookmark,
  Mail,
  MessageSquare,
  Settings,
  Building2,
  FileText,
  Users,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Bookmark,
  Mail,
  MessageSquare,
  Settings,
  Building2,
  FileText,
  Users,
  Wrench,
};

type MobileCabinetNavProps = {
  links: { href: string; label: string; icon: string }[];
};

export function MobileCabinetNav({ links }: MobileCabinetNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Навигация по разделам" className="-mx-4 overflow-x-auto border-b border-[var(--line)] px-4 lg:hidden">
      <div className="flex min-w-max gap-1 pb-1">
        {links.map((link) => {
          const isActive =
            link.href === '/profile' || link.href === '/business/cabinet'
              ? pathname === link.href
              : pathname === link.href || pathname?.startsWith(`${link.href}/`);

          return (
            <AppLink
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
              )}
              href={link.href}
              key={link.href}
            >
              {(() => {
                const IconComponent = iconMap[link.icon];
                return IconComponent ? (
                  <IconComponent aria-hidden size={16} strokeWidth={1.8} />
                ) : null;
              })()}
              {link.label}
            </AppLink>
          );
        })}
      </div>
    </nav>
  );
}
