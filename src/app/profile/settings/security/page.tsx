import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { changePassword } from '@/lib/profile/password-actions';
import { ProfileSectionForm } from '@/components/profile/profile-section-form';
import { FormField } from '@/components/ui/form-field';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordPairValidation } from '@/components/ui/password-pair-validation';
import { SubmitButton } from '@/components/ui/submit-button';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from '@/lib/auth/password-policy-constants';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Безопасность — настройки',
  description: 'Смена пароля с проверкой длины и утечек в BARSYNERGY.'
});

export default async function ProfileSettingsSecurityPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile/settings/security');
  }

  return (
    <div className="space-y-6">
      <div className="inset-panel max-w-2xl scroll-mt-6 overflow-hidden bg-[var(--surface-elevated)] p-0 shadow-[var(--shadow-panel)]" id="password">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-[var(--text)]">Смена пароля</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Смена пароля с проверкой минимальной длины и утечек.</p>
        </div>
        <div className="border-t border-[var(--line)] px-6 py-6">
          <ProfileSectionForm action={changePassword} className="grid gap-5" sectionId="password">
            <PasswordPairValidation passwordName="newPassword" />
            <div className="grid gap-5 md:grid-cols-2">
              <FormField htmlFor="current-password" label="Текущий пароль">
                <PasswordInput id="current-password" name="currentPassword" required autoComplete="current-password" placeholder="Введите текущий пароль" maxLength={200} />
              </FormField>
              <FormField htmlFor="new-password" label="Новый пароль">
                <PasswordInput id="new-password" name="newPassword" required autoComplete="new-password" placeholder={PASSWORD_HINT} minLength={PASSWORD_MIN_LENGTH} maxLength={200} />
              </FormField>
              <FormField htmlFor="confirm-password" label="Подтвердите пароль">
                <PasswordInput id="confirm-password" name="confirmPassword" required autoComplete="new-password" placeholder="Повторите новый пароль" minLength={PASSWORD_MIN_LENGTH} maxLength={200} />
              </FormField>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
              <p className="text-sm text-[var(--muted)]">{PASSWORD_HINT}</p>
              <SubmitButton>Сменить пароль</SubmitButton>
            </div>
          </ProfileSectionForm>
        </div>
      </div>
    </div>
  );
}
