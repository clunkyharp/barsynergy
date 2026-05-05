import { CategoryType, ContentStatus, type Prisma } from '@prisma/client';
import { deleteArticleDraft, updateArticleStatus } from '@/app/admin/articles/actions';
import {
  AdminActionAlert,
  AdminListFilters,
  AdminPagination,
  HiddenRedirect
} from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import {
  AdminTable,
  AdminActionMenu,
  AdminActionMenuButton,
  AdminActionMenuContent,
  AdminActionMenuLink,
  AdminActionMenuTrigger,
  AdminTableActionsCell,
  AdminTableActionsHeaderCell,
  AdminTableBody,
  AdminTableCell,
  AdminTableClamp,
  AdminTableFrame,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow
} from '@/components/ui/admin-table';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  ADMIN_CONTENT_PAGE_SIZE,
  contentStatusBadgeVariants,
  contentStatusLabels,
  getAdminCurrentPath,
  getAdminPage,
  getAdminSearchQuery,
  getAdminStringFilter,
  getAdminStatusFilter,
  getAdminTotalPages,
  type AdminContentSearchParams
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_ARTICLES_PATH = '/admin/articles';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

type AdminArticlesPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  await requireAdminSectionAccess('articles');

  const params = (await searchParams) ?? {};
  const page = getAdminPage(params);
  const currentPath = getAdminCurrentPath(ADMIN_ARTICLES_PATH, params);
  const q = getAdminSearchQuery(params);
  const status = getAdminStatusFilter(params);
  const categoryId = getAdminStringFilter(params, 'categoryId');
  const cityId = getAdminStringFilter(params, 'cityId');
  const where: Prisma.ArticleWhereInput = {
    status,
    categoryId,
    cityId,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [total, articles, categories, cities] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * ADMIN_CONTENT_PAGE_SIZE,
      take: ADMIN_CONTENT_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        category: { select: { name: true } },
        city: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        tags: {
          where: { tag: { isActive: true, type: CategoryType.ARTICLE } },
          orderBy: { tag: { sortOrder: 'asc' } },
          select: { tag: { select: { name: true } } }
        },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.category.findMany({
      where: { type: CategoryType.ARTICLE, isActive: true },
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
      <AdminPageIntro
        action={<Button href="/admin/articles/create">Создать статью</Button>}
        description="Редакционные материалы, статусы публикации и переход в полное редактирование записи."
        eyebrow="Админка / Статьи"
        title="Статьи"
      />

      <AdminActionAlert params={params} />
      <AdminListFilters
        basePath={ADMIN_ARTICLES_PATH}
        filters={[
          { name: 'categoryId', label: 'Категория', allLabel: 'Все категории', options: categories.map((category) => ({ value: category.id, label: category.name })) },
          { name: 'cityId', label: 'Город', allLabel: 'Все города', options: cities.map((city) => ({ value: city.id, label: city.name })) }
        ]}
        params={params}
        searchPlaceholder="Поиск по названию, slug или описанию"
      />

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Статьи</h2>
            <p className="text-sm text-[var(--muted)]">Всего записей: {total}.</p>
          </div>
        </div>

        {articles.length === 0 ? (
          <EmptyState title="Статей пока нет" />
        ) : (
          <AdminTableFrame>
            <AdminTable minWidth={980}>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell>Материал</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Категория</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Город</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Статус</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Обновлено</AdminTableHeaderCell>
                  <AdminTableActionsHeaderCell>Действия</AdminTableActionsHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {articles.map((article) => (
                  <AdminTableRow key={article.id}>
                    <AdminTableCell className="max-w-[320px]">
                      <AdminTableClamp className="font-semibold">{article.title}</AdminTableClamp>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{article.slug}</div>
                      {article.tags.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {article.tags.slice(0, 3).map((entry) => (
                            <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-2 py-1 text-[11px] text-[var(--muted)]" key={entry.tag.name}>
                              {entry.tag.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {article.coverImage?.originalName ? (
                        <div className="mt-1 text-xs text-[var(--muted)]">Обложка: {article.coverImage.originalName}</div>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">{article.category?.name ?? '-'}</AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">{article.city?.name ?? '-'}</AdminTableCell>
                    <AdminTableCell>
                      <StatusBadge variant={contentStatusBadgeVariants[article.status]}>{contentStatusLabels[article.status]}</StatusBadge>
                    </AdminTableCell>
                    <AdminTableCell className="text-[var(--muted)]">
                      <div>{dateFormatter.format(article.updatedAt)}</div>
                      {article.updatedBy?.email ? <div className="mt-1 text-xs">{article.updatedBy.email}</div> : null}
                    </AdminTableCell>
                    <AdminTableActionsCell>
                      <div className="flex flex-wrap gap-2">
                        <Button className="min-h-9 px-3 py-1.5 text-xs" href={`${ADMIN_ARTICLES_PATH}/${article.id}`} variant="secondary">
                          Изменить
                        </Button>
                        <AdminActionMenu>
                          <AdminActionMenuTrigger />
                          <AdminActionMenuContent>
                            {article.status === ContentStatus.PUBLISHED ? (
                              <AdminActionMenuLink href={`/articles/${article.slug}`} target="_blank" rel="noreferrer">
                                Открыть публичную страницу
                              </AdminActionMenuLink>
                            ) : null}
                            {article.status !== ContentStatus.PUBLISHED ? (
                              <form action={updateArticleStatus}>
                                <HiddenRedirect value={currentPath} />
                                <input name="articleId" type="hidden" value={article.id} />
                                <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
                                <AdminActionMenuButton>Опубликовать</AdminActionMenuButton>
                              </form>
                            ) : null}
                            {article.status !== ContentStatus.ARCHIVED ? (
                              <form action={updateArticleStatus}>
                                <HiddenRedirect value={currentPath} />
                                <input name="articleId" type="hidden" value={article.id} />
                                <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
                                <AdminActionMenuButton>В архив</AdminActionMenuButton>
                              </form>
                            ) : null}
                            {article.status !== ContentStatus.PUBLISHED ? (
                              <form action={deleteArticleDraft}>
                                <HiddenRedirect value={currentPath} />
                                <input name="articleId" type="hidden" value={article.id} />
                                <AdminActionMenuButton tone="danger">Удалить</AdminActionMenuButton>
                              </form>
                            ) : null}
                          </AdminActionMenuContent>
                        </AdminActionMenu>
                      </div>
                    </AdminTableActionsCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          </AdminTableFrame>
        )}

        <AdminPagination
          basePath={ADMIN_ARTICLES_PATH}
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
