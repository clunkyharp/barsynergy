'use client';

import { useRef, useState, type MouseEvent } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ConfirmSubmitButtonProps = ButtonProps & {
  confirmActionLabel?: string;
  confirmCancelLabel?: string;
  confirmText?: string;
  confirmTitle?: string;
};

export function ConfirmSubmitButton({
  children,
  confirmActionLabel,
  confirmCancelLabel = 'Отмена',
  confirmText,
  confirmTitle,
  onClick,
  ...props
}: ConfirmSubmitButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState<HTMLFormElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const needsConfirm = Boolean(confirmTitle || confirmText);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);

    if (event.defaultPrevented || !needsConfirm) {
      return;
    }

    event.preventDefault();
    triggerRef.current = event.currentTarget;
    setForm(event.currentTarget.closest('form'));
    setConfirmOpen(true);
  }

  function submitConfirmedAction() {
    setConfirmOpen(false);
    form?.requestSubmit(triggerRef.current ?? undefined);
  }

  return (
    <>
      <Button onClick={handleClick} {...props}>
        {children}
      </Button>
      <Dialog
        closeOnOutsideClick
        description={confirmText}
        footer={
          <>
            <button
              className="inline-flex min-h-[38px] shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--admin-secondary-border)] bg-[var(--admin-secondary-bg)] px-4 text-[13px] font-semibold text-[var(--text)] transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--admin-secondary-border-hover)] hover:bg-[var(--admin-secondary-bg-hover)] hover:text-[var(--admin-secondary-text-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none"
              onClick={() => setConfirmOpen(false)}
              ref={cancelButtonRef}
              type="button"
            >
              {confirmCancelLabel}
            </button>
            <button
              className={cn(
                'inline-flex min-h-[38px] shrink-0 items-center justify-center rounded-[var(--radius-md)] border px-4 text-[13px] font-semibold transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-2 motion-reduce:transition-none',
                'border-[var(--admin-confirm-border)] bg-[var(--admin-confirm-bg)] text-[var(--admin-confirm-text)] hover:bg-[var(--admin-confirm-bg-hover)] focus-visible:ring-[var(--focus-ring)]'
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
        showCloseButton={false}
        size="confirm"
        title={confirmTitle ?? 'Подтвердите действие'}
      >
        {null}
      </Dialog>
    </>
  );
}
