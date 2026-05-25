'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, UserRound } from 'lucide-react';
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
  { label: 'Поставщики', href: '/suppliers' },
  { label: 'Для бизнеса', href: '/business' },
  { label: 'Консалтинг', href: '/consulting' },
  { label: 'Партнёрам', href: '/partners' },
  { label: 'Спонсорство', href: '/general-sponsors' },
  { label: 'Контакты', href: '/contacts' },
  { label: 'Войти', href: '/auth/login' }
];

function getNavItems(hrefs: string[]) {
  return hrefs
    .map((href) => navItems.find((item) => item.href === href))
    .filter((item): item is (typeof navItems)[number] => Boolean(item));
}

const desktopPrimaryNavItems = getNavItems(['/education', '/events', '/articles', '/vacancies', '/suppliers', '/business']);
const desktopMoreNavItems = getNavItems(['/partners', '/general-sponsors', '/consulting', '/contacts']);

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
  const [isMoreNavOpen, setIsMoreNavOpen] = useState(false);
  const isFixedMobileHeader = isMobileMenuOpen;
  const focusClassName = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';
  const activeMoreItem = desktopMoreNavItems.find((item) => pathname && isActiveItem(pathname, item.href));
  const moreLabel = activeMoreItem?.label ?? 'Ещё';

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreNavOpen(false);
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
        <div className="relative z-10 flex min-h-[76px] items-center justify-between gap-3 px-0 text-[var(--text)] xl:grid xl:grid-cols-[176px_minmax(0,1fr)_176px] xl:items-center xl:gap-2.5 2xl:grid-cols-[220px_minmax(0,1fr)_184px] 2xl:gap-5">
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
          <nav className="hidden min-w-0 items-center justify-center gap-2.5 px-0 text-[13px] font-semibold text-[var(--text)] xl:flex xl:justify-self-center 2xl:gap-3">
            {desktopPrimaryNavItems.map((item) => {
              const isActive = pathname ? isActiveItem(pathname, item.href) : false;

              return (
                <AppLink
                  className={cn(
                    'relative inline-flex min-h-11 items-center whitespace-nowrap rounded-[var(--radius-sm)] px-2 opacity-86 transition-[color,opacity] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] after:absolute after:inset-x-2 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-[var(--motion-duration-base)] after:ease-[var(--motion-ease-move)] hover:text-[var(--text)] hover:opacity-100 hover:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none 2xl:px-2.5',
                    focusClassName,
                    isActive && 'text-[var(--accent)] opacity-100 after:scale-x-100'
                  )}
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </AppLink>
              );
            })}
            {desktopMoreNavItems.length > 0 ? (
              <details
                className="group relative"
                onBlur={(event) => {
                  const nextTarget = event.relatedTarget as Node | null;

                  if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
                    setIsMoreNavOpen(false);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setIsMoreNavOpen(false);
                  }
                }}
                onMouseEnter={() => setIsMoreNavOpen(true)}
                onMouseLeave={() => setIsMoreNavOpen(false)}
                onToggle={(event) => setIsMoreNavOpen(event.currentTarget.open)}
                open={isMoreNavOpen}
              >
                <summary
                  className={cn(
                    'relative inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] px-2 opacity-86 transition-[color,opacity] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] after:absolute after:inset-x-2 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-[var(--motion-duration-base)] after:ease-[var(--motion-ease-move)] hover:text-[var(--text)] hover:opacity-100 hover:after:scale-x-100 group-open:text-[var(--accent)] group-open:opacity-100 group-open:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none [&::-webkit-details-marker]:hidden 2xl:px-2.5',
                    desktopMoreNavItems.some((item) => pathname && isActiveItem(pathname, item.href)) && 'text-[var(--accent)] opacity-100 after:scale-x-100',
                    focusClassName
                  )}
                >
                  {moreLabel}
                  <ChevronDown className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-open:rotate-180 motion-reduce:transition-none" size={14} strokeWidth={1.8} />
                </summary>
                <div className="absolute right-0 top-[calc(100%+0.35rem)] z-20 grid min-w-[12rem] gap-1 rounded-[var(--radius-md)] border border-[var(--card-border)] bg-[var(--surface-elevated)] p-2 shadow-[var(--shadow-panel)]">
                  {desktopMoreNavItems.map((item) => {
                    const isActive = pathname ? isActiveItem(pathname, item.href) : false;

                    return (
                      <AppLink
                        className={cn(
                          'flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 py-2 text-[13px] font-semibold text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[var(--surface-muted)] hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none',
                          isActive && 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                        )}
                        href={item.href}
                        key={item.href}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </AppLink>
                    );
                  })}
                </div>
              </details>
            ) : null}
          </nav>
          <div className="hidden items-center justify-end gap-1.5 xl:flex xl:w-full">
            <ThemeToggle compact />
            <AppLink
              className={cn(
                'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-3 text-[12px] font-semibold text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)] motion-reduce:transition-none 2xl:px-4',
                focusClassName
              )}
              href="/auth/login"
              aria-label="Войти в кабинет"
            >
              <UserRound size={16} strokeWidth={1.8} />
              <span>Войти</span>
            </AppLink>
          </div>
          <MobileSiteMenu isOpen={isMobileMenuOpen} navItems={navItems} onOpenChange={setIsMobileMenuOpen} />
        </div>
      </div>
    </header>
  );
}
