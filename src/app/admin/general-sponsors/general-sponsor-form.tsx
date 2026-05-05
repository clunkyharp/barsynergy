import { ContentStatus } from '@prisma/client';
import { CoverImageField, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusLabels } from '@/lib/admin/content-utils';

type GeneralSponsorFormCity = {
  id: string;
  name: string;
};

type GeneralSponsorFormValue = {
  id: string;
  name: string;
  slug: string;
  status: ContentStatus;
  logoImageAlt: string | null;
  logoPath: string | null;
  coverImageAlt: string | null;
  coverImagePath: string | null;
  shortDescription: string;
  fullDescription: string;
  seasonLabel: string | null;
  priority: number;
  isFeatured: boolean;
  websiteUrl: string | null;
  instagramUrl: string | null;
  whatsappUrl: string | null;
  telegramUrl: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  representedBrands: string | null;
  benefitsForVenues: string | null;
  cityId: string | null;
  logoImage?: { originalName: string } | null;
  coverImage?: { originalName: string } | null;
};

type GeneralSponsorFormProps = {
  action: (formData: FormData) => Promise<void>;
  cities: GeneralSponsorFormCity[];
  redirectTo: string;
  submitLabel: string;
  sponsor?: GeneralSponsorFormValue;
};

export function GeneralSponsorForm({ action, cities, redirectTo, submitLabel, sponsor }: GeneralSponsorFormProps) {
  return (
    <Card className="p-5">
      <form action={action} className="grid gap-8">
        <HiddenRedirect value={redirectTo} />
        {sponsor ? <input name="sponsorId" type="hidden" value={sponsor.id} /> : null}

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Основная информация</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <FormField htmlFor="sponsor-name" label="Название">
              <Input id="sponsor-name" name="name" required minLength={2} maxLength={160} defaultValue={sponsor?.name ?? ''} />
            </FormField>
            <FormField htmlFor="sponsor-slug" label="Адрес страницы">
              <Input id="sponsor-slug" name="slug" maxLength={180} defaultValue={sponsor?.slug ?? ''} placeholder="Если пусто, будет создан из названия" />
            </FormField>
            <FormField htmlFor="sponsor-status" label="Статус">
              <Select id="sponsor-status" name="status" defaultValue={sponsor?.status ?? ContentStatus.DRAFT}>
                {Object.values(ContentStatus).map((status) => (
                  <option key={status} value={status}>
                    {contentStatusLabels[status]}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="sponsor-cityId" label="Город">
              <Select id="sponsor-cityId" name="cityId" defaultValue={sponsor?.cityId ?? ''}>
                <option value="">Без города</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField htmlFor="sponsor-seasonLabel" label="Сезон / статус в карточке">
              <Input id="sponsor-seasonLabel" name="seasonLabel" maxLength={160} defaultValue={sponsor?.seasonLabel ?? ''} />
            </FormField>
            <FormField htmlFor="sponsor-priority" label="Приоритет">
              <Input id="sponsor-priority" name="priority" min={0} max={100000} type="number" defaultValue={sponsor?.priority ?? 0} />
            </FormField>
            <CheckboxField
              className="lg:col-span-2"
              name="isFeatured"
              value="true"
              defaultChecked={sponsor?.isFeatured ?? false}
            >
              Показывать как приоритетного спонсора. Такие записи выводятся выше остальных опубликованных спонсоров.
            </CheckboxField>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Текст и медиа</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <CoverImageField
              id="sponsor-logoImage"
              inputName="logoImage"
              label="Логотип"
              removeName="removeLogoImage"
              currentName={sponsor?.logoImage?.originalName}
              currentAlt={sponsor?.logoImageAlt}
            />
            <CoverImageField id="sponsor-coverImage" currentName={sponsor?.coverImage?.originalName} currentAlt={sponsor?.coverImageAlt} />
            <FormField htmlFor="sponsor-logoPath" label="Путь к логотипу из public">
              <Input id="sponsor-logoPath" name="logoPath" maxLength={500} defaultValue={sponsor?.logoPath ?? ''} placeholder="/brand/sponsors/logo.png" />
            </FormField>
            <FormField htmlFor="sponsor-coverImagePath" label="Путь к обложке из public">
              <Input id="sponsor-coverImagePath" name="coverImagePath" maxLength={500} defaultValue={sponsor?.coverImagePath ?? ''} placeholder="/images/example.png" />
            </FormField>
            <div className="lg:col-span-2">
              <FormField htmlFor="sponsor-shortDescription" label="Краткое описание">
                <Textarea
                  id="sponsor-shortDescription"
                  name="shortDescription"
                  required
                  minLength={10}
                  maxLength={500}
                  defaultValue={sponsor?.shortDescription ?? ''}
                />
              </FormField>
            </div>
            <div className="lg:col-span-2">
              <FormField htmlFor="sponsor-fullDescription" label="Полное описание">
                <Textarea
                  id="sponsor-fullDescription"
                  name="fullDescription"
                  required
                  minLength={20}
                  maxLength={4000}
                  className="min-h-44"
                  defaultValue={sponsor?.fullDescription ?? ''}
                />
              </FormField>
            </div>
            <FormField htmlFor="sponsor-representedBrands" label="Представляемые бренды">
              <Textarea id="sponsor-representedBrands" name="representedBrands" maxLength={2000} defaultValue={sponsor?.representedBrands ?? ''} />
            </FormField>
            <FormField htmlFor="sponsor-benefitsForVenues" label="Польза для заведений">
              <Textarea id="sponsor-benefitsForVenues" name="benefitsForVenues" maxLength={2000} defaultValue={sponsor?.benefitsForVenues ?? ''} />
            </FormField>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Контакты</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <FormField htmlFor="sponsor-websiteUrl" label="Сайт">
              <Input id="sponsor-websiteUrl" name="websiteUrl" maxLength={500} defaultValue={sponsor?.websiteUrl ?? ''} />
            </FormField>
            <FormField htmlFor="sponsor-instagramUrl" label="Instagram">
              <Input id="sponsor-instagramUrl" name="instagramUrl" maxLength={500} defaultValue={sponsor?.instagramUrl ?? ''} />
            </FormField>
            <FormField htmlFor="sponsor-whatsappUrl" label="WhatsApp">
              <Input id="sponsor-whatsappUrl" name="whatsappUrl" maxLength={500} defaultValue={sponsor?.whatsappUrl ?? ''} />
            </FormField>
            <FormField htmlFor="sponsor-telegramUrl" label="Telegram">
              <Input id="sponsor-telegramUrl" name="telegramUrl" maxLength={500} defaultValue={sponsor?.telegramUrl ?? ''} />
            </FormField>
            <FormField htmlFor="sponsor-contactName" label="Контактное лицо">
              <Input id="sponsor-contactName" name="contactName" maxLength={240} defaultValue={sponsor?.contactName ?? ''} />
            </FormField>
            <FormField htmlFor="sponsor-contactPhone" label="Телефон">
              <Input id="sponsor-contactPhone" name="contactPhone" maxLength={240} defaultValue={sponsor?.contactPhone ?? ''} />
            </FormField>
            <FormField htmlFor="sponsor-contactEmail" label="Email">
              <Input id="sponsor-contactEmail" name="contactEmail" maxLength={240} type="email" defaultValue={sponsor?.contactEmail ?? ''} />
            </FormField>
          </div>
        </section>

        <div>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Card>
  );
}
