'use client';

import {
  useActionState,
  useCallback,
  type ReactNode
} from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { displayFont } from '@/lib/fonts';
import { PublicFormValidation } from '@/components/public/public-form-validation';

type ActionResult = {
  type: 'success' | 'error';
  message: string;
};

type LeadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  successTitle?: string;
  successMessage?: string;
  children: ReactNode;
  submitLabel?: string;
  action: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult | null>;
};

export function LeadModal({
  open,
  onOpenChange,
  title,
  description,
  successTitle = 'Заявка отправлена',
  successMessage = 'Ответим в течение 2 рабочих дней по указанному способу связи.',
  children,
  submitLabel = 'Отправить заявку',
  action
}: LeadModalProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  const closeAndReset = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const isSuccess = state?.type === 'success';

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeAndReset();
        }
        onOpenChange(nextOpen);
      }}
      open={open}
      size="md"
      title={
        isSuccess ? (
          <span className={displayFont.className}>{successTitle}</span>
        ) : (
          <span className={displayFont.className}>{title}</span>
        )
      }
      description={
        isSuccess ? (
          <p className="text-sm leading-[22px] text-[var(--muted)]">
            {successMessage}
          </p>
        ) : (
          <p className="text-sm leading-[22px] text-[var(--muted)]">
            {description}
          </p>
        )
      }
      footer={
        isSuccess ? null : (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              className="w-full rounded-[var(--radius-md)] sm:w-auto"
              onClick={closeAndReset}
              type="button"
              variant="secondary"
            >
              Отмена
            </Button>
          </div>
        )
      }
    >
      {isSuccess ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <CheckCircle
            aria-hidden="true"
            className="text-[var(--accent)]"
            size={48}
            strokeWidth={1.5}
          />
        </div>
      ) : (
        <form action={formAction} id="lead-modal-form" noValidate data-public-validation="true">
          {children}
          <div className="mt-6">
            <button
              className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--accent)] bg-[var(--accent)] px-6 text-[15px] font-semibold leading-5 text-[var(--accent-contrast)] transition-[background-color,border-color,color,box-shadow,filter,transform] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] active:scale-[0.98] hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--muted)] disabled:opacity-60 aria-busy:cursor-wait sm:w-auto"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
                  />
                  <span>Отправляем…</span>
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
          <PublicFormValidation showSummary={false} />
          {state?.type === 'error' && !isPending ? (
            <p
              aria-live="polite"
              className="mt-4 rounded-[var(--radius-sm)] border border-[var(--danger-action-bg)]/30 bg-[var(--danger-action-bg)]/10 px-3 py-2 text-sm text-[var(--danger-action-bg)]"
              role="alert"
            >
              {state.message}
            </p>
          ) : null}
        </form>
      )}
    </Dialog>
  );
}
