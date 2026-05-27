'use client';

import {
  useCallback,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent
} from 'react';
import { AppLink } from '@/components/ui/app-link';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const ACTION_MENU_OPEN_EVENT = 'barsynergy-admin-action-menu-open';
const ACTION_MENU_CONFIRM_SELECTOR = '[data-admin-action-confirm]';

export function AdminActionMenu({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <DropdownMenu
      className={className}
      closeIgnoreSelector={ACTION_MENU_CONFIRM_SELECTOR}
      eventName={ACTION_MENU_OPEN_EVENT}
      {...props}
    >
      {children}
    </DropdownMenu>
  );
}

export function AdminActionMenuTrigger({ className, children = '⋯', onClick, onKeyDown, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <DropdownMenuTrigger
      className={cn(
        'inline-flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--admin-action-border)] bg-[var(--admin-action-bg)] px-3 text-sm font-semibold text-[var(--admin-action-text)] transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--admin-action-border-hover)] hover:bg-[var(--admin-action-bg-hover)] hover:text-[var(--admin-action-text-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none',
        className
      )}
      label="Открыть действия"
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </DropdownMenuTrigger>
  );
}

export function AdminActionMenuContent({ className, children, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <DropdownMenuContent
      className={cn(
        'admin-surface-shell grid min-w-52 gap-1 overflow-y-auto p-2 shadow-[var(--shadow-overlay)]',
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </DropdownMenuContent>
  );
}

const actionMenuItemClassName =
  'flex min-h-9 w-full items-center rounded-[var(--radius-sm)] px-3 text-left text-sm font-semibold text-[var(--text)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:bg-[var(--admin-action-bg-hover)] hover:text-[var(--admin-action-text-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none disabled:pointer-events-none disabled:bg-transparent disabled:text-[var(--muted)] disabled:opacity-60';

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
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const needsConfirm = Boolean(confirmTitle || confirmText);

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    buttonRef.current?.focus();
  }, []);

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
      <Dialog
        closeOnOutsideClick
        description={confirmText}
        footer={
          <>
            <button
              className="inline-flex min-h-[38px] items-center justify-center rounded-[10px] border border-[var(--admin-secondary-border)] px-4 text-[13px] font-semibold text-[var(--text)] transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--admin-secondary-border-hover)] hover:bg-[var(--admin-secondary-bg-hover)] hover:text-[var(--admin-secondary-text-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none"
              onClick={closeConfirm}
              ref={cancelButtonRef}
              type="button"
            >
              {confirmCancelLabel}
            </button>
            <button
              className={cn(
                'inline-flex min-h-[38px] items-center justify-center rounded-[10px] border px-4 text-[13px] font-semibold transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 motion-reduce:transition-none',
                tone === 'danger'
                  ? 'border-[var(--danger-action-bg)] bg-[var(--danger-action-bg)] text-[var(--danger-action-text)] hover:bg-[var(--danger-action-bg-hover)] focus-visible:ring-[var(--focus-ring-danger)]'
                  : 'border-[var(--admin-confirm-border)] bg-[var(--admin-confirm-bg)] text-[var(--admin-confirm-text)] hover:bg-[var(--admin-confirm-bg-hover)] focus-visible:ring-[var(--focus-ring)]'
              )}
              onClick={submitConfirmedAction}
              type="button"
            >
              {confirmActionLabel ?? children}
            </button>
          </>
        }
        initialFocusRef={cancelButtonRef}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        overlayProps={{ 'data-admin-action-confirm': '' }}
        showCloseButton={false}
        size="confirm"
        title={confirmTitle ?? 'Подтвердите действие'}
      >
        {null}
      </Dialog>
    </>
  );
}
