import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { resetPasswordAction } from '@/app/auth/password-reset/actions';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/submit-button';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

const errorMessages: Record<string, string> = {
  invalid: 'Неверный или устаревший токен. Попробуйте запросить восстановление пароля заново.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.'
};

type PasswordResetConfirmPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Новый пароль',
  description: 'Установка нового пароля для входа в BARSYNERGY.'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PasswordResetConfirmPage({ searchParams }: PasswordResetConfirmPageProps) {
  const params = (await searchParams) ?? {};
  const token = firstParam(params.token) ?? '';
  const error = firstParam(params.error);
  const formError = error && errorMessages[error] ? errorMessages[error] : null;

  if (!token) {
    return (
      <div className="auth-password-reset-confirm-screen min-h-screen bg-[var(--background)]">
        <div className="container max-w-[1440px] py-5 md:py-6">
          <main className="mx-auto max-w-[440px] text-center">
            <h1 className="text-[28px] font-bold leading-[1.18] tracking-normal text-[var(--text)]">
              Неверная ссылка
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Ссылка для восстановления пароля не содержит токен. Проверьте ссылку или запросите восстановление заново.
            </p>
            <Button className="mt-6 rounded-[var(--radius-md)]" href="/auth/password-reset" size="lg">
              Запросить восстановление
            </Button>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-password-reset-confirm-screen min-h-screen bg-[var(--background)]">
      <AppLink
        className="absolute top-4 left-4 sm:top-5 sm:left-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        href="/auth/login"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Вернуться ко входу
      </AppLink>
      <div className="auth-password-reset-confirm-container container max-w-[1440px] py-5 md:py-6">
        <header className="auth-password-reset-confirm-header mx-auto mb-5 flex max-w-[440px] flex-col items-center gap-3 text-center">
          <AppLink
            aria-label="BARSYNERGY"
            className="inline-flex min-h-12 w-fit shrink-0 items-center rounded-[var(--radius-md)] pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href="/"
          >
            <Image alt="BARSYNERGY" className="theme-logo-light h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup.svg" width={360} />
            <Image alt="BARSYNERGY" className="theme-logo-dark h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup-light.svg" width={360} />
          </AppLink>
        </header>

        <main className="auth-password-reset-confirm-layout mx-auto max-w-[440px]">
          <section className="min-w-0">
            <h1 className="text-center text-[28px] font-bold leading-[1.18] tracking-normal text-[var(--text)]">
              Новый пароль
            </h1>
            <p className="mt-2 text-center text-sm leading-6 text-[var(--muted)]">
              Придумайте новый пароль для входа.
            </p>

            <div className="mt-5 w-full">
              {formError ? (
                <InlineAlert className="mb-4" tone="error">
                  {formError}
                </InlineAlert>
              ) : (
                <InlineAlert className="mb-4" tone="info">
                  Минимальная длина пароля — 8 символов.
                </InlineAlert>
              )}
              <form action={resetPasswordAction} className="auth-password-reset-confirm-form grid gap-3.5" data-public-validation="true" noValidate>
                <PublicFormValidation />
                <input name="token" type="hidden" value={token} />
                <FormField htmlFor="new-password" label="Новый пароль" required={false}>
                  <Input
                    id="new-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Минимум 8 символов"
                    required
                    minLength={8}
                    maxLength={200}
                  />
                </FormField>
                <FormField htmlFor="confirm-password" label="Подтвердите пароль" required={false}>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Повторите новый пароль"
                    required
                    minLength={8}
                    maxLength={200}
                  />
                </FormField>
                <SubmitButton className="auth-password-reset-confirm-submit mt-2 w-full" pendingText="Сохраняем…">
                  Сохранить пароль
                </SubmitButton>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
