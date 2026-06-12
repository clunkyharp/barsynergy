'use client';

import type { ReactNode } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';

type InfoStep = {
  number: string;
  title: string;
  description: string;
};

type InfoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  ctaLabel?: string;
  onCtaClick?: () => void;
  steps?: InfoStep[];
};

export function InfoModal({
  open,
  onOpenChange,
  title,
  children,
  ctaLabel,
  onCtaClick
}: InfoModalProps) {
  return (
    <Dialog
      onOpenChange={onOpenChange}
      open={open}
      size="md"
      title={
        <span className={displayFont.className}>{title}</span>
      }
      description={children}
      footer={
        ctaLabel && onCtaClick ? (
          <Button
            className="w-full rounded-[var(--radius-md)] sm:w-auto"
            onClick={() => {
              onCtaClick();
              onOpenChange(false);
            }}
          >
            {ctaLabel}
          </Button>
        ) : undefined
      }
    >
      {null}
    </Dialog>
  );
}
