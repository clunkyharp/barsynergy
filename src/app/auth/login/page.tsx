import { loginAction } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

const errorMessages: Record<string, string> = {
  invalid: 'Неверный email или пароль.',
  pending: 'Доступ еще ожидает подтверждения администратором.',
  blocked: 'Доступ заблокирован. Свяжитесь с командой BARSYNERGY.'
};

const successMessages: Record<string, string> = {
  'business-request-created': 'Заявка отправлена. После проверки администратор откроет доступ.',
  'logged-out': 'Вы вышли из аккаунта.'
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = firstParam(params.error);
  const success = firstParam(params.success);

  return (
    <div className="container max-w-2xl py-8 md:py-10">
      <section className="border-b border-[var(--line)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Аккаунт</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">Вход</h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-[var(--muted)]">
          Для администраторов, модераторов и одобренных бизнес-аккаунтов.
        </p>
      </section>

      <Card className="mt-5 p-5 md:p-6">
        {error && errorMessages[error] ? (
          <p className="mb-5 rounded-md border border-[var(--danger)] bg-[var(--danger)]/5 p-3 text-sm text-[var(--danger)]">
            {errorMessages[error]}
          </p>
        ) : null}
        {success && successMessages[success] ? (
          <p className="mb-5 rounded-md border border-[var(--success)] bg-[var(--success)]/5 p-3 text-sm text-[var(--success)]">
            {successMessages[success]}
          </p>
        ) : null}
        <form action={loginAction} className="space-y-4">
          <FormField htmlFor="email" label="Email">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </FormField>
          <FormField htmlFor="password" label="Пароль">
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </FormField>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <Button type="submit">Войти</Button>
            <Button href="/" variant="secondary">
              На главную
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
