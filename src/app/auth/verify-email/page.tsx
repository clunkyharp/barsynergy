import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import { Button } from '@/components/ui/button';
import { InlineAlert } from '@/components/ui/inline-alert';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { displayFont } from '@/lib/fonts';
import { verifyUserEmailToken } from '@/lib/auth/email-verification';

type VerifyEmailPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Подтверждение email',
  description: 'Подтверждение email для аккаунта BARSYNERGY.'
});

const errorMessages: Record<string, string> = {
  invalid: 'Ссылка недействительна или уже использована.',
  failed: 'Не удалось подтвердить email прямо сейчас. Повторите попытку позже.'
};

const successMessages: Record<string, string> = {
  'verification-resent': 'Если регистрация уже начиналась, мы отправили новое письмо для подтверждения.'
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = (await searchParams) ?? {};
  const token = firstParam(params.token);
  const error = firstParam(params.error);
  const success = firstParam(params.success);

  if (token) {
    const result = await verifyUserEmailToken(token);

    if (result === 'verified') {
      redirect('/auth/login?success=verified');
    }

    redirect(`/auth/verify-email?error=${result}`);
  }

  const errorMessage = error ? errorMessages[error] ?? errorMessages.failed : null;
  const successMessage = success ? successMessages[success] ?? null : null;

  return (
    <AuthSplitLayout>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
        <MailCheck aria-hidden size={30} strokeWidth={1.6} />
      </div>
      <h1 className={`text-[28px] font-bold leading-[1.20] text-balance tracking-normal text-[var(--text)] ${displayFont.className}`}>
        Подтверждение email
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Откройте ссылку из письма. Если она не сработала, запросите новое письмо через форму регистрации.
      </p>
      <div className="mt-5 grid gap-3">
        {errorMessage ? <InlineAlert tone="error">{errorMessage}</InlineAlert> : null}
        {successMessage ? <InlineAlert tone="success">{successMessage}</InlineAlert> : null}
        <Button className="w-full rounded-[var(--radius-md)]" href="/auth/register/user">
          Вернуться к регистрации
        </Button>
        <Button className="w-full rounded-[var(--radius-md)]" href="/auth/login" variant="secondary">
          Войти
        </Button>
      </div>
    </AuthSplitLayout>
  );
}
