import { ContactChannelFieldset } from '@/components/public/application-form-section';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField, FormSection } from '@/components/ui/form-field';
import { InlineLink } from '@/components/ui/inline-link';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ApplicationCityOption } from '@/lib/applications/form-options';

export function MasterInquiryFields({
  masterId,
  masterTitle,
  profile
}: {
  masterId: string;
  masterTitle: string;
  profile?: { fullName?: string; email?: string };
}) {
  return (
    <>
      <input name="masterId" type="hidden" value={masterId} />
      <input name="masterTitle" type="hidden" value={masterTitle} />
      <FormSection title="Ваш запрос">
        <FormField htmlFor="masterInquiryName" label="Ваше имя">
          <Input id="masterInquiryName" name="name" defaultValue={profile?.fullName ?? ''} required maxLength={160} minLength={2} placeholder="Как к вам обращаться" />
        </FormField>
        <FormField htmlFor="masterInquiryServiceType" label="Какая услуга нужна">
          <Input id="masterInquiryServiceType" name="serviceType" required maxLength={160} minLength={2} placeholder="Например, настройка бара или сервис кофемашины" />
        </FormField>
        <FormField htmlFor="masterInquiryProjectDetails" label="Коротко о задаче">
          <Textarea id="masterInquiryProjectDetails" name="projectDetails" required className="min-h-32" maxLength={2000} minLength={10} placeholder="Город, формат заведения, сроки и что нужно сделать." />
        </FormField>
      </FormSection>
      <ContactChannelFieldset
        defaults={{ email: profile?.email }}
        emailId="masterInquiryEmail"
        phoneId="masterInquiryPhone"
        telegramId="masterInquiryTelegram"
      />
      <ConsentField>
        Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
        <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
      </ConsentField>
    </>
  );
}

export function MasterSubmissionFields({ cities }: { cities: ApplicationCityOption[] }) {
  return (
    <>
      <FormSection title="Профиль мастера">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField htmlFor="masterEntityType" label="Тип профиля">
            <Select id="masterEntityType" name="entityType" required defaultValue="INDIVIDUAL">
              <option value="INDIVIDUAL">Частный мастер</option>
              <option value="BUSINESS">Компания</option>
            </Select>
          </FormField>
          <FormField htmlFor="masterTitle" label="Название профиля">
            <Input id="masterTitle" name="title" required maxLength={180} minLength={2} placeholder="Например, запуск бара и обучение команды" />
          </FormField>
          <FormField htmlFor="masterFullName" label="Имя мастера">
            <Input id="masterFullName" name="fullName" maxLength={160} placeholder="Для частного профиля" />
          </FormField>
          <FormField htmlFor="masterCompanyName" label="Компания">
            <Input id="masterCompanyName" name="companyName" maxLength={180} placeholder="Для бизнес-профиля" />
          </FormField>
          <FormField htmlFor="masterCityId" label="Город">
            <Select id="masterCityId" name="cityId" defaultValue="">
              <option value="">Не указан</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField htmlFor="masterServiceArea" label="География">
            <Input id="masterServiceArea" name="serviceArea" maxLength={160} placeholder="Например, Махачкала и Каспийск" />
          </FormField>
          <FormField htmlFor="masterSpecializations" label="Специализации">
            <Input id="masterSpecializations" name="specializations" required maxLength={300} placeholder="Настройка бара, обучение, сервис оборудования" />
          </FormField>
          <FormField htmlFor="masterRateLabel" label="Стоимость">
            <Input id="masterRateLabel" name="rateLabel" maxLength={120} placeholder="Например, от 10 000 ₽" />
          </FormField>
        </div>
        <FormField htmlFor="masterDescription" label="Описание">
          <Textarea id="masterDescription" name="description" required className="min-h-40" maxLength={4000} minLength={20} placeholder="Опишите опыт, услуги, формат работы и кому вы полезны." />
        </FormField>
      </FormSection>
      <ContactChannelFieldset emailId="masterSubmissionEmail" phoneId="masterSubmissionPhone" telegramId="masterSubmissionTelegram" />
      <ConsentField>
        Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
        <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
      </ConsentField>
    </>
  );
}
