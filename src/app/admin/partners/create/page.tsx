import { CategoryType, ContentStatus } from '@prisma/client';
import { createPartner } from '@/app/admin/partners/actions';
import { CoverImageField } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusLabels, partnerTypeOptions } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminCreatePartnerPage() {
  await requireAdminSectionAccess('partners');

  const categories = await prisma.category.findMany({
    where: { type: CategoryType.PARTNER, isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true }
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Партнёры / Создание</p>
        <h1 className="mt-2 text-3xl font-semibold">Новый партнёр</h1>
      </header>

      <Card className="p-5">
        <form action={createPartner} className="grid gap-5 lg:grid-cols-2">
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
          <FormField htmlFor="partner-partnerType" label="Тип партнёра">
            <Select id="partner-partnerType" name="partnerType" defaultValue="">
              <option value="">Не указан</option>
              {partnerTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
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
          <div className="lg:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" href="/admin/partners">
              Отмена
            </Button>
            <Button type="submit">Создать партнёра</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
