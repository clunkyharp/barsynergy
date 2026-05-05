import type { ReactNode } from 'react';
import { ContentStatus } from '@prisma/client';
import {
  deleteHomepageAudienceCard,
  deleteHomepageSocialBlock,
  saveHomepageAudienceCard,
  saveHomepageCalculatorTeaser,
  saveHomepageCtaBlock,
  saveHomepageHero,
  saveHomepageSocialBlock
} from '@/app/admin/homepage/actions';
import { AdminActionAlert, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusBadgeVariants, contentStatusLabels, type AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_HOMEPAGE_PATH = '/admin/homepage';

type AdminHomepagePageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

type StatusValue = {
  id: string;
  status: ContentStatus;
};

function StatusSelect({ defaultValue }: { defaultValue?: ContentStatus }) {
  return (
    <Select name="status" defaultValue={defaultValue ?? ContentStatus.DRAFT}>
      {Object.values(ContentStatus).map((status) => (
        <option key={status} value={status}>
          {contentStatusLabels[status]}
        </option>
      ))}
    </Select>
  );
}

function RecordStatus({ record }: { record: StatusValue }) {
  return <StatusBadge variant={contentStatusBadgeVariants[record.status]}>{contentStatusLabels[record.status]}</StatusBadge>;
}

function PriorityField({ defaultValue = 0 }: { defaultValue?: number }) {
  return (
    <FormField label="Порядок" htmlFor="">
      <Input name="priority" min={0} max={100000} type="number" defaultValue={defaultValue} />
    </FormField>
  );
}

function SubmitRow({ children, record }: { children?: ReactNode; record?: StatusValue }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit">Сохранить</Button>
      {record ? <RecordStatus record={record} /> : null}
      {children}
    </div>
  );
}

function DeleteButton({ action, id }: { action: (formData: FormData) => Promise<void>; id: string }) {
  return (
    <form action={action}>
      <HiddenRedirect value={ADMIN_HOMEPAGE_PATH} />
      <input name="id" type="hidden" value={id} />
      <Button type="submit" variant="secondary">
        Удалить черновик
      </Button>
    </form>
  );
}

export default async function AdminHomepagePage({ searchParams }: AdminHomepagePageProps) {
  await requireAdminSectionAccess('homepage');

  const params = (await searchParams) ?? {};
  const [heroes, audienceCards, socialBlocks, ctaBlocks, calculatorTeasers] = await Promise.all([
    prisma.homepageHero.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageAudienceCard.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageSocialBlock.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageCtaBlock.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageCalculatorTeaser.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] })
  ]);

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Контент главной страницы. Публично показываются только опубликованные записи; черновики, проверка и архив скрыты."
        eyebrow="Админка / Главная"
        title="Главная сайта"
      />

      <AdminActionAlert params={params} />

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Hero</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Если опубликованного hero нет, публичная главная использует минимальный fallback.</p>
        <div className="mt-5 grid gap-5">
          {(heroes.length > 0 ? heroes : [null]).map((hero, index) => (
            <form action={saveHomepageHero} className="grid gap-5 border-t border-[var(--line)] pt-5 first:border-t-0 first:pt-0" key={hero?.id ?? 'new-hero'}>
              <HiddenRedirect value={ADMIN_HOMEPAGE_PATH} />
              {hero ? <input name="heroId" type="hidden" value={hero.id} /> : null}
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr_140px]">
                <FormField label="Статус" htmlFor={`hero-status-${hero?.id ?? index}`}>
                  <StatusSelect defaultValue={hero?.status} />
                </FormField>
                <FormField label="Надзаголовок" htmlFor={`hero-eyebrow-${hero?.id ?? index}`}>
                  <Input id={`hero-eyebrow-${hero?.id ?? index}`} name="eyebrow" required minLength={2} maxLength={160} defaultValue={hero?.eyebrow ?? ''} />
                </FormField>
                <PriorityField defaultValue={hero?.priority ?? 0} />
              </div>
              <FormField label="Заголовок" htmlFor={`hero-title-${hero?.id ?? index}`}>
                <Input id={`hero-title-${hero?.id ?? index}`} name="title" required minLength={2} maxLength={220} defaultValue={hero?.title ?? ''} />
              </FormField>
              <FormField label="Описание" htmlFor={`hero-description-${hero?.id ?? index}`}>
                <Textarea id={`hero-description-${hero?.id ?? index}`} name="description" required minLength={10} maxLength={700} defaultValue={hero?.description ?? ''} />
              </FormField>
              <FormField label="Сигналы запуска, по одному на строку: Значение | подпись" htmlFor={`hero-signals-${hero?.id ?? index}`}>
                <Textarea id={`hero-signals-${hero?.id ?? index}`} name="signalsText" maxLength={2000} defaultValue={hero?.signalsText ?? ''} />
              </FormField>
              <SubmitRow record={hero ?? undefined} />
            </form>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Карточки аудиторий</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Эти записи используются в первом экране и в блоке “Для кого”.</p>
        <form action={saveHomepageAudienceCard} className="mt-5 grid gap-5 rounded-[var(--radius-lg)] border border-[var(--line)] p-4">
          <HiddenRedirect value={ADMIN_HOMEPAGE_PATH} />
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr_140px]">
            <FormField label="Статус" htmlFor="audience-new-status">
              <StatusSelect />
            </FormField>
            <FormField label="Заголовок" htmlFor="audience-new-title">
              <Input id="audience-new-title" name="title" required minLength={2} maxLength={160} />
            </FormField>
            <PriorityField />
          </div>
          <FormField label="Описание" htmlFor="audience-new-description">
            <Textarea id="audience-new-description" name="description" required minLength={10} maxLength={700} />
          </FormField>
          <div className="grid gap-5 lg:grid-cols-2">
            <FormField label="Ссылка" htmlFor="audience-new-href">
              <Input id="audience-new-href" name="href" required maxLength={500} placeholder="/education" />
            </FormField>
            <FormField label="Текст кнопки" htmlFor="audience-new-actionLabel">
              <Input id="audience-new-actionLabel" name="actionLabel" required minLength={2} maxLength={120} />
            </FormField>
            <FormField label="Короткое подтверждение" htmlFor="audience-new-proof">
              <Input id="audience-new-proof" name="proof" maxLength={240} />
            </FormField>
            <FormField label="Путь к изображению из public" htmlFor="audience-new-imagePath">
              <Input id="audience-new-imagePath" name="imagePath" maxLength={500} placeholder="/images/home/example.jpg" />
            </FormField>
            <FormField label="Иконка" htmlFor="audience-new-iconKey">
              <Input id="audience-new-iconKey" name="iconKey" maxLength={80} placeholder="users, store, star" />
            </FormField>
          </div>
          <SubmitRow />
        </form>

        <div className="mt-5 grid gap-4">
          {audienceCards.map((card) => (
            <form action={saveHomepageAudienceCard} className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--line)] p-4" key={card.id}>
              <HiddenRedirect value={ADMIN_HOMEPAGE_PATH} />
              <input name="cardId" type="hidden" value={card.id} />
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr_140px]">
                <FormField label="Статус" htmlFor={`audience-status-${card.id}`}>
                  <StatusSelect defaultValue={card.status} />
                </FormField>
                <FormField label="Заголовок" htmlFor={`audience-title-${card.id}`}>
                  <Input id={`audience-title-${card.id}`} name="title" required minLength={2} maxLength={160} defaultValue={card.title} />
                </FormField>
                <PriorityField defaultValue={card.priority} />
              </div>
              <FormField label="Описание" htmlFor={`audience-description-${card.id}`}>
                <Textarea id={`audience-description-${card.id}`} name="description" required minLength={10} maxLength={700} defaultValue={card.description} />
              </FormField>
              <div className="grid gap-5 lg:grid-cols-2">
                <FormField label="Ссылка" htmlFor={`audience-href-${card.id}`}>
                  <Input id={`audience-href-${card.id}`} name="href" required maxLength={500} defaultValue={card.href} />
                </FormField>
                <FormField label="Текст кнопки" htmlFor={`audience-actionLabel-${card.id}`}>
                  <Input id={`audience-actionLabel-${card.id}`} name="actionLabel" required minLength={2} maxLength={120} defaultValue={card.actionLabel} />
                </FormField>
                <FormField label="Короткое подтверждение" htmlFor={`audience-proof-${card.id}`}>
                  <Input id={`audience-proof-${card.id}`} name="proof" maxLength={240} defaultValue={card.proof ?? ''} />
                </FormField>
                <FormField label="Путь к изображению из public" htmlFor={`audience-imagePath-${card.id}`}>
                  <Input id={`audience-imagePath-${card.id}`} name="imagePath" maxLength={500} defaultValue={card.imagePath ?? ''} />
                </FormField>
                <FormField label="Иконка" htmlFor={`audience-iconKey-${card.id}`}>
                  <Input id={`audience-iconKey-${card.id}`} name="iconKey" maxLength={80} defaultValue={card.iconKey ?? ''} />
                </FormField>
              </div>
              <SubmitRow record={card}>
                {card.status !== ContentStatus.PUBLISHED ? <DeleteButton action={deleteHomepageAudienceCard} id={card.id} /> : null}
              </SubmitRow>
            </form>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Соцсети</h2>
        <form action={saveHomepageSocialBlock} className="mt-5 grid gap-5 rounded-[var(--radius-lg)] border border-[var(--line)] p-4">
          <HiddenRedirect value={ADMIN_HOMEPAGE_PATH} />
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr_140px]">
            <FormField label="Статус" htmlFor="social-new-status">
              <StatusSelect />
            </FormField>
            <FormField label="Площадка" htmlFor="social-new-name">
              <Input id="social-new-name" name="name" required minLength={2} maxLength={120} />
            </FormField>
            <PriorityField />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <FormField label="Заголовок" htmlFor="social-new-title">
              <Input id="social-new-title" name="title" required minLength={2} maxLength={160} />
            </FormField>
            <FormField label="Текст кнопки" htmlFor="social-new-actionLabel">
              <Input id="social-new-actionLabel" name="actionLabel" required minLength={2} maxLength={120} />
            </FormField>
          </div>
          <FormField label="Описание" htmlFor="social-new-description">
            <Textarea id="social-new-description" name="description" required minLength={10} maxLength={700} />
          </FormField>
          <div className="grid gap-5 lg:grid-cols-2">
            <FormField label="Ссылка" htmlFor="social-new-href">
              <Input id="social-new-href" name="href" required maxLength={500} />
            </FormField>
            <FormField label="Подпись" htmlFor="social-new-helperText">
              <Input id="social-new-helperText" name="helperText" maxLength={160} />
            </FormField>
            <FormField label="Логотип из public" htmlFor="social-new-logoPath">
              <Input id="social-new-logoPath" name="logoPath" maxLength={500} placeholder="/images/social/logo.png" />
            </FormField>
            <FormField label="Вариант" htmlFor="social-new-variant">
              <Input id="social-new-variant" name="variant" maxLength={80} placeholder="telegram, whatsapp, instagram" />
            </FormField>
          </div>
          <SubmitRow />
        </form>

        <div className="mt-5 grid gap-4">
          {socialBlocks.map((social) => (
            <form action={saveHomepageSocialBlock} className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--line)] p-4" key={social.id}>
              <HiddenRedirect value={ADMIN_HOMEPAGE_PATH} />
              <input name="socialId" type="hidden" value={social.id} />
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr_140px]">
                <FormField label="Статус" htmlFor={`social-status-${social.id}`}>
                  <StatusSelect defaultValue={social.status} />
                </FormField>
                <FormField label="Площадка" htmlFor={`social-name-${social.id}`}>
                  <Input id={`social-name-${social.id}`} name="name" required minLength={2} maxLength={120} defaultValue={social.name} />
                </FormField>
                <PriorityField defaultValue={social.priority} />
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <FormField label="Заголовок" htmlFor={`social-title-${social.id}`}>
                  <Input id={`social-title-${social.id}`} name="title" required minLength={2} maxLength={160} defaultValue={social.title} />
                </FormField>
                <FormField label="Текст кнопки" htmlFor={`social-actionLabel-${social.id}`}>
                  <Input id={`social-actionLabel-${social.id}`} name="actionLabel" required minLength={2} maxLength={120} defaultValue={social.actionLabel} />
                </FormField>
              </div>
              <FormField label="Описание" htmlFor={`social-description-${social.id}`}>
                <Textarea id={`social-description-${social.id}`} name="description" required minLength={10} maxLength={700} defaultValue={social.description} />
              </FormField>
              <div className="grid gap-5 lg:grid-cols-2">
                <FormField label="Ссылка" htmlFor={`social-href-${social.id}`}>
                  <Input id={`social-href-${social.id}`} name="href" required maxLength={500} defaultValue={social.href} />
                </FormField>
                <FormField label="Подпись" htmlFor={`social-helperText-${social.id}`}>
                  <Input id={`social-helperText-${social.id}`} name="helperText" maxLength={160} defaultValue={social.helperText ?? ''} />
                </FormField>
                <FormField label="Логотип из public" htmlFor={`social-logoPath-${social.id}`}>
                  <Input id={`social-logoPath-${social.id}`} name="logoPath" maxLength={500} defaultValue={social.logoPath ?? ''} />
                </FormField>
                <FormField label="Вариант" htmlFor={`social-variant-${social.id}`}>
                  <Input id={`social-variant-${social.id}`} name="variant" maxLength={80} defaultValue={social.variant ?? ''} />
                </FormField>
              </div>
              <SubmitRow record={social}>
                {social.status !== ContentStatus.PUBLISHED ? <DeleteButton action={deleteHomepageSocialBlock} id={social.id} /> : null}
              </SubmitRow>
            </form>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">CTA сообщества</h2>
        <div className="mt-5 grid gap-5">
          {(ctaBlocks.length > 0 ? ctaBlocks : [null]).map((cta, index) => (
            <form action={saveHomepageCtaBlock} className="grid gap-5 border-t border-[var(--line)] pt-5 first:border-t-0 first:pt-0" key={cta?.id ?? 'new-cta'}>
              <HiddenRedirect value={ADMIN_HOMEPAGE_PATH} />
              {cta ? <input name="ctaId" type="hidden" value={cta.id} /> : null}
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr_140px]">
                <FormField label="Статус" htmlFor={`cta-status-${cta?.id ?? index}`}>
                  <StatusSelect defaultValue={cta?.status} />
                </FormField>
                <FormField label="Подпись" htmlFor={`cta-helperText-${cta?.id ?? index}`}>
                  <Input id={`cta-helperText-${cta?.id ?? index}`} name="helperText" maxLength={180} defaultValue={cta?.helperText ?? ''} />
                </FormField>
                <PriorityField defaultValue={cta?.priority ?? 0} />
              </div>
              <FormField label="Заголовок" htmlFor={`cta-title-${cta?.id ?? index}`}>
                <Input id={`cta-title-${cta?.id ?? index}`} name="title" required minLength={2} maxLength={220} defaultValue={cta?.title ?? ''} />
              </FormField>
              <FormField label="Описание" htmlFor={`cta-description-${cta?.id ?? index}`}>
                <Textarea id={`cta-description-${cta?.id ?? index}`} name="description" required minLength={10} maxLength={700} defaultValue={cta?.description ?? ''} />
              </FormField>
              <div className="grid gap-5 lg:grid-cols-2">
                <FormField label="Основная кнопка" htmlFor={`cta-primaryLabel-${cta?.id ?? index}`}>
                  <Input id={`cta-primaryLabel-${cta?.id ?? index}`} name="primaryLabel" required minLength={2} maxLength={120} defaultValue={cta?.primaryLabel ?? ''} />
                </FormField>
                <FormField label="Основная ссылка" htmlFor={`cta-primaryHref-${cta?.id ?? index}`}>
                  <Input id={`cta-primaryHref-${cta?.id ?? index}`} name="primaryHref" required maxLength={500} defaultValue={cta?.primaryHref ?? ''} />
                </FormField>
                <FormField label="Вторичная ссылка" htmlFor={`cta-secondaryLabel-${cta?.id ?? index}`}>
                  <Input id={`cta-secondaryLabel-${cta?.id ?? index}`} name="secondaryLabel" maxLength={120} defaultValue={cta?.secondaryLabel ?? ''} />
                </FormField>
                <FormField label="URL вторичной ссылки" htmlFor={`cta-secondaryHref-${cta?.id ?? index}`}>
                  <Input id={`cta-secondaryHref-${cta?.id ?? index}`} name="secondaryHref" maxLength={500} defaultValue={cta?.secondaryHref ?? ''} />
                </FormField>
              </div>
              <SubmitRow record={cta ?? undefined} />
            </form>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Teaser калькулятора</h2>
        <div className="mt-5 grid gap-5">
          {(calculatorTeasers.length > 0 ? calculatorTeasers : [null]).map((teaser, index) => (
            <form action={saveHomepageCalculatorTeaser} className="grid gap-5 border-t border-[var(--line)] pt-5 first:border-t-0 first:pt-0" key={teaser?.id ?? 'new-calculator'}>
              <HiddenRedirect value={ADMIN_HOMEPAGE_PATH} />
              {teaser ? <input name="calculatorId" type="hidden" value={teaser.id} /> : null}
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr_140px]">
                <FormField label="Статус" htmlFor={`calculator-status-${teaser?.id ?? index}`}>
                  <StatusSelect defaultValue={teaser?.status} />
                </FormField>
                <FormField label="Надзаголовок" htmlFor={`calculator-eyebrow-${teaser?.id ?? index}`}>
                  <Input id={`calculator-eyebrow-${teaser?.id ?? index}`} name="eyebrow" required minLength={2} maxLength={120} defaultValue={teaser?.eyebrow ?? ''} />
                </FormField>
                <PriorityField defaultValue={teaser?.priority ?? 0} />
              </div>
              <FormField label="Заголовок секции" htmlFor={`calculator-title-${teaser?.id ?? index}`}>
                <Input id={`calculator-title-${teaser?.id ?? index}`} name="title" required minLength={2} maxLength={180} defaultValue={teaser?.title ?? ''} />
              </FormField>
              <div className="grid gap-5 lg:grid-cols-2">
                <FormField label="Надзаголовок карточки" htmlFor={`calculator-cardEyebrow-${teaser?.id ?? index}`}>
                  <Input id={`calculator-cardEyebrow-${teaser?.id ?? index}`} name="cardEyebrow" required minLength={2} maxLength={120} defaultValue={teaser?.cardEyebrow ?? ''} />
                </FormField>
                <FormField label="Заголовок карточки" htmlFor={`calculator-cardTitle-${teaser?.id ?? index}`}>
                  <Input id={`calculator-cardTitle-${teaser?.id ?? index}`} name="cardTitle" required minLength={2} maxLength={220} defaultValue={teaser?.cardTitle ?? ''} />
                </FormField>
              </div>
              <FormField label="Описание" htmlFor={`calculator-description-${teaser?.id ?? index}`}>
                <Textarea id={`calculator-description-${teaser?.id ?? index}`} name="description" required minLength={10} maxLength={700} defaultValue={teaser?.description ?? ''} />
              </FormField>
              <FormField label="Шаги, по одному на строку" htmlFor={`calculator-steps-${teaser?.id ?? index}`}>
                <Textarea id={`calculator-steps-${teaser?.id ?? index}`} name="stepsText" maxLength={1200} defaultValue={teaser?.stepsText ?? ''} />
              </FormField>
              <div className="grid gap-5 lg:grid-cols-2">
                <FormField label="Текст кнопки" htmlFor={`calculator-actionLabel-${teaser?.id ?? index}`}>
                  <Input id={`calculator-actionLabel-${teaser?.id ?? index}`} name="actionLabel" required minLength={2} maxLength={120} defaultValue={teaser?.actionLabel ?? ''} />
                </FormField>
                <FormField label="Ссылка кнопки" htmlFor={`calculator-actionHref-${teaser?.id ?? index}`}>
                  <Input id={`calculator-actionHref-${teaser?.id ?? index}`} name="actionHref" required maxLength={500} defaultValue={teaser?.actionHref ?? ''} />
                </FormField>
              </div>
              <SubmitRow record={teaser ?? undefined} />
            </form>
          ))}
        </div>
      </Card>
    </div>
  );
}
