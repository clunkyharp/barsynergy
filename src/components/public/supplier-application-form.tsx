import { submitSupplierApplication } from '@/app/(public)/suppliers/actions';
import {
  ContactChannelFieldset,
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  PublicFormShellHeader,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { SubmitButton } from '@/components/ui/submit-button';
import { Textarea } from '@/components/ui/textarea';

export function SupplierApplicationForm({ enabled, result, utm, cities }: PublicApplicationFormProps) {
  return (
    <PublicApplicationSection
      eyebrow="Поставщики / Заявка"
      title="Подать заявку в каталог"
      description="Укажите компанию, географию работы и контакт для заведений. Для публичного профиля команда отдельно запросит логотип или рабочее фото."
      disclosureAliases={['applications']}
      disclosureFocusSelector="#supplierCompanyName"
      disclosureId="supplier-request"
      disclosureOpenLabel="Добавить компанию"
      disclosureTitle="Заявка поставщика"
      disclosureDescription="Укажите компанию, категорию, географию, продукты или услуги и контакт для заведений. Логотип или фото нужны перед публикацией профиля."
      enabled={enabled}
      introVariant="compact"
      result={result}
    >
      <form action={submitSupplierApplication} className="editorial-form-shell public-form-shell">
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="supplier-application-website" />
        <PublicFormShellHeader
          eyebrow="Компания и поставка"
          title="Заявка поставщика"
          description="Категория, продукты или услуги, условия заказа и контакт."
        />
        <div className="relative p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField htmlFor="supplierCompanyName" label="Компания">
              <Input id="supplierCompanyName" name="companyName" required maxLength={180} minLength={2} />
            </FormField>
            <FormField htmlFor="supplierContactName" label="Контактное лицо">
              <Input id="supplierContactName" name="contactName" required maxLength={160} minLength={2} />
            </FormField>
            <ContactChannelFieldset className="md:col-span-2" emailId="supplierEmail" phoneId="supplierPhone" telegramId="supplierTelegram" />
            <FormField htmlFor="supplierCityId" label="Город">
              <Select id="supplierCityId" name="cityId" defaultValue="">
                <option value="">Не указан</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="supplierWebsiteUrl" label="Сайт">
              <Input id="supplierWebsiteUrl" name="websiteUrl" type="url" maxLength={500} />
            </FormField>
            <FormField htmlFor="supplierServiceArea" label="Категория и география">
              <Input id="supplierServiceArea" name="serviceArea" required maxLength={160} minLength={2} />
            </FormField>
            <div className="md:col-span-2">
              <FormField htmlFor="supplierDescription" label="Описание">
                <Textarea id="supplierDescription" name="description" required className="min-h-40" maxLength={4000} minLength={20} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <ConsentField>
                Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
              </ConsentField>
            </div>
          </div>
          <PublicFormShellFooter>
            <SubmitButton className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal sm:self-start">
              Отправить заявку
            </SubmitButton>
          </PublicFormShellFooter>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
