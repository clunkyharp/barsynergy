'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { InlineLink } from '@/components/ui/inline-link';

const cookieNoticeStorageKey = 'barsynergy_cookie_notice_accepted';

export function CookieNotice() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(window.localStorage.getItem(cookieNoticeStorageKey) !== 'true');
  }, []);

  if (!isVisible || pathname?.startsWith('/admin') || pathname?.startsWith('/business') || pathname?.startsWith('/auth')) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 md:inset-x-auto md:bottom-5 md:right-5 md:w-[420px]">
      <div className="border border-black/16 bg-[var(--paper)] p-4 shadow-[0_18px_50px_rgba(22,20,18,0.18)]">
        <div className="flex items-start gap-4">
          <p className="min-w-0 text-sm leading-6 text-[var(--muted)]">
            Сайт использует технические cookies для входа, защиты форм и стабильной работы. Подробнее: <InlineLink href="/legal/cookies">куки</InlineLink> и{' '}
            <InlineLink href="/legal/privacy">политика данных</InlineLink>.
          </p>
          <button
            aria-label="Закрыть уведомление о cookies"
            className="inline-flex size-9 shrink-0 items-center justify-center border border-black/12 text-[var(--text)] transition hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            onClick={() => {
              window.localStorage.setItem(cookieNoticeStorageKey, 'true');
              setIsVisible(false);
            }}
            type="button"
          >
            <X aria-hidden size={16} />
          </button>
        </div>
        <Button
          className="mt-4 min-h-11 w-full rounded-full"
          onClick={() => {
            window.localStorage.setItem(cookieNoticeStorageKey, 'true');
            setIsVisible(false);
          }}
          type="button"
        >
          Понятно
        </Button>
      </div>
    </div>
  );
}
