'use client';

import { useActionState } from 'react';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/submit-button';
import { loginAction, type LoginActionResult } from '@/app/auth/login/actions';

const errorMessages: Record<string, string> = {
  invalid: 'Неверный email или пароль.',
  pending: 'Заявка ещё на проверке или доступ к кабинету пока не открыт.',
  blocked: 'Доступ заблокирован. Свяжитесь с администратором.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.',
  'role-mismatch': 'У этой учётной записи нет доступа к админ-панели.',
  'rate-limited': 'Слишком много попыток входа. Повторите позже.'
};

const authLabelClassName = '!text-[13px] !font-medium !normal-case leading-[18px] !tracking-normal !text-[var(--text)]';

export function AdminLoginForm() {
  const [result, formAction] = useActionState<LoginActionResult, FormData>(loginAction, null);
  const errorCode = result?.type === 'error' ? result.code : null;

  return (
    <div className="mt-7">
      {errorCode ? (
        <InlineAlert className="mb-4" tone="error">
          {errorMessages[errorCode] ?? errorMessages.failed}
        </InlineAlert>
      ) : null}
      <form action={formAction} className="grid gap-4" data-public-validation="true" noValidate>
        <PublicFormValidation />
        <input name="surface" type="hidden" value="admin" />
        <FormField htmlFor="email" label="Почта" labelClassName={authLabelClassName} required={false}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </FormField>
        <FormField htmlFor="password" label="Пароль" labelClassName={authLabelClassName} required={false}>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </FormField>
        <SubmitButton className="mt-2 w-full rounded-[var(--radius-md)]" pendingText="Входим…" size="lg">
          Войти
        </SubmitButton>
      </form>
    </div>
  );
}
