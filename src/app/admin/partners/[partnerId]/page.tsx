import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@/modules/admin/queries';
import { deletePartnerDraft, updatePartner, updatePartnerStatus } from '@/app/admin/partners/actions';
import { AdminCmsActions, AdminCmsAdvancedSection, AdminCmsForm, AdminCmsGrid, AdminCmsSection, AdminCmsSummary } from '@/components/admin/admin-cms-form';
import { AdminContentVisibilityPanel, CoverImageField } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { ConfirmSubmitButton } from '@/components/ui/confirm-submit-button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import {
  contentStatusLabels,
  getAdminOptionLabel,
  partnerTypeOptions,
  withCurrentValueOption
} from '@/lib/admin/content-utils';
import { getActiveCategories, getPartnerById } from '@/lib/admin/admin-queries';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export const dynamic = 'force-dynamic';

const ADMIN_PARTNERS_PATH = '/admin/partners';

type AdminEditPartnerPageProps = {
  params: Promise<{ partnerId: string }>;
};

export default async function AdminEditPartnerPage({ params }: AdminEditPartnerPageProps) {
  await requireAdminSectionAccess('partners');
  const { partnerId } = await params;

  const [partner, categories] = await Promise.all([
    getPartnerById(partnerId),
    getActiveCategories(CategoryType.PARTNER)
  ]);

  if (!partner) {
    notFound();
  }
  const currentPath = `${ADMIN_PARTNERS_PATH}/${partner.id}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">Админка / Партнёр / Редактирование</p>
          <h1 className="mt-2 text-3xl font-semibold">{partner.title}</h1>
        </div>
        <Button href={ADMIN_PARTNERS_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <AdminContentVisibilityPanel
        currentPath={currentPath}
        idName="partnerId"
        idValue={partner.id}
        publicHref={`/partners/${partner.slug}`}
        status={partner.status}
        updateStatusAction={updatePartnerStatus}
      />

      <AdminCmsForm action={updatePartner}>
        <input name="partnerId" type="hidden" value={partner.id} />
        <AdminCmsSummary
          items={[
            { label: 'Статус', value: contentStatusLabels[partner.status] },
            { label: 'Компания', value: partner.companyName },
            { label: 'Тип', value: getAdminOptionLabel(partnerTypeOptions, partner.partnerType) },
            { label: 'Подборка', value: partner.isFeatured ? 'Показывать' : 'Не показывать' }
          ]}
        />

        <AdminCmsSection title="Публикация" description="Категория и тип партнёра.">
          <AdminCmsGrid>
            <FormField htmlFor="partner-categoryId" label="Категория">
              <Select id="partner-categoryId" name="categoryId" defaultValue={partner.categoryId ?? ''}>
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

        <AdminCmsAdvancedSection title="Технические настройки" description="Адрес страницы. Изменение сломает существующие ссылки.">
          <AdminCmsGrid>
            <FormField htmlFor="partner-slug" label="Адрес страницы">
              <Input id="partner-slug" name="slug" readOnly defaultValue={partner.slug} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsAdvancedSection>

        <AdminCmsSection title="Компания" description="Название компании и публичная ссылка.">
          <AdminCmsGrid>
            <FormField htmlFor="partner-companyName" label="Компания">
              <Input id="partner-companyName" name="companyName" required minLength={2} maxLength={180} defaultValue={partner.companyName} />
            </FormField>
            <FormField htmlFor="partner-websiteUrl" label="Сайт">
              <Input id="partner-websiteUrl" name="websiteUrl" maxLength={240} type="url" defaultValue={partner.websiteUrl ?? ''} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Тип сотрудничества" description="Тип партнёра и показ в подборке.">
          <AdminCmsGrid>
            <FormField htmlFor="partner-partnerType" label="Тип партнёра">
              <Select id="partner-partnerType" name="partnerType" defaultValue={partner.partnerType ?? ''}>
                <option value="">Не указан</option>
                {withCurrentValueOption([...partnerTypeOptions], partner.partnerType).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="partner-isFeatured" label="Показывать в подборке партнёров" hint="Эта подборка используется на публичных блоках партнёров и главной страницы.">
              <Select id="partner-isFeatured" name="isFeatured" defaultValue={String(partner.isFeatured)}>
                <option value="false">Нет</option>
                <option value="true">Да</option>
              </Select>
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Медиа" description="Обложка партнёра для каталога и публичной страницы.">
          <AdminCmsGrid>
            <CoverImageField id="partner-coverImage" currentName={partner.coverImage?.originalName} currentAlt={partner.coverImageAlt} />
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контент" description="Краткое описание и полный текст карточки партнёра.">
          <div className="grid gap-4">
            <FormField htmlFor="partner-summary" label="Описание для карточки" hint="Показывается в каталоге. До 500 символов.">
              <Textarea id="partner-summary" name="summary" required minLength={10} maxLength={500} defaultValue={partner.summary} />
            </FormField>
            <FormField htmlFor="partner-description" label="Текст страницы" hint="Полное содержимое публичной страницы">
              <MarkdownEditor id="partner-description" name="description" required minLength={20} maxLength={100_000} defaultValue={partner.description} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button type="submit">Сохранить изменения</Button>
        </AdminCmsActions>
      </AdminCmsForm>

      {partner.status === ContentStatus.DRAFT ? (
        <form action={deletePartnerDraft}>
          <input name="partnerId" type="hidden" value={partner.id} />
          <ConfirmSubmitButton
            confirmActionLabel="Удалить"
            confirmText="Это действие нельзя отменить."
            confirmTitle="Удалить черновик?"
            type="submit"
            variant="ghost"
          >
            Удалить черновик
          </ConfirmSubmitButton>
        </form>
      ) : null}
    </div>
  );
}
