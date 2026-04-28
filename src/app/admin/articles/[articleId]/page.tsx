import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@prisma/client';
import { deleteArticleDraft, updateArticle } from '@/app/admin/articles/actions';
import { AdminActionAlert, CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusLabels, type AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

const ADMIN_ARTICLES_PATH = '/admin/articles';
const ARTICLE_BODY_MAX_LENGTH = 20_000;

type AdminArticleDetailPageProps = {
  params: Promise<{ articleId: string }>;
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminArticleDetailPage({ params, searchParams }: AdminArticleDetailPageProps) {
  await requireAdminSectionAccess('articles');

  const { articleId } = await params;
  const currentPath = `${ADMIN_ARTICLES_PATH}/${articleId}`;
  const query = (await searchParams) ?? {};
  const [article, categories, cities] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
      include: {
        coverImage: { select: { originalName: true } }
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

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Статьи</p>
          <h1 className="mt-2 text-3xl font-semibold">{article.title}</h1>
          <p className="mt-2 max-w-2xl text-[var(--muted)]">Полное редактирование статьи вынесено из списка, чтобы длинный текст не рендерился внутри таблицы.</p>
        </div>
        <Button href={ADMIN_ARTICLES_PATH} variant="ghost">
          Назад к списку
        </Button>
      </header>

      <AdminActionAlert params={query} />

      <Card className="p-5">
        <form action={updateArticle} className="grid gap-5 lg:grid-cols-2">
          <HiddenRedirect value={currentPath} />
          <input name="articleId" type="hidden" value={article.id} />
          <FormField htmlFor="article-title" label="Заголовок">
            <Input id="article-title" name="title" required minLength={2} maxLength={160} defaultValue={article.title} />
          </FormField>
          <FormField htmlFor="article-slug" label="Адрес страницы">
            <Input id="article-slug" name="slug" maxLength={180} defaultValue={article.slug} />
          </FormField>
          <FormField htmlFor="article-categoryId" label="Категория">
            <Select id="article-categoryId" name="categoryId" defaultValue={article.categoryId ?? ''}>
              <option value="">Без категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="article-cityId" label="Город">
            <Select id="article-cityId" name="cityId" defaultValue={article.cityId ?? ''}>
              <option value="">Без города</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="article-authorName" label="Автор">
            <Input id="article-authorName" name="authorName" maxLength={120} defaultValue={article.authorName ?? ''} />
          </FormField>
          <FormField htmlFor="article-sourceLabel" label="Источник">
            <Input id="article-sourceLabel" name="sourceLabel" maxLength={160} defaultValue={article.sourceLabel ?? ''} />
          </FormField>
          <FormField htmlFor="article-readingTimeMinutes" label="Время чтения, минут">
            <Input
              id="article-readingTimeMinutes"
              name="readingTimeMinutes"
              min={1}
              max={240}
              type="number"
              defaultValue={article.readingTimeMinutes ?? ''}
            />
          </FormField>
          <CoverImageField id="article-coverImage" currentName={article.coverImage?.originalName} />
          <FormField htmlFor="article-status" label="Статус">
            <Select id="article-status" name="status" defaultValue={article.status}>
              {Object.values(ContentStatus).map((status) => (
                <option key={status} value={status}>
                  {contentStatusLabels[status]}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="lg:col-span-2">
            <FormField htmlFor="article-summary" label="Краткое описание">
              <Textarea id="article-summary" name="summary" required minLength={10} maxLength={500} defaultValue={article.summary} />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <FormField htmlFor="article-body" label="Текст">
              <Textarea
                id="article-body"
                name="body"
                required
                minLength={20}
                maxLength={ARTICLE_BODY_MAX_LENGTH}
                className="min-h-80"
                defaultValue={article.body}
              />
            </FormField>
          </div>
          <div className="lg:col-span-2">
            <Button type="submit">Сохранить статью</Button>
          </div>
        </form>
      </Card>

      {article.status !== ContentStatus.PUBLISHED ? (
        <form action={deleteArticleDraft}>
          <input name="articleId" type="hidden" value={article.id} />
          <Button type="submit" variant="ghost">
            Удалить черновик
          </Button>
        </form>
      ) : null}
    </div>
  );
}
