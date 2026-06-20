import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@/modules/admin/queries';
import { deleteMasterDraft, updateMasterAction, updateMasterStatus } from '@/app/admin/masters/actions';
import { AdminCmsActions, AdminCmsAdvancedSection, AdminCmsForm, AdminCmsGrid, AdminCmsSection, AdminCmsSummary } from '@/components/admin/admin-cms-form';
import { AdminContentVisibilityPanel, CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { EntityTypeFormSection } from '@/components/admin/masters/entity-type-form-section';
import { Button } from '@/components/ui/button';
import { ConfirmSubmitButton } from '@/components/ui/confirm-submit-button';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusLabels } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { getMasterById, getActiveCategories, getActiveCities } from '@/lib/admin/admin-queries';

export const dynamic = 'force-dynamic';

const ADMIN_MASTERS_PATH = '/admin/masters';

type AdminMasterEditPageProps = {
  params: Promise<{ masterId: string }>;
};

export default async function AdminMasterEditPage({ params }: AdminMasterEditPageProps) {
  await requireAdminSectionAccess('masters');
  const { masterId } = await params;

  const [master, categories, cities] = await Promise.all([
    getMasterById(masterId),
    getActiveCategories(CategoryType.MASTER),
    getActiveCities()
  ]);

  if (!master) {
    notFound();
  }

  const cityName = cities.find((city) => city.id === master.cityId)?.name ?? 'Город не указан';
  const entityLabel = master.entityType === 'INDIVIDUAL' ? 'Физ. лицо' : 'Компания';
  const nameDisplay = master.fullName ?? master.companyName ?? '—';
  const currentPath = `${ADMIN_MASTERS_PATH}/${master.id}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">Админка / Мастер / Редактирование</p>
          <h1 className="mt-2 text-3xl font-semibold">{master.title}</h1>
        </div>
        <Button href={ADMIN_MASTERS_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <AdminContentVisibilityPanel
        currentPath={currentPath}
        idName="masterId"
        idValue={master.id}
        publicHref={`/masters/${master.slug}`}
        status={master.status}
        updateStatusAction={updateMasterStatus}
      />

      <AdminCmsForm action={updateMasterAction}>
        <HiddenRedirect value={ADMIN_MASTERS_PATH} />
        <input name="masterId" type="hidden" value={master.id} />
        <AdminCmsSummary
          items={[
            { label: 'Статус', value: contentStatusLabels[master.status] },
            { label: 'Тип', value: entityLabel },
            { label: 'Имя / Компания', value: nameDisplay },
            { label: 'Город', value: cityName },
            { label: 'Проверка', value: master.isVerified ? 'Проверен' : 'Не проверен' }
          ]}
        />

        <EntityTypeFormSection
          defaultType={master.entityType as 'INDIVIDUAL' | 'BUSINESS'}
          defaultFullName={master.fullName ?? ''}
          defaultCompanyName={master.companyName ?? ''}
        >
          <AdminCmsGrid>
            <FormField htmlFor="master-categoryId" label="Категория">
              <Select id="master-categoryId" name="categoryId" defaultValue={master.categoryId ?? ''}>
                <option value="">Без категории</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </AdminCmsGrid>
        </EntityTypeFormSection>

        <AdminCmsAdvancedSection title="Технические настройки" description="Адрес страницы. Изменение сломает существующие ссылки.">
          <AdminCmsGrid>
            <FormField htmlFor="master-slug" label="Адрес страницы">
              <Input id="master-slug" name="slug" readOnly defaultValue={master.slug} />
            </FormField>
            <FormField htmlFor="master-sortOrder" label="Порядок сортировки" hint="Меньше = выше в списке.">
              <Input id="master-sortOrder" name="sortOrder" type="number" min={0} defaultValue={String(master.sortOrder)} />
            </FormField>
            <CheckboxField name="isVerified" value="true" defaultChecked={master.isVerified}>
              Мастер проверен
            </CheckboxField>
          </AdminCmsGrid>
        </AdminCmsAdvancedSection>

        <AdminCmsSection title="Контакты" description="Способ связи с мастером.">
          <AdminCmsGrid>
            <FormField htmlFor="master-contactLabel" label="Контактное лицо" hint="Только имя. Telegram/email — в полях ниже.">
              <Input id="master-contactLabel" name="contactLabel" maxLength={120} defaultValue={master.contactLabel ?? ''} />
            </FormField>
            <FormField htmlFor="master-contactTelegram" label="Telegram">
              <Input id="master-contactTelegram" name="contactTelegram" maxLength={120} defaultValue={master.contactTelegram ?? ''} />
            </FormField>
            <FormField htmlFor="master-contactPhone" label="Телефон">
              <Input id="master-contactPhone" name="contactPhone" maxLength={60} type="tel" defaultValue={master.contactPhone ?? ''} />
            </FormField>
            <FormField htmlFor="master-contactEmail" label="Email">
              <Input id="master-contactEmail" name="contactEmail" maxLength={180} type="email" defaultValue={master.contactEmail ?? ''} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="География" description="Город и зона работы мастера.">
          <AdminCmsGrid>
            <FormField htmlFor="master-cityId" label="Город">
              <Select id="master-cityId" name="cityId" defaultValue={master.cityId ?? ''}>
                <option value="">Без города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="master-serviceArea" label="Зона работы" hint="Например: СКФО, Краснодарский край, вся Россия">
              <Input id="master-serviceArea" name="serviceArea" maxLength={180} defaultValue={master.serviceArea ?? ''} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Профессиональные данные" description="Специализации, опыт и ставка.">
          <AdminCmsGrid>
            <FormField htmlFor="master-specializations" label="Специализации" hint="Каждая с новой строки.">
              <Textarea id="master-specializations" name="specializations" maxLength={1000} className="min-h-24" defaultValue={master.specializations?.join('\n') ?? ''} />
            </FormField>
            <FormField htmlFor="master-experienceYears" label="Опыт (лет)">
              <Input id="master-experienceYears" name="experienceYears" type="number" min={0} max={100} defaultValue={master.experienceYears != null ? String(master.experienceYears) : ''} />
            </FormField>
            <FormField htmlFor="master-rateLabel" label="Ставка" hint="Например: от 5000 ₽/ч">
              <Input id="master-rateLabel" name="rateLabel" maxLength={120} defaultValue={master.rateLabel ?? ''} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Медиа" description="Обложка мастера для каталога и публичной страницы.">
          <AdminCmsGrid>
            <CoverImageField id="master-coverImage" currentName={master.coverImage?.originalName} currentAlt={master.coverImageAlt} />
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контент" description="Краткое описание и полный текст карточки мастера.">
          <div className="grid gap-4">
            <FormField htmlFor="master-summary" label="Описание для карточки" hint="Показывается в каталоге. До 500 символов.">
              <Textarea id="master-summary" name="summary" required minLength={10} maxLength={500} defaultValue={master.summary} />
            </FormField>
            <FormField htmlFor="master-description" label="Текст страницы" hint="Полное содержимое публичной страницы">
              <MarkdownEditor id="master-description" name="description" required minLength={20} maxLength={100_000} defaultValue={master.description} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button type="submit">Сохранить изменения</Button>
        </AdminCmsActions>
      </AdminCmsForm>

      {master.status === ContentStatus.DRAFT ? (
        <form action={deleteMasterDraft}>
          <input name="masterId" type="hidden" value={master.id} />
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
