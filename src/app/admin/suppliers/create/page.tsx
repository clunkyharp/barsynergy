import { CategoryType, ContentStatus } from '@prisma/client';
import { createSupplier } from '@/app/admin/suppliers/actions';
import { AdminCmsActions, AdminCmsForm, AdminCmsGrid, AdminCmsSection } from '@/components/admin/admin-cms-form';
import { CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusLabels } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_SUPPLIERS_PATH = '/admin/suppliers';

export default async function AdminSuppliersCreatePage() {
  await requireAdminSectionAccess('suppliers');

  const [categories, cities] = await Promise.all([
    prisma.category.findMany({
      where: { type: CategoryType.SUPPLIER, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    })
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Поставщики / Создание</p>
          <h1 className="mt-2 text-3xl font-semibold">Новый поставщик</h1>
        </div>
        <Button href={ADMIN_SUPPLIERS_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <AdminCmsForm action={createSupplier}>
        <HiddenRedirect value={ADMIN_SUPPLIERS_PATH} />

        <AdminCmsSection title="Публикация" description="Заголовок, адрес страницы, категория и статус поставщика.">
          <AdminCmsGrid>
            <FormField htmlFor="supplier-title" label="Заголовок">
              <Input id="supplier-title" name="title" required minLength={2} maxLength={160} />
            </FormField>
            <FormField htmlFor="supplier-slug" label="Адрес страницы">
              <Input id="supplier-slug" name="slug" maxLength={180} placeholder="Если пусто, будет создан из заголовка" />
            </FormField>
            <FormField htmlFor="supplier-categoryId" label="Категория">
              <Select id="supplier-categoryId" name="categoryId" defaultValue="">
                <option value="">Без категории</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="supplier-status" label="Статус">
              <Select id="supplier-status" name="status" defaultValue={ContentStatus.DRAFT}>
                {Object.values(ContentStatus).map((status) => (
                  <option key={status} value={status}>
                    {contentStatusLabels[status]}
                  </option>
                ))}
              </Select>
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Компания" description="Название компании, сайт и рабочий контакт.">
          <AdminCmsGrid>
            <FormField htmlFor="supplier-companyName" label="Компания">
              <Input id="supplier-companyName" name="companyName" required minLength={2} maxLength={180} />
            </FormField>
            <FormField htmlFor="supplier-websiteUrl" label="Сайт">
              <Input id="supplier-websiteUrl" name="websiteUrl" maxLength={240} type="url" />
            </FormField>
            <FormField htmlFor="supplier-contactLabel" label="Контакт" hint="Коротко: имя, телефон, Telegram или email. Если контактов несколько, разделяйте точкой с запятой.">
              <Textarea id="supplier-contactLabel" name="contactLabel" maxLength={160} className="min-h-24" />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="География работы" description="Город и зона обслуживания поставщика.">
          <AdminCmsGrid>
            <FormField htmlFor="supplier-cityId" label="Город">
              <Select id="supplier-cityId" name="cityId" defaultValue="">
                <option value="">Без города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="supplier-serviceArea" label="Зона работы">
              <Input id="supplier-serviceArea" name="serviceArea" maxLength={180} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Проверка" description="Редакционная отметка о проверке поставщика.">
          <AdminCmsGrid>
            <FormField htmlFor="supplier-isVerified" label="Проверка">
              <Select id="supplier-isVerified" name="isVerified" defaultValue="false">
                <option value="false">Не проверен</option>
                <option value="true">Проверен</option>
              </Select>
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Медиа" description="Обложка поставщика для каталога и публичной страницы.">
          <AdminCmsGrid>
            <CoverImageField id="supplier-coverImage" />
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контент" description="Краткое описание и полный текст карточки поставщика.">
          <div className="grid gap-4">
            <FormField htmlFor="supplier-summary" label="Краткое описание">
              <Textarea id="supplier-summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
            <FormField htmlFor="supplier-description" label="Описание">
              <Textarea id="supplier-description" name="description" required minLength={20} className="min-h-64" />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button type="button" variant="secondary" href={ADMIN_SUPPLIERS_PATH}>
            Отмена
          </Button>
          <Button type="submit">Создать поставщика</Button>
        </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
