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
import {
  AdminCmsActions,
  AdminCmsCompactRecordSummary,
  AdminCmsGrid,
  AdminCmsInlineEditRecord,
  AdminCmsPanel,
  AdminCmsRecordForm
} from '@/components/admin/admin-cms-form';
import { AdminActionAlert, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { contentStatusBadgeVariants, contentStatusLabels, firstParam, type AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_HOMEPAGE_PATH = '/admin/homepage';
const ADMIN_GENERAL_SPONSORS_PATH = '/admin/general-sponsors';

const homepageSectionIds = [
  'homepage-hero',
  'homepage-audience',
  'homepage-positioning',
  'homepage-navigation',
  'homepage-social',
  'homepage-general-sponsors',
  'homepage-calculator'
] as const;

type HomepageSectionId = (typeof homepageSectionIds)[number];

type AdminHomepagePageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

type StatusValue = {
  id: string;
  priority: number;
  status: ContentStatus;
  updatedAt: Date;
};

type HomepageFormAction = (formData: FormData) => Promise<void>;

type HeroValues = Partial<{
  description: string;
  eyebrow: string;
  priority: number;
  signalsText: string | null;
  status: ContentStatus;
  title: string;
}>;

type AudienceValues = Partial<{
  actionLabel: string;
  description: string;
  href: string;
  iconKey: string | null;
  imagePath: string | null;
  priority: number;
  proof: string | null;
  status: ContentStatus;
  title: string;
}>;

type SocialValues = Partial<{
  actionLabel: string;
  description: string;
  helperText: string | null;
  href: string;
  logoPath: string | null;
  name: string;
  priority: number;
  status: ContentStatus;
  title: string;
  variant: string | null;
}>;

type CtaValues = Partial<{
  description: string;
  helperText: string | null;
  primaryHref: string;
  primaryLabel: string;
  priority: number;
  secondaryHref: string | null;
  secondaryLabel: string | null;
  status: ContentStatus;
  title: string;
}>;

type CalculatorValues = Partial<{
  actionHref: string;
  actionLabel: string;
  cardEyebrow: string;
  cardTitle: string;
  description: string;
  eyebrow: string;
  priority: number;
  status: ContentStatus;
  stepsText: string | null;
  title: string;
}>;

type ExternalSectionStatus = {
  details?: string;
  label: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'pending';
};

type HomepageOverviewSection = {
  description: string;
  id: HomepageSectionId;
  records?: StatusValue[];
  status?: ExternalSectionStatus;
  title: string;
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

function formatDate(value?: Date | null) {
  return value ? dateFormatter.format(value) : 'Нет изменений';
}

function lineCount(value?: string | null) {
  return value?.split('\n').filter((line) => line.trim().length > 0).length ?? 0;
}

function getActiveHomepageSection(params: AdminContentSearchParams): HomepageSectionId | undefined {
  const value = firstParam(params.section);
  return homepageSectionIds.includes(value as HomepageSectionId) ? (value as HomepageSectionId) : undefined;
}

function homepageSectionPath(sectionId: HomepageSectionId) {
  return `${ADMIN_HOMEPAGE_PATH}?section=${sectionId}`;
}

function SectionRedirect({ sectionId }: { sectionId: HomepageSectionId }) {
  return <HiddenRedirect value={homepageSectionPath(sectionId)} />;
}

function StatusSelect({ defaultValue, id }: { defaultValue?: ContentStatus; id: string }) {
  return (
    <Select id={id} name="status" defaultValue={defaultValue ?? ContentStatus.DRAFT}>
      {Object.values(ContentStatus).map((status) => (
        <option key={status} value={status}>
          {contentStatusLabels[status]}
        </option>
      ))}
    </Select>
  );
}

function RecordStatus({ record }: { record: { status: ContentStatus } }) {
  return <StatusBadge variant={contentStatusBadgeVariants[record.status]}>{contentStatusLabels[record.status]}</StatusBadge>;
}

function PriorityField({ defaultValue = 0, id }: { defaultValue?: number; id: string }) {
  return (
    <FormField label="Порядок" htmlFor={id}>
      <Input id={id} name="priority" min={0} max={100000} type="number" defaultValue={defaultValue} />
    </FormField>
  );
}

function SubmitRow({ children, record }: { children?: ReactNode; record?: { status: ContentStatus } }) {
  return (
    <AdminCmsActions>
      <Button type="submit">Сохранить секцию</Button>
      {record ? <RecordStatus record={record} /> : null}
      {children}
    </AdminCmsActions>
  );
}

function DeleteButton({ action, id }: { action: HomepageFormAction; id: string }) {
  return (
    <>
      <input name="id" type="hidden" value={id} />
      <Button formAction={action} type="submit" variant="secondary">
        Удалить черновик
      </Button>
    </>
  );
}

function recordStateSummary(records: StatusValue[]) {
  if (records.length === 0) {
    return 'Нет записей';
  }

  const published = records.filter((record) => record.status === ContentStatus.PUBLISHED).length;
  return `${published} опубликовано из ${records.length}`;
}

function sectionBadgeVariant(records: StatusValue[]) {
  if (records.length === 0) {
    return 'neutral' as const;
  }

  if (records.some((record) => record.status === ContentStatus.PUBLISHED)) {
    return 'success' as const;
  }

  if (records.some((record) => record.status === ContentStatus.REVIEW)) {
    return 'pending' as const;
  }

  if (records.every((record) => record.status === ContentStatus.ARCHIVED)) {
    return 'danger' as const;
  }

  return 'neutral' as const;
}

function prioritySummary(records: StatusValue[]) {
  if (records.length === 0) {
    return 'Порядок не задан';
  }

  const priorities = records.map((record) => record.priority);
  const min = Math.min(...priorities);
  const max = Math.max(...priorities);
  return min === max ? `Порядок ${min}` : `Порядок ${min}-${max}`;
}

function SectionStats({ records }: { records: StatusValue[] }) {
  const lastUpdated = records.reduce<Date | null>((latest, record) => {
    if (!latest || record.updatedAt > latest) {
      return record.updatedAt;
    }

    return latest;
  }, null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge showDot={records.length > 0} variant={sectionBadgeVariant(records)}>
        {recordStateSummary(records)}
      </StatusBadge>
      <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        {prioritySummary(records)}
      </span>
      <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        Обновлено: {formatDate(lastUpdated)}
      </span>
    </div>
  );
}

function ExternalSectionStats({ details, label, variant = 'neutral' }: ExternalSectionStatus) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge variant={variant}>{label}</StatusBadge>
      {details ? (
        <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
          {details}
        </span>
      ) : null}
    </div>
  );
}

function HomepageOverviewCard({
  description,
  id,
  records,
  status,
  title
}: {
  description: string;
  id: HomepageSectionId;
  records?: StatusValue[];
  status?: ExternalSectionStatus;
  title: string;
}) {
  return (
    <a
      className="group grid gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"
      href={`${homepageSectionPath(id)}#${id}`}
    >
      <div className="min-w-0">
        <p className="text-base font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      {status ? <ExternalSectionStats {...status} /> : <SectionStats records={records ?? []} />}
      <span className="text-sm font-semibold text-[var(--accent)] transition group-hover:text-[var(--accent-strong)]">Открыть секцию</span>
    </a>
  );
}

function HomepageSectionEditor({
  children,
  defaultOpen,
  description,
  id,
  records,
  status,
  title
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description: string;
  id: HomepageSectionId;
  records?: StatusValue[];
  status?: ExternalSectionStatus;
  title: string;
}) {
  return (
    <details id={id} className="group/homepage-section editorial-form-shell scroll-mt-24 overflow-visible p-0" open={defaultOpen}>
      <summary className="grid cursor-pointer list-none gap-5 p-5 transition hover:bg-[var(--surface-muted)] sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Секция главной</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          {status ? <ExternalSectionStats {...status} /> : <SectionStats records={records ?? []} />}
          <span className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text)] transition group-hover/homepage-section:border-[var(--border-strong)] group-open/homepage-section:hidden">
            Редактировать
          </span>
          <span className="hidden min-h-10 w-fit items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] px-4 text-sm font-semibold text-[var(--muted)] transition group-open/homepage-section:inline-flex">
            Свернуть
          </span>
        </div>
      </summary>
      <div className="grid gap-5 border-t border-[var(--line)] p-5 sm:p-6">{children}</div>
    </details>
  );
}

function ExternalSectionPanel({
  children,
  description,
  href,
  linkLabel,
  title
}: {
  children?: ReactNode;
  description: string;
  href?: string;
  linkLabel?: string;
  title: string;
}) {
  return (
    <div className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
      <div className="min-w-0">
        <p className="text-base font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
      {href && linkLabel ? (
        <Button href={href} variant="secondary">
          {linkLabel}
        </Button>
      ) : null}
    </div>
  );
}

function NewRecordEditor({
  action,
  children,
  description,
  title
}: {
  action: HomepageFormAction;
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <details className="group/homepage-new overflow-hidden rounded-[var(--radius-md)] border border-dashed border-[var(--line)] bg-[var(--surface-muted)]">
      <summary className="grid cursor-pointer list-none gap-3 p-4 transition hover:bg-[var(--surface)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-sm font-semibold text-[var(--text)]">{title}</span>
          <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{description}</span>
        </span>
        <span className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text)] group-open/homepage-new:hidden">
          Добавить
        </span>
        <span className="hidden min-h-10 w-fit items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] px-4 text-sm font-semibold text-[var(--muted)] group-open/homepage-new:inline-flex">
          Свернуть
        </span>
      </summary>
      <AdminCmsRecordForm action={action} className="rounded-none border-x-0 border-b-0 border-l-0 border-t border-[var(--line)]">
        {children}
      </AdminCmsRecordForm>
    </details>
  );
}

function HeroFields({ hero, uid }: { hero?: HeroValues; uid: string }) {
  return (
    <>
      <AdminCmsGrid columns="three">
        <FormField label="Статус" htmlFor={`hero-status-${uid}`}>
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

function AudienceFields({ card, uid }: { card?: AudienceValues; uid: string }) {
  return (
    <>
      <AdminCmsGrid columns="three">
        <FormField label="Статус" htmlFor={`audience-status-${uid}`}>
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

function SocialFields({ social, uid }: { social?: SocialValues; uid: string }) {
  return (
    <>
      <AdminCmsGrid columns="three">
        <FormField label="Статус" htmlFor={`social-status-${uid}`}>
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

function CtaFields({ cta, uid }: { cta?: CtaValues; uid: string }) {
  return (
    <>
      <AdminCmsGrid columns="three">
        <FormField label="Статус" htmlFor={`cta-status-${uid}`}>
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

function CalculatorFields({ teaser, uid }: { teaser?: CalculatorValues; uid: string }) {
  return (
    <>
      <AdminCmsGrid columns="three">
        <FormField label="Статус" htmlFor={`calculator-status-${uid}`}>
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

export default async function AdminHomepagePage({ searchParams }: AdminHomepagePageProps) {
  await requireAdminSectionAccess('homepage');

  const params = (await searchParams) ?? {};
  const activeSection = getActiveHomepageSection(params);
  const [heroes, audienceCards, socialBlocks, ctaBlocks, calculatorTeasers, generalSponsors] = await Promise.all([
    prisma.homepageHero.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageAudienceCard.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageSocialBlock.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageCtaBlock.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageCalculatorTeaser.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.generalSponsor.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }], take: 6 })
  ]);

  const sections: HomepageOverviewSection[] = [
    {
      description: 'Первый экран главной страницы.',
      id: 'homepage-hero',
      records: heroes,
      title: 'Hero'
    },
    {
      description: 'Карточки для ролей на главной.',
      id: 'homepage-audience',
      records: audienceCards,
      title: 'Карточки аудитории'
    },
    {
      description: 'Короткий текст о проекте и CTA внизу главной.',
      id: 'homepage-positioning',
      records: ctaBlocks,
      title: 'Короткое позиционирование'
    },
    {
      description: 'Переходы в основные разделы сайта.',
      id: 'homepage-navigation',
      status: {
        details: 'Статический блок',
        label: 'Правится в коде',
        variant: 'neutral'
      },
      title: 'Навигационные блоки'
    },
    {
      description: 'Публичные каналы сообщества и ссылки.',
      id: 'homepage-social',
      records: socialBlocks,
      title: 'Соцсети'
    },
    {
      description: 'Профили генеральных спонсоров, которые попадают на главную.',
      id: 'homepage-general-sponsors',
      records: generalSponsors,
      title: 'Генеральные спонсоры'
    },
    {
      description: 'Блок, который ведёт к калькулятору себестоимости.',
      id: 'homepage-calculator',
      records: calculatorTeasers,
      title: 'Тизер калькулятора'
    }
  ];

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Каждая секция редактируется отдельно. На сайте видны только опубликованные записи; черновики, проверка и архив скрыты."
        eyebrow="Админка / Главная"
        title="Главная сайта"
      />

      <AdminActionAlert params={params} />

      <AdminCmsPanel title="Обзор секций" description="Откройте только ту секцию, которую нужно изменить. Каждая секция сохраняется отдельно.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <HomepageOverviewCard
              description={section.description}
              id={section.id}
              key={section.id}
              records={section.records}
              status={section.status}
              title={section.title}
            />
          ))}
        </div>
      </AdminCmsPanel>

      <HomepageSectionEditor
        defaultOpen={activeSection === 'homepage-hero'}
        description="Если опубликованного hero нет, публичная главная использует минимальный fallback."
        id="homepage-hero"
        records={heroes}
        title="Hero"
      >
        {heroes.length > 0 ? (
          heroes.map((hero) => (
            <AdminCmsInlineEditRecord
              action={saveHomepageHero}
              groupName="homepage-hero-records"
              key={hero.id}
              summary={
                <AdminCmsCompactRecordSummary
                  items={[
                    { label: 'Порядок', value: hero.priority },
                    { label: 'Сигналы', value: lineCount(hero.signalsText) },
                    { label: 'Обновлено', value: formatDate(hero.updatedAt) }
                  ]}
                  status={<RecordStatus record={hero} />}
                  subtitle={hero.eyebrow}
                  title={hero.title}
                />
              }
            >
              <SectionRedirect sectionId="homepage-hero" />
              <input name="heroId" type="hidden" value={hero.id} />
              <HeroFields hero={hero} uid={hero.id} />
              <SubmitRow record={hero} />
            </AdminCmsInlineEditRecord>
          ))
        ) : (
          <NewRecordEditor action={saveHomepageHero} title="Создать hero" description="Добавьте первый hero-блок для главной страницы.">
            <SectionRedirect sectionId="homepage-hero" />
            <HeroFields uid="new" />
            <SubmitRow />
          </NewRecordEditor>
        )}
      </HomepageSectionEditor>

      <HomepageSectionEditor
        defaultOpen={activeSection === 'homepage-audience'}
        description="Эти записи используются в первом экране и в блоке «Для кого»."
        id="homepage-audience"
        records={audienceCards}
        title="Карточки аудитории"
      >
        <NewRecordEditor action={saveHomepageAudienceCard} title="Новая карточка аудитории" description="Создайте компактную карточку для роли или сценария.">
          <SectionRedirect sectionId="homepage-audience" />
          <AudienceFields uid="new" />
          <SubmitRow />
        </NewRecordEditor>

        <div className="grid gap-4">
          {audienceCards.map((card) => (
            <AdminCmsInlineEditRecord
              action={saveHomepageAudienceCard}
              groupName="homepage-audience-records"
              key={card.id}
              summary={
                <AdminCmsCompactRecordSummary
                  items={[
                    { label: 'Порядок', value: card.priority },
                    { label: 'Ссылка', value: card.href },
                    { label: 'Обновлено', value: formatDate(card.updatedAt) }
                  ]}
                  status={<RecordStatus record={card} />}
                  subtitle={card.actionLabel}
                  title={card.title}
                />
              }
            >
              <SectionRedirect sectionId="homepage-audience" />
              <input name="cardId" type="hidden" value={card.id} />
              <AudienceFields card={card} uid={card.id} />
              <SubmitRow record={card}>
                {card.status !== ContentStatus.PUBLISHED ? <DeleteButton action={deleteHomepageAudienceCard} id={card.id} /> : null}
              </SubmitRow>
            </AdminCmsInlineEditRecord>
          ))}
        </div>
      </HomepageSectionEditor>

      <HomepageSectionEditor
        defaultOpen={activeSection === 'homepage-positioning'}
        description="Короткое объяснение проекта и нижний CTA главной страницы."
        id="homepage-positioning"
        records={ctaBlocks}
        title="Короткое позиционирование"
      >
        {ctaBlocks.length > 0 ? (
          ctaBlocks.map((cta) => (
            <AdminCmsInlineEditRecord
              action={saveHomepageCtaBlock}
              groupName="homepage-cta-records"
              key={cta.id}
              summary={
                <AdminCmsCompactRecordSummary
                  items={[
                    { label: 'Порядок', value: cta.priority },
                    { label: 'Основная ссылка', value: cta.primaryHref },
                    { label: 'Вторая ссылка', value: cta.secondaryHref ?? 'Не указана' },
                    { label: 'Обновлено', value: formatDate(cta.updatedAt) }
                  ]}
                  status={<RecordStatus record={cta} />}
                  subtitle={cta.primaryLabel}
                  title={cta.title}
                />
              }
            >
              <SectionRedirect sectionId="homepage-positioning" />
              <input name="ctaId" type="hidden" value={cta.id} />
              <CtaFields cta={cta} uid={cta.id} />
              <SubmitRow record={cta} />
            </AdminCmsInlineEditRecord>
          ))
        ) : (
          <NewRecordEditor action={saveHomepageCtaBlock} title="Создать CTA" description="Добавьте короткий блок с объяснением проекта и переходами.">
            <SectionRedirect sectionId="homepage-positioning" />
            <CtaFields uid="new" />
            <SubmitRow />
          </NewRecordEditor>
        )}
      </HomepageSectionEditor>

      <HomepageSectionEditor
        defaultOpen={activeSection === 'homepage-navigation'}
        description="Эти блоки ведут в основные разделы сайта и сейчас не имеют отдельной CMS-формы."
        id="homepage-navigation"
        status={{
          details: 'Без локальной формы',
          label: 'Статический блок',
          variant: 'neutral'
        }}
        title="Навигационные блоки"
      >
        <ExternalSectionPanel
          description="Блоки «Куда перейти», «Что уже доступно» и связанные маршрутные карточки собираются из публичного компонента и опубликованных записей. Здесь показано, откуда берутся данные; отдельной CMS-формы у этого блока нет."
          title="Источник данных"
        >
          <div className="grid gap-2 text-sm leading-6 text-[var(--muted)] sm:grid-cols-2">
            <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2">Переходы в разделы: статический список</span>
            <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2">Актуальные материалы: опубликованные записи</span>
            <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2">Публичная главная: без изменения</span>
            <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2">CMS-форма: не добавлена</span>
          </div>
        </ExternalSectionPanel>
      </HomepageSectionEditor>

      <HomepageSectionEditor
        defaultOpen={activeSection === 'homepage-social'}
        description="Публичные блоки с площадками и ссылками сообщества."
        id="homepage-social"
        records={socialBlocks}
        title="Соцсети"
      >
        <NewRecordEditor action={saveHomepageSocialBlock} title="Новая соцсеть" description="Добавьте канал сообщества или обновите ссылку на площадку.">
          <SectionRedirect sectionId="homepage-social" />
          <SocialFields uid="new" />
          <SubmitRow />
        </NewRecordEditor>

        <div className="grid gap-4">
          {socialBlocks.map((social) => (
            <AdminCmsInlineEditRecord
              action={saveHomepageSocialBlock}
              groupName="homepage-social-records"
              key={social.id}
              summary={
                <AdminCmsCompactRecordSummary
                  items={[
                    { label: 'Порядок', value: social.priority },
                    { label: 'Ссылка', value: social.href },
                    { label: 'Вариант', value: social.variant ?? 'Не указан' },
                    { label: 'Обновлено', value: formatDate(social.updatedAt) }
                  ]}
                  status={<RecordStatus record={social} />}
                  subtitle={social.name}
                  title={social.title}
                />
              }
            >
              <SectionRedirect sectionId="homepage-social" />
              <input name="socialId" type="hidden" value={social.id} />
              <SocialFields social={social} uid={social.id} />
              <SubmitRow record={social}>
                {social.status !== ContentStatus.PUBLISHED ? <DeleteButton action={deleteHomepageSocialBlock} id={social.id} /> : null}
              </SubmitRow>
            </AdminCmsInlineEditRecord>
          ))}
        </div>
      </HomepageSectionEditor>

      <HomepageSectionEditor
        defaultOpen={activeSection === 'homepage-general-sponsors'}
        description="Список берётся из раздела генеральных спонсоров. Здесь видно, что попадёт на главную."
        id="homepage-general-sponsors"
        records={generalSponsors}
        title="Генеральные спонсоры"
      >
        <ExternalSectionPanel
          description="Редактирование карточек, контактов, брендов и пользы для заведений находится в отдельном CRUD-разделе. Главная использует опубликованные записи оттуда."
          href={ADMIN_GENERAL_SPONSORS_PATH}
          linkLabel="Открыть спонсоров"
          title="Управление спонсорами"
        >
          {generalSponsors.length > 0 ? (
            <div className="grid gap-3">
              {generalSponsors.map((sponsor) => (
                <AdminCmsCompactRecordSummary
                  key={sponsor.id}
                  items={[
                    { label: 'Порядок', value: sponsor.priority },
                    { label: 'Slug', value: sponsor.slug },
                    { label: 'Обновлено', value: formatDate(sponsor.updatedAt) }
                  ]}
                  status={<RecordStatus record={sponsor} />}
                  subtitle={sponsor.isFeatured ? 'Показывается как выделенный' : 'Обычная запись'}
                  title={sponsor.name}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-[var(--muted)]">Записей пока нет. Создайте спонсора в отдельном разделе и опубликуйте его.</p>
          )}
        </ExternalSectionPanel>
      </HomepageSectionEditor>

      <HomepageSectionEditor
        defaultOpen={activeSection === 'homepage-calculator'}
        description="Блок главной страницы, который ведёт к калькулятору себестоимости."
        id="homepage-calculator"
        records={calculatorTeasers}
        title="Тизер калькулятора"
      >
        {calculatorTeasers.length > 0 ? (
          calculatorTeasers.map((teaser) => (
            <AdminCmsInlineEditRecord
              action={saveHomepageCalculatorTeaser}
              groupName="homepage-calculator-records"
              key={teaser.id}
              summary={
                <AdminCmsCompactRecordSummary
                  items={[
                    { label: 'Порядок', value: teaser.priority },
                    { label: 'Шаги', value: lineCount(teaser.stepsText) },
                    { label: 'Ссылка', value: teaser.actionHref },
                    { label: 'Обновлено', value: formatDate(teaser.updatedAt) }
                  ]}
                  status={<RecordStatus record={teaser} />}
                  subtitle={teaser.cardTitle}
                  title={teaser.title}
                />
              }
            >
              <SectionRedirect sectionId="homepage-calculator" />
              <input name="calculatorId" type="hidden" value={teaser.id} />
              <CalculatorFields teaser={teaser} uid={teaser.id} />
              <SubmitRow record={teaser} />
            </AdminCmsInlineEditRecord>
          ))
        ) : (
          <NewRecordEditor action={saveHomepageCalculatorTeaser} title="Создать тизер калькулятора" description="Добавьте блок с переходом в калькулятор себестоимости.">
            <SectionRedirect sectionId="homepage-calculator" />
            <CalculatorFields uid="new" />
            <SubmitRow />
          </NewRecordEditor>
        )}
      </HomepageSectionEditor>
    </div>
  );
}
