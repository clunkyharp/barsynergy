import { displayFont } from '@/lib/fonts';

export default function Loading() {
  return (
    <main aria-busy="true" className="editorial-grid min-h-[55vh] border-b border-black/20">
      <section className="container flex flex-col justify-center py-16">
        <p className="sr-only">Страница загружается.</p>
        <div aria-hidden="true" className="max-w-3xl space-y-4">
          <div className="h-3 w-28 animate-pulse rounded-full bg-[var(--accent)]/20" />
          <div className="grid gap-3">
            <div className={`${displayFont.className} h-12 w-full max-w-2xl animate-pulse rounded-[18px] bg-black/6 md:h-16`} />
            <div className="h-5 w-full max-w-xl animate-pulse rounded-full bg-black/6" />
            <div className="h-5 w-3/4 max-w-lg animate-pulse rounded-full bg-black/6" />
          </div>
        </div>
      </section>
    </main>
  );
}
