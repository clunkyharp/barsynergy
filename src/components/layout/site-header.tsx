'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, UserRound } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AccountMenu } from '@/components/layout/account-menu';
import { MobileSiteMenu } from '@/components/layout/mobile-site-menu';
import {
  type SiteHeaderProps,
  guestNavItems,
  desktopPrimaryNavItems,
  desktopMoreNavItems,
  isWorkspacePath,
  isActiveItem
} from '@/components/layout/site-header-types';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

export function SiteHeader({ user, logoutAction }: SiteHeaderProps) {
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

  const businessHref = user?.role === 'BUSINESS' ? '/business/cabinet' : '/business';
  const effectiveDesktopPrimaryNavItems = desktopPrimaryNavItems;
  const effectiveDesktopMoreNavItems = desktopMoreNavItems.map((item) =>
    item.href === '/business' ? { ...item, href: businessHref } : item
  );
  const effectiveGuestNavItems = guestNavItems.map((item) =>
    item.href === '/business' ? { ...item, href: businessHref } : item
  );

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
            {effectiveDesktopPrimaryNavItems.map((item) => {
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
                  aria-expanded={isMoreNavOpen}
                  className={cn(
                    'relative inline-flex min-h-11 shrink-0 cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] px-1 opacity-85 transition-[color,opacity] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] after:absolute after:inset-x-1 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-[var(--motion-duration-base)] after:ease-[var(--motion-ease-move)] hover:opacity-100 hover:after:scale-x-100 group-open:after:scale-x-0 motion-reduce:transition-none motion-reduce:after:transition-none [&::-webkit-details-marker]:hidden 2xl:px-2 2xl:after:inset-x-1.5',
                    desktopMoreNavItems.some((item) => pathname && isActiveItem(pathname, item.href)) && 'text-[var(--accent)] opacity-100 after:scale-x-100',
                    focusClassName
                  )}
                >
                  {moreLabel}
                  <ChevronDown aria-hidden="true" className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-open:rotate-180 motion-reduce:transition-none" size={14} strokeWidth={1.8} />
                </summary>
                <div className="absolute right-0 top-[calc(100%+0.35rem)] z-20 grid min-w-[12rem] gap-1 rounded-[var(--radius-md)] border border-[var(--card-border)] bg-[var(--surface-elevated)] p-2 shadow-[var(--shadow-panel)]">
                  {effectiveDesktopMoreNavItems.map((item) => {
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
            <AppLink
              aria-label="Поиск"
              className={cn(
                'inline-flex min-h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-inherit transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[rgba(255,253,249,0.12)] motion-reduce:transition-none',
                focusClassName
              )}
              href="/search"
            >
              <Search aria-hidden="true" size={17} strokeWidth={1.8} />
            </AppLink>
            {user?.role === 'BUSINESS' ? (
              <AppLink
                className={cn(
                  'hidden min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] border-[1.5px] border-[var(--accent)] bg-[var(--accent-soft)] px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] motion-reduce:transition-none xl:inline-flex xl:px-4',
                  focusClassName
                )}
                href="/contacts#contact-form"
              >
                Разместить вакансию
              </AppLink>
            ) : user?.role === 'USER' ? (
              <AppLink
                className={cn(
                  'hidden min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] border-[1.5px] px-3 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none xl:inline-flex xl:px-4',
                  isHomeTop
                    ? 'border-white/20 bg-white/10 text-[var(--editorial-dark-text)] hover:bg-white/18 hover:text-white'
                    : 'border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--surface-wash)] hover:text-[var(--accent-strong)]',
                  focusClassName
                )}
                href="/vacancies"
              >
                Найти вакансии
              </AppLink>
            ) : null}
            {user ? (
              <AccountMenu logoutAction={logoutAction!} user={user} />
            ) : (
              <div className="flex items-center gap-1">
                <AppLink
                  aria-label="Войти в кабинет"
                  className={cn(
                    'inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-3 text-[12px] font-semibold text-inherit transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[rgba(255,253,249,0.12)] motion-reduce:transition-none',
                    focusClassName
                  )}
                  href="/auth/login"
                >
                  <UserRound size={16} strokeWidth={1.8} />
                  <span>Войти</span>
                </AppLink>
                <AppLink
                  className={cn(
                    'inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] border px-3 text-[12px] font-semibold transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
                    isHomeTop
                      ? 'border-white/16 bg-white/8 text-[var(--editorial-dark-text)] hover:bg-white/14'
                      : 'border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]',
                    focusClassName
                  )}
                  href="/auth/register/user"
                >
                  Регистрация
                </AppLink>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 xl:hidden">
            {user ? <AccountMenu logoutAction={logoutAction!} user={user} /> : null}
            <AppLink
              aria-label="Поиск"
              className={cn(
                'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--text)] shadow-[var(--shadow-card)] backdrop-blur-[12px] transition-[background-color,border-color,color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/30 hover:bg-[var(--surface)] motion-reduce:transition-none',
                focusClassName
              )}
              href="/search"
            >
              <Search aria-hidden="true" size={17} strokeWidth={1.8} />
            </AppLink>
            <MobileSiteMenu isOpen={isMobileMenuOpen} navItems={effectiveGuestNavItems} user={user} onOpenChange={setIsMobileMenuOpen} />
          </div>
        </div>
      </div>
    </header>
  );
}
