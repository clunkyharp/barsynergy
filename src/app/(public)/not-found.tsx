import type { Metadata } from 'next';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Страница не найдена',
  description: 'Запрошенная страница не существует или была удалена.'
};

export default function PublicNotFound() {
  return (
    <div className="background-zone background-zone-hero border-b border-[var(--line)]">
      <div className="container flex min-h-[50vh] flex-col items-center justify-center py-16 md:py-24">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--muted)]">
          <SearchX size={24} strokeWidth={1.6} />
        </span>
        <h1 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.20] text-balance text-[var(--text)]">
          Страница не найдена
        </h1>
        <p className="mt-3 max-w-md text-center text-sm leading-6 text-[var(--muted)]">
          Запрошенная страница не существует, удалена или ссылка неправильная.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button className="rounded-[var(--radius-md)]" href="/">
            На главную
          </Button>
          <Button className="rounded-[var(--radius-md)]" href="/search" variant="secondary">
            Поиск по платформе
          </Button>
        </div>
      </div>
    </div>
  );
}
