'use client';

import { useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Button, type ButtonProps } from '@/components/ui/button';
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
  const needsConfirm = Boolean(confirmTitle || confirmText);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);

    if (event.defaultPrevented || !needsConfirm) {
      return;
    }

    event.preventDefault();
    setForm(event.currentTarget.closest('form'));
    setConfirmOpen(true);
  }

  function submitConfirmedAction() {
    setConfirmOpen(false);
    form?.requestSubmit();
  }

  return (
    <>
      <Button onClick={handleClick} {...props}>
        {children}
      </Button>
      {confirmOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[calc(var(--z-overlay)+10)] grid place-items-center bg-black/35 px-4 py-6 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setConfirmOpen(false);
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
                    onClick={() => setConfirmOpen(false)}
                    type="button"
                  >
                    {confirmCancelLabel}
                  </button>
                  <button
                    className={cn(
                      'inline-flex min-h-10 items-center justify-center rounded-[var(--radius-sm)] border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2',
                      'border-[var(--admin-confirm-border)] bg-[var(--admin-confirm-bg)] text-[var(--admin-confirm-text)] hover:bg-[var(--admin-confirm-bg-hover)] focus-visible:ring-[var(--focus-ring)]'
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
