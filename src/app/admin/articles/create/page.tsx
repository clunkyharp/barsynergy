import { CategoryType, ContentStatus } from '@prisma/client';
import { createArticle } from '@/app/admin/articles/actions';
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

const ADMIN_ARTICLES_PATH = '/admin/articles';
const ARTICLE_BODY_MAX_LENGTH = 20_000;

export default async function AdminArticlesCreatePage() {
  await requireAdminSectionAccess('articles');

  const [categories, cities] = await Promise.all([
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
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Статьи / Создание</p>
          <h1 className="mt-2 text-3xl font-semibold">Новая статья</h1>
        </div>
        <Button href={ADMIN_ARTICLES_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <Card className="p-5">
        <form action={createArticle} className="grid gap-8">
          <HiddenRedirect value={ADMIN_ARTICLES_PATH} />
          
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Основная информация</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <FormField htmlFor="title" label="Заголовок">
                <Input id="title" name="title" required minLength={2} maxLength={160} />
              </FormField>
              <FormField htmlFor="slug" label="Адрес страницы">
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
              <FormField htmlFor="status" label="Статус">
                <Select id="status" name="status" defaultValue={ContentStatus.DRAFT}>
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
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Дополнительные поля</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <FormField htmlFor="authorName" label="Автор">
                <Input id="authorName" name="authorName" maxLength={120} />
              </FormField>
              <FormField htmlFor="sourceLabel" label="Источник">
                <Input id="sourceLabel" name="sourceLabel" maxLength={160} />
              </FormField>
              <FormField htmlFor="readingTimeMinutes" label="Время чтения, минут">
                <Input id="readingTimeMinutes" name="readingTimeMinutes" min={1} max={240} type="number" />
              </FormField>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Медиа и контент</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <CoverImageField id="article-coverImage" />
              <div className="lg:col-span-2">
                <FormField htmlFor="summary" label="Краткое описание">
                  <Textarea id="summary" name="summary" required minLength={10} maxLength={500} />
                </FormField>
              </div>
              <div className="lg:col-span-2">
                <FormField htmlFor="body" label="Текст">
                  <Textarea id="body" name="body" required minLength={20} maxLength={ARTICLE_BODY_MAX_LENGTH} className="min-h-64" />
                </FormField>
              </div>
            </div>
          </section>

          <div>
            <Button type="submit">Создать статью</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
