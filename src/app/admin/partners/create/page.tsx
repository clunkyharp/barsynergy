import { CategoryType } from '@/modules/admin/queries';
import { createPartner } from '@/app/admin/partners/actions';
import { AdminCmsActions, AdminCmsForm, AdminCmsGrid, AdminCmsSection } from '@/components/admin/admin-cms-form';
import { CoverImageField } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { partnerTypeOptions } from '@/lib/admin/content-utils';
import { getActiveCategories } from '@/lib/admin/admin-queries';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export const dynamic = 'force-dynamic';

export default async function AdminCreatePartnerPage() {
  await requireAdminSectionAccess('partners');

  const categories = await getActiveCategories(CategoryType.PARTNER);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Партнёры / Создание</p>
        <h1 className="mt-2 text-3xl font-semibold">Новый партнёр</h1>
      </header>

      <AdminCmsForm action={createPartner}>
        <AdminCmsSection title="Публикация" description="Категория партнёра.">
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

        <AdminCmsSection title="Тип сотрудничества" description="Тип партнёра и показ в подборке.">
          <AdminCmsGrid>
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
            <FormField htmlFor="partner-summary" label="Описание для карточки" hint="Показывается в каталоге. До 500 символов.">
              <Textarea id="partner-summary" name="summary" required minLength={10} maxLength={500} />
            </FormField>
            <FormField htmlFor="partner-description" label="Текст страницы" hint="Полное содержимое публичной страницы">
              <MarkdownEditor id="partner-description" name="description" required minLength={20} maxLength={100_000} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button type="submit">Создать партнёра</Button>
        </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
