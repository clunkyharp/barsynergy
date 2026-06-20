import type { Metadata } from 'next';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Страница не найдена',
  description: 'Запрошенная страница не существует или была удалена.'
};

const quickLinks = [
  { href: '/vacancies', label: 'Вакансии', description: 'Открытые роли и заявки от заведений.' },
  { href: '/suppliers', label: 'Поставщики', description: 'Оборудование, зерно, продукты и сервисы.' },
  { href: '/articles', label: 'Материалы', description: 'Разборы, инструкции и полезные тексты.' }
];

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
          <Button className="rounded-[var(--radius-md)] px-6 uppercase tracking-[0.06em]" href="/">
            На главную
          </Button>
          <Button className="rounded-[var(--radius-md)] border-[var(--accent)] px-6 uppercase tracking-[0.06em] text-[var(--accent)] hover:bg-[var(--accent-soft)]" href="/contacts" variant="secondary">
            Контакты
          </Button>
        </div>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {quickLinks.map((link) => (
            <AppLink
              className="group flex min-h-full cursor-pointer flex-col rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-wash-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href={link.href}
              key={link.href}
            >
              <span className="text-sm font-semibold text-[var(--text)]">{link.label}</span>
              <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{link.description}</span>
              <span className="mt-auto pt-4 text-[13px] font-semibold text-[var(--accent)]">Перейти →</span>
            </AppLink>
          ))}
        </div>
      </section>
    </main>
  );
}
