import type { ContentStatus } from '@/modules/admin/queries';

export const ADMIN_HOMEPAGE_PATH = '/admin/homepage';
export const ADMIN_GENERAL_SPONSORS_PATH = '/admin/general-sponsors';

export const homepageSectionIds = [
  'homepage-hero',
  'homepage-audience',
  'homepage-positioning',
  'homepage-navigation',
  'homepage-social',
  'homepage-general-sponsors',
  'homepage-calculator'
] as const;

export type HomepageFormAction = (formData: FormData) => Promise<void>;

export type HomepageSectionId = (typeof homepageSectionIds)[number];

export const sectionMeta: Array<{
  description: string;
  id: HomepageSectionId;
  title: string;
  externalStatus?: { details: string; label: string; variant: 'neutral' | 'success' | 'warning' | 'danger' | 'pending' };
}> = [
  { description: 'Первый экран главной страницы.', id: 'homepage-hero', title: 'Hero' },
  { description: 'Карточки для ролей на главной.', id: 'homepage-audience', title: 'Карточки аудитории' },
  { description: 'Короткий текст о проекте и CTA внизу главной.', id: 'homepage-positioning', title: 'Короткое позиционирование' },
  { description: 'Переходы в основные разделы сайта.', id: 'homepage-navigation', title: 'Навигационные блоки', externalStatus: { details: 'Статический блок', label: 'Правится в коде', variant: 'neutral' } },
  { description: 'Публичные каналы сообщества и ссылки.', id: 'homepage-social', title: 'Соцсети' },
  { description: 'Профили генеральных спонсоров, которые попадают на главную.', id: 'homepage-general-sponsors', title: 'Генеральные спонсоры' },
  { description: 'Блок, который ведёт к калькулятору себестоимости.', id: 'homepage-calculator', title: 'Тизер калькулятора' }
];

export type StatusValue = {
  id: string;
  priority: number;
  status: ContentStatus;
  updatedAt: Date;
};

export type HeroValues = Partial<{
  description: string;
  eyebrow: string;
  priority: number;
  signalsText: string | null;
  status: ContentStatus;
  title: string;
}>;

export type AudienceValues = Partial<{
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

export type SocialValues = Partial<{
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

export type CtaValues = Partial<{
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

export type CalculatorValues = Partial<{
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

export type ExternalSectionStatus = {
  details?: string;
  label: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'pending';
};

export type HomepageOverviewSection = {
  description: string;
  id: HomepageSectionId;
  records?: StatusValue[];
  status?: ExternalSectionStatus;
  title: string;
};
