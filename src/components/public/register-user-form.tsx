'use client';

import { useActionState, useState } from 'react';
import { AppLink } from '@/components/ui/app-link';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordPairValidation } from '@/components/ui/password-pair-validation';
import { SubmitButton } from '@/components/ui/submit-button';
import { Turnstile } from '@/components/ui/turnstile';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from '@/lib/auth/password-policy-constants';

type RegisterUserActionResult = { type: 'error'; code: string } | null;

const errorMessages: Record<string, string> = {
  invalid: 'Не удалось завершить регистрацию. Проверьте поля формы.',
  'account-check': 'Если регистрация уже начиналась, проверьте почту. Иначе попробуйте войти или восстановить доступ.',
  'compromised-password': 'Этот пароль уже встречался в утечках. Выберите другую фразу или пароль.',
  'rate-limited': 'Слишком много попыток за короткое время. Повторите позже.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.'
};

export function RegisterUserForm({
  action,
  defaults
}: {
  action: (prevState: RegisterUserActionResult, formData: FormData) => Promise<RegisterUserActionResult>;
  defaults?: {
    fullName?: string;
    email?: string;
  };
}) {
  const [result, formAction] = useActionState<RegisterUserActionResult, FormData>(action, null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const errorCode = result?.type === 'error' ? result.code : null;

  return (
    <form action={formAction} className="auth-register-user-form grid gap-3.5" data-public-validation="true" noValidate>
      <PublicFormValidation />
      <PasswordPairValidation />
      <input name="turnstileToken" type="hidden" value={turnstileToken} />
      {errorCode ? (
        <InlineAlert tone="error">
          <span>{errorMessages[errorCode] ?? errorMessages.failed}</span>
          {errorCode === 'account-check' ? (
            <span className="mt-1 flex flex-wrap gap-3 text-xs">
              <AppLink className="font-semibold underline" href="/auth/login">Войти</AppLink>
              <AppLink className="font-semibold underline" href="/auth/password-reset">Восстановить доступ</AppLink>
            </span>
          ) : null}
        </InlineAlert>
      ) : null}
      <FormField htmlFor="fullName" label="Полное имя">
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          defaultValue={defaults?.fullName ?? ''}
          placeholder="Иван Иванов"
          required
          minLength={1}
          maxLength={200}
        />
      </FormField>
      <FormField htmlFor="email" label="Email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaults?.email ?? ''}
          placeholder="you@example.com"
          required
        />
      </FormField>
      <FormField htmlFor="new-password" hint={PASSWORD_HINT} label="Пароль">
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
      <FormField htmlFor="confirm-password" label="Подтверждение пароля">
        <PasswordInput
          id="confirm-password"
          name="confirmPassword"
          autoComplete="off"
          placeholder="Повторите пароль"
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={200}
        />
      </FormField>
      <ConsentField>
        <span>
          Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и{' '}
          <InlineLink href="/legal/personal-data-consent">правилами платформы</InlineLink>.
        </span>
      </ConsentField>
      <Turnstile onVerify={setTurnstileToken} />
      <SubmitButton className="auth-register-user-submit mt-2 w-full" pendingText="Регистрируем…">
        Зарегистрироваться
      </SubmitButton>
    </form>
  );
}
