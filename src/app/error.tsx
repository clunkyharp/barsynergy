'use client';

import { displayFont } from '@/lib/fonts';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ reset }: ErrorProps) {
  return (
    <main className="editorial-grid min-h-[65vh] border-b border-black/20">
      <section className="container flex flex-col justify-center py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Ошибка</p>
        <h1 className={`${displayFont.className} display-tight mt-4 max-w-2xl text-[36px] md:text-[52px]`}>
          Не удалось открыть страницу
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
          Попробуйте обновить страницу. Если ошибка повторяется, свяжитесь с командой через контакты.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            className="inline-flex min-h-12 items-center justify-center border border-[var(--graphite)] bg-[var(--graphite)] px-5 text-sm font-semibold uppercase tracking-[0.06em] text-white transition hover:bg-black"
            onClick={reset}
            type="button"
          >
            Повторить
          </button>
          <a
            className="inline-flex min-h-12 items-center justify-center border border-black/25 px-5 text-sm font-semibold uppercase tracking-[0.06em] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            href="/contacts"
          >
            Контакты
          </a>
        </div>
      </section>
    </main>
  );
}
