'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
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
  { label: 'Войти', href: '/auth/login' },
  { label: 'Контакты', href: '/contacts' }
];

const desktopNavItems = navItems.filter((item) => item.href !== '/contacts' && item.href !== '/auth/login');

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
  const isHomePage = pathname === '/';

  if (isWorkspacePath(pathname)) {
    return null;
  }

      return (
    <header className={cn('sticky top-0 z-50 px-4 pt-4', isHomePage && '-mb-[98px]')}>
      <div className="container">
        <div className="relative z-10 flex min-h-[78px] items-center justify-between gap-2 rounded-full border border-black/10 bg-[color-mix(in_oklab,var(--surface),white_46%)]/90 px-3 shadow-[0_18px_50px_rgba(20,20,18,0.08)] backdrop-blur xl:grid xl:grid-cols-[208px_minmax(0,1fr)_236px] xl:items-center xl:gap-4 xl:px-4 2xl:grid-cols-[224px_minmax(0,1fr)_252px] 2xl:gap-5">
          <a className="flex min-h-12 shrink-0 items-center pl-1 xl:w-[208px] 2xl:w-[224px]" href="/" aria-label="BARSYNERGY">
            <Image
              alt="BARSYNERGY"
              className="h-9 w-auto sm:h-10 lg:h-11"
              height={44}
              priority
              src="/brand/barsynergy-lockup.svg"
              width={162}
            />
          </a>
          <nav className="hidden min-w-0 items-center justify-center gap-0 px-2 text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--text)] xl:flex 2xl:gap-0.5 2xl:px-4 2xl:text-[11px]">
          {desktopNavItems.map((item) => {
            const isActive = pathname ? isActiveItem(pathname, item.href) : false;

            return (
              <a
                className={cn(
                  'inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-2.5 opacity-80 transition hover:bg-white hover:opacity-100 2xl:min-h-11 2xl:px-3',
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
          <div className="hidden items-center justify-end gap-1.5 xl:flex xl:w-[236px] 2xl:w-[252px]">
            <a
              className="inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] transition hover:text-[var(--accent)] 2xl:min-h-11 2xl:px-4 2xl:text-[11px]"
              href="/auth/login"
            >
              Войти
            </a>
            <a
              className="inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[var(--graphite)] bg-[var(--graphite)] px-3.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-white transition hover:bg-black 2xl:min-h-11 2xl:gap-3 2xl:px-5 2xl:text-[12px]"
              href="/contacts"
            >
              <span className="text-white">Связаться</span>
              <ArrowUpRight className="text-white" size={18} />
            </a>
          </div>
          <MobileSiteMenu navItems={navItems} pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
