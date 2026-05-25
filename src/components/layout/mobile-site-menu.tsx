'use client';

import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { AppLink } from '@/components/ui/app-link';
import { focusFirstElement, trapFocusInContainer } from '@/components/ui/focus-trap';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type MobileSiteMenuProps = {
  isOpen: boolean;
  navItems: Array<{
    label: string;
    href: string;
  }>;
  onOpenChange: (nextState: boolean) => void;
};

const MENU_TOGGLE_SIZE_CLASS = 'h-11 w-11';
const MENU_TOGGLE_ICON_SIZE_CLASS = 'h-[18px] w-[18px]';
const MOBILE_MENU_CONTENT_TOP_CLASS = 'pt-[84px] sm:pt-[88px]';
const MENU_TOGGLE_LINE_LENGTH = 14;
const MENU_TOGGLE_LINE_THICKNESS = 1.5;
const MENU_TOGGLE_ICON_OFFSET = 4;

const primaryNavOrder = ['/events', '/education', '/vacancies', '/suppliers', '/articles'];
const businessNavOrder = ['/business', '/partners', '/general-sponsors', '/consulting'];
const teamNavOrder = ['/about', '/contacts', '/auth/login'];

function getMobileNavItems(navItems: MobileSiteMenuProps['navItems'], hrefs: string[]) {
  return hrefs
    .map((href) => navItems.find((item) => item.href === href))
    .filter((item): item is MobileSiteMenuProps['navItems'][number] => Boolean(item));
}

function isActiveMobileItem(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  const [pathOnly] = href.split('?');

  if (pathOnly === '/auth/login') {
    return pathname.startsWith('/auth');
  }

  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

export function MobileSiteMenu({ isOpen, navItems, onOpenChange }: MobileSiteMenuProps) {
  const pathname = usePathname();
  const [isRendered, setIsRendered] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogTitleId = useId();
  const overlayId = 'mobile-menu';
  const portalTarget = typeof document !== 'undefined' ? document.querySelector('.site-shell') ?? document.body : null;
  const primaryNavItems = getMobileNavItems(navItems, primaryNavOrder);
  const businessNavItems = getMobileNavItems(navItems, businessNavOrder);
  const teamNavItems = getMobileNavItems(navItems, teamNavOrder);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      return;
    }

    if (!isRendered) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsRendered(false);
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, isRendered]);

  useEffect(() => {
    if (!isRendered) {
      return;
    }

    const rootStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const previousRootOverflow = rootStyle.overflow;
    const previousBodyOverflow = bodyStyle.overflow;
    const previousPaddingRight = bodyStyle.paddingRight;
    const scrollbarCompensation = Math.max(window.innerWidth - document.documentElement.clientWidth, 0);

    rootStyle.overflow = 'hidden';
    bodyStyle.overflow = 'hidden';

    if (scrollbarCompensation > 0) {
      bodyStyle.paddingRight = `${scrollbarCompensation}px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      trapFocusInContainer(event, dialogRef.current);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      rootStyle.overflow = previousRootOverflow;
      bodyStyle.overflow = previousBodyOverflow;
      bodyStyle.paddingRight = previousPaddingRight;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isRendered, onOpenChange]);

  useEffect(() => {
    if (!isOpen) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }

    window.setTimeout(() => {
      focusFirstElement(dialogRef.current);
    }, 0);
  }, [isOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)');

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        onOpenChange(false);
      }
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    mediaQuery.addListener(handleChange);
    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, [onOpenChange]);

  return (
    <>
      <MenuToggle
        isOpen={isOpen}
        onClick={() => {
          if (!isOpen) {
            previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current;
          }

          onOpenChange(!isOpen);
        }}
        overlayId={overlayId}
        triggerRef={triggerRef}
      />

      {isRendered && portalTarget
        ? createPortal(
            <div
              aria-hidden={!isOpen}
              id={overlayId}
              style={{ background: 'var(--mobile-menu-bg)' }}
              className={cn(
                'mobile-menu-overlay fixed inset-0 z-[45] overflow-y-auto overscroll-contain text-[var(--text)] transition-opacity duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none xl:hidden',
                isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
              )}
            >
              <div aria-hidden="true" className="absolute inset-0 bg-[url('/images/grain.svg')] opacity-[0.22]" />
              <div
                aria-modal="true"
                aria-labelledby={dialogTitleId}
                role="dialog"
                className={cn(
                  'container relative min-h-[100dvh] px-0 pb-8 transition-[opacity,transform] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-move)] motion-reduce:transition-none',
                  MOBILE_MENU_CONTENT_TOP_CLASS,
                  isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                )}
                ref={dialogRef}
                tabIndex={-1}
              >
                <h2 className="sr-only" id={dialogTitleId}>
                  Мобильная навигация
                </h2>
                <nav aria-label="Мобильная навигация" className="grid content-start gap-4 sm:gap-5">
                  <MobileMenuGroup label="Разделы" items={primaryNavItems} onNavigate={() => onOpenChange(false)} pathname={pathname} />
                  {businessNavItems.length > 0 ? (
                    <MobileMenuGroup
                      label="Для бизнеса"
                      items={businessNavItems}
                      onNavigate={() => onOpenChange(false)}
                      pathname={pathname}
                      withDivider
                    />
                  ) : null}
                  <MobileMenuGroup label="Команда" items={teamNavItems} onNavigate={() => onOpenChange(false)} pathname={pathname} withDivider />
                </nav>
              </div>
            </div>,
            portalTarget
          )
        : null}
    </>
  );
}

function MobileMenuGroup({
  items,
  label,
  onNavigate,
  pathname,
  withDivider = false
}: {
  items: MobileSiteMenuProps['navItems'];
  label: string;
  onNavigate: () => void;
  pathname: string | null;
  withDivider?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('grid gap-1.5', withDivider && 'border-t border-[var(--line)] pt-4')}>
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">{label}</p>
      <div className="grid gap-1">
        {items.map((item) => {
          const isActive = isActiveMobileItem(pathname, item.href);

          return (
            <AppLink
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                displayFont.className,
                'display-tight block min-h-11 w-fit rounded-[var(--radius-sm)] py-1 pr-2 text-[18px] font-bold leading-[1.12] text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none sm:text-[19px]',
                isActive && 'border-l-2 border-[var(--accent)] pl-3 text-[var(--accent)]'
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              {item.label}
            </AppLink>
          );
        })}
      </div>
    </div>
  );
}

function MenuToggle({
  isOpen,
  onClick,
  overlayId,
  triggerRef
}: {
  isOpen: boolean;
  onClick: () => void;
  overlayId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      aria-controls={overlayId}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
      className={cn(
        'group inline-flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--text)] shadow-[var(--shadow-card)] backdrop-blur-[12px] transition-[background-color,border-color,color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/30 hover:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none xl:hidden',
        MENU_TOGGLE_SIZE_CLASS
      )}
      onClick={onClick}
      ref={triggerRef}
      type="button"
    >
      <span className="grid h-full w-full place-items-center">
        <MenuToggleIcon isOpen={isOpen} />
      </span>
    </button>
  );
}

function MenuToggleIcon({ isOpen }: { isOpen: boolean }) {
  const lineBaseClass =
    'absolute left-1/2 top-1/2 block rounded-full bg-current transition-[transform,opacity] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-move)] motion-reduce:transition-none';

  return (
    <span aria-hidden="true" className={cn('relative block', MENU_TOGGLE_ICON_SIZE_CLASS)}>
      <span
        className={lineBaseClass}
        style={{
          width: `${MENU_TOGGLE_LINE_LENGTH}px`,
          height: `${MENU_TOGGLE_LINE_THICKNESS}px`,
          transform: isOpen
            ? 'translate(-50%, -50%) rotate(45deg)'
            : `translate(-50%, calc(-50% - ${MENU_TOGGLE_ICON_OFFSET}px)) rotate(0deg)`
        }}
      />
      <span
        className={lineBaseClass}
        style={{
          width: `${MENU_TOGGLE_LINE_LENGTH}px`,
          height: `${MENU_TOGGLE_LINE_THICKNESS}px`,
          opacity: isOpen ? 0 : 1,
          transform: 'translate(-50%, -50%)'
        }}
      />
      <span
        className={lineBaseClass}
        style={{
          width: `${MENU_TOGGLE_LINE_LENGTH}px`,
          height: `${MENU_TOGGLE_LINE_THICKNESS}px`,
          transform: isOpen
            ? 'translate(-50%, -50%) rotate(-45deg)'
            : `translate(-50%, calc(-50% + ${MENU_TOGGLE_ICON_OFFSET}px)) rotate(0deg)`
        }}
      />
    </span>
  );
}
