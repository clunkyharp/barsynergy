import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowLeft, ArrowUpRight, Briefcase, UserRound } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Регистрация на платформе — выберите роль',
  description: 'Зарегистрируйтесь как специалист или оставьте заявку на бизнес-доступ для вашей компании.'
});

export default function RegisterPage() {
  return (
    <div className="container max-w-4xl py-10 md:py-14 xl:py-18">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AppLink className="inline-flex w-fit focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/">
          <Image alt="BARSYNERGY" className="theme-logo-light h-auto w-[220px]" height={70} priority src="/brand/barsynergy-lockup.svg" width={360} />
          <Image alt="BARSYNERGY" className="theme-logo-dark h-auto w-[220px]" height={70} priority src="/brand/barsynergy-lockup-light.svg" width={360} />
        </AppLink>
        <Button className="px-4" href="/" size="sm" variant="link">
          <ArrowLeft aria-hidden size={15} strokeWidth={1.8} />
          Вернуться на сайт
        </Button>
      </div>

      <h1 className="display-tight mt-12 text-[clamp(2rem,5vw,2.75rem)] font-semibold leading-[1.15] text-balance">
        Выберите свою роль
      </h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-[var(--muted)]">
        Зарегистрируйтесь как специалист или оставьте заявку на бизнес-доступ для компании.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <article className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-card)] p-6 transition-shadow hover:shadow-[var(--shadow-card)] md:p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--accent-soft)]">
            <UserRound className="text-[var(--accent-ink)]" size={22} strokeWidth={1.8} />
          </div>
          <h2 className="mt-5 text-xl font-semibold leading-tight text-[var(--text)]">Я специалист</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Ищу работу, обучение и материалы для роста в барной индустрии. Создайте профиль и получайте доступ к вакансиям и каталогу специалистов.
          </p>
          <div className="mt-auto flex flex-col gap-2 pt-6">
            <Button className="w-full rounded-[var(--radius-md)]" href="/auth/register/user">
              Создать профиль
            </Button>
            <Button className="w-full rounded-[var(--radius-md)]" href="/auth/login" variant="secondary">
              Уже есть аккаунт
            </Button>
          </div>
        </article>

        <article className="flex flex-col rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-card)] p-6 transition-shadow hover:shadow-[var(--shadow-card)] md:p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--surface-muted)]">
            <Briefcase className="text-[var(--text-secondary)]" size={22} strokeWidth={1.8} />
          </div>
          <h2 className="mt-5 text-xl font-semibold leading-tight text-[var(--text)]">У меня компания</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Заведение, бренд, поставщик или партнёр. Оставьте заявку на бизнес-доступ для управления заявками, каталогом и журналом.
          </p>
          <div className="mt-auto flex flex-col gap-2 pt-6">
            <Button className="w-full rounded-[var(--radius-md)]" href="/auth/register/business">
              Запросить доступ
              <ArrowUpRight size={15} strokeWidth={1.8} />
            </Button>
            <Button className="w-full rounded-[var(--radius-md)]" href="/auth/login" variant="secondary">
              Уже есть доступ
            </Button>
          </div>
        </article>
      </div>

      <p className="mt-10 text-center text-sm text-[var(--muted)]">
        Есть вопросы? Напишите в{' '}
        <a className="font-semibold text-[var(--accent-ink)] hover:text-[var(--accent-strong)]" href="https://t.me/barsynergy">
          Telegram
        </a>
      </p>
    </div>
  );
}
