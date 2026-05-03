import { loginAction } from '@/app/auth/actions';
import { ActionRow } from '@/components/ui/action-row';
import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';

const errorMessages: Record<string, string> = {
  invalid: 'Неверный email или пароль.',
  pending: 'Заявка ещё на проверке или доступ к кабинету пока не открыт.',
  blocked: 'Доступ заблокирован. Свяжитесь с командой BARSYNERGY.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.',
  'rate-limited': 'Слишком много попыток входа. Повторите позже.'
};

const successMessages: Record<string, string> = {
  'business-request-created': 'Заявку получили. После проверки напишем, как открыть доступ.',
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
    <div className="container max-w-[1180px] py-8 md:py-10 xl:py-12">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.94fr)_minmax(360px,0.66fr)] xl:items-start">
        <section className="editorial-form-shell overflow-hidden">
          <div className="border-b border-black/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,255,255,0.58))] px-5 py-5 md:px-6 md:py-5 xl:px-7">
            <div className="mx-auto w-full max-w-[560px]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Аккаунт</p>
                  <h1 className={`${displayFont.className} display-tight mt-3 text-[34px] leading-[0.96] md:text-[42px]`}>
                    Вход в кабинет
                  </h1>
                </div>
                <Button className="rounded-full" href="/" size="sm" variant="secondary">
                  На главную
                </Button>
              </div>
              <p className="mt-4 max-w-[480px] text-sm leading-6 text-[var(--muted)] md:text-[15px]">
                Используйте email и пароль, к которым уже привязан доступ.
              </p>
            </div>
          </div>
          <div className="px-5 py-5 md:px-6 md:py-6 xl:px-7 xl:py-5">
            <div className="mx-auto w-full max-w-[560px]">
              {error && errorMessages[error] ? (
                <InlineAlert className="mb-4" tone="error">
                  {errorMessages[error]}
                </InlineAlert>
              ) : null}
              {success && successMessages[success] ? (
                <InlineAlert className="mb-4" tone="success">
                  {successMessages[success]}
                </InlineAlert>
              ) : null}
              <form action={loginAction} className="grid gap-3.5">
                <FormField className="space-y-2" htmlFor="email" label="Email">
                  <Input
                    className="px-4 py-2.5 text-[14px] leading-6"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </FormField>
                <FormField className="space-y-2" htmlFor="password" label="Пароль">
                  <Input
                    className="px-4 py-2.5 text-[14px] leading-6"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </FormField>
                <ActionRow className="gap-2.5 pt-4">
                  <Button className="rounded-full" size="md" type="submit">
                    Войти
                  </Button>
                  <Button className="rounded-full" href="/" size="md" variant="secondary">
                    Вернуться на сайт
                  </Button>
                </ActionRow>
              </form>
            </div>
          </div>
        </section>

        <aside className="editorial-form-shell flex flex-col p-5 md:p-6 xl:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Что здесь</p>
          <h2 className={`${displayFont.className} display-tight mt-4 max-w-[14ch] text-[30px] leading-[0.98] md:text-[34px]`}>
            Вход для уже открытых кабинетов
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-7 text-[var(--muted)]">
            Здесь входят компании и пользователи, которым команда уже открыла доступ.
          </p>

          <div className="mt-6 grid gap-2.5">
            <Panel className="bg-white/70" padding="sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Когда нужен этот экран</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Когда кабинет уже подтверждён и у вас есть рабочий email с паролем.
              </p>
            </Panel>
            <Panel className="bg-white/70" padding="sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Если доступа ещё нет</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Для бизнеса сначала нужно оставить заявку. После проверки команда свяжется и откроет кабинет.
              </p>
            </Panel>
            <Panel className="bg-white/70" padding="sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Для кого кабинет</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Кабинет нужен компаниям, поставщикам, партнёрам, организаторам событий, работодателям и команде BARSYNERGY.
              </p>
            </Panel>
            <Panel className="bg-white/70" padding="sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Если вы специалист</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Чтобы откликнуться на вакансию или написать команде, кабинет не нужен.
              </p>
            </Panel>
          </div>

          <div className="mt-6 border-t border-black/10 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button className="rounded-full" href="/auth/register" size="md">
                Запросить доступ
              </Button>
              <Button className="rounded-full" href="/contacts" size="md" variant="secondary">
                Связаться с командой
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
