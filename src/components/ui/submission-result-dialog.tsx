'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCopy } from '@/lib/hooks/use-copy';
import type { PublicApplicationResult } from '@/lib/applications/public-form-helpers';

type SubmissionResultDialogProps = {
  result: PublicApplicationResult | null | undefined;
  successTitle?: string;
  errorTitle?: string;
  registerHref?: string;
  showRegisterCTA?: boolean;
  onAcknowledged?: () => void;
};

export function SubmissionResultDialog({
  result,
  successTitle = 'Заявка отправлена',
  errorTitle = 'Не удалось отправить',
  registerHref = '/auth/register/user',
  showRegisterCTA = true,
  onAcknowledged,
}: SubmissionResultDialogProps) {
  const [open, setOpen] = useState(false);
  const { copy } = useCopy();

  useEffect(() => {
    if (result) {
      setOpen(true);
    }
  }, [result]);

  function handleClose() {
    setOpen(false);
    onAcknowledged?.();
  }

  if (!result) return null;

  const isSuccess = result.type === 'success';
  const tone = isSuccess ? 'success' : 'error';
  const dialogTitle = isSuccess ? successTitle : errorTitle;

  return (
    <Dialog
      closeOnOutsideClick
      data-tone={tone}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
      open={open}
      showCloseButton
      size={result.applicationId ? 'md' : 'sm'}
      title={dialogTitle}
      footer={
        isSuccess ? (
          <>
            <Button onClick={handleClose} size="lg">
              Готово
            </Button>
            {showRegisterCTA && result.applicationId ? (
              <Button href={registerHref} size="lg" variant="secondary">
                Зарегистрироваться
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <Button onClick={handleClose} size="lg">
              Закрыть
            </Button>
            <Button href="https://t.me/barsynergy" size="lg" variant="secondary">
              Связаться
            </Button>
          </>
        )
      }
    >
      <p className="text-sm leading-[22px] text-[var(--muted)]">{result.message}</p>
      {isSuccess && result.applicationId ? (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">
            Номер заявки
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-mono text-sm tracking-wide text-[var(--text)]">
              {result.applicationId}
            </span>
            <button
              className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2 py-1 text-[11px] font-semibold text-[var(--muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 motion-reduce:transition-none"
              onClick={() => copy(result.applicationId!)}
              type="button"
            >
              Копировать
            </button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
