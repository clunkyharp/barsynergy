'use client';

import { ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { MobileSiteMenu } from '@/components/layout/mobile-site-menu';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'О проекте', href: '/about' },
  { label: 'Образование', href: '/education' },
  { label: 'События', href: '/events' },
  { label: 'Знания', href: '/articles' },
  { label: 'Вакансии', href: '/vacancies' },
  { label: 'Поставщики', href: '/suppliers' },
  { label: 'Партнеры', href: '/partners' },
  { label: 'Спонсоры', href: '/general-sponsors' },
  { label: 'Кабинет', href: '/auth/login' },
  { label: 'Контакты', href: '/contacts' }
];

const desktopNavItems = navItems.filter((item) => item.href !== '/contacts');

function isWorkspacePath(pathname: string | null) {
  return Boolean(pathname?.startsWith('/admin') || pathname?.startsWith('/business') || pathname?.startsWith('/auth'));
}

function isActiveItem(pathname: string, href: string) {
  if (href === '/auth/login') {
    return pathname.startsWith('/auth');
  }

  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  if (isWorkspacePath(pathname)) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/20 bg-[color-mix(in_oklab,var(--background),white_20%)]/95 backdrop-blur">
      <div className="container flex min-h-[76px] items-center justify-between gap-4 xl:gap-5">
        <a className="flex min-h-12 shrink-0 items-center gap-3" href="/" aria-label="BARSYNERGY">
          <img
            src="/brand/barsynergy-lockup.svg"
            alt="BARSYNERGY"
            width={178}
            height={47}
            className="h-auto w-[164px] 2xl:w-[178px]"
            decoding="async"
            fetchPriority="high"
          />
        </a>
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 px-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text)] xl:flex 2xl:px-4 2xl:text-[12px]">
          {desktopNavItems.map((item) => {
            const isActive = pathname ? isActiveItem(pathname, item.href) : false;

            return (
              <a
                className={cn(
                  'inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3 opacity-80 transition hover:bg-white/70 hover:opacity-100 2xl:px-4',
                  isActive && 'bg-[var(--graphite)] text-white opacity-100 hover:bg-[var(--graphite)]'
                )}
                key={item.href}
                href={item.href}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        <a
          className="hidden min-h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[var(--graphite)] bg-[var(--graphite)] px-4 text-[12px] font-semibold uppercase tracking-[0.05em] text-white transition hover:bg-black xl:inline-flex 2xl:gap-3 2xl:px-5 2xl:text-sm 2xl:tracking-[0.06em]"
          href="/contacts"
        >
          <span className="text-white">Написать</span>
          <ArrowUpRight className="text-white" size={18} />
        </a>
        <MobileSiteMenu navItems={navItems} />
      </div>
    </header>
  );
}
