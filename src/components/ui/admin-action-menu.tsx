'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent
} from 'react';
import { createPortal } from 'react-dom';
import { AppLink } from '@/components/ui/app-link';
import { getOverlayPosition } from '@/lib/ui/overlay-position';
import { cn } from '@/lib/utils';

const ACTION_MENU_OPEN_EVENT = 'barsynergy-admin-action-menu-open';
const ACTION_MENU_MAX_HEIGHT = 320;
const ACTION_MENU_CONFIRM_SELECTOR = '[data-admin-action-confirm]';

type AdminActionMenuContextValue = {
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentStyle: CSSProperties | null;
  id: string;
  open: boolean;
  portalTarget: HTMLElement | null;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  updatePosition: () => void;
};

const AdminActionMenuContext = createContext<AdminActionMenuContextValue | null>(null);

function useAdminActionMenu() {
  const context = useContext(AdminActionMenuContext);

  if (!context) {
    throw new Error('AdminActionMenu components must be used inside AdminActionMenu.');
  }

  return context;
}

export function AdminActionMenu({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [contentStyle, setContentStyle] = useState<CSSProperties | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const overlayRect = {
      height: Math.min(contentRef.current.scrollHeight, ACTION_MENU_MAX_HEIGHT),
      width: Math.max(contentRef.current.offsetWidth, 208)
    };
    const position = getOverlayPosition({
      align: 'end',
      maxHeight: ACTION_MENU_MAX_HEIGHT,
      minWidth: 208,
      overlayRect,
      sideOffset: 8,
      triggerRect,
      viewportHeight: window.innerHeight,
      viewportPadding: 12,
      viewportWidth: window.innerWidth
    });

    setContentStyle({
      left: position.left,
      maxHeight: position.maxHeight,
      position: 'fixed',
      top: position.top,
      transformOrigin: position.transformOrigin
    });
  }, []);

  const closeMenu = useCallback((options?: { restoreFocus?: boolean }) => {
    setOpen(false);
    setContentStyle(null);

    if (options?.restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setContentStyle(null);
      return;
    }

    document.dispatchEvent(new CustomEvent<string>(ACTION_MENU_OPEN_EVENT, { detail: id }));

    function handleOpen(event: Event) {
      if ((event as CustomEvent<string>).detail !== id) {
        closeMenu();
      }
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (rootRef.current?.contains(target) || contentRef.current?.contains(target) || target.closest(ACTION_MENU_CONFIRM_SELECTOR)) {
        return;
      }

      closeMenu();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
      }
    }

    function handleViewportChange() {
      updatePosition();
    }

    document.addEventListener(ACTION_MENU_OPEN_EVENT, handleOpen);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener(ACTION_MENU_OPEN_EVENT, handleOpen);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [closeMenu, id, open, updatePosition]);

  useLayoutEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [open, updatePosition]);

  const context = useMemo<AdminActionMenuContextValue>(
    () => ({
      contentRef,
      contentStyle,
      id,
      open,
      portalTarget,
      setOpen,
      triggerRef,
      updatePosition
    }),
    [contentStyle, id, open, portalTarget, updatePosition]
  );

  return (
    <div className={cn('relative inline-flex', className)} ref={rootRef} {...props}>
      <AdminActionMenuContext.Provider value={context}>{children}</AdminActionMenuContext.Provider>
    </div>
  );
}

export function AdminActionMenuTrigger({ className, children = '⋯', onClick, onKeyDown, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { id, open, setOpen, triggerRef } = useAdminActionMenu();
  const contentId = `${id}-content`;

  return (
    <button
      aria-controls={contentId}
      aria-expanded={open}
      aria-haspopup="menu"
      className={cn(
        'inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--admin-action-border)] bg-[var(--admin-action-bg)] px-3 text-sm font-semibold text-[var(--admin-action-text)] transition hover:border-[var(--admin-action-border-hover)] hover:bg-[var(--admin-action-bg-hover)] hover:text-[var(--admin-action-text-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
        className
      )}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          setOpen(!open);
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setOpen(true);
        }
      }}
      ref={triggerRef}
      type="button"
      {...props}
    >
      <span aria-hidden="true">{children}</span>
      <span className="sr-only">Открыть действия</span>
    </button>
  );
}

export function AdminActionMenuContent({ className, children, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { contentRef, contentStyle, id, open, portalTarget, updatePosition } = useAdminActionMenu();

  useLayoutEffect(() => {
    if (open) {
      updatePosition();
    }
  }, [children, open, updatePosition]);

  if (!open || !portalTarget) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        'grid min-w-52 gap-1 overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[0_16px_40px_rgba(20,20,18,0.12)]',
        className
      )}
      id={`${id}-content`}
      ref={contentRef}
      role="menu"
      style={{ ...contentStyle, ...style, visibility: contentStyle ? 'visible' : 'hidden', zIndex: 'var(--z-overlay)' }}
      {...props}
    >
      {children}
    </div>,
    portalTarget
  );
}

const actionMenuItemClassName =
  'flex min-h-9 w-full items-center rounded-[var(--radius-sm)] px-3 text-left text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--admin-action-bg-hover)] hover:text-[var(--admin-action-text-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50';

type AdminActionMenuLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export function AdminActionMenuLink({ className, ...props }: AdminActionMenuLinkProps) {
  return <AppLink className={cn(actionMenuItemClassName, className)} role="menuitem" {...props} />;
}

type AdminActionMenuButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmActionLabel?: string;
  confirmCancelLabel?: string;
  confirmText?: string;
  confirmTitle?: string;
  tone?: 'default' | 'danger';
};

export function AdminActionMenuButton({
  children,
  className,
  confirmActionLabel,
  confirmCancelLabel = 'Отмена',
  confirmText,
  confirmTitle,
  onClick,
  tone = 'default',
  ...props
}: AdminActionMenuButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const needsConfirm = Boolean(confirmTitle || confirmText);

  useEffect(() => {
    if (!confirmOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setConfirmOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [confirmOpen]);

  function handleClick(event: ReactMouseEvent<HTMLButtonElement>) {
    onClick?.(event);

    if (event.defaultPrevented || !needsConfirm) {
      return;
    }

    event.preventDefault();
    setConfirmOpen(true);
  }

  function submitConfirmedAction() {
    const form = buttonRef.current?.closest('form');

    setConfirmOpen(false);
    form?.requestSubmit(buttonRef.current ?? undefined);
  }

  return (
    <>
      <button
        className={cn(actionMenuItemClassName, tone === 'danger' && 'text-[var(--danger)] hover:text-[var(--danger)]', className)}
        onClick={handleClick}
        ref={buttonRef}
        role="menuitem"
        type="submit"
        {...props}
      >
        {children}
      </button>
      {confirmOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[calc(var(--z-overlay)+10)] grid place-items-center bg-black/35 px-4 py-6 backdrop-blur-sm"
              data-admin-action-confirm=""
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setConfirmOpen(false);
                  buttonRef.current?.focus();
                }
              }}
            >
              <div
                aria-modal="true"
                className="w-full max-w-sm rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-5 text-left shadow-[var(--shadow-overlay)]"
                role="dialog"
              >
                {confirmTitle ? <h2 className="text-base font-semibold text-[var(--text)]">{confirmTitle}</h2> : null}
                {confirmText ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{confirmText}</p> : null}
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--admin-secondary-border)] px-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--admin-secondary-border-hover)] hover:bg-[var(--admin-secondary-bg-hover)] hover:text-[var(--admin-secondary-text-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                    onClick={() => {
                      setConfirmOpen(false);
                      buttonRef.current?.focus();
                    }}
                    type="button"
                  >
                    {confirmCancelLabel}
                  </button>
                  <button
                    className={cn(
                      'inline-flex min-h-10 items-center justify-center rounded-[var(--radius-sm)] border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2',
                      tone === 'danger'
                        ? 'border-[var(--danger)] bg-[var(--danger)] text-white focus-visible:ring-[var(--focus-ring-danger)]'
                        : 'border-[var(--admin-confirm-border)] bg-[var(--admin-confirm-bg)] text-[var(--admin-confirm-text)] hover:bg-[var(--admin-confirm-bg-hover)] focus-visible:ring-[var(--focus-ring)]'
                    )}
                    onClick={submitConfirmedAction}
                    type="button"
                  >
                    {confirmActionLabel ?? children}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
