import { loginAction } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
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
    <div className="container max-w-5xl py-10 md:py-14">
      <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
        <section className="editorial-form-shell p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Аккаунт</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">Вход</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-[var(--muted)]">
            Для администраторов, модераторов и одобренных бизнес-аккаунтов.
          </p>
          <div className="mt-8 border-t border-black/10 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Что понадобится</p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
              <li className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                <span>Рабочий email, который уже привязан к вашему доступу.</span>
              </li>
              <li className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                <span>Подтвержденный администратором аккаунт для входа в кабинет.</span>
              </li>
            </ul>
          </div>
          <div className="mt-8 rounded-[1.25rem] border border-black/10 bg-[var(--surface)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Нет доступа?</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Если вы представляете бизнес и хотите работать через кабинет, сначала отправьте заявку на доступ.
            </p>
            <Button className="mt-4 min-h-11 rounded-full px-5 tracking-[0.1em]" href="/auth/register" variant="secondary">
              Запросить доступ
            </Button>
          </div>
        </section>

        <section className="editorial-form-shell overflow-hidden">
          <div className="border-b border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.58))] px-5 py-5 md:px-6 md:py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Авторизация</p>
            <h2 className="mt-3 text-2xl font-semibold uppercase leading-8">Введите данные</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">Если доступ уже одобрен, используйте email и пароль от кабинета.</p>
          </div>
          <div className="p-5 md:p-6">
            {error && errorMessages[error] ? (
              <p className="mb-5 rounded-[1.15rem] border border-[var(--danger)] bg-[var(--danger)]/5 px-4 py-4 text-sm leading-6 text-[var(--danger)]">
                {errorMessages[error]}
              </p>
            ) : null}
            {success && successMessages[success] ? (
              <p className="mb-5 rounded-[1.15rem] border border-[var(--success)] bg-[var(--success)]/5 px-4 py-4 text-sm leading-6 text-[var(--success)]">
                {successMessages[success]}
              </p>
            ) : null}
            <form action={loginAction} className="grid gap-4">
              <FormField htmlFor="email" label="Email">
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </FormField>
              <FormField htmlFor="password" label="Пароль">
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </FormField>
              <div className="flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center">
                <Button className="min-h-12 rounded-full px-6 tracking-[0.12em]" type="submit">
                  Войти
                </Button>
                <Button className="min-h-12 rounded-full px-6 tracking-[0.12em]" href="/auth/register" variant="secondary">
                  Нужен доступ
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
