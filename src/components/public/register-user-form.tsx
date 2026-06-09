'use client';

import { useState } from 'react';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordPairValidation } from '@/components/ui/password-pair-validation';
import { SubmitButton } from '@/components/ui/submit-button';
import { Turnstile } from '@/components/ui/turnstile';
import { PublicFormValidation } from '@/components/public/public-form-validation';

export function RegisterUserForm({
  action,
  defaults
}: {
  action: (formData: FormData) => void;
  defaults?: {
    email?: string;
    fullName?: string;
  };
}) {
  const [turnstileToken, setTurnstileToken] = useState('');

  return (
    <form action={action} className="auth-register-user-form grid gap-3.5" data-public-validation="true" noValidate>
      <PublicFormValidation />
      <PasswordPairValidation />
      <input name="turnstileToken" type="hidden" value={turnstileToken} />
      <FormField htmlFor="fullName" label="Полное имя" >
        <Input
          defaultValue={defaults?.fullName ?? ''}
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Иван Иванов"
          required
          minLength={1}
          maxLength={200}
        />
      </FormField>
      <FormField htmlFor="email" label="Email" >
        <Input
          defaultValue={defaults?.email ?? ''}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </FormField>
      <FormField htmlFor="new-password" hint="Минимум 8 символов" label="Пароль" >
        <PasswordInput
          id="new-password"
          name="password"
          autoComplete="new-password"
          placeholder="Минимум 8 символов"
          required
          minLength={8}
          maxLength={200}
        />
      </FormField>
      <FormField htmlFor="confirm-password" label="Подтверждение пароля" >
        <PasswordInput
          id="confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Повторите пароль"
          required
          minLength={8}
          maxLength={200}
        />
      </FormField>
      <ConsentField value="on">
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
