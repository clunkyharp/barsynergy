'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type BusinessSidebarProps = {
  companyName: string;
};

const links = [
  { href: '/business', label: 'Компания' },
  { href: '/business/requests', label: 'Заявки' }
];

export function BusinessSidebar({ companyName }: BusinessSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-[1.75rem] border border-[var(--line)] bg-white/90 p-5 shadow-[0_24px_80px_rgba(22,19,15,0.08)] backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Бизнес-кабинет</p>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{companyName}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Управление заявками, статусом компании и рабочими комментариями.</p>
      <nav className="mt-6 grid gap-2 text-sm">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);

          return (
            <a
              className={cn(
                'rounded-2xl px-3 py-2.5 font-semibold transition hover:bg-[var(--surface-muted)]',
                isActive ? 'bg-[var(--graphite)] text-white hover:bg-[var(--graphite)]' : 'text-[var(--text)]'
              )}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </a>
          );
        })}
      </nav>
      <div className="mt-6 rounded-2xl border border-black/10 bg-[var(--surface)] px-4 py-4 text-sm leading-6 text-[var(--muted)]">
        Сначала проверьте статус компании и текущие заявки. Новые запросы лучше отправлять только с заполненным профилем.
      </div>
    </aside>
  );
}
