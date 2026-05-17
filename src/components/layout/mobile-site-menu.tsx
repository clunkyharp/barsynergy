'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { AppLink } from '@/components/ui/app-link';
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

const MENU_TOGGLE_SIZE_CLASS = 'h-[54px] w-[54px]';
const MENU_TOGGLE_ICON_SIZE_CLASS = 'h-[24px] w-[24px]';
const MOBILE_MENU_CONTENT_TOP_CLASS = 'pt-[110px] sm:pt-[114px]';
const MENU_TOGGLE_LINE_LENGTH = 18;
const MENU_TOGGLE_LINE_THICKNESS = 2;
const MENU_TOGGLE_ICON_OFFSET = 5;

export function MobileSiteMenu({ isOpen, navItems, onOpenChange }: MobileSiteMenuProps) {
  const [isRendered, setIsRendered] = useState(false);
  const overlayId = 'mobile-menu';
  const portalTarget = typeof document !== 'undefined' ? document.querySelector('.site-shell') ?? document.body : null;

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
    }, 240);

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
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      rootStyle.overflow = previousRootOverflow;
      bodyStyle.overflow = previousBodyOverflow;
      bodyStyle.paddingRight = previousPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRendered, onOpenChange]);

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
      <MenuToggle isOpen={isOpen} onClick={() => onOpenChange(!isOpen)} overlayId={overlayId} />

      {isRendered && portalTarget
        ? createPortal(
            <div
              aria-hidden={!isOpen}
              id={overlayId}
              style={{ background: 'var(--mobile-menu-bg)' }}
              className={cn(
                'mobile-menu-overlay fixed inset-0 z-[45] overflow-y-auto overscroll-contain text-[var(--text)] transition-opacity duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none xl:hidden',
                isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
              )}
            >
              <div aria-hidden="true" className="absolute inset-0 bg-[url('/images/grain.svg')] opacity-[0.22]" />
              <div
                aria-modal="true"
                role="dialog"
                className={cn(
                  'container relative min-h-[100dvh] px-0 pb-8 transition-[opacity,transform] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
                  MOBILE_MENU_CONTENT_TOP_CLASS,
                  isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                )}
              >
                <nav aria-label="Мобильная навигация" className="grid content-start gap-4 sm:gap-5">
                  <ThemeToggle className="w-fit" />
                  <div className="grid gap-2 border-t border-[var(--line)] pt-2">
                    {navItems.map((item) => (
                      <AppLink
                        className="group/link grid min-h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-5 rounded-[var(--radius-lg)] border border-transparent px-4 py-3 text-[var(--text)] transition-[background-color,border-color,color] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[var(--line)] hover:bg-[var(--surface-wash)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none sm:min-h-[88px] sm:px-5"
                        href={item.href}
                        key={item.href}
                        onClick={() => onOpenChange(false)}
                      >
                        <span className={cn(displayFont.className, 'display-tight text-[34px] leading-none text-balance sm:text-[46px]')}>
                          {item.label}
                        </span>
                        <ArrowUpRight
                          className="text-[var(--accent)] transition duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:-translate-y-1 group-hover/link:translate-x-1 motion-reduce:transition-none"
                          size={24}
                        />
                      </AppLink>
                    ))}
                  </div>
                  <AppLink
                    className="mt-4 inline-flex min-h-14 w-fit items-center gap-3 rounded-[var(--radius-md)] border border-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent)] transition-[background-color,color,border-color] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
                    href="/contacts"
                    onClick={() => onOpenChange(false)}
                  >
                    Написать команде
                    <ArrowUpRight size={18} />
                  </AppLink>
                </nav>
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
  overlayId
}: {
  isOpen: boolean;
  onClick: () => void;
  overlayId: string;
}) {
  return (
    <button
      aria-controls={overlayId}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
      className={cn(
        'group inline-flex shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--text)] shadow-[0_12px_24px_rgba(20,20,18,0.08)] backdrop-blur-[12px] transition-[background-color,border-color,box-shadow,color] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[var(--accent)]/30 hover:bg-[var(--surface)] hover:shadow-[0_16px_28px_rgba(20,20,18,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none xl:hidden',
        MENU_TOGGLE_SIZE_CLASS
      )}
      onClick={onClick}
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
    'absolute left-1/2 top-1/2 block rounded-full bg-current transition-[transform,opacity] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';

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
