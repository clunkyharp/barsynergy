'use client';

import { useEffect, useState } from 'react';
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
  { label: 'Для партнёров', href: '/partners' },
  { label: 'Спонсорство', href: '/general-sponsors' },
  { label: 'Войти', href: '/auth/login' },
  { label: 'Контакты', href: '/contacts' }
];

const desktopNavItems = navItems.filter((item) => !['/contacts', '/auth/login'].includes(item.href));

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHomePage = pathname === '/';
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
        'px-4 pt-4',
        isFixedMobileHeader ? 'fixed inset-x-0 top-0 z-[60] lg:sticky lg:top-0 lg:z-50' : 'sticky top-0 z-50',
        isHomePage && !isFixedMobileHeader && '-mb-[98px]'
      )}
    >
      <div className="container">
        <div
          className={cn(
            'relative z-10 flex min-h-[82px] items-center justify-between gap-2 rounded-full px-3 shadow-[0_18px_50px_rgba(20,20,18,0.08)] backdrop-blur lg:grid lg:grid-cols-[188px_minmax(0,1fr)_188px] lg:items-center lg:gap-2 lg:px-4 xl:grid-cols-[220px_minmax(0,1fr)_236px] xl:gap-3 2xl:grid-cols-[250px_minmax(0,1fr)_260px] 2xl:gap-4',
            isMobileMenuOpen
              ? 'border border-white/14 bg-[rgba(20,20,18,0.52)] text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-[18px] lg:border-black/10 lg:bg-[color-mix(in_oklab,var(--surface),white_46%)]/90 lg:text-[var(--text)] lg:shadow-[0_18px_50px_rgba(20,20,18,0.08)]'
              : 'border border-black/10 bg-[color-mix(in_oklab,var(--surface),white_46%)]/90'
          )}
        >
          <a
            aria-label="BARSYNERGY"
            className={cn(
              'flex min-h-12 shrink-0 items-center rounded-full pl-2 pr-1 lg:w-full lg:pr-0',
              isMobileMenuOpen && 'sm:pl-3',
              focusClassName
            )}
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image
              alt="BARSYNERGY"
              className="h-10 w-auto object-contain sm:h-11 lg:h-11"
              height={44}
              priority
              src={isMobileMenuOpen ? '/brand/barsynergy-lockup-light.svg' : '/brand/barsynergy-lockup.svg'}
              width={162}
            />
          </a>
          <nav className="hidden min-w-0 items-center justify-center gap-0 px-0.5 text-[10px] font-semibold uppercase tracking-[0.035em] text-[var(--text)] lg:flex lg:justify-self-center xl:px-1 xl:text-[10px] 2xl:gap-0.5 2xl:px-3 2xl:text-[11px]">
            {desktopNavItems.map((item) => {
              const isActive = pathname ? isActiveItem(pathname, item.href) : false;

              return (
                <a
                  className={cn(
                    'inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-1.5 opacity-84 transition hover:bg-white hover:opacity-100 xl:px-2 2xl:min-h-11 2xl:px-3',
                    focusClassName,
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
          <div className="hidden items-center justify-end gap-1.5 lg:flex lg:w-full">
            <a
              className={cn(
                'hidden min-h-10 items-center whitespace-nowrap rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] transition hover:text-[var(--accent)] xl:inline-flex 2xl:min-h-11 2xl:px-4 2xl:text-[11px]',
                focusClassName
              )}
              href="/auth/login"
            >
              Войти
            </a>
            <a
              className={cn(
                'inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[var(--graphite)] bg-[var(--graphite)] px-3 text-[10px] font-semibold uppercase tracking-[0.06em] text-white transition-colors duration-200 hover:border-[var(--graphite)] hover:bg-[var(--graphite)] hover:text-white xl:px-3.5 xl:text-[11px] 2xl:min-h-11 2xl:gap-3 2xl:px-5 2xl:text-[12px]',
                focusClassName
              )}
              href="/contacts"
            >
              <span className="text-white">Связаться</span>
              <ArrowUpRight className="text-white" size={18} />
            </a>
          </div>
          <MobileSiteMenu isOpen={isMobileMenuOpen} navItems={navItems} onOpenChange={setIsMobileMenuOpen} />
        </div>
      </div>
    </header>
  );
}
