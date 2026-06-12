'use client';

import { useActionState } from 'react';
import { cn } from '@/lib/utils';
import { AppLink } from '@/components/ui/app-link';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineAlert } from '@/components/ui/inline-alert';
import { PasswordInput } from '@/components/ui/password-input';
import { SubmitButton } from '@/components/ui/submit-button';
import type { LoginActionResult } from '@/app/auth/login/actions';
import { loginAction } from '@/app/auth/login/actions';

const errorMessages: Record<string, string> = {
  invalid: 'Неверный email или пароль.',
  pending: 'Заявка ещё на проверке или доступ к кабинету пока не открыт.',
  blocked: 'Доступ заблокирован. Свяжитесь с командой BARSYNERGY.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.',
  'role-mismatch': 'У этой учётной записи нет доступа к выбранному кабинету.',
  'rate-limited': 'Слишком много попыток входа. Повторите позже.'
};

const loginRoleOptions = [
  {
    value: 'participant',
    label: 'Я специалист',
    href: '/auth/login?role=participant',
    description: 'Профиль, вакансии и отклики'
  },
  {
    value: 'business',
    label: 'Я представляю компанию',
    href: '/auth/login?role=business',
    description: 'Кабинет компании и заявки'
  }
] as const;

export function LoginForm({ returnTo, role }: { returnTo?: string; role?: string }) {
  const [result, formAction] = useActionState<LoginActionResult, FormData>(loginAction, null);
  const errorCode = result?.type === 'error' ? result.code : null;
  const isRoleMismatch = errorCode === 'role-mismatch';
  const selectedRole = role === 'business' ? 'business' : 'participant';

  return (
    <form action={formAction} className="auth-login-form grid gap-3.5" noValidate>
      <input name="surface" type="hidden" value="public" />
      {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}
      <input name="role" type="hidden" value={selectedRole} />
      <div className="grid gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          Выберите кабинет
        </p>
        <div className="grid gap-2 sm:grid-cols-2" role="tablist" aria-label="Тип входа">
          {loginRoleOptions.map((option) => {
            const href = returnTo ? `${option.href}&returnTo=${encodeURIComponent(returnTo)}` : option.href;
            const isActive = selectedRole === option.value;

            return (
              <AppLink
                aria-selected={isActive}
                className={cn(
                  'rounded-[var(--radius-md)] border px-3 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]'
                    : 'border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--text)] hover:border-[var(--accent)]/35 hover:bg-[var(--surface-wash)]'
                )}
                href={href}
                key={option.value}
                role="tab"
              >
                <span className="block text-sm font-semibold leading-5">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{option.description}</span>
              </AppLink>
            );
          })}
        </div>
      </div>
      {errorCode ? (
        <InlineAlert className="mb-1 flex items-start gap-2" tone={isRoleMismatch ? 'warning' : 'error'}>
          {!isRoleMismatch ? <span aria-hidden="true" className="font-bold">✕</span> : null}
          <span>{errorMessages[errorCode] ?? errorMessages.failed}</span>
        </InlineAlert>
      ) : null}
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
        <PasswordInput
          id="password"
          name="password"
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
  );
}
