import { Fragment } from 'react';
import { CategoryType, ContentStatus } from '@prisma/client';
import { createSupplier, deleteSupplierDraft, updateSupplier, updateSupplierStatus } from '@/app/admin/suppliers/actions';
import {
  AdminActionAlert,
  AdminPagination,
  CoverImageField,
  HiddenRedirect
} from '@/components/admin/content-admin-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ADMIN_CONTENT_PAGE_SIZE,
  contentStatusBadgeVariants,
  contentStatusLabels,
  getAdminCurrentPath,
  getAdminPage,
  getAdminTotalPages,
  type AdminContentSearchParams
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

const ADMIN_SUPPLIERS_PATH = '/admin/suppliers';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

type AdminSuppliersPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminSuppliersPage({ searchParams }: AdminSuppliersPageProps) {
  await requireAdminSectionAccess('suppliers');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_SUPPLIERS_PATH, params);

  const [total, suppliers, categories, cities] = await Promise.all([
    prisma.supplier.count(),
    prisma.supplier.findMany({
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * ADMIN_CONTENT_PAGE_SIZE,
      take: ADMIN_CONTENT_PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
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
  const totalPages = getAdminTotalPages(total);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Admin / Suppliers</p>
        <h1 className="mt-2 text-3xl font-semibold">Поставщики</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Создание, публикация и архивация поставщиков для публичного каталога.
        </p>
      </header>

      <AdminActionAlert params={params} />

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Новый поставщик</h2>
        <form action={createSupplier} className="mt-5 grid gap-5 lg:grid-cols-2">
          <HiddenRedirect value={currentPath} />
          <FormField htmlFor="supplier-title" label="Заголовок">
            <Input id="supplier-title" name="title" required minLength={2} maxLength={160} />
          </FormField>
          <FormField htmlFor="supplier-slug" label="Slug">
            <Input id="supplier-slug" name="slug" maxLength={180} placeholder="Если пусто, будет создан из заголовка" />
          </FormField>
          <FormField htmlFor="supplier-companyName" label="Компания">
            <Input id="supplier-companyName" name="companyName" required minLength={2} maxLength={180} />
          </FormField>
          <FormField htmlFor="supplier-websiteUrl" label="Сайт">
            <Input id="supplier-websiteUrl" name="websiteUrl" maxLength={240} type="url" />
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
          <FormField htmlFor="supplier-contactLabel" label="Контакт">
            <Input id="supplier-contactLabel" name="contactLabel" maxLength={160} />
          </FormField>
          <FormField htmlFor="supplier-serviceArea" label="Зона работы">
            <Input id="supplier-serviceArea" name="serviceArea" maxLength={180} />
          </FormField>
          <FormField htmlFor="supplier-isVerified" label="Проверен">
            <Select id="supplier-isVerified" name="isVerified" defaultValue="false">
              <option value="false">Нет</option>
              <option value="true">Да</option>
            </Select>
          </FormField>
          <CoverImageField id="supplier-coverImage" />
          <FormField htmlFor="supplier-status" label="Статус">
            <Select id="supplier-status" name="status" defaultValue={ContentStatus.DRAFT}>
              {Object.values(ContentStatus).map((status) => (
                <option key={status} value={status}>
                  {contentStatusLabels[status]}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="lg:col-span-2">
            <FormField htmlFor="supplier-summary" label="Краткое описание">
              <Textarea id="supplier-summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <FormField htmlFor="supplier-description" label="Описание">
              <Textarea id="supplier-description" name="description" required minLength={20} className="min-h-64" />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <Button type="submit">Создать поставщика</Button>
          </div>
        </form>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Поставщики</h2>
          <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
        </div>

        {suppliers.length === 0 ? (
          <EmptyState
            title="Поставщиков пока нет"
            description="Создайте первого поставщика, чтобы проверить рабочий процесс публикации."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
            <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-muted)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Поставщик</th>
                  <th className="px-4 py-3 font-semibold">Контекст</th>
                  <th className="px-4 py-3 font-semibold">Город</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 font-semibold">Обновлено</th>
                  <th className="px-4 py-3 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <Fragment key={supplier.id}>
                    <tr className="border-b border-[var(--line)]">
                      <td className="max-w-[320px] px-4 py-4 align-top">
                        <div className="font-semibold">{supplier.title}</div>
                        <div className="mt-1 truncate text-xs text-[var(--muted)]">/{supplier.slug}</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">{supplier.category?.name ?? 'Без категории'}</div>
                        {supplier.coverImage?.originalName ? (
                          <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {supplier.coverImage.originalName}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">
                        <div>{supplier.companyName}</div>
                        {supplier.isVerified ? <div className="mt-1 text-xs">Проверен</div> : null}
                        {supplier.serviceArea ? <div className="mt-1 text-xs">{supplier.serviceArea}</div> : null}
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">{supplier.city?.name ?? '-'}</td>
                      <td className="px-4 py-4 align-top">
                        <Badge variant={contentStatusBadgeVariants[supplier.status]}>{contentStatusLabels[supplier.status]}</Badge>
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">
                        <div>{dateFormatter.format(supplier.updatedAt)}</div>
                        {supplier.updatedBy?.email ? <div className="mt-1 text-xs">{supplier.updatedBy.email}</div> : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {supplier.status !== ContentStatus.PUBLISHED ? (
                            <form action={updateSupplierStatus}>
                              <HiddenRedirect value={currentPath} />
                              <input name="supplierId" type="hidden" value={supplier.id} />
                              <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
                              <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit">
                                Опубликовать
                              </Button>
                            </form>
                          ) : null}
                          {supplier.status !== ContentStatus.ARCHIVED ? (
                            <form action={updateSupplierStatus}>
                              <HiddenRedirect value={currentPath} />
                              <input name="supplierId" type="hidden" value={supplier.id} />
                              <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
                              <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="secondary">
                                В архив
                              </Button>
                            </form>
                          ) : null}
                          {supplier.status !== ContentStatus.PUBLISHED ? (
                            <form action={deleteSupplierDraft}>
                              <HiddenRedirect value={currentPath} />
                              <input name="supplierId" type="hidden" value={supplier.id} />
                              <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="ghost">
                                Удалить
                              </Button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--line)] last:border-0">
                      <td className="bg-[var(--surface-muted)] px-4 py-4" colSpan={6}>
                        <details>
                          <summary className="cursor-pointer text-sm font-semibold">Редактировать запись</summary>
                          <form action={updateSupplier} className="mt-5 grid gap-5 lg:grid-cols-2">
                            <HiddenRedirect value={currentPath} />
                            <input name="supplierId" type="hidden" value={supplier.id} />
                            <FormField htmlFor={`supplier-title-${supplier.id}`} label="Заголовок">
                              <Input
                                id={`supplier-title-${supplier.id}`}
                                name="title"
                                required
                                minLength={2}
                                maxLength={160}
                                defaultValue={supplier.title}
                              />
                            </FormField>
                            <FormField htmlFor={`supplier-slug-${supplier.id}`} label="Slug">
                              <Input id={`supplier-slug-${supplier.id}`} name="slug" maxLength={180} defaultValue={supplier.slug} />
                            </FormField>
                            <FormField htmlFor={`supplier-company-${supplier.id}`} label="Компания">
                              <Input
                                id={`supplier-company-${supplier.id}`}
                                name="companyName"
                                required
                                minLength={2}
                                maxLength={180}
                                defaultValue={supplier.companyName}
                              />
                            </FormField>
                            <FormField htmlFor={`supplier-website-${supplier.id}`} label="Сайт">
                              <Input id={`supplier-website-${supplier.id}`} name="websiteUrl" maxLength={240} type="url" defaultValue={supplier.websiteUrl ?? ''} />
                            </FormField>
                            <FormField htmlFor={`supplier-category-${supplier.id}`} label="Категория">
                              <Select id={`supplier-category-${supplier.id}`} name="categoryId" defaultValue={supplier.categoryId ?? ''}>
                                <option value="">Без категории</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <FormField htmlFor={`supplier-city-${supplier.id}`} label="Город">
                              <Select id={`supplier-city-${supplier.id}`} name="cityId" defaultValue={supplier.cityId ?? ''}>
                                <option value="">Без города</option>
                                {cities.map((city) => (
                                  <option key={city.id} value={city.id}>
                                    {city.name}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <FormField htmlFor={`supplier-contact-${supplier.id}`} label="Контакт">
                              <Input id={`supplier-contact-${supplier.id}`} name="contactLabel" maxLength={160} defaultValue={supplier.contactLabel ?? ''} />
                            </FormField>
                            <FormField htmlFor={`supplier-service-${supplier.id}`} label="Зона работы">
                              <Input id={`supplier-service-${supplier.id}`} name="serviceArea" maxLength={180} defaultValue={supplier.serviceArea ?? ''} />
                            </FormField>
                            <FormField htmlFor={`supplier-verified-${supplier.id}`} label="Проверен">
                              <Select id={`supplier-verified-${supplier.id}`} name="isVerified" defaultValue={String(supplier.isVerified)}>
                                <option value="false">Нет</option>
                                <option value="true">Да</option>
                              </Select>
                            </FormField>
                            <CoverImageField id={`supplier-cover-${supplier.id}`} currentName={supplier.coverImage?.originalName} />
                            <FormField htmlFor={`supplier-status-${supplier.id}`} label="Статус">
                              <Select id={`supplier-status-${supplier.id}`} name="status" defaultValue={supplier.status}>
                                {Object.values(ContentStatus).map((status) => (
                                  <option key={status} value={status}>
                                    {contentStatusLabels[status]}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <div className="lg:col-span-2">
                              <FormField htmlFor={`supplier-summary-${supplier.id}`} label="Краткое описание">
                                <Textarea
                                  id={`supplier-summary-${supplier.id}`}
                                  name="summary"
                                  required
                                  minLength={10}
                                  maxLength={500}
                                  defaultValue={supplier.summary}
                                />
                              </FormField>
                            </div>
                            <div className="lg:col-span-2">
                              <FormField htmlFor={`supplier-description-${supplier.id}`} label="Описание">
                                <Textarea
                                  id={`supplier-description-${supplier.id}`}
                                  name="description"
                                  required
                                  minLength={20}
                                  className="min-h-64"
                                  defaultValue={supplier.description}
                                />
                              </FormField>
                            </div>
                            <div className="lg:col-span-2">
                              <Button type="submit">Сохранить поставщика</Button>
                            </div>
                          </form>
                        </details>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination
          basePath={ADMIN_SUPPLIERS_PATH}
          page={page}
          pageSize={ADMIN_CONTENT_PAGE_SIZE}
          params={params}
          total={total}
          totalPages={totalPages}
        />
      </section>
    </div>
  );
}
