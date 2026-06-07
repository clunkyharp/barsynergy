import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminCmsGrid } from '@/components/admin/admin-cms-form';
import { PUBLICATION_STATUS_HINT } from '@/lib/admin/content-ui';
import {
  type AudienceValues,
  type CalculatorValues,
  type CtaValues,
  type HeroValues,
  type SocialValues
} from './homepage-cms-types';
import { PriorityField, StatusSelect } from './homepage-cms-utils';

export function HeroFields({ hero, uid }: { hero?: HeroValues; uid: string }) {
  return (
    <>
      <AdminCmsGrid columns="three">
        <FormField label="Статус" htmlFor={`hero-status-${uid}`} hint={PUBLICATION_STATUS_HINT}>
          <StatusSelect id={`hero-status-${uid}`} defaultValue={hero?.status} />
        </FormField>
        <FormField label="Надзаголовок" htmlFor={`hero-eyebrow-${uid}`}>
          <Input id={`hero-eyebrow-${uid}`} name="eyebrow" required minLength={2} maxLength={160} defaultValue={hero?.eyebrow ?? ''} />
        </FormField>
        <PriorityField id={`hero-priority-${uid}`} defaultValue={hero?.priority ?? 0} />
      </AdminCmsGrid>
      <FormField label="Заголовок" htmlFor={`hero-title-${uid}`}>
        <Input id={`hero-title-${uid}`} name="title" required minLength={2} maxLength={220} defaultValue={hero?.title ?? ''} />
      </FormField>
      <FormField label="Описание" htmlFor={`hero-description-${uid}`}>
        <Textarea id={`hero-description-${uid}`} name="description" required minLength={10} maxLength={700} defaultValue={hero?.description ?? ''} />
      </FormField>
      <FormField label="Сигналы запуска, по одному на строку: Значение | подпись" htmlFor={`hero-signals-${uid}`}>
        <Textarea id={`hero-signals-${uid}`} name="signalsText" maxLength={2000} defaultValue={hero?.signalsText ?? ''} />
      </FormField>
    </>
  );
}

export function AudienceFields({ card, uid }: { card?: AudienceValues; uid: string }) {
  return (
    <>
      <AdminCmsGrid columns="three">
        <FormField label="Статус" htmlFor={`audience-status-${uid}`} hint={PUBLICATION_STATUS_HINT}>
          <StatusSelect id={`audience-status-${uid}`} defaultValue={card?.status} />
        </FormField>
        <FormField label="Заголовок" htmlFor={`audience-title-${uid}`}>
          <Input id={`audience-title-${uid}`} name="title" required minLength={2} maxLength={160} defaultValue={card?.title ?? ''} />
        </FormField>
        <PriorityField id={`audience-priority-${uid}`} defaultValue={card?.priority ?? 0} />
      </AdminCmsGrid>
      <FormField label="Описание" htmlFor={`audience-description-${uid}`}>
        <Textarea id={`audience-description-${uid}`} name="description" required minLength={10} maxLength={700} defaultValue={card?.description ?? ''} />
      </FormField>
      <AdminCmsGrid columns="two">
        <FormField label="Ссылка" htmlFor={`audience-href-${uid}`}>
          <Input id={`audience-href-${uid}`} name="href" required maxLength={500} placeholder="/education" defaultValue={card?.href ?? ''} />
        </FormField>
        <FormField label="Текст кнопки" htmlFor={`audience-actionLabel-${uid}`}>
          <Input id={`audience-actionLabel-${uid}`} name="actionLabel" required minLength={2} maxLength={120} defaultValue={card?.actionLabel ?? ''} />
        </FormField>
        <FormField label="Короткое подтверждение" htmlFor={`audience-proof-${uid}`}>
          <Input id={`audience-proof-${uid}`} name="proof" maxLength={240} defaultValue={card?.proof ?? ''} />
        </FormField>
        <FormField label="Путь к изображению из public" htmlFor={`audience-imagePath-${uid}`}>
          <Input id={`audience-imagePath-${uid}`} name="imagePath" maxLength={500} placeholder="/images/home/example.jpg" defaultValue={card?.imagePath ?? ''} />
        </FormField>
        <FormField label="Иконка" htmlFor={`audience-iconKey-${uid}`}>
          <Input id={`audience-iconKey-${uid}`} name="iconKey" maxLength={80} placeholder="users, store, star" defaultValue={card?.iconKey ?? ''} />
        </FormField>
      </AdminCmsGrid>
    </>
  );
}

export function SocialFields({ social, uid }: { social?: SocialValues; uid: string }) {
  return (
    <>
      <AdminCmsGrid columns="three">
        <FormField label="Статус" htmlFor={`social-status-${uid}`} hint={PUBLICATION_STATUS_HINT}>
          <StatusSelect id={`social-status-${uid}`} defaultValue={social?.status} />
        </FormField>
        <FormField label="Площадка" htmlFor={`social-name-${uid}`}>
          <Input id={`social-name-${uid}`} name="name" required minLength={2} maxLength={120} defaultValue={social?.name ?? ''} />
        </FormField>
        <PriorityField id={`social-priority-${uid}`} defaultValue={social?.priority ?? 0} />
      </AdminCmsGrid>
      <AdminCmsGrid columns="two">
        <FormField label="Заголовок" htmlFor={`social-title-${uid}`}>
          <Input id={`social-title-${uid}`} name="title" required minLength={2} maxLength={160} defaultValue={social?.title ?? ''} />
        </FormField>
        <FormField label="Текст кнопки" htmlFor={`social-actionLabel-${uid}`}>
          <Input id={`social-actionLabel-${uid}`} name="actionLabel" required minLength={2} maxLength={120} defaultValue={social?.actionLabel ?? ''} />
        </FormField>
      </AdminCmsGrid>
      <FormField label="Описание" htmlFor={`social-description-${uid}`}>
        <Textarea id={`social-description-${uid}`} name="description" required minLength={10} maxLength={700} defaultValue={social?.description ?? ''} />
      </FormField>
      <AdminCmsGrid columns="two">
        <FormField label="Ссылка" htmlFor={`social-href-${uid}`}>
          <Input id={`social-href-${uid}`} name="href" required maxLength={500} defaultValue={social?.href ?? ''} />
        </FormField>
        <FormField label="Подпись" htmlFor={`social-helperText-${uid}`}>
          <Input id={`social-helperText-${uid}`} name="helperText" maxLength={160} defaultValue={social?.helperText ?? ''} />
        </FormField>
        <FormField label="Логотип из public" htmlFor={`social-logoPath-${uid}`}>
          <Input id={`social-logoPath-${uid}`} name="logoPath" maxLength={500} placeholder="/images/social/logo.png" defaultValue={social?.logoPath ?? ''} />
        </FormField>
        <FormField label="Вариант" htmlFor={`social-variant-${uid}`}>
          <Input id={`social-variant-${uid}`} name="variant" maxLength={80} placeholder="telegram, whatsapp, instagram" defaultValue={social?.variant ?? ''} />
        </FormField>
      </AdminCmsGrid>
    </>
  );
}

export function CtaFields({ cta, uid }: { cta?: CtaValues; uid: string }) {
  return (
    <>
      <AdminCmsGrid columns="three">
        <FormField label="Статус" htmlFor={`cta-status-${uid}`} hint={PUBLICATION_STATUS_HINT}>
          <StatusSelect id={`cta-status-${uid}`} defaultValue={cta?.status} />
        </FormField>
        <FormField label="Подпись" htmlFor={`cta-helperText-${uid}`}>
          <Input id={`cta-helperText-${uid}`} name="helperText" maxLength={180} defaultValue={cta?.helperText ?? ''} />
        </FormField>
        <PriorityField id={`cta-priority-${uid}`} defaultValue={cta?.priority ?? 0} />
      </AdminCmsGrid>
      <FormField label="Заголовок" htmlFor={`cta-title-${uid}`}>
        <Input id={`cta-title-${uid}`} name="title" required minLength={2} maxLength={220} defaultValue={cta?.title ?? ''} />
      </FormField>
      <FormField label="Описание" htmlFor={`cta-description-${uid}`}>
        <Textarea id={`cta-description-${uid}`} name="description" required minLength={10} maxLength={700} defaultValue={cta?.description ?? ''} />
      </FormField>
      <AdminCmsGrid columns="two">
        <FormField label="Основная кнопка" htmlFor={`cta-primaryLabel-${uid}`}>
          <Input id={`cta-primaryLabel-${uid}`} name="primaryLabel" required minLength={2} maxLength={120} defaultValue={cta?.primaryLabel ?? ''} />
        </FormField>
        <FormField label="Основная ссылка" htmlFor={`cta-primaryHref-${uid}`}>
          <Input id={`cta-primaryHref-${uid}`} name="primaryHref" required maxLength={500} defaultValue={cta?.primaryHref ?? ''} />
        </FormField>
        <FormField label="Вторичная ссылка" htmlFor={`cta-secondaryLabel-${uid}`}>
          <Input id={`cta-secondaryLabel-${uid}`} name="secondaryLabel" maxLength={120} defaultValue={cta?.secondaryLabel ?? ''} />
        </FormField>
        <FormField label="URL вторичной ссылки" htmlFor={`cta-secondaryHref-${uid}`}>
          <Input id={`cta-secondaryHref-${uid}`} name="secondaryHref" maxLength={500} defaultValue={cta?.secondaryHref ?? ''} />
        </FormField>
      </AdminCmsGrid>
    </>
  );
}

export function CalculatorFields({ teaser, uid }: { teaser?: CalculatorValues; uid: string }) {
  return (
    <>
      <AdminCmsGrid columns="three">
        <FormField label="Статус" htmlFor={`calculator-status-${uid}`} hint={PUBLICATION_STATUS_HINT}>
          <StatusSelect id={`calculator-status-${uid}`} defaultValue={teaser?.status} />
        </FormField>
        <FormField label="Надзаголовок" htmlFor={`calculator-eyebrow-${uid}`}>
          <Input id={`calculator-eyebrow-${uid}`} name="eyebrow" required minLength={2} maxLength={120} defaultValue={teaser?.eyebrow ?? ''} />
        </FormField>
        <PriorityField id={`calculator-priority-${uid}`} defaultValue={teaser?.priority ?? 0} />
      </AdminCmsGrid>
      <FormField label="Заголовок секции" htmlFor={`calculator-title-${uid}`}>
        <Input id={`calculator-title-${uid}`} name="title" required minLength={2} maxLength={180} defaultValue={teaser?.title ?? ''} />
      </FormField>
      <AdminCmsGrid columns="two">
        <FormField label="Надзаголовок карточки" htmlFor={`calculator-cardEyebrow-${uid}`}>
          <Input id={`calculator-cardEyebrow-${uid}`} name="cardEyebrow" required minLength={2} maxLength={120} defaultValue={teaser?.cardEyebrow ?? ''} />
        </FormField>
        <FormField label="Заголовок карточки" htmlFor={`calculator-cardTitle-${uid}`}>
          <Input id={`calculator-cardTitle-${uid}`} name="cardTitle" required minLength={2} maxLength={220} defaultValue={teaser?.cardTitle ?? ''} />
        </FormField>
      </AdminCmsGrid>
      <FormField label="Описание" htmlFor={`calculator-description-${uid}`}>
        <Textarea id={`calculator-description-${uid}`} name="description" required minLength={10} maxLength={700} defaultValue={teaser?.description ?? ''} />
      </FormField>
      <FormField label="Шаги, по одному на строку" htmlFor={`calculator-steps-${uid}`}>
        <Textarea id={`calculator-steps-${uid}`} name="stepsText" maxLength={1200} defaultValue={teaser?.stepsText ?? ''} />
      </FormField>
      <AdminCmsGrid columns="two">
        <FormField label="Текст кнопки" htmlFor={`calculator-actionLabel-${uid}`}>
          <Input id={`calculator-actionLabel-${uid}`} name="actionLabel" required minLength={2} maxLength={120} defaultValue={teaser?.actionLabel ?? ''} />
        </FormField>
        <FormField label="Ссылка кнопки" htmlFor={`calculator-actionHref-${uid}`}>
          <Input id={`calculator-actionHref-${uid}`} name="actionHref" required maxLength={500} defaultValue={teaser?.actionHref ?? ''} />
        </FormField>
      </AdminCmsGrid>
    </>
  );
}
