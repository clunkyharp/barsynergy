import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/current-user';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { AdminLoginForm } from './_components/admin-login-form';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Вход для команды',
  description: 'Закрытый вход для редакции и администраторов BARSYNERGY.'
});

export default async function AdminLoginPage() {
  const currentUser = await getCurrentUser();

  if (canAccessAdmin(currentUser?.role)) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="container flex max-w-[440px] flex-col py-8 md:py-12 xl:py-16">
        <header className="mb-10 flex flex-wrap items-center gap-4 md:mb-16">
          <AppLink
            aria-label="BARSYNERGY"
            className="inline-flex min-h-12 w-fit shrink-0 items-center rounded-[var(--radius-md)] pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href="/"
          >
            <Image alt="BARSYNERGY" className="theme-logo-light h-auto w-[180px] md:w-[200px]" height={70} priority src="/brand/barsynergy-lockup.svg" width={360} />
            <Image alt="BARSYNERGY" className="theme-logo-dark h-auto w-[180px] md:w-[200px]" height={70} priority src="/brand/barsynergy-lockup-light.svg" width={360} />
          </AppLink>
          <span aria-hidden="true" className="hidden h-9 w-px bg-[var(--line)] sm:block" />
          <Button className="px-4" href="/" size="sm" variant="link">
            <ArrowLeft aria-hidden size={15} strokeWidth={1.8} />
            Вернуться на сайт
          </Button>
        </header>

        <main className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-6 shadow-[var(--shadow-panel)] md:p-8">
          <h1 className="text-[30px] font-bold leading-[1.18] tracking-normal text-[var(--text)]">Вход для команды</h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            Для редакции и администраторов BARSYNERGY.
          </p>
          <AdminLoginForm />
        </main>
      </div>
    </div>
  );
}
