import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { loginAction } from '@/app/auth/actions';
import { AppLink } from '@/components/ui/app-link';
import { InlineAlert } from '@/components/ui/inline-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/submit-button';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

const errorMessages: Record<string, string> = {
  invalid: 'Неверный email или пароль.',
  pending: 'Заявка ещё на проверке или доступ к кабинету пока не открыт.',
  blocked: 'Доступ заблокирован. Свяжитесь с командой BARSYNERGY.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.',
  'role-mismatch': 'У этой учётной записи нет доступа к выбранному кабинету.',
  'rate-limited': 'Слишком много попыток входа. Повторите позже.'
};

const successMessages: Record<string, string> = {
  'business-request-created': 'Заявку получили. После проверки напишем, как открыть доступ.',
  'business-request-duplicate': 'Заявка по этому email уже получена. Мы свяжемся по мере проверки.',
  'logged-out': 'Вы вышли из аккаунта.',
  'password-reset': 'Пароль успешно изменён. Войдите с новым паролем.'
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Вход',
  description: 'Вход в закрытые кабинеты BARSYNERGY для участника или бизнеса.'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const authLabelClassName = '!text-[13px] !font-medium !normal-case leading-[18px] !tracking-normal !text-[var(--text)]';

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = firstParam(params.error);
  const success = firstParam(params.success);
  const returnTo = firstParam(params.returnTo);
  const wasSubmitted = firstParam(params['_s']) === '1';
  const isRoleMismatch = error === 'role-mismatch';
  const topSuccess = success && successMessages[success] ? successMessages[success] : null;
  const formError = error && wasSubmitted && errorMessages[error] ? errorMessages[error] : null;

  return (
    <div className="auth-login-screen min-h-screen bg-[var(--background)] relative overflow-hidden">
      <AppLink
        className="absolute top-4 left-4 sm:top-5 sm:left-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        href="/"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Вернуться на сайт
      </AppLink>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(150,112,30,0.08),transparent)]" />
      <div className="auth-login-container relative container max-w-[1440px] py-5 md:py-6">
        <header className="auth-login-header mx-auto mb-5 flex max-w-[440px] flex-col items-center gap-3 text-center">
          <AppLink
            aria-label="BARSYNERGY"
            className="auth-login-logo inline-flex min-h-12 w-fit shrink-0 items-center rounded-[var(--radius-md)] pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href="/"
          >
            <Image alt="BARSYNERGY" className="theme-logo-light h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup.svg" width={360} />
            <Image alt="BARSYNERGY" className="theme-logo-dark h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup-light.svg" width={360} />
          </AppLink>
        </header>

        <main className="auth-login-layout mx-auto max-w-[440px]">
          <section className="min-w-0">
            <h1 className="auth-login-title text-center text-[28px] font-bold leading-[1.18] tracking-normal text-[var(--text)]">
              Вход в кабинет
            </h1>
            <p className="mt-2 text-center text-sm leading-6 text-[var(--muted)]">
              Для заведений и специалистов BARSYNERGY.
            </p>

            <div className="auth-login-form-block mt-5 w-full">
              {formError ? (
                <InlineAlert className="mb-4 flex items-start gap-2" tone={isRoleMismatch ? 'warning' : 'error'}>
                  {!isRoleMismatch ? <span aria-hidden="true" className="font-bold">✕</span> : null}
                  <span>{formError}</span>
                </InlineAlert>
              ) : null}
              {topSuccess ? (
                <InlineAlert className="mb-4" tone="success">
                  {topSuccess}
                </InlineAlert>
              ) : null}
              <form action={loginAction} className="auth-login-form grid gap-3.5" data-public-validation="true" noValidate>
                <PublicFormValidation />
                <input name="surface" type="hidden" value="public" />
                {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}
                <FormField htmlFor="email" label="Email" labelClassName={authLabelClassName} required={false}>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="name@example.com"
                    required
                  />
                </FormField>
                <FormField htmlFor="password" label="Пароль" labelClassName={authLabelClassName} required={false}>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Введите пароль"
                    required
                  />
                </FormField>
                <AppLink className="-mt-1 justify-self-end text-sm font-semibold leading-5 text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/auth/password-reset">
                  Забыли пароль?
                </AppLink>
                <SubmitButton className="auth-login-submit mt-2 w-full" pendingText="Входим…">
                  Войти
                </SubmitButton>
                <p className="mt-1 text-center text-xs text-[var(--muted)]">
                  Проблемы с доступом?{' '}
                  <AppLink className="text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]" href="/contacts?topic=other#contact-form">
                    Написать команде
                  </AppLink>
                </p>
                <div className="mt-2 flex flex-col items-center gap-2">
                  <AppLink className="text-sm font-semibold leading-5 text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/auth/register/user">
                    Зарегистрироваться как участник
                  </AppLink>
                  <AppLink className="text-sm font-semibold leading-5 text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/auth/register">
                    Запросить бизнес-доступ
                  </AppLink>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

