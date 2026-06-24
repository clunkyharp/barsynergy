'use client';

import { useActionState } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordPairValidation } from '@/components/ui/password-pair-validation';
import { SubmitButton } from '@/components/ui/submit-button';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from '@/lib/auth/password-policy-constants';
import {
  requestPasswordResetAction,
  resetPasswordAction,
  type PasswordResetRequestResult,
  type PasswordResetConfirmResult
} from '@/app/auth/password-reset/actions';

const requestErrorMessages: Record<string, string> = {
  invalid: 'Введите корректный email.',
  'rate-limited': 'Слишком много попыток за короткое время. Повторите позже.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.'
};

const confirmErrorMessages: Record<string, string> = {
  invalid: 'Неверный или устаревший токен. Попробуйте запросить восстановление пароля заново.',
  'compromised-password': 'Этот пароль уже встречался в утечках. Выберите другую фразу или пароль.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.'
};

export function PasswordResetRequestForm() {
  const [result, formAction] = useActionState<PasswordResetRequestResult, FormData>(requestPasswordResetAction, null);
  const isSuccess = result?.type === 'success';
  const errorCode = result?.type === 'error' ? result.code : null;

  return (
    <div className="mt-5 w-full">
      {errorCode ? (
        <InlineAlert className="mb-4" tone="error">
          {requestErrorMessages[errorCode] ?? requestErrorMessages.failed}
        </InlineAlert>
      ) : null}
      {isSuccess ? (
        <InlineAlert className="mb-4" tone="success">
          Если этот email зарегистрирован на платформе, мы отправили на него инструкции по восстановлению пароля.
        </InlineAlert>
      ) : (
        <form action={formAction} className="auth-password-reset-form grid gap-3.5" data-public-validation="true" noValidate>
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
        <AppLink className="text-[var(--accent-ink)] transition-colors hover:text-[var(--accent-strong)]" href="/auth/login">
          Вспомнили пароль? Войти
        </AppLink>
      </p>
    </div>
  );
}

export function PasswordResetConfirmForm({ token }: { token: string }) {
  const [result, formAction] = useActionState<PasswordResetConfirmResult, FormData>(resetPasswordAction, null);
  const errorCode = result?.type === 'error' ? result.code : null;

  return (
    <div className="mt-5 w-full">
      {errorCode ? (
        <div className="space-y-4">
          <InlineAlert className="mb-4" tone="error">
            {confirmErrorMessages[errorCode] ?? confirmErrorMessages.failed}
          </InlineAlert>
          <Button className="w-full rounded-[var(--radius-md)]" href="/auth/password-reset" size="lg">
            Запросить восстановление заново
          </Button>
        </div>
      ) : (
        <InlineAlert className="mb-4" tone="info">
          {PASSWORD_HINT}
        </InlineAlert>
      )}
      <form action={formAction} className="auth-password-reset-confirm-form grid gap-3.5" data-public-validation="true" noValidate>
        <PublicFormValidation />
        <PasswordPairValidation />
        <input name="token" type="hidden" value={token} />
        <FormField htmlFor="new-password" label="Новый пароль" required={false}>
          <PasswordInput
            id="new-password"
            name="password"
            autoComplete="new-password"
            placeholder={PASSWORD_HINT}
            required
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={200}
          />
        </FormField>
        <FormField htmlFor="confirm-password" label="Подтвердите пароль" required={false}>
          <PasswordInput
            id="confirm-password"
            name="confirmPassword"
            autoComplete="off"
            placeholder="Повторите новый пароль"
            required
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={200}
          />
        </FormField>
        <SubmitButton className="auth-password-reset-confirm-submit mt-2 w-full" pendingText="Сохраняем…">
          Сохранить пароль
        </SubmitButton>
      </form>
    </div>
  );
}
