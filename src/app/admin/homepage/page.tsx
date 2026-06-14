import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { AdminCmsPanel } from '@/components/admin/admin-cms-form';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { ADMIN_GENERAL_SPONSORS_PATH, sectionMeta } from '@/components/admin/homepage-cms/homepage-cms-types';
import { RecordStatus, formatDate, getActiveHomepageSection } from '@/components/admin/homepage-cms/homepage-cms-utils';
import { HomepageSectionEditor, ExternalSectionPanel } from '@/components/admin/homepage-cms/homepage-cms-section-layout';
import { AdminCmsCompactRecordSummary } from '@/components/admin/admin-cms-form';
import {
  deleteHomepageAudienceCard,
  deleteHomepageSocialBlock,
  saveHomepageAudienceCard,
  saveHomepageCalculatorTeaser,
  saveHomepageCtaBlock,
  saveHomepageHero,
  saveHomepageSocialBlock
} from '@/app/admin/homepage/actions';
import { HeroSection, AudienceSection, CtaSection, SocialSection, CalculatorSection } from '@/components/admin/homepage-cms/homepage-cms-sections';
import { getHomepageCmsData } from '@/lib/admin/homepage-queries';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';

export const dynamic = 'force-dynamic';

export default async function AdminHomepagePage({ searchParams }: { searchParams?: Promise<AdminContentSearchParams> }) {
  await requireAdminSectionAccess('homepage');

  const params = (await searchParams) ?? {};
  const activeSection = getActiveHomepageSection(params) ?? '';
  const cmsData = await getHomepageCmsData();

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Каждая секция редактируется отдельно. На сайте видны только опубликованные записи; черновики, проверка и архив скрыты."
        eyebrow="Админка / Главная"
        title="Главная сайта"
      />

      <AdminActionAlert params={params} />

      <AdminCmsPanel title="Секции главной" description="Каждая секция редактируется отдельно. На сайте видны только опубликованные записи.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sectionMeta.map((section) => (
            <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3" key={section.id}>
              <p className="text-sm font-semibold">{section.title}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{section.description}</p>
              {section.externalStatus ? (
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  {section.externalStatus.label}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </AdminCmsPanel>

      <HeroSection heroes={cmsData.heroes} activeSection={activeSection} saveAction={saveHomepageHero} />

      <AudienceSection cards={cmsData.audienceCards} activeSection={activeSection} saveAction={saveHomepageAudienceCard} deleteAction={deleteHomepageAudienceCard} />

      <CtaSection ctaBlocks={cmsData.ctaBlocks} activeSection={activeSection} saveAction={saveHomepageCtaBlock} />

      <HomepageSectionEditor
        defaultOpen={activeSection === 'homepage-navigation'}
        description="Эти блоки ведут в основные разделы сайта. Отдельной формы редактирования пока нет — структура задана в коде."
        id="homepage-navigation"
        title="Навигационные блоки"
      >
        <ExternalSectionPanel
          description="Блоки «Куда перейти», «Что уже доступно» и связанные маршрутные карточки собираются из публичного компонента и опубликованных записей."
          title="Источник данных"
        >
          <div className="grid gap-2 text-sm leading-6 text-[var(--muted)] sm:grid-cols-2">
            <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2">Переходы в разделы: статический список</span>
            <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2">Актуальные материалы: опубликованные записи</span>
            <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2">Публичная главная: без изменения</span>
            <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-3 py-2">Форма редактирования: не добавлена</span>
          </div>
        </ExternalSectionPanel>
      </HomepageSectionEditor>

      <SocialSection socialBlocks={cmsData.socialBlocks} activeSection={activeSection} saveAction={saveHomepageSocialBlock} deleteAction={deleteHomepageSocialBlock} />

      <HomepageSectionEditor
        defaultOpen={activeSection === 'homepage-general-sponsors'}
        description="Список берётся из раздела генеральных спонсоров."
        id="homepage-general-sponsors"
        title="Генеральные спонсоры"
      >
        <ExternalSectionPanel
          description="Редактирование карточек, контактов, брендов и пользы для заведений находится в отдельном CRUD-разделе."
          href={ADMIN_GENERAL_SPONSORS_PATH}
          linkLabel="Открыть спонсоров"
          title="Управление спонсорами"
        >
          {cmsData.generalSponsors.length > 0 ? (
            <div className="grid gap-3">
              {cmsData.generalSponsors.map((sponsor) => (
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

      <CalculatorSection teasers={cmsData.calculatorTeasers} activeSection={activeSection} saveAction={saveHomepageCalculatorTeaser} />
    </div>
  );
}
