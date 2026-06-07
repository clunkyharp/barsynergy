import { createSkill, updateSkill } from '@/app/admin/skills/actions';
import {
  AdminCmsCompactRecordSummary,
  AdminCmsInlineEditRecord,
  AdminCmsPanel
} from '@/components/admin/admin-cms-form';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { AdminActionAlert, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { ContextualEmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AdminStatusChip } from '@/components/ui/status-badge';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/modules/admin/queries';

export const dynamic = 'force-dynamic';

const ADMIN_SKILLS_PATH = '/admin/skills';

type AdminSkillsPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminSkillsPage({ searchParams }: AdminSkillsPageProps) {
  await requireAdminSectionAccess('skills');

  const params = (await searchParams) ?? {};
  const skills = await prisma.skill.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Навыки специалистов. Пользователи выбирают навыки в своём профиле для показа работодателям."
        eyebrow="Админка / Справочники"
        title="Навыки"
      />

      <AdminActionAlert params={params} />

      <AdminCmsPanel title="Новый навык" description="Добавьте новый навык. Станет доступен в профилях специалистов.">
        <form action={createSkill} className="grid gap-4">
          <HiddenRedirect value={ADMIN_SKILLS_PATH} />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_auto] lg:items-end">
            <FormField htmlFor="skill-name" label="Название">
              <Input id="skill-name" name="name" required minLength={1} maxLength={120} />
            </FormField>
            <FormField htmlFor="skill-slug" label="Slug">
              <Input id="skill-slug" name="slug" maxLength={160} placeholder="Если пусто, будет создан из названия" />
            </FormField>
            <FormField htmlFor="skill-sortOrder" label="Порядок">
              <Input id="skill-sortOrder" name="sortOrder" min={0} max={100000} type="number" defaultValue={0} />
            </FormField>
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </AdminCmsPanel>

      <section className="grid gap-4">
        {skills.length === 0 ? (
          <ContextualEmptyState context="Навыки" title="Навыков пока нет" description="Добавьте первый навык для профилей специалистов." />
        ) : (
          skills.map((skill) => (
            <AdminCmsInlineEditRecord
              action={updateSkill}
              groupName="skill-edit-list"
              key={skill.id}
              formClassName="lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_150px_auto] lg:items-end"
              summary={
                <AdminCmsCompactRecordSummary
                  title={skill.name}
                  subtitle={skill.slug}
                  items={[
                    { label: 'Порядок', value: skill.sortOrder }
                  ]}
                  status={<AdminStatusChip variant={skill.isActive ? 'success' : 'neutral'}>{skill.isActive ? 'Активен' : 'Выключен'}</AdminStatusChip>}
                />
              }
            >
              <HiddenRedirect value={ADMIN_SKILLS_PATH} />
              <input name="skillId" type="hidden" value={skill.id} />
              <FormField htmlFor={`skill-name-${skill.id}`} label="Название">
                <Input id={`skill-name-${skill.id}`} name="name" required minLength={1} maxLength={120} defaultValue={skill.name} />
              </FormField>
              <FormField htmlFor={`skill-slug-${skill.id}`} label="Slug">
                <Input id={`skill-slug-${skill.id}`} name="slug" maxLength={160} defaultValue={skill.slug} />
              </FormField>
              <FormField htmlFor={`skill-sortOrder-${skill.id}`} label="Порядок">
                <Input id={`skill-sortOrder-${skill.id}`} name="sortOrder" min={0} max={100000} type="number" defaultValue={skill.sortOrder} />
              </FormField>
              <FormField htmlFor={`skill-isActive-${skill.id}`} label="Статус">
                <Select id={`skill-isActive-${skill.id}`} name="isActive" defaultValue={skill.isActive ? 'true' : 'false'}>
                  <option value="true">Активен</option>
                  <option value="false">Выключен</option>
                </Select>
              </FormField>
              <Button type="submit" variant="secondary">
                Сохранить
              </Button>
            </AdminCmsInlineEditRecord>
          ))
        )}
      </section>
    </div>
  );
}
