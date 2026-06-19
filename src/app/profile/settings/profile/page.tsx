import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { updateAvatar } from '@/lib/profile/avatar-actions';
import { updateBasicProfile } from '@/lib/profile/basic-profile-actions';
import { AvatarCropper } from '@/components/profile/avatar-cropper';
import { ProfileSectionForm } from '@/components/profile/profile-section-form';
import { ProfileSettingsSection } from '@/components/profile/profile-settings-section';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getProfileAvatarUrl } from '@/lib/profile/avatar-url';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { getProfileSettingsData } from '@/modules/profile/queries';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Профиль — настройки',
  description: 'Аватар, имя, город, профессия и контакты в BARSYNERGY.'
});

export default async function ProfileSettingsProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile/settings/profile');
  }

  const [user, cities] = await getProfileSettingsData(currentUser.id);

  if (!user) {
    redirect('/auth/login?returnTo=/profile/settings/profile');
  }

  const profile = user.profile;
  const avatarUrl = profile ? getProfileAvatarUrl(profile.avatarFile) : null;

  return (
    <div className="space-y-6">
      <ProfileSettingsSection defaultOpen description="Фото профиля для откликов и каталога специалистов." id="avatar" title="Аватар">
        <ProfileSectionForm action={updateAvatar} className="grid gap-4" sectionId="avatar">
          {avatarUrl ? (
            <div className="mb-4 flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-[var(--border-default)] bg-[var(--surface-muted)]">
                <Image alt="Текущий аватар" className="h-full w-full object-cover" src={avatarUrl} width={64} height={64} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">Текущее фото</p>
                <p className="text-xs text-[var(--muted)]">Новое фото заменит текущее.</p>
              </div>
            </div>
          ) : null}
          <AvatarCropper currentAvatarUrl={avatarUrl} />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">Рекомендуем квадратное фото не меньше 400×400 px.</p>
            <SubmitButton>Загрузить</SubmitButton>
          </div>
        </ProfileSectionForm>
      </ProfileSettingsSection>

      <ProfileSettingsSection defaultOpen description="Имя, город, профессия и контакты." id="main" title="Основное">
        <ProfileSectionForm action={updateBasicProfile} className="grid gap-5" sectionId="main">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField htmlFor="fullName" label="Полное имя">
              <Input id="fullName" name="fullName" required maxLength={120} placeholder="Иван Иванов" defaultValue={profile?.fullName ?? ''} />
            </FormField>
            <FormField htmlFor="cityId" label="Город">
              <Select id="cityId" name="cityId" defaultValue={profile?.cityId ?? ''}>
                <option value="">Не выбран</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="profession" label="Профессия">
              <Input id="profession" name="profession" maxLength={120} placeholder="Например, бар-менеджер" defaultValue={profile?.profession ?? ''} />
            </FormField>
            <FormField htmlFor="company" label="Компания">
              <Input id="company" name="company" maxLength={160} placeholder="Например, Coffee Point" defaultValue={profile?.company ?? ''} />
            </FormField>
            <FormField htmlFor="phone" label="Телефон">
              <Input id="phone" name="phone" maxLength={80} placeholder="+7 999 123 45 67" defaultValue={profile?.phone ?? ''} />
            </FormField>
            <FormField htmlFor="telegram" label="Telegram">
              <Input id="telegram" name="telegram" maxLength={80} placeholder="@username" defaultValue={profile?.telegram ?? ''} />
            </FormField>
          </div>
          <FormField htmlFor="bio" label="О себе">
            <Textarea id="bio" name="bio" maxLength={1000} rows={4} placeholder="Расскажите о себе…" defaultValue={profile?.bio ?? ''} />
          </FormField>
          <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
            <p className="text-sm text-[var(--muted)]">После сохранения данные обновятся в профиле.</p>
            <SubmitButton>Сохранить профиль</SubmitButton>
          </div>
        </ProfileSectionForm>
      </ProfileSettingsSection>
    </div>
  );
}
