import type { ReactNode } from 'react';
import { logoutAction } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';

export default async function BusinessLayout({ children }: { children: ReactNode }) {
  const { businessAccount } = await requireBusinessAccountAccess();

  return (
    <div className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="container grid gap-6 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-lg border border-[var(--line)] bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Бизнес-кабинет</p>
          <p className="mt-2 font-semibold">{businessAccount.companyName}</p>
          <nav className="mt-5 grid gap-2 text-sm">
            <a className="rounded-md bg-[var(--surface)] px-3 py-2 font-semibold" href="/business">
              Компания
            </a>
            <a className="rounded-md px-3 py-2 font-semibold transition hover:bg-[var(--surface)]" href="/business/requests">
              Заявки
            </a>
          </nav>
          <form action={logoutAction} className="mt-5">
            <Button className="w-full" type="submit" variant="secondary">
              Выйти
            </Button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
