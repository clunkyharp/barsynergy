import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { updateAvatar } from '@/lib/profile/avatar-actions';
import { updateBasicProfile } from '@/lib/profile/basic-profile-actions';
import { updateJobSearch } from '@/lib/profile/job-search-actions';
import { updateProfileSkills } from '@/lib/profile/skills-actions';
import { updateWorkExperiences } from '@/lib/profile/work-experience-actions';
import { changePassword } from '@/lib/profile/password-actions';
import { AvatarCropper } from '@/components/profile/avatar-cropper';
import { ExperienceEditor } from '@/components/profile/experience-editor';
import { ProfileSectionForm } from '@/components/profile/profile-section-form';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { SettingsAlert } from '@/components/profile/settings-alert';
import { SkillsSelector } from '@/components/profile/skills-selector';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { PasswordPairValidation } from '@/components/ui/password-pair-validation';
import { SalaryInput } from '@/components/ui/salary-input';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { getCurrentUser } from '@/lib/auth/current-user';
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from '@/lib/auth/password-policy-constants';
import { getProfileAvatarUrl } from '@/lib/profile/avatar-url';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { firstParam } from '@/lib/admin/content-utils';
import { getProfileSettingsData, EmploymentType, JobSearchStatus } from '@/modules/profile/queries';
import { NotificationSettings } from '@/components/profile/notification-settings';
import { getNotificationPreferences } from '@/lib/notifications/web-push/preferences';
import { getActiveSubscriptions } from '@/lib/notifications/web-push/subscriptions';

type ProfileSettingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Настройки профиля',
  description: 'Редактирование профиля, уведомления и смена пароля в BARSYNERGY.'
});

export default async function ProfileSettingsPage({ searchParams }: ProfileSettingsPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile/settings');
  }

  const params = (await searchParams) ?? {};
  const success = firstParam(params.success);
  const error = firstParam(params.error);

  const [[user, cities, allSkills], notificationPreferences, activeSubs] = await Promise.all([
    getProfileSettingsData(currentUser.id),
    getNotificationPreferences(currentUser.id),
    getActiveSubscriptions(currentUser.id)
  ]);

  if (!user) {
    redirect('/auth/login?returnTo=/profile/settings');
  }

  const profile = user.profile;
  const avatarUrl = profile ? getProfileAvatarUrl(profile.avatarFile) : null;
  const selectedSkillIds = new Set(profile?.profileSkills.map((ps) => ps.skillId) ?? []);

  const jobSearchStatuses: { value: JobSearchStatus; label: string }[] = [
    { value: 'ACTIVE', label: 'Активно ищу' },
    { value: 'OPEN', label: 'Рассматриваю предложения' },
    { value: 'NOT_LOOKING', label: 'Не ищу' }
  ];

  const employmentTypeOptions: { value: EmploymentType; label: string }[] = [
    { value: 'FULL_TIME', label: 'Полная занятость' },
    { value: 'PART_TIME', label: 'Частичная занятость' },
    { value: 'FREELANCE', label: 'Фриланс' },
    { value: 'REMOTE', label: 'Удалённая работа' }
  ];

  const sections = [
    { id: 'avatar', label: 'Аватар' },
    { id: 'main', label: 'Основное' },
    { id: 'search', label: 'Статус поиска' },
    { id: 'skills', label: 'Навыки' },
    { id: 'experience', label: 'Опыт' },
    { id: 'notifications', label: 'Уведомления' },
    { id: 'password', label: 'Пароль' }
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader bare title="Настройки" />

      <SettingsAlert success={success} error={error} />

      <ProfileTabs sections={[...sections]} />

      <Panel className="max-w-2xl scroll-mt-6" id="avatar" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Аватар</h2>
        <ProfileSectionForm action={updateAvatar} className="mt-5 grid gap-4" sectionId="avatar">
          {avatarUrl ? (
            <div className="mb-4 flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-[var(--border-default)] bg-[var(--surface-muted)]">
                <img alt="Текущий аватар" className="h-full w-full object-cover" src={avatarUrl} />
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
      </Panel>

      <Panel className="max-w-2xl scroll-mt-6" id="main" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Основное</h2>
        <ProfileSectionForm action={updateBasicProfile} className="mt-5 grid gap-5" sectionId="main">
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
      </Panel>

      <Panel className="max-w-2xl scroll-mt-6" id="search" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Статус и условия поиска</h2>
        <ProfileSectionForm action={updateJobSearch} className="mt-5 grid gap-5" sectionId="search">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField htmlFor="jobSearchStatus" label="Статус поиска">
              <Select id="jobSearchStatus" name="jobSearchStatus" defaultValue={profile?.jobSearchStatus ?? ''}>
                <option value="">Не указан</option>
                {jobSearchStatuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="desiredSalary" label="Желаемая зарплата (от)">
              <SalaryInput id="desiredSalary" name="desiredSalary" placeholder="50 000" defaultValue={profile?.desiredSalary ?? null} />
            </FormField>
            <FormField htmlFor="desiredSalaryMax" label="Желаемая зарплата (до)">
              <SalaryInput id="desiredSalaryMax" name="desiredSalaryMax" placeholder="150 000" defaultValue={profile?.desiredSalaryMax ?? null} />
            </FormField>
          </div>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-[var(--text)]">Формат работы</legend>
            <div className="flex flex-wrap gap-4">
              {employmentTypeOptions.map((opt) => (
                <CheckboxField
                  key={opt.value}
                  name="employmentTypes"
                  value={opt.value}
                  defaultChecked={profile?.employmentTypes.includes(opt.value)}
                >
                  {opt.label}
                </CheckboxField>
              ))}
            </div>
          </fieldset>
          <CheckboxField name="isPublic" defaultChecked={profile?.isPublic ?? false}>
            Показывать профиль работодателям в каталоге специалистов
          </CheckboxField>
          <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
            <p className="text-sm text-[var(--muted)]">Статус и условия поиска помогут работодателям понять ваши предпочтения.</p>
            <SubmitButton>Сохранить профиль</SubmitButton>
          </div>
        </ProfileSectionForm>
      </Panel>

      <Panel className="max-w-2xl scroll-mt-6" id="skills" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Навыки</h2>
        <ProfileSectionForm action={updateProfileSkills} className="mt-5 grid gap-4" sectionId="skills">
          <fieldset>
            <legend className="mb-3 text-sm text-[var(--muted)]">Выберите свои навыки:</legend>
            <SkillsSelector allSkills={allSkills} selectedSkillIds={selectedSkillIds} />
          </fieldset>
        </ProfileSectionForm>
      </Panel>

      <Panel className="max-w-2xl scroll-mt-6" id="experience" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Опыт работы</h2>
        <ProfileSectionForm action={updateWorkExperiences} className="mt-5 grid gap-5" sectionId="experience">
          <ExperienceEditor
            initial={(profile?.workExperiences ?? []).map((exp) => ({
              id: exp.id,
              companyName: exp.companyName,
              position: exp.position,
              startDate: exp.startDate.toISOString().split('T')[0],
              endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : null,
              description: exp.description
            }))}
          />
          <div className="flex items-center justify-end gap-3 border-t border-[var(--line)] pt-5">
            <SubmitButton>Сохранить опыт</SubmitButton>
          </div>
        </ProfileSectionForm>
      </Panel>

      <Panel className="max-w-2xl scroll-mt-6" id="notifications" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Уведомления</h2>
        <div className="mt-5">
          <NotificationSettings
            initialPreferences={notificationPreferences}
            subscriptionCount={activeSubs.length}
          />
        </div>
      </Panel>

      <Panel className="max-w-2xl scroll-mt-6" id="password" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Смена пароля</h2>
        <ProfileSectionForm action={changePassword} className="mt-5 grid gap-5" sectionId="password">
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
      </Panel>
    </div>
  );
}
