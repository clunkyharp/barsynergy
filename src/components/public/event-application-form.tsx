import { submitEventApplication } from '@/app/(public)/events/actions';
import {
  ContactChannelFieldset,
  HiddenUtmFields,
  HoneypotField,
  PublicApplicationSection,
  PublicFormShellFooter,
  PublicFormShellHeader,
  type PublicApplicationFormProps
} from '@/components/public/application-form-section';
import { Button } from '@/components/ui/button';
import { ConsentField } from '@/components/ui/consent-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { InlineLink } from '@/components/ui/inline-link';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function EventApplicationForm({ enabled, result, utm, cities, defaults = {} }: PublicApplicationFormProps) {
  const hasEventContext = Boolean(defaults.eventTitle);

  return (
    <PublicApplicationSection
      eyebrow="События / Заявка"
      title={hasEventContext ? 'Заявка на выбранное событие' : 'Участие в событии или своё предложение'}
      description={hasEventContext ? 'Название события уже подставлено в форму.' : 'Можно записаться на событие или предложить свой формат.'}
      enabled={enabled}
      result={result}
    >
      <form action={submitEventApplication} className="editorial-form-shell overflow-hidden">
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="event-application-website" />
        <PublicFormShellHeader
          eyebrow="Участие и предложение"
          title={hasEventContext ? defaults.eventTitle! : 'Заявка на событие'}
          description={hasEventContext ? 'Оставьте контакт и короткий комментарий по участию.' : 'Для участия, новой темы, коллаборации или события в календаре.'}
        />
        <div className="relative p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField htmlFor="eventName" label="Имя">
              <Input id="eventName" name="name" required maxLength={160} minLength={2} />
            </FormField>
            <FormField htmlFor="eventTitle" label="Событие или тема">
              <Input id="eventTitle" name="eventTitle" defaultValue={defaults.eventTitle} required maxLength={180} minLength={2} />
            </FormField>
            <ContactChannelFieldset className="md:col-span-2" emailId="eventEmail" phoneId="eventPhone" telegramId="eventTelegram" />
            <FormField htmlFor="eventCityId" label="Город">
              <Select id="eventCityId" name="cityId" defaultValue="">
                <option value="">Не указан</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="md:col-span-2">
              <FormField htmlFor="eventMessage" label="Комментарий">
                <Textarea id="eventMessage" name="message" required className="min-h-40" maxLength={3000} minLength={10} />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <ConsentField>
                Согласен с <InlineLink href="/legal/privacy">политикой обработки персональных данных</InlineLink> и даю{' '}
                <InlineLink href="/legal/personal-data-consent">согласие на обработку персональных данных</InlineLink> для этой заявки.
              </ConsentField>
            </div>
          </div>
          <PublicFormShellFooter note="Если предлагаете своё событие, напишите, где оно пройдёт, о чём будет и кто придёт.">
            <Button className="min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal sm:self-start" type="submit">
              Отправить заявку
            </Button>
          </PublicFormShellFooter>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
