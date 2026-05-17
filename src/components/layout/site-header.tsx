'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, UserRound } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MobileSiteMenu } from '@/components/layout/mobile-site-menu';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'О проекте', href: '/about' },
  { label: 'Образование', href: '/education' },
  { label: 'События', href: '/events' },
  { label: 'Знания', href: '/articles' },
  { label: 'Вакансии', href: '/vacancies' },
  { label: 'Для бизнеса', href: '/business' },
  { label: 'Консалтинг', href: '/consulting' },
  { label: 'Поставщики', href: '/suppliers' },
  { label: 'Для партнёров', href: '/partners' },
  { label: 'Спонсорство', href: '/general-sponsors' },
  { label: 'Войти', href: '/auth/login' },
  { label: 'Контакты', href: '/contacts' }
];

const desktopNavItems = navItems.filter((item) => !['/contacts', '/auth/login'].includes(item.href));

function isWorkspacePath(pathname: string | null) {
  return Boolean(pathname?.startsWith('/admin') || pathname?.startsWith('/business/cabinet') || pathname?.startsWith('/auth'));
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isFixedMobileHeader = isMobileMenuOpen;
  const focusClassName = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isWorkspacePath(pathname)) {
    return null;
  }

  return (
    <header
      className={cn(
        'border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-[16px]',
        isFixedMobileHeader ? 'fixed inset-x-0 top-0 z-[60] xl:sticky xl:top-0 xl:z-50' : 'sticky top-0 z-50'
      )}
    >
      <div className="container">
        <div className="relative z-10 flex min-h-[76px] items-center justify-between gap-3 px-0 text-[var(--text)] xl:grid xl:grid-cols-[176px_minmax(0,1fr)_184px] xl:items-center xl:gap-2.5 2xl:grid-cols-[220px_minmax(0,1fr)_248px] 2xl:gap-5">
          <AppLink
            aria-label="BARSYNERGY"
            className={cn(
              'flex min-h-12 shrink-0 items-center rounded-[var(--radius-md)] pr-1 xl:w-full xl:pr-0',
              isMobileMenuOpen && 'sm:pl-3',
              focusClassName
            )}
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image
              alt="BARSYNERGY"
              className="theme-logo-light h-10 w-auto object-contain sm:h-11 xl:h-10 2xl:h-11"
              height={44}
              priority
              src="/brand/barsynergy-lockup.svg"
              width={162}
            />
            <Image
              alt="BARSYNERGY"
              className="theme-logo-dark h-10 w-auto object-contain sm:h-11 xl:h-10 2xl:h-11"
              height={44}
              priority
              src="/brand/barsynergy-lockup-light.svg"
              width={162}
            />
          </AppLink>
          <nav className="hidden min-w-0 items-center justify-center gap-1.5 px-0 text-[11px] font-semibold text-[var(--text)] xl:flex xl:justify-self-center 2xl:gap-5 2xl:text-[12px]">
            {desktopNavItems.map((item) => {
              const isActive = pathname ? isActiveItem(pathname, item.href) : false;

              return (
                <AppLink
                  className={cn(
                    'relative inline-flex min-h-9 items-center whitespace-nowrap rounded-[var(--radius-sm)] px-1 opacity-86 transition after:absolute after:inset-x-1 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform hover:text-[var(--text)] hover:opacity-100 hover:after:scale-x-100 2xl:px-2 2xl:after:inset-x-1.5',
                    focusClassName,
                    isActive && 'text-[var(--accent)] opacity-100 after:scale-x-100'
                  )}
                  key={item.href}
                  href={item.href}
                >
                  {item.label}
                </AppLink>
              );
            })}
          </nav>
          <div className="hidden items-center justify-end gap-1.5 xl:flex xl:w-full">
            <ThemeToggle compact />
            <AppLink
              className={cn(
                'inline-flex min-h-10 w-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-0 text-[12px] font-semibold text-[var(--accent)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] 2xl:min-h-11 2xl:w-auto 2xl:px-4',
                focusClassName
              )}
              href="/auth/login"
              aria-label="Войти в кабинет"
            >
              <UserRound size={16} strokeWidth={1.8} />
              <span className="hidden 2xl:inline">Войти</span>
            </AppLink>
            <AppLink
              className={cn(
                'inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--accent)] px-2.5 text-[12px] font-semibold text-[var(--accent)] transition-colors duration-200 hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] xl:px-3.5 2xl:min-h-11 2xl:gap-3 2xl:px-5',
                focusClassName
              )}
              href="/contacts"
              aria-label="Связаться"
            >
              <span className="hidden xl:inline">Связаться</span>
              <ArrowUpRight size={18} />
            </AppLink>
          </div>
          <MobileSiteMenu isOpen={isMobileMenuOpen} navItems={navItems} onOpenChange={setIsMobileMenuOpen} />
        </div>
      </div>
    </header>
  );
}
