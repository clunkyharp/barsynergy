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
  const highlights = [
    'Образовательные коллаборации',
    'Спецпроекты для заведений',
    'Партнерские интеграции',
    'Размещение и поддержка событий'
  ];

  const preparationNotes = [
    'Кто вы и какой формат сотрудничества хотите обсудить.',
    'Какую задачу должен решить проект: обучение, мероприятие, размещение или запуск.',
    'Ссылку на сайт, Telegram или материалы, если они уже готовы.'
  ];

  return (
    <PublicApplicationSection
      eyebrow="Партнеры / Заявка"
      title="Обсудить партнерство"
      description="Форма для брендов, школ и заведений: совместный проект, размещение, событие или программа."
      enabled={enabled}
      result={result}
    >
      <form action={submitPartnerApplication} className="editorial-form-shell">
        <HiddenUtmFields utm={utm} />
        <HoneypotField id="partner-application-website" />
        <div className="relative grid lg:grid-cols-[0.42fr_0.58fr]">
          <div className="relative border-b border-white/10 bg-[var(--graphite)] px-5 py-6 text-white md:px-6 md:py-7 lg:border-b-0 lg:border-r lg:border-white/10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/56">Партнерская заявка</p>
            <h3 className="mt-3 text-2xl font-semibold uppercase leading-8 md:text-[30px] md:leading-9">
              Формат для брендов, школ и заведений
            </h3>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/72">
              Опишите идею коротко и по делу. Команда начнет обсуждение с этой заявки.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span
                  className="border border-white/16 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/80"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Что подготовить</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/74">
                {preparationNotes.map((item) => (
                  <li className="flex gap-3" key={item}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
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
                  <Textarea
                    id="partnerProposal"
                    name="proposal"
                    required
                    className="min-h-36"
                    maxLength={4000}
                    minLength={20}
                  />
                </FormField>
              </div>
              <div className="md:col-span-2 border-t border-black/10 pt-1">
                <ConsentCheckboxField>
                  Согласен на обработку персональных данных для обработки заявки. Текст{' '}
                  <a className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline" href="/legal/personal-data-consent">
                    согласия
                  </a>
                  .
                </ConsentCheckboxField>
              </div>
              <div className="md:col-span-2 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-xs leading-6 text-[var(--muted)]">
                  После отправки мы свяжемся с вами и обсудим следующий шаг.
                </p>
                <Button type="submit">Отправить заявку</Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </PublicApplicationSection>
  );
}
