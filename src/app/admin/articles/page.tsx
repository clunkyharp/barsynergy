import { CategoryType, ContentStatus } from '@prisma/client';
import { createArticle, deleteArticleDraft, updateArticleStatus } from '@/app/admin/articles/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusBadgeVariants, contentStatusLabels } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

export default async function AdminArticlesPage() {
  await requireAdminSectionAccess('articles');

  const [articles, categories, cities] = await Promise.all([
    prisma.article.findMany({
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } },
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

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Admin / Articles</p>
        <h1 className="mt-2 text-3xl font-semibold">Статьи</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Создание, публикация и архивация материалов для публичного раздела знаний.
        </p>
      </header>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Новая статья</h2>
        <form action={createArticle} className="mt-5 grid gap-5 lg:grid-cols-2">
          <FormField htmlFor="title" label="Заголовок">
            <Input id="title" name="title" required minLength={2} maxLength={160} />
          </FormField>
          <FormField htmlFor="slug" label="Slug">
            <Input id="slug" name="slug" maxLength={180} placeholder="Если пусто, будет создан из заголовка" />
          </FormField>
          <FormField htmlFor="categoryId" label="Категория">
            <Select id="categoryId" name="categoryId" defaultValue="">
              <option value="">Без категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="cityId" label="Город">
            <Select id="cityId" name="cityId" defaultValue="">
              <option value="">Без города</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="authorName" label="Автор">
            <Input id="authorName" name="authorName" maxLength={120} />
          </FormField>
          <FormField htmlFor="sourceLabel" label="Источник">
            <Input id="sourceLabel" name="sourceLabel" maxLength={160} />
          </FormField>
          <FormField htmlFor="readingTimeMinutes" label="Время чтения, минут">
            <Input id="readingTimeMinutes" name="readingTimeMinutes" min={1} max={240} type="number" />
          </FormField>
          <FormField htmlFor="status" label="Статус">
            <Select id="status" name="status" defaultValue={ContentStatus.DRAFT}>
              {Object.values(ContentStatus).map((status) => (
                <option key={status} value={status}>
                  {contentStatusLabels[status]}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="lg:col-span-2">
            <FormField htmlFor="summary" label="Краткое описание">
              <Textarea id="summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <FormField htmlFor="body" label="Текст">
              <Textarea id="body" name="body" required minLength={20} className="min-h-64" />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <Button type="submit">Создать статью</Button>
          </div>
        </form>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Материалы</h2>
            <p className="text-sm text-[var(--muted)]">Показаны последние 50 записей.</p>
          </div>
        </div>

        {articles.length === 0 ? (
          <EmptyState
            title="Статей пока нет"
            description="Создайте первый материал, чтобы проверить рабочий процесс публикации."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--surface)]">
            <table className="min-w-[980px] w-full border-collapse text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface-muted)] text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Материал</th>
                  <th className="px-4 py-3 font-semibold">Категория</th>
                  <th className="px-4 py-3 font-semibold">Город</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 font-semibold">Обновлено</th>
                  <th className="px-4 py-3 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="max-w-[320px] px-4 py-4 align-top">
                      <div className="font-semibold">{article.title}</div>
                      <div className="mt-1 truncate text-xs text-[var(--muted)]">/{article.slug}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-[var(--muted)]">{article.category?.name ?? '-'}</td>
                    <td className="px-4 py-4 align-top text-[var(--muted)]">{article.city?.name ?? '-'}</td>
                    <td className="px-4 py-4 align-top">
                      <Badge variant={contentStatusBadgeVariants[article.status]}>{contentStatusLabels[article.status]}</Badge>
                    </td>
                    <td className="px-4 py-4 align-top text-[var(--muted)]">
                      <div>{dateFormatter.format(article.updatedAt)}</div>
                      {article.updatedBy?.email ? <div className="mt-1 text-xs">{article.updatedBy.email}</div> : null}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {article.status !== ContentStatus.PUBLISHED ? (
                          <form action={updateArticleStatus}>
                            <input name="articleId" type="hidden" value={article.id} />
                            <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit">
                              Опубликовать
                            </Button>
                          </form>
                        ) : null}
                        {article.status !== ContentStatus.ARCHIVED ? (
                          <form action={updateArticleStatus}>
                            <input name="articleId" type="hidden" value={article.id} />
                            <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="secondary">
                              В архив
                            </Button>
                          </form>
                        ) : null}
                        {article.status !== ContentStatus.PUBLISHED ? (
                          <form action={deleteArticleDraft}>
                            <input name="articleId" type="hidden" value={article.id} />
                            <Button className="min-h-9 px-3 py-1.5 text-xs" type="submit" variant="ghost">
                              Удалить
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
