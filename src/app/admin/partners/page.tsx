import { Fragment } from 'react';
import { CategoryType, ContentStatus } from '@prisma/client';
import { createPartner, deletePartnerDraft, updatePartner, updatePartnerStatus } from '@/app/admin/partners/actions';
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

const ADMIN_PARTNERS_PATH = '/admin/partners';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

type AdminPartnersPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminPartnersPage({ searchParams }: AdminPartnersPageProps) {
  await requireAdminSectionAccess('partners');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_PARTNERS_PATH, params);

  const [total, partners, categories] = await Promise.all([
    prisma.partner.count(),
    prisma.partner.findMany({
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * ADMIN_CONTENT_PAGE_SIZE,
      take: ADMIN_CONTENT_PAGE_SIZE,
      include: {
        category: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.category.findMany({
      where: { type: CategoryType.PARTNER, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    })
  ]);
  const totalPages = getAdminTotalPages(total);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Партнеры</p>
        <h1 className="mt-2 text-3xl font-semibold">Партнеры</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Создание, публикация и архивация партнеров для публичного раздела.
        </p>
      </header>

      <AdminActionAlert params={params} />

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Новый партнер</h2>
        <form action={createPartner} className="mt-5 grid gap-5 lg:grid-cols-2">
          <HiddenRedirect value={currentPath} />
          <FormField htmlFor="partner-title" label="Заголовок">
            <Input id="partner-title" name="title" required minLength={2} maxLength={160} />
          </FormField>
          <FormField htmlFor="partner-slug" label="Адрес страницы">
            <Input id="partner-slug" name="slug" maxLength={180} placeholder="Если пусто, будет создан из заголовка" />
          </FormField>
          <FormField htmlFor="partner-companyName" label="Компания">
            <Input id="partner-companyName" name="companyName" required minLength={2} maxLength={180} />
          </FormField>
          <FormField htmlFor="partner-websiteUrl" label="Сайт">
            <Input id="partner-websiteUrl" name="websiteUrl" maxLength={240} type="url" />
          </FormField>
          <FormField htmlFor="partner-categoryId" label="Категория">
            <Select id="partner-categoryId" name="categoryId" defaultValue="">
              <option value="">Без категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="partner-partnerType" label="Тип партнера">
            <Input id="partner-partnerType" name="partnerType" maxLength={120} />
          </FormField>
          <FormField htmlFor="partner-isFeatured" label="В подборке">
            <Select id="partner-isFeatured" name="isFeatured" defaultValue="false">
              <option value="false">Нет</option>
              <option value="true">Да</option>
            </Select>
          </FormField>
          <CoverImageField id="partner-coverImage" />
          <FormField htmlFor="partner-status" label="Статус">
            <Select id="partner-status" name="status" defaultValue={ContentStatus.DRAFT}>
              {Object.values(ContentStatus).map((status) => (
                <option key={status} value={status}>
                  {contentStatusLabels[status]}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="lg:col-span-2">
            <FormField htmlFor="partner-summary" label="Краткое описание">
              <Textarea id="partner-summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <FormField htmlFor="partner-description" label="Описание">
              <Textarea id="partner-description" name="description" required minLength={20} className="min-h-64" />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <Button type="submit">Создать партнера</Button>
          </div>
        </form>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Партнеры</h2>
          <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
        </div>

        {partners.length === 0 ? (
          <EmptyState
            title="Партнеров пока нет"
            description="Создайте первого партнера, чтобы проверить рабочий процесс публикации."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
            <table className="min-w-[980px] w-full border-collapse text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-muted)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Партнер</th>
                  <th className="px-4 py-3 font-semibold">Контекст</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 font-semibold">Обновлено</th>
                  <th className="px-4 py-3 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <Fragment key={partner.id}>
                    <tr className="border-b border-[var(--line)]">
                      <td className="max-w-[320px] px-4 py-4 align-top">
                        <div className="font-semibold">{partner.title}</div>
                        <div className="mt-1 truncate text-xs text-[var(--muted)]">/{partner.slug}</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">{partner.category?.name ?? 'Без категории'}</div>
                        {partner.coverImage?.originalName ? (
                          <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {partner.coverImage.originalName}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">
                        <div>{partner.companyName}</div>
                        {partner.partnerType ? <div className="mt-1 text-xs">{partner.partnerType}</div> : null}
                        {partner.isFeatured ? <div className="mt-1 text-xs">В подборке</div> : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Badge variant={contentStatusBadgeVariants[partner.status]}>{contentStatusLabels[partner.status]}</Badge>
                      </td>
                      <td className="px-4 py-4 align-top text-[var(--muted)]">
                        <div>{dateFormatter.format(partner.updatedAt)}</div>
                        {partner.updatedBy?.email ? <div className="mt-1 text-xs">{partner.updatedBy.email}</div> : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {partner.status !== ContentStatus.PUBLISHED ? (
                            <form action={updatePartnerStatus}>
                              <HiddenRedirect value={currentPath} />
                              <input name="partnerId" type="hidden" value={partner.id} />
                              <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
                              <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit">
                                Опубликовать
                              </Button>
                            </form>
                          ) : null}
                          {partner.status !== ContentStatus.ARCHIVED ? (
                            <form action={updatePartnerStatus}>
                              <HiddenRedirect value={currentPath} />
                              <input name="partnerId" type="hidden" value={partner.id} />
                              <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
                              <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="secondary">
                                В архив
                              </Button>
                            </form>
                          ) : null}
                          {partner.status !== ContentStatus.PUBLISHED ? (
                            <form action={deletePartnerDraft}>
                              <HiddenRedirect value={currentPath} />
                              <input name="partnerId" type="hidden" value={partner.id} />
                              <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="ghost">
                                Удалить
                              </Button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--line)] last:border-0">
                      <td className="bg-[var(--surface-muted)] px-4 py-4" colSpan={5}>
                        <details>
                          <summary className="cursor-pointer text-sm font-semibold">Редактировать запись</summary>
                          <form action={updatePartner} className="mt-5 grid gap-5 lg:grid-cols-2">
                            <HiddenRedirect value={currentPath} />
                            <input name="partnerId" type="hidden" value={partner.id} />
                            <FormField htmlFor={`partner-title-${partner.id}`} label="Заголовок">
                              <Input
                                id={`partner-title-${partner.id}`}
                                name="title"
                                required
                                minLength={2}
                                maxLength={160}
                                defaultValue={partner.title}
                              />
                            </FormField>
                            <FormField htmlFor={`partner-slug-${partner.id}`} label="Адрес страницы">
                              <Input id={`partner-slug-${partner.id}`} name="slug" maxLength={180} defaultValue={partner.slug} />
                            </FormField>
                            <FormField htmlFor={`partner-company-${partner.id}`} label="Компания">
                              <Input
                                id={`partner-company-${partner.id}`}
                                name="companyName"
                                required
                                minLength={2}
                                maxLength={180}
                                defaultValue={partner.companyName}
                              />
                            </FormField>
                            <FormField htmlFor={`partner-website-${partner.id}`} label="Сайт">
                              <Input id={`partner-website-${partner.id}`} name="websiteUrl" maxLength={240} type="url" defaultValue={partner.websiteUrl ?? ''} />
                            </FormField>
                            <FormField htmlFor={`partner-category-${partner.id}`} label="Категория">
                              <Select id={`partner-category-${partner.id}`} name="categoryId" defaultValue={partner.categoryId ?? ''}>
                                <option value="">Без категории</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <FormField htmlFor={`partner-type-${partner.id}`} label="Тип партнера">
                              <Input id={`partner-type-${partner.id}`} name="partnerType" maxLength={120} defaultValue={partner.partnerType ?? ''} />
                            </FormField>
                            <FormField htmlFor={`partner-featured-${partner.id}`} label="В подборке">
                              <Select id={`partner-featured-${partner.id}`} name="isFeatured" defaultValue={String(partner.isFeatured)}>
                                <option value="false">Нет</option>
                                <option value="true">Да</option>
                              </Select>
                            </FormField>
                            <CoverImageField id={`partner-cover-${partner.id}`} currentName={partner.coverImage?.originalName} />
                            <FormField htmlFor={`partner-status-${partner.id}`} label="Статус">
                              <Select id={`partner-status-${partner.id}`} name="status" defaultValue={partner.status}>
                                {Object.values(ContentStatus).map((status) => (
                                  <option key={status} value={status}>
                                    {contentStatusLabels[status]}
                                  </option>
                                ))}
                              </Select>
                            </FormField>
                            <div className="lg:col-span-2">
                              <FormField htmlFor={`partner-summary-${partner.id}`} label="Краткое описание">
                                <Textarea
                                  id={`partner-summary-${partner.id}`}
                                  name="summary"
                                  required
                                  minLength={10}
                                  maxLength={500}
                                  defaultValue={partner.summary}
                                />
                              </FormField>
                            </div>
                            <div className="lg:col-span-2">
                              <FormField htmlFor={`partner-description-${partner.id}`} label="Описание">
                                <Textarea
                                  id={`partner-description-${partner.id}`}
                                  name="description"
                                  required
                                  minLength={20}
                                  className="min-h-64"
                                  defaultValue={partner.description}
                                />
                              </FormField>
                            </div>
                            <div className="lg:col-span-2">
                              <Button type="submit">Сохранить партнера</Button>
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
          basePath={ADMIN_PARTNERS_PATH}
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
