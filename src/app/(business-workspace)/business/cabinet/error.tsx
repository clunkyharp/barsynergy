'use client';

import { Button } from '@/components/ui/button';

export default function BusinessCabinetErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Ошибка</p>
        <h1 className="mt-4 text-2xl font-semibold text-[var(--text)]">Что-то пошло не так</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {error.message || 'Произошла непредвиденная ошибка. Попробуйте обновить страницу.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Повторить</Button>
          <Button href="/business/cabinet" variant="secondary">Вернуться в кабинет</Button>
        </div>
      </div>
    </div>
  );
}
