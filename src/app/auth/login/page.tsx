import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import { InlineAlert } from '@/components/ui/inline-alert';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { displayFont } from '@/lib/fonts';
import { LoginForm } from '@/app/auth/login/_components/login-form';

const successMessages: Record<string, string> = {
  'business-request-created': 'Заявку получили. Обычно отвечаем за 1–2 рабочих дня. После проверки напишем, как открыть доступ.',
  'logged-out': 'Вы вышли из аккаунта.',
  'password-reset': 'Пароль успешно изменён. Войдите с новым паролем.',
  'verified': 'Email подтверждён — теперь войдите в аккаунт.'
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Вход',
  description: 'Вход в закрытые кабинеты BARSYNERGY для участника или бизнеса.'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const success = firstParam(params.success);
  const returnTo = firstParam(params.returnTo);
  const isVerified = success === 'verified';
  const topSuccess = success && !isVerified && successMessages[success] ? successMessages[success] : null;

  return (
    <AuthSplitLayout>
      {isVerified ? (
        <div className="mb-6 flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-3">
          <CheckCircle2 aria-hidden className="shrink-0 text-[var(--accent-ink)]" size={22} strokeWidth={1.8} />
          <div>
            <p className={`text-[14px] font-semibold leading-5 text-[var(--text)] ${displayFont.className}`}>
              Email подтверждён!
            </p>
            <p className="mt-0.5 text-[12px] leading-5 text-[var(--muted)]">
              Войдите, чтобы продолжить.
            </p>
          </div>
        </div>
      ) : null}
      <h1 className="text-[28px] font-bold leading-[1.20] text-balance tracking-normal text-[var(--text)]">
        Вход в кабинет
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Войдите как специалист или представитель компании.
      </p>
      <div className="mt-5 w-full">
        {topSuccess ? (
          <InlineAlert className="mb-4" tone="success">
            {topSuccess}
          </InlineAlert>
        ) : null}
        <LoginForm returnTo={returnTo} />
      </div>
    </AuthSplitLayout>
  );
}
