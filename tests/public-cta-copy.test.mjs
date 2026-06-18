import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

const publicActionSourceFiles = [
  'src/app/(public)/articles/page.tsx',
  'src/app/(public)/consulting/page.tsx',
  'src/app/(public)/contacts/page.tsx',
  'src/app/(public)/education/page.tsx',
  'src/app/(public)/partners/page.tsx',
  'src/app/(public)/general-sponsors/page.tsx',
  'src/app/(public)/search/page.tsx',
  'src/app/(public)/suppliers/page.tsx',
  'src/app/(public)/tools/cost-calculator/page.tsx',
  'src/components/public/article-detail-sidebar.tsx',
  'src/components/public/business-solution-form.tsx',
  'src/components/public/consulting-request-form.tsx',
  'src/components/public/contact-application-form.tsx',
  'src/components/public/contact-application-form-constants.ts',
  'src/components/public/contact-action-row.tsx',
  'src/components/public/general-sponsor-card.tsx',
  'src/components/public/homepage-client.tsx',
  'src/components/public/partner-application-form.tsx',
  'src/components/public/platform-ui.tsx',
  'src/components/public/public-related-content-section.tsx',
  'src/components/public/published-content-section.tsx',
  'src/components/public/social-channel-card.tsx',
  'src/components/public/vacancy-application-forms.tsx',
  'src/lib/public/home.ts'
];

const publicContactActionSourceFiles = [
  'src/app/(public)/contacts/page.tsx',
  'src/app/(public)/suppliers/page.tsx',
  'src/app/(public)/vacancies/page.tsx',
  'src/components/layout/mobile-site-menu.tsx',
  'src/components/layout/site-header.tsx',
  'src/components/public/contact-application-form.tsx',
  'src/components/public/homepage-client.tsx',
  'src/components/public/vacancy-application-forms.tsx'
];

test('public CTA labels describe concrete user actions', () => {
  const source = publicActionSourceFiles.map(readProjectFile).join('\n');
  const visibleCopySource = source.replace(/const replacements: Record<string, string> = \{[\s\S]*?\n {2}\};/, '');

  assert.doesNotMatch(visibleCopySource, /Запросить формат/);
  assert.doesNotMatch(visibleCopySource, /Запросить сертификат/);
  assert.doesNotMatch(visibleCopySource, /Выбрать формат/);
  assert.doesNotMatch(visibleCopySource, /Обсудить формат/);
  assert.doesNotMatch(visibleCopySource, /Получить условия/);
  assert.doesNotMatch(visibleCopySource, /Открыть обучение/);
  assert.doesNotMatch(visibleCopySource, /Открыть каталог/);
  assert.doesNotMatch(visibleCopySource, /Открыть программу/);
  assert.doesNotMatch(visibleCopySource, /Открыть профиль/);
  assert.doesNotMatch(visibleCopySource, /Открыть форму заявки/);
  assert.doesNotMatch(visibleCopySource, /Открыть отклик/);
  assert.doesNotMatch(visibleCopySource, /Открыть запись/);
  assert.doesNotMatch(visibleCopySource, /Открыть событие/);
  assert.doesNotMatch(visibleCopySource, /Открыть калькулятор/);
  assert.doesNotMatch(visibleCopySource, /Открыть канал/);

  assert.match(source, /Обсудить открытие/);
  assert.match(source, /Разобрать меню/);
  assert.match(source, /Описать задачу команды/);
  assert.match(source, /Запросить условия сотрудничества/);
  assert.match(source, /Выбрать программу/);
  assert.match(source, /Выбрать событие/);
  assert.match(source, /Найти вакансию/);
  assert.match(source, /Смотреть поставщиков/);
  assert.match(source, /Разместить заведение/);
  assert.match(source, /Рассчитать себестоимость/);
  assert.match(source, /Написать в Telegram/);
  assert.match(source, /Смотреть поставщика/);
  assert.match(source, /Смотреть программу/);
  assert.match(source, /Смотреть Instagram/);
  assert.match(source, /function normalizePublicActionLabel/);
  assert.match(source, /'Открыть калькулятор': 'Рассчитать себестоимость'/);
  assert.match(source, /'Открыть каталог': 'Смотреть поставщиков'/);
  assert.match(source, /normalizePublicActionLabel\(calculatorTeaser\.actionLabel\)/);
});

test('public contact actions use shared direct wording', () => {
  const source = publicContactActionSourceFiles.map(readProjectFile).join('\n');
  const mobileMenuSource = readProjectFile('src/components/layout/mobile-site-menu.tsx');

  assert.match(source, /Связаться с нами/);
  assert.match(source, /Написать команде/);
  assert.match(mobileMenuSource, /registerUserItem/);
  assert.match(mobileMenuSource, /group\.label/);
  assert.doesNotMatch(mobileMenuSource, /label: 'Бизнес и партнёры'/);
  assert.doesNotMatch(mobileMenuSource, /\/contacts\?topic=other#contact-form/);
});

test('business process rows do not duplicate step metadata chips', () => {
  const source = readProjectFile('src/app/(public)/business/page.tsx');
  const sectionStart = source.indexOf('<PublicEyebrow>Как это работает</PublicEyebrow>');
  const sectionEnd = source.indexOf('</section>', sectionStart);
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /processSteps\.map\(\(step, (i|index)\) =>/);
  assert.match(sectionSource, /\{step\.title\}/);
  assert.match(sectionSource, /\{step\.description\}/);
  assert.doesNotMatch(sectionSource, /metaLabel="Этап"/);
  assert.doesNotMatch(sectionSource, /meta=\{/);
  assert.doesNotMatch(sectionSource, /action=\{\{ href: step\.href, label: step\.action \}\}/);
  assert.doesNotMatch(sectionSource, /Сценарий/);
  assert.doesNotMatch(sectionSource, /Первый запуск/);
});

test('business page renders the catalog listing request form directly', () => {
  const source = readProjectFile('src/app/(public)/business/page.tsx');
  const formSource = readProjectFile('src/components/public/business-solution-form.tsx');
  const actionSource = readProjectFile('src/app/(public)/business/actions.ts');

  assert.match(source, /Каталог заведений/);
  assert.match(source, /BusinessSolutionForm/);
  assert.match(source, /direct/);
  assert.match(source, /#business-request/);
  assert.match(source, /getApplicationCityOptions/);
  assert.match(source, /arePublicApplicationFormsEnabled/);
  assert.match(source, /getPublicApplicationUtm/);
  assert.match(formSource, /label="Название заведения"/);
  assert.match(formSource, /label="Тип"/);
  assert.match(formSource, /label="Комментарий"/);
  assert.match(formSource, /businessVenueTypeOptions/);
  assert.match(actionSource, /Размещение в каталоге/);
  assert.doesNotMatch(source, /Цифровые решения для заведений и команд/);
  assert.doesNotMatch(source, /secondaryLink=\{\{ label: 'Войти в кабинет'/);
});

test('contacts page keeps channels and the feedback form in one compact section', () => {
  const pageSource = readProjectFile('src/app/(public)/contacts/page.tsx');
  const formSource = readProjectFile('src/components/public/contact-application-form.tsx');
  const heroStart = pageSource.indexOf('<EditorialPublicPage');
  const heroEnd = pageSource.indexOf('/>', heroStart);
  const heroSource = pageSource.slice(heroStart, heroEnd);

  assert.doesNotMatch(heroSource, /primaryLink=/);
  assert.doesNotMatch(heroSource, /secondaryLink=/);
  assert.doesNotMatch(heroSource, /#contact-channels/);
  assert.doesNotMatch(heroSource, /Политика обработки персональных данных/);
  assert.doesNotMatch(pageSource, /href: '#contact-form'/);
  assert.doesNotMatch(formSource, /showFormDisclosure/);
  assert.doesNotMatch(formSource, /defaultOpen=/);
  assert.doesNotMatch(formSource, /RequestDisclosure/);
  assert.match(formSource, /title="Опишите задачу — ответим на ваш контакт"/);
  assert.match(formSource, /Укажите контакт и коротко опишите задачу\. Детали можно добавить ниже, если они нужны\./);
  assert.match(formSource, /contact-primary-fields grid gap-4 md:grid-cols-2/);
  assert.match(formSource, /contact-primary-fields/);
  assert.doesNotMatch(formSource, /id="contact-channels"/);
  assert.doesNotMatch(formSource, /contact-channels-panel/);
  assert.match(pageSource, /const cities = applicationFormsEnabled \? await getApplicationCityOptions\(\) : \[\]/);
});

test('public visual number indicators do not use leading zeroes', () => {
  const source = [
    'src/app/(public)/consulting/page.tsx',
    'src/app/(public)/general-sponsors/page.tsx',
    'src/components/public/platform-ui-tool-teaser.tsx'
  ].map(readProjectFile).join('\n');

  assert.match(source, /home-tool-step-index">\{index \+ 1\}/);
  assert.doesNotMatch(source, /padStart\(2, '0'\)/);
  assert.doesNotMatch(source, /code: '0[1-9]'/);
  assert.doesNotMatch(source, /num: '0[1-9]'/);
});

test('related content rows only draw separators between items', () => {
  const source = readProjectFile('src/components/public/public-related-content-section.tsx');
  const listStart = source.indexOf('{items.map((item, index)');
  const listSource = source.slice(source.lastIndexOf('<div', listStart), source.indexOf('</div>', listStart));

  assert.doesNotMatch(listSource, /border-y border-\[var\(--line\)\]/);
  assert.match(listSource, /border-b border-\[var\(--line\)\] px-3 py-5 last:border-b-0/);
});

test('education page removes the redundant bottom request promo block', () => {
  const source = readProjectFile('src/app/(public)/education/page.tsx');

  assert.doesNotMatch(source, /education-compact-request/);
  assert.doesNotMatch(source, /Заявка на обучение/);
  assert.doesNotMatch(source, /Опишите задачу обучения/);
  assert.doesNotMatch(source, /Интенсив, разбор, обучение команды или сертификат/);
  assert.doesNotMatch(source, />\s*Описать задачу\s*</);
  assert.doesNotMatch(source, /Можно запросить интенсив/);
  assert.doesNotMatch(source, /Подберите формат под задачу команды/);
});

test('education format choices render as filtered accordion cards', () => {
  const source = readProjectFile('src/components/public/editorial-display-primitives-panels.tsx');
  const matrixStart = source.indexOf('export function ProgramFormatMatrix');
  const matrixEnd = source.indexOf('export function PartnerFormatTable');
  const matrixSource = source.slice(matrixStart, matrixEnd);

  assert.match(matrixSource, /useState<'all' \| 'barista' \| 'manager' \| 'owner'>/);
  assert.match(matrixSource, /const filteredItems = useMemo/);
  assert.match(matrixSource, /aria-pressed=\{audienceFilter === filter\.id\}/);
  assert.match(matrixSource, /<StatusPill>\{item\.status\}<\/StatusPill>/);
  assert.match(matrixSource, /<InlineAction action=\{item\.action\} \/>/);
  assert.match(matrixSource, /public-card-shell flex h-full flex-col p-4 md:p-5/);
  assert.doesNotMatch(matrixSource, /<StatusPill accent>\{item\.status\}<\/StatusPill>/);
  assert.doesNotMatch(matrixSource, /<details/);
  assert.doesNotMatch(matrixSource, /Раскрыть/);
  assert.doesNotMatch(matrixSource, /Свернуть/);
});

test('sponsor benefit and package sections render as editorial rows', () => {
  const primitivesSource = readProjectFile('src/components/public/editorial-display-primitives-panels.tsx');
  const primitivesTypesSource = readProjectFile('src/components/public/editorial-display-primitives-types.ts');
  const pageSource = readProjectFile('src/app/(public)/general-sponsors/page.tsx');
  const benefitStart = primitivesSource.indexOf('export function SponsorBenefitSheet');
  const benefitEnd = primitivesSource.indexOf('export function SponsorPackageComparison', benefitStart);
  const packageStart = primitivesSource.indexOf('export function SponsorPackageComparison');
  const packageEnd = primitivesSource.indexOf('export function ProcessStepsInline', packageStart);
  const benefitSource = primitivesSource.slice(benefitStart, benefitEnd);
  const packageSource = primitivesSource.slice(packageStart, packageEnd);

  assert.match(primitivesTypesSource, /benefit: ReactNode/);
  assert.match(primitivesTypesSource, /brandVisibility: ReactNode/);
  assert.match(primitivesTypesSource, /result: ReactNode/);
  assert.match(benefitSource, /sponsor-benefit-sheet divide-y divide-\[var\(--line\)\] border-y/);
  assert.match(benefitSource, /Где бренд виден/);
  assert.doesNotMatch(benefitSource, /StructuredCard/);
  assert.doesNotMatch(benefitSource, /public-card-shell/);
  assert.match(packageSource, /sponsor-package-table border-y border-\[var\(--line\)\]/);
  assert.match(packageSource, /sponsor-package-row grid gap-4 border-b/);
  assert.match(packageSource, /<MetaText>Пакет<\/MetaText>/);
  assert.doesNotMatch(packageSource, /StructuredCard/);
  assert.doesNotMatch(packageSource, /public-card-shell/);
  assert.doesNotMatch(pageSource, /area:/);
  assert.doesNotMatch(pageSource, /touchpoint:/);
});

test('business page is framed as a catalog listing flow, not a digital service grid', () => {
  const source = readProjectFile('src/app/(public)/business/page.tsx');
  const formSource = readProjectFile('src/components/public/business-solution-form.tsx');

  assert.match(source, /Три шага до карточки/);
  assert.match(source, /Что получите/);
  assert.match(source, /home-services-section background-zone background-zone-beige/);
  assert.doesNotMatch(source, /public-contrast-services-section home-services-section background-zone background-zone-graphite/);
  assert.match(source, /<Button className="mt-7 rounded-\[var\(--radius-md\)\]" href="#business-request" size="lg">/);
  assert.match(source, /Перейти к форме/);
  assert.match(source, /mt-8 grid gap-4 sm:grid-cols-2/);
  assert.match(formSource, /businessVenueTypeOptions/);
  assert.doesNotMatch(source, /businessServiceCards/);
  assert.doesNotMatch(source, /BusinessServiceCardGrid/);
  assert.doesNotMatch(source, /const businessServiceMeta/);
  assert.doesNotMatch(source, /Цифровой инструмент под конкретный процесс/);
  assert.doesNotMatch(source, /home-service-card-action/);
});

test('consulting page combines cases and prices into tabs before the direct request form', () => {
  const source = readProjectFile('src/app/(public)/consulting/page.tsx');
  const tabsSource = readProjectFile('src/components/public/consulting-tabs.tsx');
  const formSource = readProjectFile('src/components/public/consulting-request-form.tsx');

  assert.match(source, /Направления/);
  assert.match(source, /function ConsultingDirectionCards/);
  assert.match(source, /Открытие заведения/);
  assert.match(source, /Барная карта/);
  assert.match(source, /Себестоимость и цены/);
  assert.doesNotMatch(source, /<ConsultingTabs cases=\{consultingCases\} prices=\{consultingPriceItems\} \/>/);
  assert.match(tabsSource, /role="tablist"/);
  assert.match(source, /ConsultingRequestForm/);
  assert.match(source, /direct/);
  assert.match(source, /getApplicationCityOptions/);
  assert.match(source, /arePublicApplicationFormsEnabled/);
  assert.match(formSource, /sectionId="consulting-request"/);
  assert.match(formSource, /disclosureId=\{direct \? undefined : 'consulting-request'\}/);
});

test('partner format cards do not render repeated bottom action buttons', () => {
  const source = readProjectFile('src/app/(public)/partners/page.tsx');
  const sectionStart = source.indexOf('<PartnerFormatTable');
  const sectionEnd = source.indexOf('<PartnershipStartSequence', sectionStart);
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /nextStep: format\.nextStep/);
  assert.doesNotMatch(sectionSource, /action: \{/);
  assert.doesNotMatch(source, /function getPartnerFormatActionLabel/);
  assert.doesNotMatch(sectionSource, /requestFormat=.*#partner-request/);
});

test('partner start rows do not repeat route and status chips', () => {
  const source = readProjectFile('src/app/(public)/partners/page.tsx');
  const sectionStart = source.indexOf('function PartnershipStartSequence');
  const sectionEnd = source.indexOf('export default function PartnersPage', sectionStart);
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /<RoleTaskCard/);
  assert.doesNotMatch(sectionSource, /eyebrow=\{option\.label\}/);
  assert.doesNotMatch(sectionSource, /metaLabel="Статус"/);
  assert.doesNotMatch(sectionSource, /meta=\{/);
  assert.doesNotMatch(sectionSource, /action=\{\{ href: option\.href, label: option\.action \}\}/);
  assert.doesNotMatch(sectionSource, /href: '#partner-request'/);
  assert.doesNotMatch(sectionSource, /action: 'Оставить заявку'/);
  assert.doesNotMatch(sectionSource, /Описать партнёрский проект/);
});

test('partners page routes requests to contacts instead of rendering a bottom request block', () => {
  const source = readProjectFile('src/app/(public)/partners/page.tsx');

  assert.doesNotMatch(source, /PartnerApplicationForm/);
  assert.doesNotMatch(source, /id="applications"/);
  assert.doesNotMatch(source, /#partner-request/);
  assert.match(source, /topic: 'partnership'/);
  assert.match(source, /#contact-form/);
});

test('public toolbar filters show the status row only after a filter is active', () => {
  const source = readProjectFile('src/components/public/public-filters-content.tsx');
  const toolbarSource = readProjectFile('src/components/public/public-filters-variant-toolbar.tsx');

  assert.match(source, /resolvedVariant === 'toolbar'/);
  assert.match(toolbarSource, /\(hasActiveFilters \|\| isPending\) \?/);
  assert.match(toolbarSource, /activeSummaryLabel\}: \{activeFilters\.length\}\./);
  assert.doesNotMatch(toolbarSource, /\{description\}/);
  assert.doesNotMatch(toolbarSource, /\{contextSummary\}/);
});

test('supplier sidebar filters keep only the compact filters heading', () => {
  const supplierSource = readProjectFile('src/app/(public)/suppliers/page.tsx');
  const filterStart = supplierSource.indexOf('<PublicFilters');
  const filterEnd = supplierSource.indexOf('variant="sidebar"');
  const supplierFilterSource = supplierSource.slice(filterStart, filterEnd);
  const filterComponentSource = readProjectFile('src/components/public/public-filters-content.tsx');

  assert.match(supplierFilterSource, /title="Фильтры"/);
  assert.doesNotMatch(supplierFilterSource, /title="Фильтр каталога"/);
  assert.doesNotMatch(supplierFilterSource, /contextItems=/);
  assert.doesNotMatch(supplierFilterSource, /Отберите компании по направлению/);
  assert.match(filterComponentSource, /const shouldShowFilterIntro = !\(isDirectoryTone && resolvedVariant === 'sidebar'\)/);
  assert.doesNotMatch(filterComponentSource, /absolute inset-x-0 top-0 h-px bg-\[linear-gradient\(90deg,var\(--accent\),transparent_68%\)\]/);
});

test('supplier hero does not repeat the find-supplier jump link', () => {
  const source = readProjectFile('src/app/(public)/suppliers/page.tsx');
  const heroStart = source.indexOf('<PageHero');
  const heroEnd = source.indexOf('</PageHero>', heroStart);
  const heroSource = source.slice(heroStart, heroEnd);

  assert.match(heroSource, /<SuppliersHeroActions \/>/);
  assert.doesNotMatch(heroSource, /Найти поставщика/);
  assert.doesNotMatch(heroSource, /href: '#suppliers-list'/);
});

test('supplier page removes the inline application request block', () => {
  const source = readProjectFile('src/app/(public)/suppliers/page.tsx');

  assert.match(source, /<SuppliersHeroActions \/>/);
  assert.doesNotMatch(source, /SupplierApplicationForm/);
  assert.doesNotMatch(source, /#supplier-request/);
});

test('supplier list header does not repeat the add company action', () => {
  const source = readProjectFile('src/app/(public)/suppliers/page.tsx');
  const listStart = source.indexOf('<PublishedContentSection');
  const listEnd = source.indexOf('title="Каталог"', listStart);
  const listSource = source.slice(listStart, listEnd);

  assert.doesNotMatch(listSource, /listAction=/);
  assert.doesNotMatch(listSource, /label: 'Добавить компанию'/);
});

test('supplier list cards do not duplicate verified status as an extra badge', () => {
  const supplierSource = readProjectFile('src/lib/public/content/suppliers.ts');

  assert.match(supplierSource, /supplier\.isVerified \? 'Статус: проверен BARSYNERGY' : undefined/);
  assert.doesNotMatch(supplierSource, /value: 'Проверен BARSYNERGY'/);
});

test('supplier directory rows use compact logo marks with explicit contact and profile actions', () => {
  const directoryRowSource = readProjectFile('src/components/public/published-content-row-directory.tsx');

  assert.match(directoryRowSource, /actionLabel = 'Связаться'/);
  assert.match(directoryRowSource, /profileLabel = 'Профиль'/);
  assert.match(directoryRowSource, /public-list-row-actions/);
  assert.match(directoryRowSource, /public-list-row-primary-action/);
  assert.match(directoryRowSource, /titleInitials\(item\.subtitle \?\? item\.title\)/);
  assert.doesNotMatch(directoryRowSource, />Без логотипа</);
});

test('events page does not render duplicate event request blocks', () => {
  const source = readProjectFile('src/app/(public)/events/page.tsx');

  assert.doesNotMatch(source, /function EventSubmissionNotice/);
  assert.doesNotMatch(source, /id="event-proposal"/);
  assert.doesNotMatch(source, /Добавить событие в афишу/);
  assert.doesNotMatch(source, /EventApplicationForm/);
  assert.doesNotMatch(source, /getApplicationCityOptions/);
  assert.doesNotMatch(source, /arePublicApplicationFormsEnabled/);
  assert.doesNotMatch(source, /Записаться или предложить событие/);
  assert.doesNotMatch(source, /Заявка на событие/);
});

test('consulting experts render as finished service rows instead of empty cards', () => {
  const source = readProjectFile('src/app/(public)/consulting/page.tsx');
  const sectionStart = source.indexOf('<PublicEyebrow>Эксперты</PublicEyebrow>');
  const sectionEnd = source.indexOf('</section>', sectionStart);
  const sectionSource = source.slice(sectionStart, sectionEnd);
  const directionStart = source.indexOf('<PublicEyebrow>Направления</PublicEyebrow>');

  assert.ok(sectionStart > -1);
  assert.ok(directionStart > -1);
  assert.ok(sectionStart < directionStart);
  assert.doesNotMatch(sectionSource, /xl:sticky xl:top-24/);
  assert.match(sectionSource, /md:flex-col md:items-start md:gap-3/);
  assert.doesNotMatch(sectionSource, /md:block/);
  assert.match(sectionSource, /Подбор эксперта/);
  assert.match(sectionSource, /consulting-expert-list border-y border-\[var\(--line\)\]/);
  assert.match(sectionSource, /md:grid-cols-\[minmax\(7rem,0\.28fr\)_minmax\(0,1fr\)_minmax\(12rem,0\.46fr\)\]/);
  assert.match(sectionSource, /<Button className="rounded-\[var\(--radius-md\)\]" href="#consulting-request" size="lg">/);
  assert.doesNotMatch(sectionSource, /accent-foreground/);
  assert.doesNotMatch(sectionSource, /bg-\[var\(--accent\)\] px-5/);
  assert.doesNotMatch(sectionSource, /public-card-label w-fit/);
  assert.doesNotMatch(sectionSource, /public-card-meta/);
  assert.doesNotMatch(sectionSource, /Подбирается командой/);
  assert.doesNotMatch(sectionSource, /expertActionLabels/);
  assert.doesNotMatch(sectionSource, /getConsultingContactHref\(\{ preferredExpert: expert\.value \}\)/);
  assert.doesNotMatch(sectionSource, /_auto\]/);
  assert.doesNotMatch(sectionSource, /Настроить обучение/);
  assert.doesNotMatch(sectionSource, />Эксперт<\/p>/);
  assert.doesNotMatch(sectionSource, /Эксперты по направлениям/);
  assert.doesNotMatch(sectionSource, /max-w-\[13ch\]/);
  assert.doesNotMatch(sectionSource, /RoleTaskCard/);
  assert.doesNotMatch(sectionSource, /public-card-shell/);
  assert.doesNotMatch(sectionSource, /density="compact"/);
  assert.doesNotMatch(sectionSource, /presentation="row"/);
});

test('consulting direction section uses visual direction cards routed to contacts', () => {
  const source = readProjectFile('src/app/(public)/consulting/page.tsx');
  const sectionStart = source.indexOf('<PublicEyebrow>Направления</PublicEyebrow>');
  const sectionEnd = source.indexOf('</section>', sectionStart);
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(source, /const directionMeta/);
  assert.match(source, /const consultingDirectionCards/);
  assert.match(source, /function ConsultingDirectionCards/);
  assert.match(sectionSource, /<ConsultingDirectionCards \/>/);
  assert.match(source, /home-services-grid consulting-services-grid/);
  assert.match(source, /home-service-card/);
  assert.match(source, /home-service-result/);
  assert.match(source, /getConsultingContactHref\(\{ consultingDirection: direction\.value \}\)/);
  assert.doesNotMatch(sectionSource, /eyebrow="Консалтинг"/);
  assert.doesNotMatch(sectionSource, /presentation="row"/);
  assert.doesNotMatch(sectionSource, /action=\{\{ href: getConsultingContactHref\(\{ consultingDirection: option\.value \}\), label: 'Описать задачу' \}\}/);
});

test('consulting page renders a direct request form while contact routing remains available', () => {
  const consultingSource = readProjectFile('src/app/(public)/consulting/page.tsx');
  const consultingFormSource = readProjectFile('src/components/public/consulting-request-form.tsx');
  const contactConstantsSource = readProjectFile('src/components/public/contact-application-form-constants.ts');
  const contactPageSource = readProjectFile('src/app/(public)/contacts/page.tsx');
  const contactActionsSource = readProjectFile('src/app/(public)/contacts/actions.ts');

  assert.match(consultingSource, /new URLSearchParams\(\{ topic: 'consulting' \}\)/);
  assert.match(consultingSource, /return `\/contacts\?\$\{params\.toString\(\)\}#contact-form`/);
  assert.match(consultingSource, /ConsultingRequestForm/);
  assert.match(consultingSource, /direct/);
  assert.match(consultingSource, /#consulting-request/);
  assert.match(consultingSource, /getApplicationCityOptions/);
  assert.match(consultingSource, /arePublicApplicationFormsEnabled/);
  assert.match(consultingSource, /getPublicApplicationUtm/);
  assert.match(consultingFormSource, /sectionId="consulting-request"/);
  assert.match(consultingFormSource, /disclosureId=\{direct \? undefined : 'consulting-request'\}/);
  assert.doesNotMatch(consultingSource, /RequestDisclosureTrigger/);

  assert.match(contactConstantsSource, /value: 'consulting'/);
  assert.match(contactConstantsSource, /label: 'Консалтинг'/);
  assert.match(contactPageSource, /consulting: 'consulting'/);
  assert.match(contactPageSource, /'consulting-request': 'consulting'/);
  assert.match(contactActionsSource, /case 'consulting':\n\s+return 'Консалтинг'/);
});

test('public application request blocks stay compact before the form is opened', () => {
  const sectionSource = readProjectFile('src/components/public/application-form-section.tsx');
  const disclosureSource = readProjectFile('src/components/public/request-disclosure.tsx');

  assert.match(sectionSource, /py-8 md:py-10/);
  assert.match(sectionSource, /xl:grid-cols-\[minmax\(15rem,0\.48fr\)_minmax\(0,1\.52fr\)\]/);
  assert.match(sectionSource, /!text-\[clamp\(1\.85rem,2\.5vw,2\.65rem\)\]/);
  assert.match(sectionSource, /<PublicBodyText className="mt-3 max-w-md text-sm leading-6"/);
  assert.doesNotMatch(sectionSource, /py-14 md:py-18/);
  assert.doesNotMatch(sectionSource, /xl:grid-cols-\[0\.64fr_1\.36fr\]/);
  assert.match(disclosureSource, /md:grid-cols-\[minmax\(0,1fr\)_auto\]/);
  assert.match(disclosureSource, /md:justify-self-end/);
  assert.match(disclosureSource, /size="sm"/);
});

test('vacancies empty state does not repeat action links inside the list panel', () => {
  const source = readProjectFile('src/app/(public)/vacancies/page.tsx');
  const listStart = source.indexOf('<PublishedContentSection');
  const listEnd = source.indexOf('title="Открытые вакансии"');
  const listSource = source.slice(listStart, listEnd);

  assert.match(listSource, /emptyActions=\{\[/);
  assert.match(listSource, /label: 'Следить в Telegram'/);
  assert.doesNotMatch(listSource, /label: 'Разместить вакансию'/);
});

test('public contact CTAs map to form topics and defaults', () => {
  const contactsSource = readProjectFile('src/app/(public)/contacts/page.tsx');
  const sectionSource = readProjectFile('src/components/public/published-content-section.tsx');
  const vacancyDetailSource = readProjectFile('src/app/(public)/vacancies/[slug]/page.tsx');
  const platformEventSource = readProjectFile('src/components/public/platform-ui-event-agenda.tsx');
  const contactConstantsSource = readProjectFile('src/components/public/contact-application-form-constants.ts');

  const contactActionsSource = readProjectFile('src/app/(public)/contacts/actions.ts');

  assert.match(contactsSource, /vacancy: 'vacancy-placement'/);
  assert.match(contactsSource, /consulting: 'consulting'/);
  assert.match(contactConstantsSource, /value: 'consulting'/);
  assert.match(contactConstantsSource, /label: 'Консалтинг'/);
  assert.match(contactConstantsSource, /value: 'partnership'/);
  assert.match(contactConstantsSource, /label: 'Хочу стать партнёром'/);
  assert.doesNotMatch(contactConstantsSource, /value: 'supplier-contact'/);
  assert.doesNotMatch(contactConstantsSource, /label: 'Связаться с поставщиком'/);
  assert.match(contactActionsSource, /'vacancy-placement'/);
  assert.match(contactActionsSource, /'event'/);
  assert.doesNotMatch(contactActionsSource, /'supplier-contact'/);
  assert.doesNotMatch(sectionSource, /encodedContactHref\('vacancy-response'/);
  assert.doesNotMatch(sectionSource, /position: item\.title/);
  assert.doesNotMatch(sectionSource, /vacancyTitle: item\.title/);
  assert.match(vacancyDetailSource, /VacancyResponseDialog/);
  assert.match(vacancyDetailSource, /submitVacancyResponseApplication/);
  assert.doesNotMatch(vacancyDetailSource, /topic=vacancy-response&position=/);
  assert.doesNotMatch(vacancyDetailSource, /topic=vacancy#/);
  assert.match(platformEventSource, /#event-request/);
});

test('vacancy list rows separate facts from company and description', () => {
  const rowSource = readProjectFile('src/components/public/published-content-row-opportunity.tsx');

  assert.match(rowSource, /function vacancyLead/);
  assert.match(rowSource, /\['Опыт', 'Формат', 'График'\]/);
  assert.match(rowSource, /metaGroupValue\(item, 'Оплата'\) \?\? 'по договорённости'/);
  assert.doesNotMatch(rowSource, /Компания \/ город/);
  assert.match(rowSource, /public-list-row-company/);
  assert.doesNotMatch(rowSource, />О нас<\/p>/);
  assert.match(rowSource, /public-list-row-actions/);
  assert.match(rowSource, /public-list-row-primary-action/);
});

test('vacancy detail page renders the real vacancy response form', () => {
  const source = readProjectFile('src/app/(public)/vacancies/[slug]/page.tsx');

  assert.match(source, /VacancyResponseDialog/);
  assert.match(source, /getVacancyApplicationFormOptions/);
  assert.match(source, /arePublicApplicationFormsEnabled/);
  assert.match(source, /getPublicApplicationUtm/);
  assert.doesNotMatch(source, /topic=vacancy-response/);
});
