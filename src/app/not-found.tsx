import { displayFont } from '@/lib/fonts';

export default function NotFound() {
  return (
    <main className="editorial-grid min-h-[65vh] border-b border-black/20">
      <section className="container flex flex-col justify-center py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">404</p>
        <h1 className={`${displayFont.className} display-tight mt-4 max-w-2xl text-[36px] md:text-[52px]`}>
          Страница не найдена
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
          Проверьте адрес или перейдите в один из основных разделов сайта.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            className="inline-flex min-h-12 items-center justify-center border border-[var(--graphite)] bg-[var(--graphite)] px-5 text-sm font-semibold uppercase tracking-[0.06em] text-white transition hover:bg-black"
            href="/"
          >
            На главную
          </a>
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
