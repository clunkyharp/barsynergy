import { CategoryType, ContentStatus } from '@/modules/admin/queries';
import { createPartner } from '@/app/admin/partners/actions';
import { AdminCmsActions, AdminCmsForm, AdminCmsGrid, AdminCmsSection } from '@/components/admin/admin-cms-form';
import { CoverImageField } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PUBLICATION_STATUS_HINT, contentStatusLabels, partnerTypeOptions } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/modules/admin/queries';

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

      <AdminCmsForm action={createPartner}>
        <AdminCmsSection title="Публикация" description="Заголовок, адрес страницы и публикационный статус партнёра.">
          <AdminCmsGrid>
            <FormField htmlFor="partner-title" label="Заголовок">
              <Input id="partner-title" name="title" required minLength={2} maxLength={160} />
            </FormField>
            <FormField htmlFor="partner-slug" label="Адрес страницы">
              <Input id="partner-slug" name="slug" maxLength={180} placeholder="Если пусто, будет создан из заголовка" />
            </FormField>
            <FormField htmlFor="partner-status" label="Статус" hint={PUBLICATION_STATUS_HINT}>
              <Select id="partner-status" name="status" defaultValue={ContentStatus.DRAFT}>
                {Object.values(ContentStatus).map((status) => (
                  <option key={status} value={status}>
                    {contentStatusLabels[status]}
                  </option>
                ))}
              </Select>
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Компания" description="Название компании и публичная ссылка.">
          <AdminCmsGrid>
            <FormField htmlFor="partner-companyName" label="Компания">
              <Input id="partner-companyName" name="companyName" required minLength={2} maxLength={180} />
            </FormField>
            <FormField htmlFor="partner-websiteUrl" label="Сайт">
              <Input id="partner-websiteUrl" name="websiteUrl" maxLength={240} type="url" />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Тип сотрудничества" description="Категория, тип партнёра и показ в подборке партнёров.">
          <AdminCmsGrid>
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
            <FormField htmlFor="partner-isFeatured" label="Показывать в подборке партнёров" hint="Эта подборка используется на публичных блоках партнёров и главной страницы.">
              <Select id="partner-isFeatured" name="isFeatured" defaultValue="false">
                <option value="false">Нет</option>
                <option value="true">Да</option>
              </Select>
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Медиа" description="Обложка партнёра для каталога и публичной страницы.">
          <AdminCmsGrid>
            <CoverImageField id="partner-coverImage" />
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контент" description="Краткое описание и полный текст карточки партнёра.">
          <div className="grid gap-4">
            <FormField htmlFor="partner-summary" label="Краткое описание">
              <Textarea id="partner-summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
            <FormField htmlFor="partner-description" label="Описание">
              <Textarea id="partner-description" name="description" required minLength={20} className="min-h-64" />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button type="button" variant="secondary" href="/admin/partners">
            Отмена
          </Button>
          <Button type="submit">Создать партнёра</Button>
        </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
