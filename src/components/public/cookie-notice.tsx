'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { InlineLink } from '@/components/ui/inline-link';
import { cn } from '@/lib/utils';

const cookieNoticeStorageKey = 'barsynergy_cookie_notice_accepted';

export function CookieNotice() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const isCostCalculatorPage = pathname === '/tools/cost-calculator';

  useEffect(() => {
    setIsVisible(window.localStorage.getItem(cookieNoticeStorageKey) !== 'true');
  }, []);

  if (!isVisible || pathname?.startsWith('/admin') || pathname?.startsWith('/business') || pathname?.startsWith('/auth')) {
    return null;
  }

  return (
    <div
      className={cn(
        isCostCalculatorPage
          ? 'relative z-10 mx-auto my-4 w-[calc(100%-1.5rem)] max-w-[420px]'
          : 'fixed inset-x-3 bottom-3 z-40 md:inset-x-auto md:bottom-5 md:right-5 md:w-[420px]'
      )}
    >
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--paper)] p-4 shadow-[0_18px_50px_rgba(22,20,18,0.18)]">
        <div className={cn('flex items-start gap-4', isCostCalculatorPage && 'gap-3')}>
          <p className="min-w-0 text-sm leading-6 text-[var(--muted)]">
            Сайт использует технические cookies для входа, защиты форм и стабильной работы. Документы: <InlineLink href="/legal/cookies">куки</InlineLink> и{' '}
            <InlineLink href="/legal/privacy">политика данных</InlineLink>.
          </p>
          <button
            aria-label="Закрыть уведомление о cookies"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] text-[var(--text)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            onClick={() => {
              window.localStorage.setItem(cookieNoticeStorageKey, 'true');
              setIsVisible(false);
            }}
            type="button"
          >
            <X aria-hidden size={16} />
          </button>
        </div>
        {isCostCalculatorPage ? null : (
          <Button
            className="mt-4 min-h-11 w-full rounded-[var(--radius-md)]"
            onClick={() => {
              window.localStorage.setItem(cookieNoticeStorageKey, 'true');
              setIsVisible(false);
            }}
            type="button"
          >
            Понятно
          </Button>
        )}
      </div>
    </div>
  );
}
