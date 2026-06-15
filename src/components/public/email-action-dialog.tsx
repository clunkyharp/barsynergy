'use client';

import { Copy, ExternalLink, Mail } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCopy } from '@/lib/hooks/use-copy';
import { SUPPORT_EMAIL } from '@/lib/contact-info';

type EmailActionDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function buildGmailUrl(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

export function EmailActionDialog({ onOpenChange, open }: EmailActionDialogProps) {
  const { copy } = useCopy();

  return (
    <Dialog
      closeOnOutsideClick
      onOpenChange={onOpenChange}
      open={open}
      showCloseButton
      size="sm"
      title="Написать на почту"
      description="Выберите способ отправить письмо."
    >
      <div className="grid gap-4 py-2">
        <Button
          className="rounded-[var(--radius-md)]"
          href={`mailto:${SUPPORT_EMAIL}`}
          size="lg"
          variant="secondary"
        >
          <Mail size={16} />
          Открыть почтовый клиент
        </Button>
        <Button
          className="rounded-[var(--radius-md)]"
          href={buildGmailUrl(SUPPORT_EMAIL)}
          rel="noreferrer"
          size="lg"
          target="_blank"
          variant="secondary"
        >
          <ExternalLink size={16} />
          Открыть Gmail в браузере
        </Button>
        <Button
          className="rounded-[var(--radius-md)]"
          onClick={() => copy(SUPPORT_EMAIL)}
          size="lg"
          variant="secondary"
        >
          <Copy size={16} />
          Скопировать адрес
        </Button>
      </div>
    </Dialog>
  );
}
