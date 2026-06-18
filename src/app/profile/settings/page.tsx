import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { updateAvatar } from '@/lib/profile/avatar-actions';
import { updateBasicProfile } from '@/lib/profile/basic-profile-actions';
import { updateJobSearch, setProfilePublic } from '@/lib/profile/job-search-actions';
import { updateProfileSkills } from '@/lib/profile/skills-actions';
import { updateWorkExperiences } from '@/lib/profile/work-experience-actions';
import { changePassword } from '@/lib/profile/password-actions';
import { AvatarCropper } from '@/components/profile/avatar-cropper';
import { ExperienceEditor } from '@/components/profile/experience-editor';
import { ProfileSectionForm } from '@/components/profile/profile-section-form';
import { ProfileSettingsSection } from '@/components/profile/profile-settings-section';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { SettingsAlert } from '@/components/profile/settings-alert';
import { SkillsSelector } from '@/components/profile/skills-selector';
import { PageHeader } from '@/components/ui/page-header';
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
    { id: 'publish', label: 'Публикация' },
    { id: 'notifications', label: 'Уведомления' },
    { id: 'password', label: 'Пароль' }
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title="Настройки" />

      <SettingsAlert success={success} error={error} />

      <ProfileTabs sections={[...sections]} />

      <ProfileSettingsSection defaultOpen description="Фото профиля для откликов и каталога специалистов." id="avatar" title="Аватар">
        <ProfileSectionForm action={updateAvatar} className="grid gap-4" sectionId="avatar">
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
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted)]">Рекомендуем квадратное фото не меньше 400×400 px.</p>
            <SubmitButton className="w-full sm:w-auto">Загрузить</SubmitButton>
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
          <div className="flex flex-col items-stretch gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted)]">После сохранения данные обновятся в профиле.</p>
            <SubmitButton className="w-full sm:w-auto">Сохранить профиль</SubmitButton>
          </div>
        </ProfileSectionForm>
      </ProfileSettingsSection>

      <ProfileSettingsSection description="Публичность профиля, формат работы и зарплатные ожидания." id="search" title="Статус и условия поиска">
        <ProfileSectionForm action={updateJobSearch} className="grid gap-5" sectionId="search">
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
            <div className="grid gap-3 sm:flex sm:flex-wrap">
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
          <div className="flex flex-col items-stretch gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted)]">Статус и условия поиска помогут работодателям понять ваши предпочтения.</p>
            <SubmitButton className="w-full sm:w-auto">Сохранить профиль</SubmitButton>
          </div>
        </ProfileSectionForm>
      </ProfileSettingsSection>

      <ProfileSettingsSection description="Публикация резюме в каталоге специалистов." id="publish" title="Публикация резюме">
        <ProfileSectionForm action={setProfilePublic} className="grid gap-5" sectionId="publish">
          <div className="flex items-start gap-3">
            <input
              defaultChecked={profile?.isPublic ?? false}
              id="publish-toggle"
              name="publish"
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
            />
            <div>
              <label className="text-sm font-semibold text-[var(--text)]" htmlFor="publish-toggle">Опубликовать резюме в каталоге</label>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                После публикации резюме будет доступно по адресу:
                {profile?.publicHandle && profile?.isPublic ? (
                  <span className="ml-1 font-mono text-[var(--accent)]">barsynergy.app/specialists/cv/{profile.publicHandle}</span>
                ) : null}
              </p>
            </div>
          </div>

          <FormField htmlFor="publish-handle" label="Публичный адрес">
            <input
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-field)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              defaultValue={profile?.publicHandle ?? ''}
              id="publish-handle"
              name="handle"
              placeholder="Автоматически из имени"
              maxLength={60}
              pattern="[a-z0-9-]+"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">Только латиница, цифры и дефисы. Оставьте пустым для автогенерации.</p>
          </FormField>

          <div className="flex flex-col items-stretch gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted)]">
              Для публикации нужно заполнить ФИО, профессию, город и формат занятости.
            </p>
            <SubmitButton className="w-full sm:w-auto">Сохранить</SubmitButton>
          </div>
        </ProfileSectionForm>
      </ProfileSettingsSection>

      <ProfileSettingsSection description="Профессиональные навыки, которые увидят работодатели." id="skills" title="Навыки">
        <ProfileSectionForm action={updateProfileSkills} className="grid gap-4" sectionId="skills">
          <fieldset>
            <legend className="mb-3 text-sm text-[var(--muted)]">Выберите свои навыки:</legend>
            <SkillsSelector allSkills={allSkills} selectedSkillIds={selectedSkillIds} />
          </fieldset>
        </ProfileSectionForm>
      </ProfileSettingsSection>

      <ProfileSettingsSection description="Места работы, должности и краткое описание опыта." id="experience" title="Опыт работы">
        <ProfileSectionForm action={updateWorkExperiences} className="grid gap-5" sectionId="experience">
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
      </ProfileSettingsSection>

      <ProfileSettingsSection description="Настройка браузерных уведомлений по заявкам и сообщениям." id="notifications" title="Уведомления">
        <div>
          <NotificationSettings
            initialPreferences={notificationPreferences}
            subscriptionCount={activeSubs.length}
          />
        </div>
      </ProfileSettingsSection>

      <ProfileSettingsSection description="Смена пароля с проверкой минимальной длины и утечек." id="password" title="Смена пароля">
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
          <div className="flex flex-col items-stretch gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted)]">{PASSWORD_HINT}</p>
            <SubmitButton className="w-full sm:w-auto">Сменить пароль</SubmitButton>
          </div>
        </ProfileSectionForm>
      </ProfileSettingsSection>
    </div>
  );
}
