import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@/modules/admin/queries';
import { updateSupplier, updateSupplierStatus } from '@/app/admin/suppliers/actions';
import { AdminCmsActions, AdminCmsForm, AdminCmsGrid, AdminCmsSection, AdminCmsSummary } from '@/components/admin/admin-cms-form';
import { AdminContentVisibilityPanel, CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { PUBLICATION_STATUS_HINT, contentStatusLabels } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/modules/admin/queries';

export const dynamic = 'force-dynamic';

const ADMIN_SUPPLIERS_PATH = '/admin/suppliers';

type AdminSupplierEditPageProps = {
  params: Promise<{ supplierId: string }>;
};

export default async function AdminSupplierEditPage({ params }: AdminSupplierEditPageProps) {
  await requireAdminSectionAccess('suppliers');
  const { supplierId } = await params;

  const [supplier, categories, cities] = await Promise.all([
    prisma.supplier.findUnique({
      where: { id: supplierId },
      include: { coverImage: { select: { originalName: true } } }
    }),
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

  if (!supplier) {
    notFound();
  }
  const cityName = cities.find((city) => city.id === supplier.cityId)?.name ?? 'Город не указан';
  const currentPath = `${ADMIN_SUPPLIERS_PATH}/${supplier.id}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Поставщики / Редактирование</p>
          <h1 className="mt-2 text-3xl font-semibold">Редактировать поставщика</h1>
        </div>
        <Button href={ADMIN_SUPPLIERS_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <AdminContentVisibilityPanel
        currentPath={currentPath}
        idName="supplierId"
        idValue={supplier.id}
        publicHref={`/suppliers/${supplier.slug}`}
        status={supplier.status}
        updateStatusAction={updateSupplierStatus}
      />

      <AdminCmsForm action={updateSupplier}>
        <HiddenRedirect value={ADMIN_SUPPLIERS_PATH} />
        <input name="supplierId" type="hidden" value={supplier.id} />
        <AdminCmsSummary
          items={[
            { label: 'Статус', value: contentStatusLabels[supplier.status] },
            { label: 'Компания', value: supplier.companyName },
            { label: 'Город', value: cityName },
            { label: 'Проверка', value: supplier.isVerified ? 'Проверен' : 'Не проверен' }
          ]}
        />

        <AdminCmsSection title="Публикация" description="Заголовок, адрес страницы, категория и статус поставщика.">
          <AdminCmsGrid>
            <FormField htmlFor="supplier-title" label="Заголовок">
              <Input id="supplier-title" name="title" required minLength={2} maxLength={160} defaultValue={supplier.title} />
            </FormField>
            <FormField htmlFor="supplier-slug" label="Адрес страницы">
              <Input id="supplier-slug" name="slug" maxLength={180} defaultValue={supplier.slug} />
            </FormField>
            <FormField htmlFor="supplier-categoryId" label="Категория">
              <Select id="supplier-categoryId" name="categoryId" defaultValue={supplier.categoryId ?? ''}>
                <option value="">Без категории</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="supplier-status" label="Статус" hint={PUBLICATION_STATUS_HINT}>
              <Select id="supplier-status" name="status" defaultValue={supplier.status}>
                {Object.values(ContentStatus).map((status) => (
                  <option key={status} value={status}>
                    {contentStatusLabels[status]}
                  </option>
                ))}
              </Select>
            </FormField>
            <p className="text-xs leading-5 text-[var(--muted)] lg:col-span-2">
              Статус через панель «Видимость на сайте» использует подтверждение. Изменение через этот Select сохраняется без подтверждения.
            </p>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Компания" description="Название компании, сайт и рабочий контакт.">
          <AdminCmsGrid>
            <FormField htmlFor="supplier-companyName" label="Компания">
              <Input
                id="supplier-companyName"
                name="companyName"
                required
                minLength={2}
                maxLength={180}
                defaultValue={supplier.companyName}
              />
            </FormField>
            <FormField htmlFor="supplier-websiteUrl" label="Сайт" hint="Необязательно. Если не заполнен, ссылка не покажется на публичной странице.">
              <Input id="supplier-websiteUrl" name="websiteUrl" maxLength={240} type="url" defaultValue={supplier.websiteUrl ?? ''} />
            </FormField>
            <FormField htmlFor="supplier-contactLabel" label="Контакт" hint="Коротко: имя, телефон, Telegram или email. Если контактов несколько, разделяйте точкой с запятой.">
              <Textarea id="supplier-contactLabel" name="contactLabel" maxLength={160} className="min-h-24" defaultValue={supplier.contactLabel ?? ''} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="География работы" description="Город и зона обслуживания поставщика.">
          <AdminCmsGrid>
            <FormField htmlFor="supplier-cityId" label="Город">
              <Select id="supplier-cityId" name="cityId" defaultValue={supplier.cityId ?? ''}>
                <option value="">Без города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="supplier-serviceArea" label="Зона работы" hint="Например: СКФО, Краснодарский край, вся Россия">
              <Input id="supplier-serviceArea" name="serviceArea" maxLength={180} defaultValue={supplier.serviceArea ?? ''} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Проверка" description="Редакционная отметка о проверке поставщика.">
          <AdminCmsGrid>
            <FormField htmlFor="supplier-isVerified" label="Проверка">
              <Select id="supplier-isVerified" name="isVerified" defaultValue={String(supplier.isVerified)}>
                <option value="false">Не проверен</option>
                <option value="true">Проверен</option>
              </Select>
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Медиа" description="Обложка поставщика для каталога и публичной страницы.">
          <AdminCmsGrid>
            <CoverImageField id="supplier-coverImage" currentName={supplier.coverImage?.originalName} currentAlt={supplier.coverImageAlt} />
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контент" description="Краткое описание и полный текст карточки поставщика.">
          <div className="grid gap-4">
            <FormField htmlFor="supplier-summary" label="Краткое описание">
              <Textarea id="supplier-summary" name="summary" required minLength={10} maxLength={500} defaultValue={supplier.summary} />
            </FormField>
            <FormField htmlFor="supplier-description" label="Описание">
              <MarkdownEditor id="supplier-description" name="description" required minLength={20} maxLength={100_000} className="min-h-64" defaultValue={supplier.description} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button type="button" variant="secondary" href={ADMIN_SUPPLIERS_PATH}>
            Отмена
          </Button>
          <Button type="submit">Сохранить изменения</Button>
        </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
