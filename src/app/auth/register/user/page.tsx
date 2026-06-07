import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Image from 'next/image';
import { AppLink } from '@/components/ui/app-link';
import { AuthBackLink } from '@/components/layout/auth-back-link';
import { InlineAlert } from '@/components/ui/inline-alert';
import { RegisterUserForm } from '@/components/public/register-user-form';
import { registerUserAction } from '@/app/auth/actions';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

const errorMessages: Record<string, string> = {
  invalid: 'Не удалось завершить регистрацию. Проверьте поля формы. Если вы уже регистрировались с этим email, попробуйте войти или восстановить доступ.',
  'account-check': 'Если регистрация уже начиналась, проверьте почту: письмо для подтверждения отправлено повторно, когда аккаунт ждёт подтверждения. Иначе попробуйте войти или восстановить доступ.',
  'rate-limited': 'Слишком много попыток за короткое время. Повторите позже.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.'
};

const successMessages: Record<string, string> = {
  registered: 'Почти готово! Проверьте почту и подтвердите email, чтобы войти.'
};

type RegisterUserPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const REGISTER_USER_FLASH_COOKIE = 'barsynergy-register-user-flash';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Регистрация участника',
  description: 'Регистрация специалиста в сообществе BARSYNERGY.'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterUserPage({ searchParams }: RegisterUserPageProps) {
  const params = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const error = firstParam(params.error);
  const success = firstParam(params.success);
  const formError = error && errorMessages[error] ? errorMessages[error] : null;
  const formSuccess = success && successMessages[success] ? successMessages[success] : null;
  const storedDefaults = (() => {
    const raw = cookieStore.get(REGISTER_USER_FLASH_COOKIE)?.value;

    if (!raw || !error) {
      return null;
    }

    try {
      return JSON.parse(decodeURIComponent(raw)) as { email?: string; fullName?: string };
    } catch {
      return null;
    }
  })();

  return (
    <div className="auth-register-user-screen min-h-screen bg-[var(--background)] relative overflow-hidden">
      <AuthBackLink />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(150,112,30,0.08),transparent)]" />
      <div className="auth-register-user-container relative container max-w-[1440px] py-5 md:py-6">
        <header className="auth-register-user-header mx-auto mb-5 flex max-w-[440px] flex-col items-center gap-3 text-center">
          <AppLink
            aria-label="BARSYNERGY"
            className="inline-flex min-h-12 w-fit shrink-0 items-center rounded-[var(--radius-md)] pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href="/"
          >
            <Image alt="BARSYNERGY" className="theme-logo-light h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup.svg" width={360} />
            <Image alt="BARSYNERGY" className="theme-logo-dark h-auto w-[176px] md:w-[198px]" height={70} priority src="/brand/barsynergy-lockup-light.svg" width={360} />
          </AppLink>
        </header>

        <main className="auth-register-user-layout mx-auto max-w-[440px]">
          <section className="min-w-0">
            <h1 className="text-center text-[28px] font-bold leading-[1.18] tracking-normal text-[var(--text)]">
              Регистрация участника
            </h1>
            <p className="mt-2 text-center text-sm leading-6 text-[var(--muted)]">
              Для специалистов бара, барменов и всех, кто работает в индустрии
            </p>

            <div className="mt-5 w-full">
              {formError ? (
                <InlineAlert className="mb-4" tone="error">
                  {formError}
                </InlineAlert>
              ) : null}
              {error === 'account-check' ? (
                <div className="mb-5 flex flex-wrap gap-3 text-sm">
                  <AppLink className="font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]" href="/auth/login">
                    Попробовать вход
                  </AppLink>
                  <AppLink className="font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]" href="/auth/password-reset">
                    Восстановить доступ
                  </AppLink>
                </div>
              ) : null}
              {formSuccess ? (
                <div className="flex flex-col items-center gap-5 py-4 text-center">
                  <InlineAlert tone="success">
                    {formSuccess}
                  </InlineAlert>
                  <AppLink
                    className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-8 text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    href="/auth/login"
                  >
                    Войти в аккаунт
                  </AppLink>
                </div>
              ) : (
                <>
                  <RegisterUserForm action={registerUserAction} defaults={storedDefaults ?? undefined} />
                  <p className="mt-5 text-center text-sm text-[var(--muted)]">
                    Уже есть аккаунт?{' '}
                    <AppLink className="font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]" href="/auth/login">
                      Войти
                    </AppLink>
                  </p>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
