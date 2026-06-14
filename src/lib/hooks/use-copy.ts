'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/toast';

export function useCopy() {
  const { showToast } = useToast();

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast({ title: 'Скопировано', tone: 'success' });
      } catch {
        showToast({ title: 'Не удалось скопировать', tone: 'error' });
      }
    },
    [showToast]
  );

  return { copy };
}
