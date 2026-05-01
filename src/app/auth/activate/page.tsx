import { activateBusinessAccessAction } from '@/app/auth/actions';
import { ActionRow } from '@/components/ui/action-row';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';
import { findActiveBusinessAccessInvite, parseBusinessAccessRequestPayload } from '@/lib/auth/business-access';

const errorMessages: Record<string, string> = {
  invalid: 'Ссылка активации недействительна или уже использована.',
  mismatch: 'Пароль и подтверждение должны совпадать.',
  blocked: 'Доступ временно заблокирован. Свяжитесь с командой BARSYNERGY.',
  failed: 'Не удалось завершить активацию прямо сейчас. Повторите попытку позже.'
};

type ActivatePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ActivateBusinessAccessPage({ searchParams }: ActivatePageProps) {
  const params = (await searchParams) ?? {};
  const token = firstParam(params.token) ?? '';
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Бизнес-аккаунт</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">Завершить подключение</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-[var(--muted)]">
            Установите пароль для первого входа в кабинет компании. Ссылка действует ограниченное время и используется один раз.
          </p>
          {companyName ? (
            <Panel className="mt-8" padding="sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Подключаемый доступ</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {companyName}
                {invite?.user.email ? ` / ${invite.user.email}` : ''}
              </p>
            </Panel>
          ) : null}
        </section>

        <section className="editorial-form-shell overflow-hidden">
          <div className="border-b border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.58))] px-5 py-5 md:px-6 md:py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Активация</p>
            <h2 className="mt-3 text-2xl font-semibold uppercase leading-8">Создайте пароль</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
              После активации вы сразу попадёте в кабинет и сможете продолжить работу с заявками компании.
            </p>
          </div>
          <div className="p-5 md:p-6">
            {error && errorMessages[error] ? (
              <InlineAlert className="mb-5" tone="error">
                {errorMessages[error]}
              </InlineAlert>
            ) : null}

            {!token || !invite ? (
              <InlineAlert tone="error">Ссылка активации недействительна или уже использована.</InlineAlert>
            ) : (
              <form action={activateBusinessAccessAction} className="grid gap-4">
                <input name="token" type="hidden" value={token} />
                <FormField htmlFor="password" label="Пароль" hint="Минимум 8 символов. Лучше использовать уникальный пароль для кабинета.">
                  <Input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
                </FormField>
                <FormField htmlFor="confirmPassword" label="Повторите пароль">
                  <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required />
                </FormField>
                <ActionRow>
                  <Button className="rounded-full" size="lg" type="submit">
                    Активировать доступ
                  </Button>
                  <Button className="rounded-full" href="/auth/login" size="lg" variant="secondary">
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
