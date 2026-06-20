import { CategoryType } from '@/modules/admin/queries';
import { createMasterAction } from '@/app/admin/masters/actions';
import { AdminCmsActions, AdminCmsForm, AdminCmsGrid, AdminCmsSection } from '@/components/admin/admin-cms-form';
import { CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { EntityTypeFormSection } from '@/components/admin/masters/entity-type-form-section';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { getActiveCategories, getActiveCities } from '@/lib/admin/admin-queries';

export const dynamic = 'force-dynamic';

const ADMIN_MASTERS_PATH = '/admin/masters';

export default async function AdminMastersCreatePage() {
  await requireAdminSectionAccess('masters');

  const [categories, cities] = await Promise.all([
    getActiveCategories(CategoryType.MASTER),
    getActiveCities()
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">Админка / Мастера / Создание</p>
          <h1 className="mt-2 text-3xl font-semibold">Новый мастер</h1>
        </div>
        <Button href={ADMIN_MASTERS_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <AdminCmsForm action={createMasterAction}>
        <HiddenRedirect value={ADMIN_MASTERS_PATH} />

        <EntityTypeFormSection>
          <AdminCmsGrid>
            <FormField htmlFor="master-categoryId" label="Категория">
              <Select id="master-categoryId" name="categoryId" defaultValue="">
                <option value="">Без категории</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </AdminCmsGrid>
        </EntityTypeFormSection>

        <AdminCmsSection title="Контакты" description="Способ связи с мастером.">
          <AdminCmsGrid>
            <FormField htmlFor="master-contactLabel" label="Контактное лицо" hint="Только имя. Telegram/email — в полях ниже.">
              <Input id="master-contactLabel" name="contactLabel" maxLength={120} />
            </FormField>
            <FormField htmlFor="master-contactTelegram" label="Telegram">
              <Input id="master-contactTelegram" name="contactTelegram" maxLength={120} />
            </FormField>
            <FormField htmlFor="master-contactPhone" label="Телефон">
              <Input id="master-contactPhone" name="contactPhone" maxLength={60} type="tel" />
            </FormField>
            <FormField htmlFor="master-contactEmail" label="Email">
              <Input id="master-contactEmail" name="contactEmail" maxLength={180} type="email" />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="География" description="Город и зона работы мастера.">
          <AdminCmsGrid>
            <FormField htmlFor="master-cityId" label="Город">
              <Select id="master-cityId" name="cityId" defaultValue="">
                <option value="">Без города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="master-serviceArea" label="Зона работы">
              <Input id="master-serviceArea" name="serviceArea" maxLength={180} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Профессиональные данные" description="Специализации, опыт и ставка.">
          <AdminCmsGrid>
            <FormField htmlFor="master-specializations" label="Специализации" hint="Каждая с новой строки.">
              <Textarea id="master-specializations" name="specializations" maxLength={1000} className="min-h-24" />
            </FormField>
            <FormField htmlFor="master-experienceYears" label="Опыт (лет)">
              <Input id="master-experienceYears" name="experienceYears" type="number" min={0} max={100} />
            </FormField>
            <FormField htmlFor="master-rateLabel" label="Ставка" hint="Например: от 5000 ₽/ч">
              <Input id="master-rateLabel" name="rateLabel" maxLength={120} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Медиа" description="Обложка мастера для каталога и публичной страницы.">
          <AdminCmsGrid>
            <CoverImageField id="master-coverImage" />
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контент" description="Краткое описание и полный текст карточки мастера.">
          <div className="grid gap-4">
            <FormField htmlFor="master-summary" label="Описание для карточки" hint="Показывается в каталоге. До 500 символов.">
              <Textarea id="master-summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
            <FormField htmlFor="master-description" label="Текст страницы" hint="Полное содержимое публичной страницы">
              <MarkdownEditor id="master-description" name="description" required minLength={20} maxLength={100_000} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button type="submit">Создать мастера</Button>
        </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
