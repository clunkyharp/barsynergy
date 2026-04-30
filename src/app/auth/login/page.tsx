import { loginAction } from '@/app/auth/actions';
import { ActionRow } from '@/components/ui/action-row';
import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';

const errorMessages: Record<string, string> = {
  invalid: 'Неверный email или пароль.',
  pending: 'Заявка еще рассматривается. Когда доступ откроют, вы сможете войти по этим данным.',
  blocked: 'Доступ заблокирован. Свяжитесь с командой BARSYNERGY.',
  'rate-limited': 'Слишком много попыток входа. Повторите позже.'
};

const successMessages: Record<string, string> = {
  'business-request-created': 'Заявка отправлена. Когда доступ будет готов, вы сможете войти по этому email.',
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
            Для тех, у кого уже открыт доступ к кабинету компании, профилю специалиста или рабочему разделу.
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
                <span>Активный доступ к вашему разделу: профиль специалиста, кабинет компании или рабочая админ-зона.</span>
              </li>
            </ul>
          </div>
          <Panel className="mt-8" padding="sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Нет доступа?</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Если вы представляете бизнес и хотите работать через кабинет компании, сначала отправьте заявку на доступ. Отдельная
              регистрация специалистов пока не открыта.
            </p>
            <Button className="mt-4 rounded-full" href="/auth/register" variant="secondary">
              Запросить доступ
            </Button>
          </Panel>
        </section>

        <section className="editorial-form-shell overflow-hidden">
          <div className="border-b border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.58))] px-5 py-5 md:px-6 md:py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Авторизация</p>
            <h2 className="mt-3 text-2xl font-semibold uppercase leading-8">Введите данные</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
              Если доступ уже открыт, используйте email и пароль, которые привязаны к вашему разделу.
            </p>
          </div>
          <div className="p-5 md:p-6">
            {error && errorMessages[error] ? (
              <InlineAlert className="mb-5" tone="error">
                {errorMessages[error]}
              </InlineAlert>
            ) : null}
            {success && successMessages[success] ? (
              <InlineAlert className="mb-5" tone="success">
                {successMessages[success]}
              </InlineAlert>
            ) : null}
            <form action={loginAction} className="grid gap-4">
              <FormField htmlFor="email" label="Email">
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </FormField>
              <FormField htmlFor="password" label="Пароль">
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </FormField>
              <ActionRow>
                <Button className="rounded-full" size="lg" type="submit">
                  Войти
                </Button>
                <Button className="rounded-full" href="/auth/register" size="lg" variant="secondary">
                  Нужен доступ
                </Button>
              </ActionRow>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
