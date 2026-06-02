import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { loginAction } from '@/app/auth/actions';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/submit-button';
import { PublicFormValidation } from '@/components/public/public-form-validation';
import { getCurrentUser } from '@/lib/auth/current-user';
import { canAccessAdmin } from '@/lib/auth/permissions';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

const errorMessages: Record<string, string> = {
  invalid: 'Неверный email или пароль.',
  pending: 'Заявка ещё на проверке или доступ к кабинету пока не открыт.',
  blocked: 'Доступ заблокирован. Свяжитесь с администратором.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.',
  'role-mismatch': 'У этой учётной записи нет доступа к админ-панели.',
  'rate-limited': 'Слишком много попыток входа. Повторите позже.'
};

type AdminLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Вход для команды',
  description: 'Закрытый вход для редакции и администраторов BARSYNERGY.'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const authLabelClassName = '!text-[13px] !font-medium !normal-case leading-[18px] !tracking-normal !text-[var(--text)]';

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const currentUser = await getCurrentUser();

  if (canAccessAdmin(currentUser?.role)) {
    redirect('/admin');
  }

  const params = (await searchParams) ?? {};
  const error = firstParam(params.error);
  const wasSubmitted = firstParam(params['_s']) === '1';
  const formError = error && wasSubmitted && errorMessages[error] ? errorMessages[error] : null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="container max-w-[960px] py-8 md:py-12 xl:py-16">
        <header className="mb-10 flex flex-wrap items-center gap-4 md:mb-16">
          <AppLink
            aria-label="BARSYNERGY"
            className="inline-flex min-h-12 w-fit shrink-0 items-center rounded-[var(--radius-md)] pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href="/"
          >
            <Image alt="BARSYNERGY" className="theme-logo-light h-auto w-[220px] md:w-[250px]" height={70} priority src="/brand/barsynergy-lockup.svg" width={360} />
            <Image alt="BARSYNERGY" className="theme-logo-dark h-auto w-[220px] md:w-[250px]" height={70} priority src="/brand/barsynergy-lockup-light.svg" width={360} />
          </AppLink>
          <span aria-hidden="true" className="hidden h-9 w-px bg-[var(--line)] sm:block" />
          <Button className="px-4 text-[var(--muted)] hover:text-[var(--accent)]" href="/" size="sm" variant="link">
            Вернуться на сайт
          </Button>
        </header>

        <main className="mx-auto max-w-[410px] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-6 shadow-[var(--shadow-panel)] md:p-8">
          <h1 className="text-[30px] font-bold leading-[1.18] tracking-normal text-[var(--text)]">Вход для команды</h1>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            Для редакции и администраторов BARSYNERGY.
          </p>

          <div className="mt-7">
            {formError ? (
              <InlineAlert className="mb-4" tone="error">
                {formError}
              </InlineAlert>
            ) : null}
            <form action={loginAction} className="grid gap-4" data-public-validation="true" noValidate>
              <PublicFormValidation />
              <input name="surface" type="hidden" value="admin" />
              <FormField htmlFor="email" label="Почта" labelClassName={authLabelClassName} required={false}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </FormField>
              <FormField htmlFor="password" label="Пароль" labelClassName={authLabelClassName} required={false}>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </FormField>
              <SubmitButton className="mt-2 w-full rounded-[var(--radius-md)]" pendingText="Входим…" size="lg">
                Войти
              </SubmitButton>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
