import type { Metadata } from 'next';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import { Button } from '@/components/ui/button';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { PasswordResetConfirmForm } from '@/app/auth/password-reset/_components/password-reset-forms';

type PasswordResetConfirmPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Новый пароль',
  description: 'Установка нового пароля для входа в BARSYNERGY.'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PasswordResetConfirmPage({ searchParams }: PasswordResetConfirmPageProps) {
  const params = (await searchParams) ?? {};
  const token = firstParam(params.token) ?? '';

  if (!token) {
    return (
      <AuthSplitLayout>
        <div className="text-center">
          <h1 className="text-[28px] font-bold leading-[1.20] text-balance tracking-normal text-[var(--text)]">
            Неверная ссылка
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Ссылка для восстановления пароля не содержит токен. Проверьте ссылку или запросите восстановление заново.
          </p>
          <Button className="mt-6 rounded-[var(--radius-md)]" href="/auth/password-reset" size="lg">
            Запросить восстановление
          </Button>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout>
      <h1 className="text-[28px] font-bold leading-[1.20] text-balance tracking-normal text-[var(--text)]">
        Новый пароль
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Придумайте новый пароль для входа.
      </p>
      <PasswordResetConfirmForm token={token} />
    </AuthSplitLayout>
  );
}
