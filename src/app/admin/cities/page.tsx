import { createCity, updateCity } from '@/app/admin/taxonomy/actions';
import { AdminCmsCompactRecordSummary, AdminCmsInlineEditRecord, AdminCmsPanel } from '@/components/admin/admin-cms-form';
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
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_CITIES_PATH = '/admin/cities';

type AdminCitiesPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminCitiesPage({ searchParams }: AdminCitiesPageProps) {
  await requireAdminSectionAccess('cities');

  const params = (await searchParams) ?? {};
  const cities = await prisma.city.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Города для фильтров, форм заявок, профилей и контентных карточек."
        eyebrow="Админка / Таксономия"
        title="Города"
      />

      <AdminActionAlert params={params} />

      <AdminCmsPanel title="Новый город" description="Добавьте город для фильтров, заявок и карточек контента. Новые города активны сразу, статус можно изменить в строке редактирования.">
        <form action={createCity} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px_auto] lg:items-end">
          <HiddenRedirect value={ADMIN_CITIES_PATH} />
          <FormField htmlFor="city-name" label="Название">
            <Input id="city-name" name="name" required minLength={2} maxLength={120} />
          </FormField>
          <FormField htmlFor="city-slug" label="Slug">
            <Input id="city-slug" name="slug" maxLength={160} placeholder="Если пусто, будет создан из названия" />
          </FormField>
          <FormField htmlFor="city-region" label="Регион">
            <Input id="city-region" name="region" maxLength={160} />
          </FormField>
          <FormField htmlFor="city-sortOrder" label="Порядок">
            <Input id="city-sortOrder" name="sortOrder" min={0} max={100000} type="number" defaultValue={0} />
          </FormField>
          <Button type="submit">Создать</Button>
        </form>
      </AdminCmsPanel>

      <section className="grid gap-4">
        {cities.length === 0 ? (
          <ContextualEmptyState context="Таксономия" title="Городов пока нет" description="Добавьте город, чтобы он появился в фильтрах, формах заявок и карточках контента." />
        ) : (
          cities.map((city) => (
            <AdminCmsInlineEditRecord
              action={updateCity}
              groupName="city-edit-list"
              key={city.id}
              formClassName="lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px_150px_auto] lg:items-end"
              summary={
                <AdminCmsCompactRecordSummary
                  title={city.name}
                  subtitle={city.slug}
                  items={[
                    { label: 'Регион', value: city.region || 'Не указан' },
                    { label: 'Порядок', value: city.sortOrder }
                  ]}
                  status={<AdminStatusChip variant={city.isActive ? 'success' : 'neutral'}>{city.isActive ? 'Активен' : 'Выключен'}</AdminStatusChip>}
                />
              }
            >
              <HiddenRedirect value={ADMIN_CITIES_PATH} />
              <input name="cityId" type="hidden" value={city.id} />
              <FormField htmlFor={`city-name-${city.id}`} label="Название">
                <Input id={`city-name-${city.id}`} name="name" required minLength={2} maxLength={120} defaultValue={city.name} />
              </FormField>
              <FormField htmlFor={`city-slug-${city.id}`} label="Slug">
                <Input id={`city-slug-${city.id}`} name="slug" maxLength={160} defaultValue={city.slug} />
              </FormField>
              <FormField htmlFor={`city-region-${city.id}`} label="Регион">
                <Input id={`city-region-${city.id}`} name="region" maxLength={160} defaultValue={city.region ?? ''} />
              </FormField>
              <FormField htmlFor={`city-sortOrder-${city.id}`} label="Порядок">
                <Input id={`city-sortOrder-${city.id}`} name="sortOrder" min={0} max={100000} type="number" defaultValue={city.sortOrder} />
              </FormField>
              <FormField htmlFor={`city-isActive-${city.id}`} label="Статус">
                <Select id={`city-isActive-${city.id}`} name="isActive" defaultValue={city.isActive ? 'true' : 'false'}>
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
