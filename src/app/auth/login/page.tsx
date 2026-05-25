import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { loginAction } from '@/app/auth/actions';
import { AppLink } from '@/components/ui/app-link';
import { AuthRoleCard } from '@/components/ui/auth-role-card';
import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/submit-button';
import { cn } from '@/lib/utils';

const errorMessages: Record<string, string> = {
  invalid: 'Неверный email или пароль.',
  pending: 'Заявка ещё на проверке или доступ к кабинету пока не открыт.',
  blocked: 'Доступ заблокирован. Свяжитесь с командой BARSYNERGY.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.',
  'role-mismatch': 'У этой учётной записи нет доступа к выбранному кабинету.',
  'rate-limited': 'Слишком много попыток входа. Повторите позже.'
};

const successMessages: Record<string, string> = {
  'business-request-created': 'Заявку получили. После проверки напишем, как открыть доступ.',
  'logged-out': 'Вы вышли из аккаунта.'
};

const publicLoginRoles = [
  {
    id: 'participant',
    title: 'Участник',
    description: 'Программы, события, материалы и заявки.',
    formTitle: 'Вход в кабинет участника'
  },
  {
    id: 'business',
    title: 'Бизнес',
    description: 'Заявки, партнёрские инструменты и рабочие процессы.',
    formTitle: 'Вход в кабинет бизнеса'
  }
] as const;

type PublicLoginRoleId = (typeof publicLoginRoles)[number]['id'];

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const authLabelClassName = '!text-[13px] !font-medium !normal-case leading-[18px] !tracking-normal !text-[var(--text)]';

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = firstParam(params.error);
  const success = firstParam(params.success);
  const roleParam = firstParam(params.role);
  const selectedRoleId: PublicLoginRoleId = publicLoginRoles.some((role) => role.id === roleParam) ? (roleParam as PublicLoginRoleId) : 'participant';
  const selectedRole = publicLoginRoles.find((role) => role.id === selectedRoleId) ?? publicLoginRoles[0];
  const isRoleMismatch = error === 'role-mismatch';
  const isRequestSent = success === 'business-request-created';
  const topSuccess = success && success !== 'business-request-created' ? successMessages[success] : null;
  const formError = error && errorMessages[error] ? errorMessages[error] : null;

  return (
    <div className="auth-login-screen min-h-screen bg-[var(--background)]">
      <div className="auth-login-container container max-w-[1440px] py-8 md:py-12 xl:py-16">
        <header className="auth-login-header mb-8 flex flex-wrap items-center gap-4 md:mb-14">
          <AppLink
            aria-label="BARSYNERGY"
            className="auth-login-logo inline-flex min-h-12 w-fit shrink-0 items-center rounded-[var(--radius-md)] pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href="/"
          >
            <Image alt="BARSYNERGY" className="theme-logo-light h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup.svg" width={360} />
            <Image alt="BARSYNERGY" className="theme-logo-dark h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup-light.svg" width={360} />
          </AppLink>
          <span aria-hidden="true" className="hidden h-9 w-px bg-[var(--line)] sm:block" />
          <Button className="auth-login-back rounded-[var(--radius-md)] px-4" href="/" size="sm" variant="secondary">
            <ArrowLeft aria-hidden size={15} strokeWidth={1.8} />
            Вернуться на сайт
          </Button>
        </header>

        <main className="auth-login-layout mx-auto grid max-w-[1220px] gap-8 lg:grid-cols-[minmax(0,500px)_1px_minmax(0,510px)] lg:gap-20 xl:gap-24">
          <section className="min-w-0">
            <h1 className="auth-login-title max-w-[410px] text-[30px] font-bold leading-[1.18] tracking-normal text-[var(--text)]">
              {selectedRole.formTitle}
            </h1>

            <div className="auth-login-form-block mt-7 w-full max-w-[410px]">
              {formError ? (
                <InlineAlert className="mb-4" tone={isRoleMismatch ? 'warning' : 'error'}>
                  {formError}
                </InlineAlert>
              ) : null}
              {topSuccess ? (
                <InlineAlert className="mb-4" tone="success">
                  {topSuccess}
                </InlineAlert>
              ) : null}
              <form action={loginAction} className="auth-login-form grid gap-4">
                <input name="surface" type="hidden" value="public" />
                <input name="role" type="hidden" value={selectedRoleId} />
                <FormField htmlFor="email" label="Почта" labelClassName={authLabelClassName} required={false}>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="почта"
                    required
                  />
                </FormField>
                <FormField htmlFor="password" label="Пароль" labelClassName={authLabelClassName} required={false}>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="пароль"
                    required
                  />
                </FormField>
                <AppLink className="-mt-1 justify-self-end text-sm font-semibold leading-5 text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/contacts?topic=other">
                  Забыли пароль?
                </AppLink>
                <SubmitButton className="auth-login-submit mt-2 w-full" pendingText="Входим…">
                  Войти
                </SubmitButton>
                <Button
                  className="w-full"
                  href="/auth/register"
                  variant="secondary"
                >
                  Запросить доступ
                </Button>
              </form>
              <AccessNotice sent={isRequestSent} />
            </div>
          </section>

          <div aria-hidden="true" className="hidden w-px bg-[var(--border-default)] lg:block" />

          <aside className="auth-login-role-zone min-w-0">
            <h2 className="text-2xl font-bold leading-8 text-[var(--text)] md:text-[30px]">Кабинет</h2>
            <p className="mt-3 max-w-[410px] text-base leading-7 text-[var(--muted)]">
              Выберите роль для входа. Доступ проверяется после авторизации.
            </p>
            <div className="auth-login-role-list mt-10 grid max-w-[410px] gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
              {publicLoginRoles.map((role) => (
                <RoleCard key={role.id} role={role} selected={role.id === selectedRoleId} />
              ))}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

function RoleCard({
  role,
  selected
}: {
  role: (typeof publicLoginRoles)[number];
  selected: boolean;
}) {
  return (
    <AuthRoleCard
      description={role.description}
      href={`/auth/login?role=${role.id}`}
      selected={selected}
      title={role.title}
    />
  );
}

function AccessNotice({ sent }: { sent: boolean }) {
  return (
    <div
      className={cn(
        'auth-access-notice mt-4 rounded-[8px] border p-4',
        sent ? 'border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]' : 'border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--muted)]'
      )}
      data-state={sent ? 'sent' : 'idle'}
      role={sent ? 'status' : undefined}
    >
      <p className={cn('text-sm font-semibold leading-5', sent ? 'text-[var(--success-text)]' : 'text-[var(--text)]')}>
        {sent ? 'Заявка отправлена.' : 'Нет доступа?'}
      </p>
      <p className="mt-1 text-sm leading-6">
        {sent ? 'Мы проверим доступ и свяжемся с вами.' : 'Отправьте запрос. Мы проверим роль и свяжемся с вами.'}
      </p>
    </div>
  );
}
