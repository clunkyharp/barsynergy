'use client';

import { useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

type SettingsAlertProps = {
  success?: string | null;
  error?: string | null;
};

export function SettingsAlert({ success, error }: SettingsAlertProps) {
  const { showToast } = useToast();

  useEffect(() => {
    if (!success && !error) return;

    showToast({
      id: 'settings-save',
      title: error ?? success ?? '',
      tone: error ? 'error' : 'success',
      duration: error ? 7000 : 3000
    });

    const url = new URL(window.location.href);
    url.searchParams.delete('success');
    url.searchParams.delete('error');
    window.history.replaceState({}, '', url.toString());
  }, [success, error, showToast]);

  return null;
}
