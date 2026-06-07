import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { changePassword, updateAvatar, updateBasicProfile, updateJobSearch, updateProfileSkills, updateWorkExperiences } from '@/lib/profile/actions';
import { ExperienceEditor } from '@/components/profile/experience-editor';
import { SettingsAlert } from '@/components/profile/settings-alert';
import { SkillsSelector } from '@/components/profile/skills-selector';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { PasswordPairValidation } from '@/components/ui/password-pair-validation';
import { SalaryInput } from '@/components/ui/salary-input';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { FileUpload } from '@/components/ui/file-upload';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getProfileAvatarUrl } from '@/lib/profile/avatar-url';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { firstParam } from '@/lib/admin/content-utils';
import { getProfileSettingsData, EmploymentType, JobSearchStatus } from '@/modules/profile/queries';

type ProfileSettingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Настройки профиля',
  description: 'Редактирование профиля и смена пароля в BARSYNERGY.'
});

export default async function ProfileSettingsPage({ searchParams }: ProfileSettingsPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile/settings');
  }

  const params = (await searchParams) ?? {};
  const success = firstParam(params.success);
  const error = firstParam(params.error);

  const [user, cities, allSkills] = await getProfileSettingsData(currentUser.id);

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
    { id: 'password', label: 'Пароль' }
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Аккаунт"
        description="Редактирование профиля и настройки безопасности."
        title="Настройки"
      />

      <SettingsAlert success={success} error={error} />

      <nav aria-label="Разделы настроек" className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <a
            className="inline-flex min-h-9 items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text)]"
            href={`#${s.id}`}
            key={s.id}
          >
            {s.label}
          </a>
        ))}
      </nav>

      <Panel className="max-w-2xl scroll-mt-6" id="avatar" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Аватар</h2>
        <form action={updateAvatar} className="mt-5">
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
          <FileUpload accept="image/*" name="avatar" title="Загрузить фото" description="JPEG, PNG до 5 MB. Квадратное фото." privacy="public" />
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">Рекомендуем квадратное фото не меньше 400×400 px.</p>
            <SubmitButton>Загрузить</SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel className="max-w-2xl scroll-mt-6" id="main" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Основное</h2>
        <form action={updateBasicProfile} className="mt-5 grid gap-5">
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
            <FormField htmlFor="website" label="Сайт">
              <Input id="website" name="website" type="url" maxLength={240} placeholder="https://yoursite.ru" defaultValue={profile?.website ?? ''} />
            </FormField>
          </div>
          <FormField htmlFor="bio" label="О себе">
            <Textarea id="bio" name="bio" maxLength={1000} rows={4} placeholder="Расскажите о себе…" defaultValue={profile?.bio ?? ''} />
          </FormField>
          <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
            <p className="text-sm text-[var(--muted)]">После сохранения данные обновятся в профиле.</p>
            <SubmitButton>Сохранить профиль</SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel className="max-w-2xl scroll-mt-6" id="search" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Статус и условия поиска</h2>
        <form action={updateJobSearch} className="mt-5 grid gap-5">
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
        </form>
      </Panel>

      <Panel className="max-w-2xl scroll-mt-6" id="skills" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Навыки</h2>
        <form action={updateProfileSkills} className="mt-5">
          <fieldset>
            <legend className="mb-3 text-sm text-[var(--muted)]">Выберите свои навыки:</legend>
            <SkillsSelector allSkills={allSkills} selectedSkillIds={selectedSkillIds} />
          </fieldset>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
            <p className="text-sm text-[var(--muted)]">Выбранные навыки будут видны работодателям.</p>
            <SubmitButton>Сохранить навыки</SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel className="max-w-2xl scroll-mt-6" id="experience" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Опыт работы</h2>
        <form action={updateWorkExperiences} className="mt-5 grid gap-5">
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
        </form>
      </Panel>

      <Panel className="max-w-2xl scroll-mt-6" id="password" padding="lg" tone="elevated">
        <h2 className="text-lg font-semibold tracking-normal">Смена пароля</h2>
        <form action={changePassword} className="mt-5 grid gap-5">
          <PasswordPairValidation passwordName="newPassword" />
          <div className="grid gap-5 md:grid-cols-2">
            <FormField htmlFor="current-password" label="Текущий пароль">
              <Input id="current-password" name="currentPassword" required type="password" autoComplete="current-password" placeholder="Введите текущий пароль" maxLength={200} />
            </FormField>
            <FormField htmlFor="new-password" label="Новый пароль">
              <Input id="new-password" name="newPassword" required type="password" autoComplete="new-password" placeholder="Минимум 6 символов" minLength={6} maxLength={200} />
            </FormField>
            <FormField htmlFor="confirm-password" label="Подтвердите пароль">
              <Input id="confirm-password" name="confirmPassword" required type="password" autoComplete="new-password" placeholder="Повторите новый пароль" minLength={6} maxLength={200} />
            </FormField>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
            <p className="text-sm text-[var(--muted)]">Минимум 6 символов.</p>
            <SubmitButton>Сменить пароль</SubmitButton>
          </div>
        </form>
      </Panel>
    </div>
  );
}
