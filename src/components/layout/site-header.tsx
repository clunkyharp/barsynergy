'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, UserRound } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MobileSiteMenu } from '@/components/layout/mobile-site-menu';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'О проекте', href: '/about' },
  { label: 'Обучение', href: '/education' },
  { label: 'События', href: '/events' },
  { label: 'Материалы', href: '/articles' },
  { label: 'Вакансии', href: '/vacancies' },
  { label: 'Поставщики', href: '/suppliers' },
  { label: 'Для бизнеса', href: '/business' },
  { label: 'Консалтинг', href: '/consulting' },
  { label: 'Партнёры', href: '/partners' },
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
const desktopMoreNavItems = getNavItems(['/consulting', '/partners', '/general-sponsors', '/contacts']);

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
  const [hasScrolled, setHasScrolled] = useState(false);
  const moreNavRef = useRef<HTMLDetailsElement>(null);
  const isFixedMobileHeader = isMobileMenuOpen;
  const focusClassName = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';
  const activeMoreItem = desktopMoreNavItems.find((item) => pathname && isActiveItem(pathname, item.href));
  const moreLabel = activeMoreItem?.label ?? 'Ещё';
  const isHomePath = pathname === '/';
  const isHomeTop = isHomePath && !hasScrolled && !isMobileMenuOpen;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isHomePath) {
      setHasScrolled(true);
      return;
    }

    const updateHeaderState = () => setHasScrolled(window.scrollY > 20);

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });

    return () => window.removeEventListener('scroll', updateHeaderState);
  }, [isHomePath]);

  useEffect(() => {
    if (!isMoreNavOpen) {
      return;
    }

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target as Node | null;

      if (target && moreNavRef.current?.contains(target)) {
        return;
      }

      setIsMoreNavOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);

    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isMoreNavOpen]);

  if (isWorkspacePath(pathname)) {
    return null;
  }

  return (
    <header
      className={cn(
        'site-header border-b transition-[background-color,border-color,backdrop-filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)]',
        isFixedMobileHeader ? 'fixed inset-x-0 top-0 z-[60]' : null,
        isMobileMenuOpen
          ? 'site-header-menu-open border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)] text-[var(--editorial-dark-text)]'
          : isHomePath
            ? cn(
                'fixed inset-x-0 top-0 z-50',
                isHomeTop
                  ? 'site-header-home-top border-transparent bg-transparent text-[var(--editorial-dark-text)]'
                  : 'site-header-home-dark border-[var(--line)] bg-[color-mix(in_srgb,var(--editorial-dark-surface)_96%,transparent)] text-[var(--editorial-dark-text)] backdrop-blur-[12px]'
              )
            : 'sticky top-0 z-50 border-[var(--line)] bg-[var(--header-bg)] text-[var(--text)] backdrop-blur-[8px]'
      )}
    >
      <div className="container">
        <div className="relative z-10 flex min-h-[56px] items-center justify-between gap-3 px-0 xl:grid xl:min-h-[64px] xl:grid-cols-[176px_minmax(0,1fr)_max-content] xl:items-center xl:gap-x-6 2xl:grid-cols-[220px_minmax(0,1fr)_max-content] 2xl:gap-x-8">
          <AppLink
            aria-label="BARSYNERGY"
            className={cn(
              'flex min-h-12 shrink-0 items-center rounded-[var(--radius-md)] pr-1 xl:w-full xl:min-w-[176px] xl:pr-0 2xl:min-w-[220px]',
              isMobileMenuOpen && 'sm:pl-3',
              focusClassName
            )}
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image
              alt="BARSYNERGY"
              className="theme-logo-light h-9 w-auto object-contain sm:h-10 xl:h-10 2xl:h-11"
              height={44}
              priority
              src="/brand/barsynergy-lockup.svg"
              unoptimized
              width={162}
            />
            <Image
              alt=""
              aria-hidden="true"
              className="theme-logo-dark h-9 w-auto object-contain sm:h-10 xl:h-10 2xl:h-11"
              height={44}
              priority
              src="/brand/barsynergy-lockup-light.svg"
              unoptimized
              width={162}
            />
          </AppLink>
          <nav className="hidden min-w-0 items-center justify-center gap-1 px-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-inherit xl:flex xl:justify-self-start 2xl:gap-2 2xl:text-[12px] 2xl:tracking-[0.08em]">
            {desktopPrimaryNavItems.map((item) => {
              const isActive = pathname ? isActiveItem(pathname, item.href) : false;

              return (
                <AppLink
                  className={cn(
                    'relative inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-[var(--radius-sm)] px-1 opacity-85 transition-[color,opacity] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] after:absolute after:inset-x-1 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-[var(--motion-duration-base)] after:ease-[var(--motion-ease-move)] hover:opacity-100 hover:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none 2xl:px-2 2xl:after:inset-x-1.5',
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
                className="group relative shrink-0"
                ref={moreNavRef}
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
                onToggle={(event) => setIsMoreNavOpen(event.currentTarget.open)}
                open={isMoreNavOpen}
              >
                <summary
                  className={cn(
                    'relative inline-flex min-h-11 shrink-0 cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] px-1 opacity-85 transition-[color,opacity] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] after:absolute after:inset-x-1 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-[var(--motion-duration-base)] after:ease-[var(--motion-ease-move)] hover:opacity-100 hover:after:scale-x-100 group-open:after:scale-x-0 motion-reduce:transition-none motion-reduce:after:transition-none [&::-webkit-details-marker]:hidden 2xl:px-2 2xl:after:inset-x-1.5',
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
          <div className="hidden shrink-0 items-center justify-end gap-2 xl:flex xl:w-full">
            <ThemeToggle
              className={cn(
                'h-11 min-h-11 w-11 rounded-[8px] px-0 shadow-none',
                isHomeTop
                  ? 'border-[rgba(255,253,249,0.18)] bg-[rgba(255,253,249,0.12)] text-[var(--editorial-dark-text)] hover:border-[rgba(255,253,249,0.28)] hover:bg-[rgba(255,253,249,0.2)] hover:text-[var(--editorial-dark-text)]'
                  : 'border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--text)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface-wash)] hover:text-[var(--accent)]'
              )}
              compact
            />
            <AppLink
              className={cn(
                'hidden min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] border-[1.5px] border-[var(--accent)] bg-[var(--accent-soft)] px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] motion-reduce:transition-none 2xl:inline-flex 2xl:px-4',
                focusClassName
              )}
              href="/vacancies#vacancy-form"
            >
              Разместить вакансию
            </AppLink>
            <AppLink
              className={cn(
                'inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-3 text-[12px] font-semibold text-inherit transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[rgba(255,253,249,0.12)] motion-reduce:transition-none',
                focusClassName
              )}
              href="/auth/login"
              aria-label="Войти в кабинет"
            >
              <UserRound size={16} strokeWidth={1.8} />
              <span>Войти</span>
            </AppLink>
          </div>
          <div className="flex shrink-0 items-center gap-2 xl:hidden">
            <ThemeToggle
              className={cn(
                'shadow-none',
                isHomeTop
                  ? 'border-[rgba(255,253,249,0.18)] bg-[rgba(255,253,249,0.12)] text-[var(--editorial-dark-text)] hover:border-[rgba(255,253,249,0.28)] hover:bg-[rgba(255,253,249,0.2)] hover:text-[var(--editorial-dark-text)]'
                  : 'border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--text)] hover:border-[var(--accent)]/40 hover:bg-[var(--surface-wash)] hover:text-[var(--accent)]'
              )}
              compact
            />
            <MobileSiteMenu isOpen={isMobileMenuOpen} navItems={navItems} onOpenChange={setIsMobileMenuOpen} />
          </div>
        </div>
      </div>
    </header>
  );
}
