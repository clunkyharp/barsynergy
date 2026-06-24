import { ArrowLeft, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { activateBusinessAccessAction } from '@/app/auth/actions';
import { ActionRow } from '@/components/ui/action-row';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import { PasswordPairValidation } from '@/components/ui/password-pair-validation';
import { Panel } from '@/components/ui/panel';
import { SubmitButton } from '@/components/ui/submit-button';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import {
  BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME,
  findActiveBusinessAccessInvite,
  parseBusinessAccessRequestPayload
} from '@/lib/auth/business-access';
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from '@/lib/auth/password-policy-constants';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

const errorMessages: Record<string, string> = {
  invalid: 'Ссылка активации недействительна или уже использована.',
  mismatch: 'Пароль и подтверждение должны совпадать.',
  'compromised-password': 'Этот пароль уже встречался в утечках. Выберите другую фразу или пароль.',
  blocked: 'Доступ временно заблокирован. Свяжитесь с командой BARSYNERGY.',
  failed: 'Не удалось завершить активацию прямо сейчас. Повторите попытку позже.'
};

type ActivatePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Активация доступа',
  description: 'Закрытая страница для активации бизнес-доступа BARSYNERGY.'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ActivateBusinessAccessPage({ searchParams }: ActivatePageProps) {
  const params = (await searchParams) ?? {};
  const tokenParam = firstParam(params.token);

  if (tokenParam) {
    redirect(`/auth/activate/consume?token=${encodeURIComponent(tokenParam)}`);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME)?.value ?? '';
  const error = firstParam(params.error);
  const invite = token ? await findActiveBusinessAccessInvite(token) : null;
  const requestProfile = (() => {
    if (!invite) {
      return null;
    }

    try {
      return parseBusinessAccessRequestPayload(invite.application.payload, invite.application.name);
    } catch {
      return null;
    }
  })();
  const companyName = invite?.application.businessAccount?.companyName ?? requestProfile?.companyName;

  return (
    <div className="container max-w-5xl py-10 md:py-14">
      <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
        <section className="editorial-form-shell p-6 md:p-8">
          <div className="mb-8 flex justify-end">
            <Button className="px-4" href="/" size="sm" variant="link">
              <ArrowLeft aria-hidden size={15} strokeWidth={1.8} />
              Вернуться на сайт
            </Button>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-ink)]">Бизнес-аккаунт</p>
          <span className="mt-6 grid size-14 place-items-center rounded-[var(--radius-pill)] border border-[var(--accent)]/35 bg-[var(--accent-soft)] text-[var(--accent-ink)]">
            <ShieldCheck aria-hidden size={26} strokeWidth={1.7} />
          </span>
          <h1 className="display-tight mt-4 text-[40px] font-semibold leading-[1.20] text-balance tracking-normal md:text-[54px]">Завершить подключение</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-[var(--muted)]">
            Установите пароль для первого входа в кабинет компании. Ссылка действует недолго и открывается один раз.
          </p>
          {companyName ? (
            <Panel className="mt-8" padding="sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Доступ для компании</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {companyName}
                {invite?.user.email ? ` / ${invite.user.email}` : ''}
              </p>
            </Panel>
          ) : null}
        </section>

        <section className="editorial-form-shell overflow-hidden">
          <div className="border-b border-black/10 bg-[var(--surface-wash)] px-5 py-5 md:px-6 md:py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-ink)]">Активация</p>
            <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-normal">Создайте пароль</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
              После активации вы попадёте в кабинет и сможете работать с заявками компании.
            </p>
          </div>
          <div className="p-5 md:p-6">
            {error && errorMessages[error] ? (
              <InlineAlert className="mb-5" tone="error">
                {errorMessages[error]}
              </InlineAlert>
            ) : null}

            {!token || !invite ? (
              <div className="space-y-4">
                <InlineAlert tone="error">Ссылка активации недействительна или уже использована.</InlineAlert>
                <div className="flex flex-wrap gap-3">
                  <Button className="rounded-[var(--radius-md)]" href="/auth/register/business" size="lg">
                    Запросить новую ссылку
                  </Button>
                  <Button className="rounded-[var(--radius-md)]" href="/auth/login" size="lg" variant="secondary">
                    Войти
                  </Button>
                  <Button className="rounded-[var(--radius-md)]" href="/contacts?topic=other" size="lg" variant="secondary">
                    Написать команде
                  </Button>
                </div>
              </div>
            ) : (
              <form action={activateBusinessAccessAction} className="grid gap-4" data-public-validation="true" noValidate>
                <PublicFormValidation />
                <PasswordPairValidation />
                <input name="token" type="hidden" value={token} />
                <FormField htmlFor="new-password" label="Пароль" hint={PASSWORD_HINT}>
                  <Input id="new-password" name="password" type="password" minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" placeholder={PASSWORD_HINT} required />
                </FormField>
                <FormField htmlFor="confirm-password" label="Повторите пароль">
                  <Input id="confirm-password" name="confirmPassword" type="password" minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" placeholder="Повторите пароль" required />
                </FormField>
                <ActionRow>
                  <SubmitButton className="rounded-[var(--radius-md)]" size="lg">
                    Активировать доступ
                  </SubmitButton>
                  <Button className="rounded-[var(--radius-md)]" href="/auth/login" size="lg" variant="secondary">
                    Уже есть вход
                  </Button>
                </ActionRow>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
