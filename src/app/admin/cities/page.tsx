import { createCity, updateCity } from '@/app/admin/taxonomy/actions';
import { AdminActionAlert, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
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

      <Card className="p-5">
        <form action={createCity} className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr_140px_auto] lg:items-end">
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
          <div className="grid gap-3">
            <CheckboxField name="isActive" value="true" defaultChecked>
              Активен
            </CheckboxField>
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </Card>

      <section className="grid gap-4">
        {cities.length === 0 ? (
          <Card className="p-5 text-sm text-[var(--muted)]">Городов пока нет.</Card>
        ) : (
          cities.map((city) => (
            <Card className="p-5" key={city.id}>
              <form action={updateCity} className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_120px_140px_auto] lg:items-end">
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
                <div className="grid gap-3">
                  <StatusBadge variant={city.isActive ? 'success' : 'neutral'}>{city.isActive ? 'Активен' : 'Выключен'}</StatusBadge>
                  <CheckboxField name="isActive" value="true" defaultChecked={city.isActive}>
                    Активен
                  </CheckboxField>
                </div>
                <Button type="submit" variant="secondary">
                  Сохранить
                </Button>
              </form>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
