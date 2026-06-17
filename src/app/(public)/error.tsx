'use client';

import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicErrorPage({ reset }: ErrorProps) {
  return (
    <main className="editorial-grid min-h-[65vh] border-b border-[var(--line)]">
      <section className="container flex flex-col justify-center py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Ошибка</p>
        <h1 className={`${displayFont.className} display-tight mt-4 max-w-2xl text-[36px] md:text-[52px]`}>
          Не удалось открыть страницу
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
          Попробуйте обновить страницу. Если ошибка повторяется, свяжитесь с нами через контакты.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button onClick={reset}>
            Попробовать снова
          </Button>
          <AppLink
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] px-5 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            href="/contacts"
          >
            Контакты
          </AppLink>
        </div>
      </section>
    </main>
  );
}
