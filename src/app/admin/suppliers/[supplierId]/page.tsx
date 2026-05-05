import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@prisma/client';
import { updateSupplier } from '@/app/admin/suppliers/actions';
import { CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusLabels } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

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

      <Card className="p-5">
        <form action={updateSupplier} className="grid gap-8">
          <HiddenRedirect value={ADMIN_SUPPLIERS_PATH} />
          <input name="supplierId" type="hidden" value={supplier.id} />
          
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Основная информация</h3>
            <div className="grid gap-5 lg:grid-cols-2">
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
              <FormField htmlFor="supplier-status" label="Статус">
                <Select id="supplier-status" name="status" defaultValue={supplier.status}>
                  {Object.values(ContentStatus).map((status) => (
                    <option key={status} value={status}>
                      {contentStatusLabels[status]}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Детали компании</h3>
            <div className="grid gap-5 lg:grid-cols-2">
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
              <FormField htmlFor="supplier-websiteUrl" label="Сайт">
                <Input id="supplier-websiteUrl" name="websiteUrl" maxLength={240} type="url" defaultValue={supplier.websiteUrl ?? ''} />
              </FormField>
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
              <FormField htmlFor="supplier-contactLabel" label="Контакт">
                <Input id="supplier-contactLabel" name="contactLabel" maxLength={160} defaultValue={supplier.contactLabel ?? ''} />
              </FormField>
              <FormField htmlFor="supplier-serviceArea" label="Зона работы">
                <Input id="supplier-serviceArea" name="serviceArea" maxLength={180} defaultValue={supplier.serviceArea ?? ''} />
              </FormField>
              <FormField htmlFor="supplier-isVerified" label="Проверен">
                <Select id="supplier-isVerified" name="isVerified" defaultValue={String(supplier.isVerified)}>
                  <option value="false">Нет</option>
                  <option value="true">Да</option>
                </Select>
              </FormField>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Медиа и описание</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <CoverImageField id="supplier-coverImage" currentName={supplier.coverImage?.originalName} currentAlt={supplier.coverImageAlt} />
              <div className="lg:col-span-2">
                <FormField htmlFor="supplier-summary" label="Краткое описание">
                  <Textarea
                    id="supplier-summary"
                    name="summary"
                    required
                    minLength={10}
                    maxLength={500}
                    defaultValue={supplier.summary}
                  />
                </FormField>
              </div>
              <div className="lg:col-span-2">
                <FormField htmlFor="supplier-description" label="Описание">
                  <Textarea
                    id="supplier-description"
                    name="description"
                    required
                    minLength={20}
                    className="min-h-64"
                    defaultValue={supplier.description}
                  />
                </FormField>
              </div>
            </div>
          </section>

          <div>
            <Button type="submit">Сохранить изменения</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
