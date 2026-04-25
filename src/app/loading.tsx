import { displayFont } from '@/lib/fonts';

export default function Loading() {
  return (
    <main className="editorial-grid min-h-[65vh] border-b border-black/20">
      <section className="container flex flex-col justify-center py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Загрузка</p>
        <h1 className={`${displayFont.className} display-tight mt-4 max-w-2xl text-[36px] md:text-[52px]`}>
          Подготавливаем страницу
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
          Подождите несколько секунд. Данные загружаются.
        </p>
      </section>
    </main>
  );
}
