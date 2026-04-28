import { submitPartnerApplication } from '@/app/(public)/partners/actions';
import {
  ConsentCheckboxField,
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function PartnerApplicationForm({ enabled, result, utm, cities }: PublicApplicationFormProps) {
  return (
    <PublicApplicationSection
      eyebrow="Партнеры / Заявка"
      title="Обсудить партнерство"
      description="Форма для брендов, школ и заведений, которые хотят предложить совместный проект, размещение или программу."
      enabled={enabled}
      result={result}
    >
      <form action={submitPartnerApplication} className="border border-black/20 bg-white p-5">
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="partner-application-website" />
        <h3 className="text-lg font-semibold uppercase leading-7">Партнерская заявка</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <FormField htmlFor="partnerCompanyName" label="Компания">
            <Input id="partnerCompanyName" name="companyName" required maxLength={180} minLength={2} />
          </FormField>
          <FormField htmlFor="partnerContactName" label="Контактное лицо">
            <Input id="partnerContactName" name="contactName" required maxLength={160} minLength={2} />
          </FormField>
          <FormField htmlFor="partnerEmail" label="Email">
            <Input id="partnerEmail" name="email" type="email" maxLength={180} />
          </FormField>
          <FormField htmlFor="partnerPhone" label="Телефон">
            <Input id="partnerPhone" name="phone" maxLength={80} />
          </FormField>
          <FormField htmlFor="partnerTelegram" label="Telegram">
            <Input id="partnerTelegram" name="telegram" maxLength={80} />
          </FormField>
          <FormField htmlFor="partnerCityId" label="Город">
            <Select id="partnerCityId" name="cityId" defaultValue="">
              <option value="">Не указан</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="partnerType" label="Тип партнерства">
            <Input id="partnerType" name="partnerType" required maxLength={160} minLength={2} />
          </FormField>
          <FormField htmlFor="partnerWebsiteUrl" label="Сайт">
            <Input id="partnerWebsiteUrl" name="websiteUrl" type="url" maxLength={500} />
          </FormField>
          <div className="md:col-span-2">
            <FormField htmlFor="partnerProposal" label="Предложение">
              <Textarea id="partnerProposal" name="proposal" required className="min-h-36" maxLength={4000} minLength={20} />
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
          <div className="md:col-span-2">
            <Button type="submit">Отправить заявку</Button>
          </div>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
