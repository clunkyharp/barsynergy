import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { InlineAlert } from '@/components/ui/inline-alert';
import { RegisterUserForm } from '@/components/public/register-user-form';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

const errorMessages: Record<string, string> = {
  invalid: 'Проверьте обязательные поля.',
  'email-used': 'Этот email уже зарегистрирован. Попробуйте войти или восстановить пароль.',
  'rate-limited': 'Слишком много попыток за короткое время. Повторите позже.',
  failed: 'Не удалось выполнить действие прямо сейчас. Повторите попытку позже.'
};

const successMessages: Record<string, string> = {
  registered: 'Регистрация прошла успешно.'
};

type RegisterUserPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Регистрация участника',
  description: 'Регистрация специалиста в сообществе BARSYNERGY.'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RegisterUserPage({ searchParams }: RegisterUserPageProps) {
  const params = (await searchParams) ?? {};
  const error = firstParam(params.error);
  const success = firstParam(params.success);
  const formError = error && errorMessages[error] ? errorMessages[error] : null;
  const formSuccess = success && successMessages[success] ? successMessages[success] : null;

  return (
    <div className="auth-register-user-screen min-h-screen bg-[var(--background)] relative overflow-hidden">
      <AppLink
        className="absolute top-4 left-4 sm:top-5 sm:left-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        href="/"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        Вернуться на сайт
      </AppLink>
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
              {formSuccess ? (
                <InlineAlert className="mb-4" tone="success">
                  {formSuccess}
                </InlineAlert>
              ) : null}
              <RegisterUserForm />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
