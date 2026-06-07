import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowLeft, Check } from 'lucide-react';
import { loginAction } from '@/app/auth/actions';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/submit-button';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { accentFont } from '@/lib/fonts';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { cn } from '@/lib/utils';

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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = firstParam(params.error);
  const success = firstParam(params.success);
  const returnTo = firstParam(params.returnTo);
  const wasSubmitted = firstParam(params['_s']) === '1';
  const isRoleMismatch = error === 'role-mismatch';
  const topSuccess = success && successMessages[success] ? successMessages[success] : null;
  const formError = error && wasSubmitted && errorMessages[error] ? errorMessages[error] : null;

  const valueProps = [
    'Обучение, вакансии и инструменты для баров и кофеен СКФО',
    'Проверенные поставщики и консалтинг под задачи заведений',
    'Сообщество специалистов и управляющих в регионе'
  ] as const;

  return (
    <div className="auth-login-screen min-h-screen bg-[var(--background)] relative overflow-hidden">
      <div className="auth-login-container relative container max-w-[1440px] py-6 md:py-8">
        <div className="md:grid md:grid-cols-[1fr_1fr] md:gap-8 md:items-start">
          <main className="auth-login-layout mx-auto max-w-[440px] md:mx-0 md:max-w-[460px]">
            <section className="min-w-0">
              <header className="auth-login-header mb-6 flex flex-wrap items-center gap-4">
                <AppLink
                  aria-label="BARSYNERGY"
                  className="auth-login-logo inline-flex min-h-12 w-fit shrink-0 items-center rounded-[var(--radius-md)] pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  href="/"
                >
                  <Image alt="BARSYNERGY" className="theme-logo-light h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup.svg" width={360} />
                  <Image alt="BARSYNERGY" className="theme-logo-dark h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup-light.svg" width={360} />
                </AppLink>
                <span aria-hidden="true" className="hidden h-9 w-px bg-[var(--line)] sm:block" />
                <Button className="px-3" href="/" size="sm" variant="link">
                  <ArrowLeft aria-hidden size={14} strokeWidth={1.8} />
                  Вернуться на сайт
                </Button>
              </header>

              <h1 className="auth-login-title text-center text-[28px] font-bold leading-[1.18] tracking-normal text-[var(--text)] md:text-left">
                Вход в кабинет
              </h1>
              <p className="mt-2 text-center text-sm leading-6 text-[var(--muted)] md:text-left">
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
                  <FormField htmlFor="email" label="Email" labelSize="sm">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      placeholder="name@example.com"
                      required
                    />
                  </FormField>
                  <FormField htmlFor="password" label="Пароль" labelSize="sm">
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
                  <div className="mt-3 border-t border-[var(--border-default)] pt-4">
                    <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                      Ещё нет аккаунта?
                    </p>
                    <div className="flex flex-col items-center gap-2">
                      <AppLink className="text-sm font-semibold leading-5 text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/auth/register/user">
                        Зарегистрироваться как участник
                      </AppLink>
                      <AppLink className="text-sm font-semibold leading-5 text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/auth/register">
                        Запросить бизнес-доступ
                      </AppLink>
                    </div>
                  </div>
                </form>
              </div>
            </section>
          </main>

          <aside aria-hidden="true" className="auth-login-brand-panel relative hidden overflow-hidden rounded-[var(--radius-xl)] md:block md:sticky md:top-8" style={{ minHeight: 'calc(100vh - 5rem)' }}>
            <div className="absolute inset-0 bg-[var(--editorial-dark-surface)]" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[1]"
              style={{
                background:
                  'linear-gradient(160deg, rgba(14,11,9,0.88) 0%, rgba(14,11,9,0.55) 45%, rgba(14,11,9,0.28) 100%), linear-gradient(0deg, rgba(14,11,9,0.72) 0%, transparent 55%), radial-gradient(circle at 65% 20%, rgba(200,132,42,0.22), transparent 22rem)'
              }}
            />
            <Image
              alt=""
              className="absolute inset-0 z-0 object-cover object-[center_45%] saturate-[0.85]"
              fill
              priority
              sizes="50vw"
              src="/images/home/hero-bar-counter-bundo.jpg"
            />
            <div className="relative z-[2] flex h-full flex-col justify-end px-8 pb-14 pt-16" style={{ minHeight: 'calc(100vh - 5rem)' }}>
              <h2 className={`${cn(accentFont.className)} text-[2.8rem] font-semibold leading-[1.02] text-[var(--editorial-dark-text)]`}>
                Платформа для<br />баров СКФО
              </h2>
              <ul className="mt-8 space-y-5">
                {valueProps.map((prop) => (
                  <li className="flex items-start gap-3 text-sm leading-6 text-[var(--editorial-dark-muted)]" key={prop}>
                    <Check className="mt-0.5 shrink-0 text-[var(--accent)]" size={16} strokeWidth={2.5} />
                    {prop}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

