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
          : 'fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 md:inset-x-auto md:bottom-5 md:right-5 md:w-[420px]'
      )}
    >
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--paper)] p-3 shadow-[var(--shadow-overlay)] md:p-4">
        <div className={cn('grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:gap-4', isCostCalculatorPage && 'gap-3')}>
          <p className="min-w-0 text-[13px] leading-5 text-[var(--muted)] md:text-sm md:leading-6">
            Сайт использует технические cookies для входа, защиты форм и стабильной работы. Документы: <InlineLink href="/legal/cookies">куки</InlineLink> и{' '}
            <InlineLink href="/legal/privacy">политика данных</InlineLink>.
          </p>
          <button
            aria-label="Закрыть уведомление о cookies"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] px-3 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:size-11 md:px-0"
            onClick={() => {
              window.localStorage.setItem(cookieNoticeStorageKey, 'true');
              setIsVisible(false);
            }}
            type="button"
          >
            <span className="md:hidden">Понятно</span>
            <span aria-hidden="true" className="hidden md:inline-flex">
              <X size={16} />
            </span>
          </button>
        </div>
        {isCostCalculatorPage ? null : (
          <Button
            className="mt-3 hidden min-h-10 w-full rounded-[var(--radius-md)] md:flex md:mt-4 md:min-h-11"
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
