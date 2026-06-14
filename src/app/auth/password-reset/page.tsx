import type { Metadata } from 'next';
import { AuthSplitLayout } from '@/components/auth/auth-split-layout';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { PasswordResetRequestForm } from '@/app/auth/password-reset/_components/password-reset-forms';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Восстановление пароля',
  description: 'Запрос на восстановление пароля для входа в BARSYNERGY.'
});

export default function PasswordResetPage() {
  return (
    <AuthSplitLayout>
      <h1 className="text-[28px] font-bold leading-[1.20] text-balance tracking-normal text-[var(--text)]">
        Восстановление пароля
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Введите email, указанный при регистрации. Если учётная запись существует, мы отправим ссылку для сброса пароля.
      </p>
      <PasswordResetRequestForm />
    </AuthSplitLayout>
  );
}
