'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type RefObject
} from 'react';
import { createPortal } from 'react-dom';
import { focusFirstElement, trapFocusInContainer } from '@/components/ui/focus-trap';
import { cn } from '@/lib/utils';

type DialogSize = 'confirm' | 'sm' | 'md' | 'lg';
type DialogOverlayProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  [key: `data-${string}`]: string | undefined;
};

type DialogProps = {
  children: ReactNode;
  closeLabel?: string;
  closeOnOutsideClick?: boolean;
  description?: ReactNode;
  footer?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  overlayProps?: DialogOverlayProps;
  showCloseButton?: boolean;
  size?: DialogSize;
  title: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'>;

const dialogSizes: Record<DialogSize, string> = {
  confirm: 'max-w-[235px]',
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl'
};

export function Dialog({
  children,
  className,
  closeLabel = 'Закрыть',
  closeOnOutsideClick = true,
  description,
  footer,
  initialFocusRef,
  onOpenChange,
  open,
  overlayProps,
  showCloseButton = true,
  size = 'md',
  title,
  ...props
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const closeDialog = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }

      focusFirstElement(dialogRef.current);
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDialog();
        return;
      }

      trapFocusInContainer(event, dialogRef.current);
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeDialog, initialFocusRef, open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      {...overlayProps}
      className={cn(
        'dialog-overlay fixed inset-0 z-[calc(var(--z-overlay)+10)] grid place-items-center overflow-y-auto bg-black/35 px-4 py-6 backdrop-blur-sm motion-reduce:transition-none',
        overlayProps?.className
      )}
      onMouseDown={(event) => {
        overlayProps?.onMouseDown?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (closeOnOutsideClick && event.target === event.currentTarget) {
          closeDialog();
        }
      }}
    >
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          'dialog-panel w-full rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-6 text-left text-[var(--text)] shadow-[var(--shadow-overlay)] motion-reduce:transition-none',
          dialogSizes[size],
          className
        )}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className={cn('font-semibold text-[var(--text)]', size === 'confirm' ? 'text-lg leading-6' : 'text-base leading-6')} id={titleId}>
              {title}
            </h2>
            {description ? (
              <div className="mt-2 text-sm leading-[22px] text-[var(--muted)]" id={descriptionId}>
                {description}
              </div>
            ) : null}
          </div>
          {showCloseButton ? (
            <button
              aria-label={closeLabel}
              className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] text-lg leading-none text-[var(--muted)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--border-strong)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none"
              onClick={closeDialog}
              type="button"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          ) : null}
        </div>
        {children ? <div className={cn(size === 'confirm' ? 'mt-4 text-sm leading-[22px] text-[var(--muted)]' : 'mt-5')}>{children}</div> : null}
        {footer ? <div className={cn('mt-5 flex gap-2', size === 'confirm' ? 'flex-row justify-end' : 'flex-col-reverse sm:flex-row sm:justify-end')}>{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
