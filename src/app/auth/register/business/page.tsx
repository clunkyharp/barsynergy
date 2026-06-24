import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { ActionRow } from '@/components/ui/action-row';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Panel } from '@/components/ui/panel';
import { BusinessRequestForm } from '@/components/public/business-request-form';
import { createBusinessAccountRequestAction } from '@/app/auth/actions';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { getActiveCities } from '@/modules/auth/shared/queries';
import { SUPPORT_TELEGRAM } from '@/lib/contact-info';
import { getEnv } from '@/lib/validation/env';

const PUBLIC_CONTACT_TELEGRAM = 'https://t.me/barsynergy';

const errorMessages: Record<string, string> = {
  invalid: 'Проверьте обязательные поля, email и сайт.',
  disabled: `Форма сейчас недоступна. Если доступ нужен, напишите в Telegram ${SUPPORT_TELEGRAM}.`,
  failed: 'Не удалось создать кабинет прямо сейчас. Попробуйте позже.',
  'rate-limited': 'Слишком много запросов за короткое время. Повторите позже.',
  'already-registered': 'Аккаунт с таким email уже существует. Войдите или восстановите пароль.'
};

type RegisterBusinessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Заявка на бизнес-доступ',
  description: 'Форма заявки на бизнес-доступ для заведений, брендов, поставщиков и партнёров BARSYNERGY.'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterBusinessPage({ searchParams }: RegisterBusinessPageProps) {
  const env = getEnv();
  const formsEnabled = arePublicApplicationFormsEnabled(env);
  const params = (await searchParams) ?? {};
  const error = firstParam(params.error);
  const cities = formsEnabled
    ? await getActiveCities()
    : [];

  return (
    <div className="container max-w-6xl py-10 md:py-14 xl:py-18">
      <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr] xl:items-start">
        <section className="editorial-form-shell p-6 md:p-8">
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
          <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-ink)]">Бизнес-доступ</p>
          <h1 className="auth-register-title display-tight mt-8 max-w-[15ch] text-[clamp(2rem,9vw,2.375rem)] font-semibold leading-[1.20] text-balance tracking-normal md:text-[52px]">
            Заявка на бизнес-доступ
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-[var(--muted)]">
            Для заведений, брендов, поставщиков и партнёров, которым нужен доступ к заявкам, каталогу и журналу.
          </p>
          <div className="mt-8 border-t border-black/10 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Что указать</p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
              <li className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                <span>Шаг 1: контактные данные.</span>
              </li>
              <li className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                <span>Шаг 2: информация о компании.</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="editorial-form-shell overflow-hidden">
          {!formsEnabled ? (
            <div className="p-5 md:p-6">
              <Panel className="border-[var(--warning-border)] bg-[var(--warning-bg)] p-6 md:p-7" padding="lg">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--warning)]">Доступ временно закрыт</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">Форма заявок сейчас недоступна</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                  Новые заявки через эту форму сейчас не принимаются. Если доступ нужен уже сейчас, напишите в{' '}
                  <a className="font-semibold text-[var(--accent-ink)] hover:text-[var(--accent-strong)]" href={PUBLIC_CONTACT_TELEGRAM}>
                    Telegram
                  </a>
                  .
                </p>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <Panel className="bg-[var(--surface-wash)] text-sm leading-6 text-[var(--muted)]" padding="sm">
                    Для связи по доступу используйте Telegram команды.
                  </Panel>
                  <Panel className="bg-[var(--surface-wash)] text-sm leading-6 text-[var(--muted)]" padding="sm">
                    Когда форма снова откроется, заявку можно будет оставить на этой же странице.
                  </Panel>
                </div>
                <ActionRow className="mt-7 border-t-0 pt-0">
                  <Button className="rounded-[var(--radius-md)]" href={PUBLIC_CONTACT_TELEGRAM} size="lg">
                    Написать в Telegram
                  </Button>
                  <Button className="rounded-[var(--radius-md)]" href="/auth/login" size="lg" variant="secondary">
                    Уже есть доступ
                  </Button>
                </ActionRow>
              </Panel>
            </div>
          ) : (
            <>
              <div className="border-b border-black/10 bg-[var(--surface-wash)] px-5 py-5 md:px-6 md:py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-ink)]">Бизнес-доступ</p>
                <h2 className="auth-register-form-title mt-3 text-[clamp(1.55rem,7vw,2rem)] font-semibold leading-tight tracking-normal md:text-[2rem]">Данные компании</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
                  Укажите данные компании — кабинет откроется сразу после отправки. На email придёт ссылка для установки пароля.
                </p>
              </div>
              <div className="p-5 md:p-6">
                {error && errorMessages[error] ? (
                  <InlineAlert className="mb-5" tone="error">
                    {errorMessages[error]}
                  </InlineAlert>
                ) : null}
                <BusinessRequestForm action={createBusinessAccountRequestAction} cities={cities} />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
