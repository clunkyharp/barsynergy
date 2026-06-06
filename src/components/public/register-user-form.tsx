'use client';

import { registerUserAction } from '@/app/auth/actions';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { SubmitButton } from '@/components/ui/submit-button';
import { PublicFormValidation } from '@/components/public/public-form-validation';

export function RegisterUserForm() {
  return (
    <form action={registerUserAction} className="auth-register-user-form grid gap-3.5" data-public-validation="true" noValidate>
      <PublicFormValidation />
      <FormField htmlFor="fullName" label="Полное имя" required={false}>
        <Input
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
      <FormField htmlFor="email" label="Email" required={false}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </FormField>
      <FormField htmlFor="password" hint="Минимум 8 символов" label="Пароль" required={false}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Минимум 8 символов"
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
      <SubmitButton className="auth-register-user-submit mt-2 w-full" pendingText="Регистрируем…">
        Зарегистрироваться
      </SubmitButton>
    </form>
  );
}
