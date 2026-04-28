import { submitSupplierApplication } from '@/app/(public)/suppliers/actions';
import {
  ConsentCheckboxField,
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  PublicFormShellHeader,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function SupplierApplicationForm({ enabled, result, utm, cities }: PublicApplicationFormProps) {
  return (
    <PublicApplicationSection
      eyebrow="Поставщики / Заявка"
      title="Добавить поставщика"
      description="Оставьте информацию о компании, сервисе или продукте, чтобы команда могла с вами связаться."
      enabled={enabled}
      result={result}
    >
      <form action={submitSupplierApplication} className="editorial-form-shell overflow-hidden">
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="supplier-application-website" />
        <PublicFormShellHeader
          eyebrow="Форма поставщика"
          title="Заявка поставщика"
          description="Для компаний и сервисов, которые хотят попасть в каталог после проверки редакцией."
        />
        <div className="relative p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField htmlFor="supplierCompanyName" label="Компания">
              <Input id="supplierCompanyName" name="companyName" required maxLength={180} minLength={2} />
            </FormField>
            <FormField htmlFor="supplierContactName" label="Контактное лицо">
              <Input id="supplierContactName" name="contactName" required maxLength={160} minLength={2} />
            </FormField>
            <FormField htmlFor="supplierEmail" label="Email">
              <Input id="supplierEmail" name="email" type="email" maxLength={180} />
            </FormField>
            <FormField htmlFor="supplierPhone" label="Телефон">
              <Input id="supplierPhone" name="phone" maxLength={80} />
            </FormField>
            <FormField htmlFor="supplierTelegram" label="Telegram">
              <Input id="supplierTelegram" name="telegram" maxLength={80} />
            </FormField>
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
            <FormField htmlFor="supplierServiceArea" label="Что поставляете">
              <Input id="supplierServiceArea" name="serviceArea" required maxLength={160} minLength={2} />
            </FormField>
            <div className="md:col-span-2">
              <FormField htmlFor="supplierDescription" label="Описание">
                <Textarea id="supplierDescription" name="description" required className="min-h-40" maxLength={4000} minLength={20} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <ConsentCheckboxField>
                Согласен на обработку персональных данных для обработки заявки. Текст{' '}
                <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                  согласия
                </a>
                .
              </ConsentCheckboxField>
            </div>
          </div>
          <PublicFormShellFooter note="Чем конкретнее вы опишете продукт, сервис и регион работы, тем быстрее команда обработает заявку.">
            <Button className="min-h-12 rounded-full px-6 tracking-[0.12em] sm:self-start" type="submit">
              Отправить заявку
            </Button>
          </PublicFormShellFooter>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
