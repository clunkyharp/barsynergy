'use client';

import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
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
const MOBILE_MENU_CONTENT_TOP_CLASS = 'pt-[72px] sm:pt-[76px]';

const flatNavOrder = [
  '/events',
  '/education',
  '/vacancies',
  '/suppliers',
  '/articles',
  '/business',
  '/partners',
  '/general-sponsors',
  '/consulting',
  '/about',
  '/contacts'
];

function getFlatNavItems(navItems: MobileSiteMenuProps['navItems']) {
  return flatNavOrder
    .map((href) => navItems.find((item) => item.href === href))
    .filter((item): item is MobileSiteMenuProps['navItems'][number] => Boolean(item));
}

function isActiveMobileItem(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  const [pathOnly] = href.split('?');

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
  const flatItems = getFlatNavItems(navItems);
  const loginItem = navItems.find((item) => item.href === '/auth/login');

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
              className={cn(
                'fixed inset-0 z-[45] overflow-y-auto overscroll-contain bg-[var(--editorial-dark-surface)] transition-opacity duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none xl:hidden',
                isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
              )}
            >
              <div
                aria-modal="true"
                aria-labelledby={dialogTitleId}
                role="dialog"
                className={cn(
                  'container relative flex min-h-[100dvh] flex-col pb-8 transition-[opacity,transform] duration-[var(--motion-duration-panel)] ease-[var(--motion-ease-move)] motion-reduce:transition-none',
                  MOBILE_MENU_CONTENT_TOP_CLASS,
                  isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                )}
                ref={dialogRef}
                tabIndex={-1}
              >
                <h2 className="sr-only" id={dialogTitleId}>
                  Мобильная навигация
                </h2>

                <nav aria-label="Мобильная навигация" className="mt-6">
                  <div>
                    {flatItems.map((item) => {
                      const isActive = isActiveMobileItem(pathname, item.href);

                      return (
                        <AppLink
                          aria-current={isActive ? 'page' : undefined}
                          className={cn(
                            displayFont.className,
                            'flex min-h-[3.25rem] w-full items-center border-b border-[var(--editorial-dark-border)] py-3.5 text-[28px] font-normal leading-[1.1] text-[var(--editorial-dark-text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none last:border-b-0 sm:text-[32px]',
                            isActive && 'text-[var(--accent)]'
                          )}
                          href={item.href}
                          key={item.href}
                          onClick={() => onOpenChange(false)}
                        >
                          {item.label}
                        </AppLink>
                      );
                    })}
                  </div>
                </nav>

                <div className="mt-auto flex items-center justify-between border-t border-[var(--editorial-dark-border)] pt-5 text-[13px] text-[var(--editorial-dark-muted)]">
                  {loginItem ? (
                    <AppLink
                      className="transition-colors duration-[var(--motion-duration-fast)] hover:text-[var(--editorial-dark-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
                      href="/auth/login"
                      onClick={() => onOpenChange(false)}
                    >
                      {loginItem.label}
                    </AppLink>
                  ) : null}
                  <AppLink
                    className="transition-colors duration-[var(--motion-duration-fast)] hover:text-[var(--editorial-dark-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
                    href="https://t.me/barsynergy"
                    onClick={() => onOpenChange(false)}
                  >
                    Telegram
                  </AppLink>
                </div>
              </div>
            </div>,
            portalTarget
          )
        : null}
    </>
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
      {isOpen ? (
        <X aria-hidden="true" size={18} strokeWidth={1.8} />
      ) : (
        <Menu aria-hidden="true" size={18} strokeWidth={1.8} />
      )}
    </button>
  );
}
