'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Search, UserRound } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AccountMenu } from '@/components/layout/account-menu';
import { MobileSiteMenu } from '@/components/layout/mobile-site-menu';
import {
  type SiteHeaderProps,
  type NavItem,
  type NavGroup,
  guestNavItems,
  desktopPrimaryNavItems,
  desktopDropdownGroups,
  desktopMoreGroups,
  isWorkspacePath,
  isActiveItem
} from '@/components/layout/site-header-types';
import { AppLink } from '@/components/ui/app-link';
import { cn } from '@/lib/utils';

const FOCUS_CLASS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

const LINK_BASE_CLASS = 'relative inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-[var(--radius-sm)] px-1 opacity-85 transition-[color,opacity] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] after:absolute after:inset-x-1 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-[var(--motion-duration-base)] after:ease-[var(--motion-ease-move)] hover:opacity-100 hover:after:scale-x-100 motion-reduce:transition-none motion-reduce:after:transition-none 2xl:px-2 2xl:after:inset-x-1.5';

const TRIGGER_BASE_CLASS = cn(
  LINK_BASE_CLASS,
  'cursor-pointer list-none gap-1.5 group-open:after:scale-x-0 [&::-webkit-details-marker]:hidden'
);

const PANEL_CLASS = 'absolute left-1/2 top-[calc(100%+0.35rem)] z-20 flex min-w-[12rem] -translate-x-1/2 flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--card-border)] bg-[var(--surface-elevated)] p-2 shadow-[var(--shadow-panel)]';

const MENU_ITEM_CLASS = 'flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 py-2 text-[13px] font-semibold text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[var(--surface-muted)] hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none';

type DropdownId = string | null;

function NavDropdown({
  id,
  label,
  items,
  isActive,
  isOpen,
  onToggle,
  onClose,
  align = 'center'
}: {
  id: string;
  label: string;
  items: NavItem[];
  isActive: boolean;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onClose: () => void;
  align?: 'center' | 'right';
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && ref.current?.contains(target)) return;
      onClose();
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isOpen, onClose]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDetailsElement>) {
    if (event.key === 'Escape') {
      onClose();
      summaryRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown' && isOpen) {
      const firstLink = ref.current?.querySelector<HTMLAnchorElement>('[role="menuitem"]');
      if (firstLink) {
        event.preventDefault();
        firstLink.focus();
      }
    }
  }

  const panelClassName = align === 'right'
    ? cn(PANEL_CLASS, 'left-auto right-0 translate-x-0')
    : PANEL_CLASS;

  return (
    <details
      className="group relative shrink-0"
      ref={ref}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
          onClose();
        }
      }}
      onKeyDown={handleKeyDown}
      onToggle={(event) => onToggle(event.currentTarget.open)}
      open={isOpen}
    >
      <summary
        aria-controls={id}
        aria-expanded={isOpen}
        className={cn(
          TRIGGER_BASE_CLASS,
          isActive && 'text-[var(--accent-ink)] opacity-100 after:scale-x-100',
          FOCUS_CLASS
        )}
        ref={summaryRef}
      >
        {label}
        <ChevronDown aria-hidden="true" className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-open:rotate-180 motion-reduce:transition-none" size={14} strokeWidth={1.8} />
      </summary>
      <div className={panelClassName} id={id} role="menu">
        {items.map((item) => {
          const itemActive = typeof window !== 'undefined'
            ? false
            : false;
          return (
            <AppLink
              aria-label={undefined}
              className={cn(
                MENU_ITEM_CLASS,
                itemActive && 'bg-[var(--accent-soft)] text-[var(--accent-ink)]'
              )}
              href={item.href}
              key={item.href}
              onClick={() => onClose()}
              role="menuitem"
            >
              {item.label}
            </AppLink>
          );
        })}
      </div>
    </details>
  );
}

function useDropdownState() {
  const [openId, setOpenId] = useState<DropdownId>(null);

  function toggle(id: string, open: boolean) {
    setOpenId(open ? id : (prev) => (prev === id ? null : prev));
  }

  function close() {
    setOpenId(null);
  }

  return { openId, toggle, close };
}

export function SiteHeader({ user, logoutAction }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { openId, toggle, close: closeAllDropdowns } = useDropdownState();
  const isFixedMobileHeader = isMobileMenuOpen;
  const isHomePath = pathname === '/';
  const isHomeTop = isHomePath && !hasScrolled && !isMobileMenuOpen;
  const morePanelId = useId();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    closeAllDropdowns();
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

  if (isWorkspacePath(pathname)) {
    return null;
  }

  const businessHref = user?.role === 'BUSINESS' ? '/business/cabinet' : '/business';
  const effectiveDesktopDropdownGroups: NavGroup[] = desktopDropdownGroups.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.href === '/business' ? { ...item, href: businessHref } : item
    )
  }));
  const effectiveDesktopMoreGroups: NavGroup[] = desktopMoreGroups.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.href === '/business' ? { ...item, href: businessHref } : item
    )
  }));
  const effectiveGuestNavItems = guestNavItems.map((item) =>
    item.href === '/business' ? { ...item, href: businessHref } : item
  );

  const moreItems = effectiveDesktopMoreGroups.flatMap((g) => g.items);
  const moreActive = moreItems.some((item) => pathname && isActiveItem(pathname, item.href));

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
        <div className="relative z-10 flex min-h-[56px] items-center justify-between gap-3 px-0 lg:grid lg:min-h-[64px] lg:grid-cols-[176px_minmax(0,1fr)_max-content] lg:items-center lg:gap-x-6 2xl:grid-cols-[220px_minmax(0,1fr)_max-content] 2xl:gap-x-8">
          <AppLink
            aria-label="BARSYNERGY"
            className={cn(
              'flex min-h-12 shrink-0 items-center rounded-[var(--radius-md)] pr-1 xl:w-full xl:min-w-[176px] xl:pr-0 2xl:min-w-[220px]',
              isMobileMenuOpen && 'sm:pl-3',
              FOCUS_CLASS
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
          <nav className="hidden min-w-0 items-center justify-center gap-1 px-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-inherit lg:flex lg:justify-self-start 2xl:gap-2 2xl:text-[12px] 2xl:tracking-[0.08em]">
            {desktopPrimaryNavItems.map((item) => {
              const isActive = pathname ? isActiveItem(pathname, item.href) : false;

              return (
                <AppLink
                  className={cn(
                    LINK_BASE_CLASS,
                    FOCUS_CLASS,
                    isActive && 'text-[var(--accent-ink)] opacity-100 after:scale-x-100'
                  )}
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </AppLink>
              );
            })}
            {effectiveDesktopDropdownGroups.map((group) => {
              const groupId = `nav-${group.label}`;
              const groupActive = group.items.some((item) => pathname && isActiveItem(pathname, item.href));

              return (
                <NavDropdown
                  id={groupId}
                  isActive={groupActive}
                  isOpen={openId === groupId}
                  items={group.items}
                  key={group.label}
                  label={group.label}
                  onClose={closeAllDropdowns}
                  onToggle={(open) => toggle(groupId, open)}
                />
              );
            })}
            {moreItems.length > 0 ? (
              <NavDropdown
                id={morePanelId}
                isActive={moreActive}
                isOpen={openId === morePanelId}
                items={moreItems}
                label="Ещё"
                onClose={closeAllDropdowns}
                onToggle={(open) => toggle(morePanelId, open)}
                align="right"
              />
            ) : null}
          </nav>
          <div className="hidden shrink-0 items-center justify-end gap-2 lg:flex lg:w-full">
            <AppLink
              aria-label="Поиск"
              className={cn(
                'inline-flex min-h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-inherit transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[rgba(255,253,249,0.12)] motion-reduce:transition-none',
                FOCUS_CLASS
              )}
              href="/search"
            >
              <Search aria-hidden="true" size={17} strokeWidth={1.8} />
            </AppLink>
            <AppLink
              className={cn(
                'hidden min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] border-[1.5px] border-[var(--accent)] bg-[var(--accent-soft)] px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--accent-ink)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] motion-reduce:transition-none lg:inline-flex lg:px-4',
                FOCUS_CLASS
              )}
              href={businessHref}
            >
              Для бизнеса
            </AppLink>
            {user ? (
              <AccountMenu logoutAction={logoutAction!} user={user} />
            ) : (
              <div className="flex items-center gap-1">
                <AppLink
                  aria-label="Войти в кабинет"
                  className={cn(
                    'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] px-3 text-[12px] font-semibold text-inherit transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[rgba(255,253,249,0.12)] motion-reduce:transition-none',
                    FOCUS_CLASS
                  )}
                  href="/auth/login"
                >
                  <UserRound size={16} strokeWidth={1.8} />
                  <span>Войти</span>
                </AppLink>
                <AppLink
                  className={cn(
                    'inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] border px-3 text-[12px] font-semibold transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
                    isHomeTop
                      ? 'border-white/16 bg-white/8 text-[var(--editorial-dark-text)] hover:bg-white/14'
                      : 'border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]',
                    FOCUS_CLASS
                  )}
                  href="/auth/register/user"
                >
                  Регистрация
                </AppLink>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            {user ? <AccountMenu logoutAction={logoutAction!} user={user} /> : null}
            <AppLink
              aria-label="Поиск"
              className={cn(
                'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--text)] shadow-[var(--shadow-card)] backdrop-blur-[12px] transition-[background-color,border-color,color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/30 hover:bg-[var(--surface)] motion-reduce:transition-none',
                FOCUS_CLASS
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
