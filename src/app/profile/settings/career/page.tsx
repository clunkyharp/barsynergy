import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { updateJobSearch, setProfilePublic } from '@/lib/profile/job-search-actions';
import { updateProfileSkills } from '@/lib/profile/skills-actions';
import { updateWorkExperiences } from '@/lib/profile/work-experience-actions';
import { ExperienceEditor } from '@/components/profile/experience-editor';
import { ProfileSectionForm } from '@/components/profile/profile-section-form';
import { ProfileSettingsSection } from '@/components/profile/profile-settings-section';
import { SkillsSelector } from '@/components/profile/skills-selector';
import { FormField } from '@/components/ui/form-field';
import { SalaryInput } from '@/components/ui/salary-input';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { getCurrentUser } from '@/lib/auth/current-user';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { getProfileSettingsData, EmploymentType, JobSearchStatus } from '@/modules/profile/queries';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Карьера — настройки',
  description: 'Статус поиска, навыки, опыт работы и публикация резюме в BARSYNERGY.'
});

export default async function ProfileSettingsCareerPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/auth/login?returnTo=/profile/settings/career');
  }

  const [user, , allSkills] = await getProfileSettingsData(currentUser.id);

  if (!user) {
    redirect('/auth/login?returnTo=/profile/settings/career');
  }

  const profile = user.profile;
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

  return (
    <div className="space-y-6">
      <ProfileSettingsSection defaultOpen description="Публичность профиля, формат работы и зарплатные ожидания." id="search" title="Статус и условия поиска">
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
      </ProfileSettingsSection>

      <ProfileSettingsSection defaultOpen description="Профессиональные навыки, которые увидят работодатели." id="skills" title="Навыки">
        <ProfileSectionForm action={updateProfileSkills} className="grid gap-4" sectionId="skills">
          <fieldset>
            <legend className="mb-3 text-sm text-[var(--muted)]">Выберите свои навыки:</legend>
            <SkillsSelector allSkills={allSkills} selectedSkillIds={selectedSkillIds} />
          </fieldset>
        </ProfileSectionForm>
      </ProfileSettingsSection>

      <ProfileSettingsSection defaultOpen description="Места работы, должности и краткое описание опыта." id="experience" title="Опыт работы">
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

      <ProfileSettingsSection defaultOpen description="Публикация резюме в каталоге специалистов." id="publish" title="Публикация резюме">
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

          <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
            <p className="text-sm text-[var(--muted)]">
              Для публикации нужно заполнить ФИО, профессию, город и формат занятости.
            </p>
            <SubmitButton>Сохранить</SubmitButton>
          </div>
        </ProfileSectionForm>
      </ProfileSettingsSection>
    </div>
  );
}
