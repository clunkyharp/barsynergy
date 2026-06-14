'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SubmissionResultDialog } from '@/components/ui/submission-result-dialog';
import type { PublicApplicationResult } from '@/lib/applications/public-form-helpers';

export function PublicFormResultDialog({ result }: { result: PublicApplicationResult | undefined }) {
  const router = useRouter();

  const handleAcknowledged = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('applicationSuccess');
    url.searchParams.delete('applicationError');
    url.searchParams.delete('applicationId');
    router.replace(url.pathname + url.search);
  }, [router]);

  if (!result) return null;

  return <SubmissionResultDialog result={result} onAcknowledged={handleAcknowledged} />;
}
