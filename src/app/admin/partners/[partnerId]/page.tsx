import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@prisma/client';
import { updatePartner, updatePartnerStatus } from '@/app/admin/partners/actions';
import { AdminCmsActions, AdminCmsForm, AdminCmsGrid, AdminCmsSection, AdminCmsSummary } from '@/components/admin/admin-cms-form';
import { AdminContentVisibilityPanel, CoverImageField } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  PUBLICATION_STATUS_HINT,
  contentStatusLabels,
  getAdminOptionLabel,
  partnerTypeOptions,
  withCurrentValueOption
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_PARTNERS_PATH = '/admin/partners';

type AdminEditPartnerPageProps = {
  params: Promise<{ partnerId: string }>;
};

export default async function AdminEditPartnerPage({ params }: AdminEditPartnerPageProps) {
  await requireAdminSectionAccess('partners');
  const { partnerId } = await params;

  const [partner, categories] = await Promise.all([
    prisma.partner.findUnique({
      where: { id: partnerId },
      include: { coverImage: { select: { originalName: true } } }
    }),
    prisma.category.findMany({
      where: { type: CategoryType.PARTNER, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    })
  ]);

  if (!partner) {
    notFound();
  }
  const currentPath = `${ADMIN_PARTNERS_PATH}/${partner.id}`;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Партнёры / Редактирование</p>
        <h1 className="mt-2 text-3xl font-semibold">{partner.title}</h1>
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

        <AdminCmsSection title="Публикация" description="Заголовок, адрес страницы и публикационный статус партнёра.">
          <AdminCmsGrid>
            <FormField htmlFor="partner-title" label="Заголовок">
              <Input id="partner-title" name="title" required minLength={2} maxLength={160} defaultValue={partner.title} />
            </FormField>
            <FormField htmlFor="partner-slug" label="Адрес страницы">
              <Input id="partner-slug" name="slug" maxLength={180} defaultValue={partner.slug} />
            </FormField>
            <FormField htmlFor="partner-status" label="Статус" hint={PUBLICATION_STATUS_HINT}>
              <Select id="partner-status" name="status" defaultValue={partner.status}>
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
              <Input id="partner-companyName" name="companyName" required minLength={2} maxLength={180} defaultValue={partner.companyName} />
            </FormField>
            <FormField htmlFor="partner-websiteUrl" label="Сайт">
              <Input id="partner-websiteUrl" name="websiteUrl" maxLength={240} type="url" defaultValue={partner.websiteUrl ?? ''} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Тип сотрудничества" description="Категория, тип партнёра и показ в подборке партнёров.">
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
            <FormField htmlFor="partner-summary" label="Краткое описание">
              <Textarea id="partner-summary" name="summary" required minLength={10} maxLength={500} defaultValue={partner.summary} />
            </FormField>
            <FormField htmlFor="partner-description" label="Описание">
              <Textarea id="partner-description" name="description" required minLength={20} className="min-h-64" defaultValue={partner.description} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button type="button" variant="secondary" href={ADMIN_PARTNERS_PATH}>
            Отмена
          </Button>
          <Button type="submit">Сохранить изменения</Button>
        </AdminCmsActions>
      </AdminCmsForm>
    </div>
  );
}
