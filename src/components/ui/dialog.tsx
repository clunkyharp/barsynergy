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
  hideHeader?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  overlayProps?: DialogOverlayProps;
  scrollableBody?: boolean;
  showCloseButton?: boolean;
  size?: DialogSize;
  title: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'>;

const dialogSizes: Record<DialogSize, string> = {
  confirm: 'max-w-[min(400px,90vw)]',
  sm: 'max-w-[min(24rem,90vw)]',
  md: 'max-w-[min(32rem,90vw)]',
  lg: 'max-w-[min(42rem,90vw)]'
};

export function Dialog({
  children,
  className,
  closeLabel = 'Закрыть',
  closeOnOutsideClick = true,
  description,
  footer,
  hideHeader = false,
  initialFocusRef,
  onOpenChange,
  open,
  overlayProps,
  scrollableBody = false,
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
        'dialog-overlay fixed inset-0 z-[calc(var(--z-overlay)+10)] overflow-y-auto bg-black/35 backdrop-blur-sm motion-reduce:transition-none',
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
      <div className="flex min-h-full items-center justify-center px-4 py-6">
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          'dialog-panel w-full rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] text-left text-[var(--text)] shadow-[var(--shadow-overlay)] motion-reduce:transition-none',
          size === 'confirm' ? 'border-[var(--border-strong)] bg-[var(--surface)] shadow-none p-5' : 'p-6',
          scrollableBody && 'flex max-h-[85vh] flex-col',
          dialogSizes[size],
          className
        )}
        data-size={size}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        {...props}
      >
        {hideHeader ? (
          <>
            {title ? <h2 className="sr-only" id={titleId}>{title}</h2> : null}
            {description ? <div className="sr-only" id={descriptionId}>{description}</div> : null}
          </>
        ) : (
          <div className="flex shrink-0 items-start justify-between gap-4">
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
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] text-lg leading-none text-[var(--muted)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--border-strong)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 motion-reduce:transition-none"
                onClick={closeDialog}
                type="button"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            ) : null}
          </div>
        )}
        {children ? <div className={cn(size === 'confirm' ? 'mt-4 text-sm leading-[22px] text-[var(--muted)]' : 'mt-5', scrollableBody && 'flex-1 overflow-y-auto')}>{children}</div> : null}
        {footer ? <div className={cn('mt-5 flex shrink-0 gap-2', size === 'confirm' ? 'flex-row justify-end' : 'flex-col-reverse sm:flex-row sm:justify-end')}>{footer}</div> : null}
      </div>
      </div>
    </div>,
    document.body
  );
}
