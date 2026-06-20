import { ContentStatus } from '@/modules/admin/queries';
import type { HomepageFormAction } from '@/components/admin/homepage-cms/homepage-cms-types';
import { AdminCmsInlineEditRecord, AdminCmsCompactRecordSummary } from '@/components/admin/admin-cms-form';
import { SectionRedirect, SubmitRow, DeleteButton, RecordStatus, formatDate, lineCount } from '@/components/admin/homepage-cms/homepage-cms-utils';
import { HomepageSectionEditor, NewRecordEditor } from '@/components/admin/homepage-cms/homepage-cms-section-layout';
import { HeroFields, AudienceFields, CtaFields, CalculatorFields, SocialFields, TestimonialFields, StepFields } from '@/components/admin/homepage-cms/homepage-cms-fields';

type SectionProps = { activeSection: string };

type HeroRecord = { id: string; priority: number; signalsText: string | null; updatedAt: Date; eyebrow: string; title: string; status: ContentStatus };
type AudienceRecord = { id: string; priority: number; href: string; updatedAt: Date; actionLabel: string; title: string; status: ContentStatus };
type CtaRecord = { id: string; priority: number; primaryHref: string; secondaryHref: string | null; updatedAt: Date; primaryLabel: string; title: string; status: ContentStatus };
type SocialRecord = { id: string; priority: number; href: string; variant: string | null; updatedAt: Date; name: string; title: string; status: ContentStatus };
type CalculatorRecord = { id: string; priority: number; stepsText: string | null; updatedAt: Date; actionHref: string; cardTitle: string; title: string; status: ContentStatus };
type TestimonialRecord = { id: string; priority: number; quote: string; author: string; role: string; city: string; updatedAt: Date; status: ContentStatus };
type StepRecord = { id: string; priority: number; title: string; description: string; updatedAt: Date; status: ContentStatus };

export function HeroSection({ heroes, activeSection, saveAction }: { heroes: HeroRecord[] } & SectionProps & { saveAction: HomepageFormAction }) {
  return (
    <HomepageSectionEditor
      defaultOpen={activeSection === 'homepage-hero'}
      description="Если активной записи нет, главная страница показывает резервный вариант."
      id="homepage-hero"
      records={heroes}
      title="Главный экран"
    >
      {heroes.length > 0 ? (
        heroes.map((hero) => (
          <AdminCmsInlineEditRecord
            action={saveAction}
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
        <NewRecordEditor action={saveAction} title="Создать запись главного экрана" description="Добавьте первую запись главного экрана сайта.">
          <SectionRedirect sectionId="homepage-hero" />
          <HeroFields uid="new" />
          <SubmitRow />
        </NewRecordEditor>
      )}
    </HomepageSectionEditor>
  );
}

export function AudienceSection({ cards, activeSection, saveAction, deleteAction }: { cards: AudienceRecord[] } & SectionProps & { saveAction: HomepageFormAction; deleteAction: HomepageFormAction }) {
  return (
    <HomepageSectionEditor
      defaultOpen={activeSection === 'homepage-audience'}
      description="Эти записи используются в первом экране и в блоке «Для кого»."
      id="homepage-audience"
      records={cards}
      title="Карточки аудитории"
    >
      <NewRecordEditor action={saveAction} title="Новая карточка аудитории" description="Создайте компактную карточку для роли или сценария.">
        <SectionRedirect sectionId="homepage-audience" />
        <AudienceFields uid="new" />
        <SubmitRow />
      </NewRecordEditor>

      <div className="grid gap-4">
        {cards.map((card) => (
          <AdminCmsInlineEditRecord
            action={saveAction}
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
              {card.status === ContentStatus.DRAFT ? <DeleteButton action={deleteAction} id={card.id} /> : null}
            </SubmitRow>
          </AdminCmsInlineEditRecord>
        ))}
      </div>
    </HomepageSectionEditor>
  );
}

export function CtaSection({ ctaBlocks, activeSection, saveAction }: { ctaBlocks: CtaRecord[] } & SectionProps & { saveAction: HomepageFormAction }) {
  return (
    <HomepageSectionEditor
      defaultOpen={activeSection === 'homepage-positioning'}
      description="Короткое описание проекта и кнопки действия внизу главной."
      id="homepage-positioning"
      records={ctaBlocks}
      title="Короткое позиционирование"
    >
      {ctaBlocks.length > 0 ? (
        ctaBlocks.map((cta) => (
          <AdminCmsInlineEditRecord
            action={saveAction}
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
        <NewRecordEditor action={saveAction} title="Создать блок призыва к действию" description="Добавьте короткий блок с объяснением проекта и переходами.">
          <SectionRedirect sectionId="homepage-positioning" />
          <CtaFields uid="new" />
          <SubmitRow />
        </NewRecordEditor>
      )}
    </HomepageSectionEditor>
  );
}

export function SocialSection({ socialBlocks, activeSection, saveAction, deleteAction }: { socialBlocks: SocialRecord[] } & SectionProps & { saveAction: HomepageFormAction; deleteAction: HomepageFormAction }) {
  return (
    <HomepageSectionEditor
      defaultOpen={activeSection === 'homepage-social'}
      description="Публичные блоки с площадками и ссылками сообщества."
      id="homepage-social"
      records={socialBlocks}
      title="Соцсети"
    >
      <NewRecordEditor action={saveAction} title="Новая соцсеть" description="Добавьте канал сообщества или обновите ссылку на площадку.">
        <SectionRedirect sectionId="homepage-social" />
        <SocialFields uid="new" />
        <SubmitRow />
      </NewRecordEditor>

      <div className="grid gap-4">
        {socialBlocks.map((social) => (
          <AdminCmsInlineEditRecord
            action={saveAction}
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
              {social.status === ContentStatus.DRAFT ? <DeleteButton action={deleteAction} id={social.id} /> : null}
            </SubmitRow>
          </AdminCmsInlineEditRecord>
        ))}
      </div>
    </HomepageSectionEditor>
  );
}

export function CalculatorSection({ teasers, activeSection, saveAction }: { teasers: CalculatorRecord[] } & SectionProps & { saveAction: HomepageFormAction }) {
  return (
    <HomepageSectionEditor
      defaultOpen={activeSection === 'homepage-calculator'}
      description="Блок главной страницы, который ведёт к калькулятору себестоимости."
      id="homepage-calculator"
      records={teasers}
      title="Тизер калькулятора"
    >
      {teasers.length > 0 ? (
        teasers.map((teaser) => (
          <AdminCmsInlineEditRecord
            action={saveAction}
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
        <NewRecordEditor action={saveAction} title="Создать тизер калькулятора" description="Добавьте блок с переходом в калькулятор себестоимости.">
          <SectionRedirect sectionId="homepage-calculator" />
          <CalculatorFields uid="new" />
          <SubmitRow />
        </NewRecordEditor>
      )}
    </HomepageSectionEditor>
  );
}

export function TestimonialSection({ testimonials, activeSection, saveAction, deleteAction }: { testimonials: TestimonialRecord[] } & SectionProps & { saveAction: HomepageFormAction; deleteAction: HomepageFormAction }) {
  return (
    <HomepageSectionEditor
      defaultOpen={activeSection === 'homepage-testimonials'}
      description="Отзывы заведений и специалистов. Если опубликованных записей нет, на главной показывается резервный набор."
      id="homepage-testimonials"
      records={testimonials}
      title="Отзывы индустрии"
    >
      <NewRecordEditor action={saveAction} title="Новый отзыв" description="Добавьте отзыв кофейни, бара или специалиста.">
        <SectionRedirect sectionId="homepage-testimonials" />
        <TestimonialFields uid="new" />
        <SubmitRow />
      </NewRecordEditor>

      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <AdminCmsInlineEditRecord
            action={saveAction}
            groupName="homepage-testimonial-records"
            key={testimonial.id}
            summary={
              <AdminCmsCompactRecordSummary
                items={[
                  { label: 'Порядок', value: testimonial.priority },
                  { label: 'Роль', value: testimonial.role },
                  { label: 'Город', value: testimonial.city },
                  { label: 'Обновлено', value: formatDate(testimonial.updatedAt) }
                ]}
                status={<RecordStatus record={testimonial} />}
                subtitle={testimonial.author}
                title={testimonial.quote}
              />
            }
          >
            <SectionRedirect sectionId="homepage-testimonials" />
            <input name="testimonialId" type="hidden" value={testimonial.id} />
            <TestimonialFields testimonial={testimonial} uid={testimonial.id} />
            <SubmitRow record={testimonial}>
              {testimonial.status === ContentStatus.DRAFT ? <DeleteButton action={deleteAction} id={testimonial.id} /> : null}
            </SubmitRow>
          </AdminCmsInlineEditRecord>
        ))}
      </div>
    </HomepageSectionEditor>
  );
}

export function StepsSection({ steps, activeSection, saveAction, deleteAction }: { steps: StepRecord[] } & SectionProps & { saveAction: HomepageFormAction; deleteAction: HomepageFormAction }) {
  return (
    <HomepageSectionEditor
      defaultOpen={activeSection === 'homepage-steps'}
      description="Блок «Как это работает». Номера шагов проставляются автоматически по порядку. Если опубликованных записей нет, показывается резервный набор."
      id="homepage-steps"
      records={steps}
      title="Шаги «Как это работает»"
    >
      <NewRecordEditor action={saveAction} title="Новый шаг" description="Добавьте шаг сценария использования платформы.">
        <SectionRedirect sectionId="homepage-steps" />
        <StepFields uid="new" />
        <SubmitRow />
      </NewRecordEditor>

      <div className="grid gap-4">
        {steps.map((step) => (
          <AdminCmsInlineEditRecord
            action={saveAction}
            groupName="homepage-step-records"
            key={step.id}
            summary={
              <AdminCmsCompactRecordSummary
                items={[
                  { label: 'Порядок', value: step.priority },
                  { label: 'Обновлено', value: formatDate(step.updatedAt) }
                ]}
                status={<RecordStatus record={step} />}
                subtitle={step.description}
                title={step.title}
              />
            }
          >
            <SectionRedirect sectionId="homepage-steps" />
            <input name="stepId" type="hidden" value={step.id} />
            <StepFields step={step} uid={step.id} />
            <SubmitRow record={step}>
              {step.status === ContentStatus.DRAFT ? <DeleteButton action={deleteAction} id={step.id} /> : null}
            </SubmitRow>
          </AdminCmsInlineEditRecord>
        ))}
      </div>
    </HomepageSectionEditor>
  );
}
