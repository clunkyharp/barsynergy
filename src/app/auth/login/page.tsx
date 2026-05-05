import Image from 'next/image';
import { FileText, Headphones, Lock, Mail, Settings2 } from 'lucide-react';
import { loginAction } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';
import { SubmitButton } from '@/components/ui/submit-button';
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
    <div className="container max-w-[1220px] py-10 md:py-14 xl:py-20">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(380px,0.72fr)] xl:items-center">
        <aside className="min-w-0">
          <a className="inline-flex w-fit focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" href="/">
            <Image alt="BARSYNERGY" className="h-auto w-[250px]" height={70} priority src="/brand/barsynergy-lockup.svg" width={360} />
          </a>
          <h1 className={`${displayFont.className} display-tight mt-12 max-w-[13ch] text-[40px] md:text-[54px]`}>
            Кабинет BARSYNERGY для барной индустрии СКФО
          </h1>
          <span className="mt-7 block h-1 w-20 bg-[var(--accent)]" />
          <p className="mt-7 max-w-xl text-base leading-8 text-[var(--muted)]">
            Регистрация закрытая. Кабинет открывает команда BARSYNERGY после заявки и проверки роли.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button className="rounded-[var(--radius-md)] px-6" href="/auth/register" size="lg">
              Запросить доступ
            </Button>
            <Button className="rounded-[var(--radius-md)] px-6" href="/" size="lg" variant="secondary">
              Вернуться на сайт
            </Button>
          </div>

          <div className="mt-10 hidden gap-5 md:grid">
            {[
              {
                icon: Settings2,
                title: 'Кабинет компании',
                description: 'Обновляйте карточку компании, создавайте заявки и смотрите ответы команды.'
              },
              {
                icon: FileText,
                title: 'Работа с заявками',
                description: 'Проверяйте статусы, комментарии и следующие шаги без переписки в разных каналах.'
              },
              {
                icon: Mail,
                title: 'Доступ команды',
                description: 'Команда BARSYNERGY управляет материалами, событиями и публичными разделами.'
              }
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4" key={item.title}>
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-[rgba(157,9,14,0.16)] bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon size={23} strokeWidth={1.7} />
                  </span>
                  <span className="pt-1">
                    <span className="block text-base font-semibold text-[var(--text)]">{item.title}</span>
                    <span className="mt-1 block max-w-md text-sm leading-6 text-[var(--muted)]">{item.description}</span>
                  </span>
                </div>
              );
            })}
          </div>

          <Panel className="mt-10 hidden max-w-xl border-[rgba(191,168,143,0.42)] bg-[rgba(255,253,249,0.74)] md:block" padding="md">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] border border-[rgba(157,9,14,0.16)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <Lock size={19} strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">Безопасный доступ</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Вход доступен только для аккаунтов, которым команда уже открыла кабинет.
                </p>
              </div>
            </div>
          </Panel>
        </aside>

        <section className="editorial-form-shell overflow-hidden">
          <div className="px-5 pt-9 text-center md:px-8 md:pt-11">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[rgba(157,9,14,0.16)] bg-[var(--accent-soft)] text-[var(--accent)]">
              <Lock size={25} strokeWidth={1.7} />
            </div>
            <h2 className={`${displayFont.className} display-tight mt-7 text-[34px] leading-[0.96] md:text-[42px]`}>
              Вход в кабинет
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--muted)] md:text-[15px]">
              Используйте email и пароль от аккаунта, который команда уже открыла. Если доступа ещё нет, отправьте заявку.
            </p>
          </div>
          <div className="px-5 py-7 md:px-8 md:py-8">
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
              <form action={loginAction} className="grid gap-4">
                <FormField className="space-y-2" htmlFor="email" label="Email">
                  <Input
                    className="px-4 py-3 text-[14px] leading-6"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </FormField>
                <FormField className="space-y-2" htmlFor="password" label="Пароль">
                  <Input
                    className="px-4 py-3 text-[14px] leading-6"
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </FormField>
                <SubmitButton className="mt-3 rounded-[var(--radius-md)]" size="lg">
                  Войти
                </SubmitButton>
                <Button className="rounded-[var(--radius-md)]" href="/auth/register" size="lg" variant="secondary">
                  Запросить доступ
                </Button>
                <Button className="rounded-[var(--radius-md)]" href="/contacts?topic=other" size="lg" variant="ghost">
                  Восстановить доступ через команду
                </Button>
                <Button className="rounded-[var(--radius-md)]" href="/" size="lg" variant="ghost">
                  Вернуться на сайт
                  <ArrowRightMark />
                </Button>
              </form>
              <div className="mt-7 border-t border-black/10 pt-6">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <Headphones className="mt-1 text-[var(--accent)]" size={22} strokeWidth={1.7} />
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    Нужна помощь? Напишите на{' '}
                    <a className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]" href="mailto:hello@barsynergy.ru">
                      hello@barsynergy.ru
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ArrowRightMark() {
  return <span aria-hidden="true">→</span>;
}
