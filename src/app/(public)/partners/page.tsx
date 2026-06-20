import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PartnerFormatTable } from '@/components/public/editorial-display-primitives';
import { PageHero } from '@/components/public/page-hero';
import { RoleTaskCard } from '@/components/public/public-card-patterns';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { JsonLd } from '@/components/seo/json-ld';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { buildPublicPageMetadata } from '@/lib/public/metadata';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Партнёры',
  description: 'Партнёрские форматы BARSYNERGY для брендов, школ и заведений.',
  path: '/partners'
});

const partnerFormats = [
  {
    title: 'Событие',
    fit: 'Брендам, школам и площадкам, которым нужна встреча со специалистами и командами заведений.',
    partnerProvides: 'Тема, продукт, эксперт, площадка или команда для события.',
    barsynergyProvides: 'Соберём формат, анонс, страницу события и действие для гостей.',
    nextStep: 'Описать событие и аудиторию.'
  },
  {
    title: 'Обучение',
    fit: 'Брендам, школам и заведениям, которым нужно обучение под команду, запуск или сезон.',
    partnerProvides: 'Тема, эксперт, продуктовая часть, площадка или задача команды.',
    barsynergyProvides: 'Соберём программу, заявку и формат запуска.',
    nextStep: 'Описать, кого нужно обучить.'
  },
  {
    title: 'Материал',
    fit: 'Компаниям, которым нужен материал, кейс или интервью для специалистов и заведений.',
    partnerProvides: 'Фактура, тема, контакты, изображения и эксперт для комментария.',
    barsynergyProvides: 'Подготовим материал и привяжем его к нужному разделу сайта.',
    nextStep: 'Материал проходит редакторскую проверку.'
  },
  {
    title: 'Каталог',
    fit: 'Поставщикам, школам, сервисам и площадкам, которым нужна карточка компании на сайте.',
    partnerProvides: 'Профиль компании, контакты, продукты, география работы и короткое описание.',
    barsynergyProvides: 'Разместить карточку и связать её с релевантными разделами.',
    nextStep: 'Передать данные компании.'
  },
  {
    title: 'Спецпроект',
    fit: 'Запускам и сезонным темам, где нужно связать событие, обучение и материалы.',
    partnerProvides: 'Задача, продукты, эксперты, календарь и ответственные со своей стороны.',
    barsynergyProvides: 'Соберём проект из события, материала, обучения или другого рабочего формата.',
    nextStep: 'Описать задачу проекта.'
  }
] as const;

const partnershipStartOptions = [
  {
    label: 'Основной путь',
    title: 'Сначала описать задачу',
    description: 'Если формат ещё не выбран, напишите задачу. Мы посмотрим и предложим ближайший вариант.',
    recommended: true
  },
  {
    label: 'Альтернатива',
    title: 'Описать проект до заявки',
    description: 'Подходит, если нужно выбрать между событием, обучением, материалом, каталогом и спецпроектом.',
    recommended: false
  },
  {
    label: 'Отдельный раздел',
    title: 'Посмотреть спонсорство',
    description: 'Если задача ближе к размещению бренда, откройте страницу спонсорства.',
    recommended: false
  }
] as const;

function getPartnerContactHref(partnerType?: string) {
  const params = new URLSearchParams({ topic: 'partnership' });

  if (partnerType) {
    params.set('partnerType', partnerType);
  }

  return `/contacts?${params.toString()}#contact-form`;
}

function PartnershipStartSequence() {
  const contactHref = getPartnerContactHref();

  return (
    <section className="background-zone background-zone-gray editorial-grid border-b border-[var(--line)] py-10 md:py-14">
      <div className="container grid gap-8 xl:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)] xl:items-center">
        <div>
          <PublicEyebrow>Партнёрство</PublicEyebrow>
          <PublicDisplayTitle className="mt-4 max-w-[13ch]">С чего можно начать</PublicDisplayTitle>
          <PublicBodyText className="mt-5 max-w-md" size="md">
            Начните с задачи. Формат можно выбрать сразу или уточнить вместе с нами.
          </PublicBodyText>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="min-h-12 rounded-[var(--radius-md)] px-5 tracking-normal" href={contactHref}>
              Описать партнёрскую задачу
              <ArrowUpRight size={16} />
            </Button>
          </div>
        </div>

        <div className="[&>article:last-child]:border-b-0 [&>article:first-child]:pt-0">
          {partnershipStartOptions.map((option) => (
            <RoleTaskCard
              density="compact"
              description={option.description}
              key={option.title}
              presentation="row"
              priority={option.recommended}
              title={option.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PartnersPage() {
  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/partners', 'Партнёры')} />
      <PageHero
        breadcrumbs={[{ label: 'Партнёры' }]}
        eyebrow="Партнёры"
        title="Партнёрство для брендов, школ и заведений"
        subtitle="Помогаем брендам, школам и заведениям появляться внутри профессиональной кофейной среды: через события, обучение, материалы и каталог. Спонсоры финансируют проект, поставщики размещают контакты в каталоге."
        tone="graphite"
        actions={[
          { label: 'Описать партнёрскую задачу', href: getPartnerContactHref(), kind: 'primary' },
          { label: 'Смотреть спонсорство', href: '/general-sponsors', kind: 'secondary' }
        ]}
      />
      <section className="background-zone background-zone-beige editorial-grid border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <PartnerFormatTable
            className="border-0 py-0"
            description="Выберите, что хотите сделать: провести событие, собрать обучение, запустить материал, разместить компанию или обсудить спецпроект."
            eyebrow="Форматы"
            items={partnerFormats.map((format) => ({
              format: format.title,
              fit: format.fit,
              partnerProvides: format.partnerProvides,
              barsynergyProvides: format.barsynergyProvides,
              nextStep: format.nextStep
            }))}
            title="Как можно работать вместе"
          />
        </div>
      </section>
      <PartnershipStartSequence />
    </>
  );
}
