import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { requestPasswordResetAction } from '@/app/auth/password-reset/actions';
import { AppLink } from '@/components/ui/app-link';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/submit-button';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

const errorMessages: Record<string, string> = {
  invalid: 'Введите корректный email.',
  'rate-limited': 'Слишком много попыток за короткое время. Повторите позже.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.'
};

const successMessages: Record<string, string> = {
  'reset-sent': 'Если этот email зарегистрирован на платформе, мы отправили на него инструкции по восстановлению пароля.'
};

type PasswordResetPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Восстановление пароля',
  description: 'Запрос на восстановление пароля для входа в BARSYNERGY.'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PasswordResetPage({ searchParams }: PasswordResetPageProps) {
  const params = (await searchParams) ?? {};
  const error = firstParam(params.error);
  const success = firstParam(params.success);
  const formError = error && errorMessages[error] ? errorMessages[error] : null;
  const formSuccess = success && successMessages[success] ? successMessages[success] : null;

  return (
    <div className="auth-password-reset-screen min-h-screen bg-[var(--background)]">
      <AppLink
        className="absolute top-4 left-4 sm:top-5 sm:left-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        href="/auth/login"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Вернуться ко входу
      </AppLink>
      <div className="auth-password-reset-container container max-w-[1440px] py-5 md:py-6">
        <header className="auth-password-reset-header mx-auto mb-5 flex max-w-[440px] flex-col items-center gap-3 text-center">
          <AppLink
            aria-label="BARSYNERGY"
            className="inline-flex min-h-12 w-fit shrink-0 items-center rounded-[var(--radius-md)] pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href="/"
          >
            <Image alt="BARSYNERGY" className="theme-logo-light h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup.svg" width={360} />
            <Image alt="BARSYNERGY" className="theme-logo-dark h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup-light.svg" width={360} />
          </AppLink>
        </header>

        <main className="auth-password-reset-layout mx-auto max-w-[440px]">
          <section className="min-w-0">
            <h1 className="text-center text-[28px] font-bold leading-[1.18] tracking-normal text-[var(--text)]">
              Восстановление пароля
            </h1>
            <p className="mt-2 text-center text-sm leading-6 text-[var(--muted)]">
              Введите email, указанный при регистрации. Если учётная запись существует, мы отправим ссылку для сброса пароля.
            </p>

            <div className="mt-5 w-full">
              {formError ? (
                <InlineAlert className="mb-4" tone="error">
                  {formError}
                </InlineAlert>
              ) : null}
              {formSuccess ? (
                <InlineAlert className="mb-4" tone="success">
                  {formSuccess}
                </InlineAlert>
              ) : null}
              {formSuccess ? null : (
                <form action={requestPasswordResetAction} className="auth-password-reset-form grid gap-3.5" data-public-validation="true" noValidate>
                  <PublicFormValidation />
                  <FormField htmlFor="reset-email" label="Email" required={false}>
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      required
                    />
                  </FormField>
                  <SubmitButton className="auth-password-reset-submit mt-2 w-full" pendingText="Отправляем…">
                    Отправить ссылку
                  </SubmitButton>
                </form>
              )}
              <p className="mt-4 text-center text-sm leading-6 text-[var(--muted)]">
                <AppLink className="text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]" href="/auth/login">
                  Вспомнили пароль? Войти
                </AppLink>
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
