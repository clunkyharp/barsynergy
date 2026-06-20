import { notFound } from 'next/navigation';
import { CategoryType, ContentStatus } from '@/modules/admin/queries';
import { deleteSupplierDraft, updateSupplier, updateSupplierStatus } from '@/app/admin/suppliers/actions';
import { AdminCmsActions, AdminCmsAdvancedSection, AdminCmsForm, AdminCmsGrid, AdminCmsSection, AdminCmsSummary } from '@/components/admin/admin-cms-form';
import { AdminContentVisibilityPanel, CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
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
import { getSupplierById, getActiveCategories, getActiveCities, getActiveBusinessAccounts } from '@/lib/admin/admin-queries';

export const dynamic = 'force-dynamic';

const ADMIN_SUPPLIERS_PATH = '/admin/suppliers';

type AdminSupplierEditPageProps = {
  params: Promise<{ supplierId: string }>;
};

export default async function AdminSupplierEditPage({ params }: AdminSupplierEditPageProps) {
  await requireAdminSectionAccess('suppliers');
  const { supplierId } = await params;

  const [supplier, categories, cities, businessAccounts] = await Promise.all([
    getSupplierById(supplierId),
    getActiveCategories(CategoryType.SUPPLIER),
    getActiveCities(),
    getActiveBusinessAccounts()
  ]);

  if (!supplier) {
    notFound();
  }
  const cityName = cities.find((city) => city.id === supplier.cityId)?.name ?? 'Город не указан';
  const currentPath = `${ADMIN_SUPPLIERS_PATH}/${supplier.id}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Поставщик / Редактирование</p>
          <h1 className="mt-2 text-3xl font-semibold">{supplier.companyName}</h1>
        </div>
        <Button href={ADMIN_SUPPLIERS_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <AdminContentVisibilityPanel
        currentPath={currentPath}
        idName="supplierId"
        idValue={supplier.id}
        publicHref={`/suppliers/${supplier.slug}`}
        status={supplier.status}
        updateStatusAction={updateSupplierStatus}
      />

      <AdminCmsForm action={updateSupplier}>
        <HiddenRedirect value={ADMIN_SUPPLIERS_PATH} />
        <input name="supplierId" type="hidden" value={supplier.id} />
        <AdminCmsSummary
          items={[
            { label: 'Статус', value: contentStatusLabels[supplier.status] },
            { label: 'Компания', value: supplier.companyName },
            { label: 'Город', value: cityName },
            { label: 'Проверка', value: supplier.isVerified ? 'Проверен' : 'Не проверен' }
          ]}
        />

        <AdminCmsSection title="Публикация" description="Категория поставщика.">
          <AdminCmsGrid>
            <FormField htmlFor="supplier-categoryId" label="Категория">
              <Select id="supplier-categoryId" name="categoryId" defaultValue={supplier.categoryId ?? ''}>
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
            <FormField htmlFor="supplier-slug" label="Адрес страницы">
              <Input id="supplier-slug" name="slug" readOnly defaultValue={supplier.slug} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsAdvancedSection>

        <AdminCmsSection title="Компания" description="Название компании, сайт и рабочий контакт.">
          <AdminCmsGrid>
            <FormField htmlFor="supplier-companyName" label="Компания">
              <Input
                id="supplier-companyName"
                name="companyName"
                required
                minLength={2}
                maxLength={180}
                defaultValue={supplier.companyName}
              />
            </FormField>
            <FormField htmlFor="supplier-websiteUrl" label="Сайт" hint="Необязательно. Если не заполнен, ссылка не покажется на публичной странице.">
              <Input id="supplier-websiteUrl" name="websiteUrl" maxLength={240} type="url" defaultValue={supplier.websiteUrl ?? ''} />
            </FormField>
            <FormField htmlFor="supplier-businessAccountId" label="Бизнес-аккаунт">
              <Select id="supplier-businessAccountId" name="businessAccountId" defaultValue={supplier.businessAccountId ?? ''}>
                <option value="">Без привязки</option>
                {businessAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.companyName}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="supplier-contactLabel" label="Контактное лицо" hint="Только имя. Telegram/телефон — в полях ниже.">
              <Input id="supplier-contactLabel" name="contactLabel" maxLength={120} defaultValue={supplier.contactLabel ?? ''} />
            </FormField>
            <FormField htmlFor="supplier-contactTelegram" label="Telegram">
              <Input id="supplier-contactTelegram" name="contactTelegram" maxLength={120} placeholder="@username или t.me/..." defaultValue={supplier.contactTelegram ?? ''} />
            </FormField>
            <FormField htmlFor="supplier-contactPhone" label="Телефон">
              <Input id="supplier-contactPhone" name="contactPhone" type="tel" maxLength={60} defaultValue={supplier.contactPhone ?? ''} />
            </FormField>
            <FormField htmlFor="supplier-contactWhatsapp" label="WhatsApp" hint="Если совпадает с телефоном, можно не заполнять — будет использован телефон.">
              <Input id="supplier-contactWhatsapp" name="contactWhatsapp" type="tel" maxLength={60} placeholder="+7 ..." defaultValue={supplier.contactWhatsapp ?? ''} />
            </FormField>
            <CheckboxField name="isVerified" value="true" defaultChecked={supplier.isVerified}>
              Поставщик проверен
            </CheckboxField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="География работы" description="Город и зона обслуживания поставщика.">
          <AdminCmsGrid>
            <FormField htmlFor="supplier-cityId" label="Город">
              <Select id="supplier-cityId" name="cityId" defaultValue={supplier.cityId ?? ''}>
                <option value="">Без города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="supplier-serviceArea" label="Зона работы" hint="Например: СКФО, Краснодарский край, вся Россия">
              <Input id="supplier-serviceArea" name="serviceArea" maxLength={180} defaultValue={supplier.serviceArea ?? ''} />
            </FormField>
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Медиа" description="Обложка поставщика для каталога и публичной страницы.">
          <AdminCmsGrid>
            <CoverImageField id="supplier-coverImage" currentName={supplier.coverImage?.originalName} currentAlt={supplier.coverImageAlt} />
          </AdminCmsGrid>
        </AdminCmsSection>

        <AdminCmsSection title="Контент" description="Краткое описание и полный текст карточки поставщика.">
          <div className="grid gap-4">
            <FormField htmlFor="supplier-summary" label="Описание для карточки" hint="Показывается в каталоге. До 500 символов.">
              <Textarea id="supplier-summary" name="summary" required minLength={10} maxLength={500} defaultValue={supplier.summary} />
            </FormField>
            <FormField htmlFor="supplier-description" label="Текст страницы" hint="Полное содержимое публичной страницы">
              <MarkdownEditor id="supplier-description" name="description" required minLength={20} maxLength={100_000} defaultValue={supplier.description} />
            </FormField>
          </div>
        </AdminCmsSection>

        <AdminCmsActions>
          <Button type="submit">Сохранить изменения</Button>
        </AdminCmsActions>
      </AdminCmsForm>

      {supplier.status === ContentStatus.DRAFT ? (
        <form action={deleteSupplierDraft}>
          <input name="supplierId" type="hidden" value={supplier.id} />
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
