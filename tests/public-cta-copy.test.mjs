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
  'src/app/(public)/education/page.tsx',
  'src/app/(public)/partners/page.tsx',
  'src/app/(public)/general-sponsors/page.tsx',
  'src/app/(public)/suppliers/page.tsx',
  'src/app/(public)/tools/cost-calculator/page.tsx',
  'src/components/public/business-solution-form.tsx',
  'src/components/public/consulting-request-form.tsx',
  'src/components/public/contact-application-form.tsx',
  'src/components/public/contact-action-row.tsx',
  'src/components/public/general-sponsor-card.tsx',
  'src/components/public/homepage-client.tsx',
  'src/components/public/partner-application-form.tsx',
  'src/components/public/platform-ui.tsx',
  'src/components/public/public-featured-content.tsx',
  'src/components/public/public-related-content-section.tsx',
  'src/components/public/published-content-section.tsx',
  'src/components/public/social-card.tsx',
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
  assert.doesNotMatch(visibleCopySource, /Открыть Telegram/);

  assert.match(source, /Записаться на интенсив/);
  assert.match(source, /Записаться на разбор меню/);
  assert.match(source, /Описать задачу команды/);
  assert.match(source, /Заказать сертификат/);
  assert.match(source, /Запросить условия сотрудничества/);
  assert.match(source, /Выбрать программу/);
  assert.match(source, /Выбрать событие/);
  assert.match(source, /Найти вакансию/);
  assert.match(source, /Перейти в каталог/);
  assert.match(source, /Оставить заявку/);
  assert.match(source, /Рассчитать себестоимость/);
  assert.match(source, /Написать в Telegram/);
  assert.match(source, /function normalizePublicActionLabel/);
  assert.match(source, /'Открыть калькулятор': 'Рассчитать себестоимость'/);
  assert.match(source, /'Открыть каталог': 'Перейти в каталог'/);
  assert.match(source, /normalizePublicActionLabel\(calculatorTeaser\.actionLabel\)/);
});

test('public contact actions use shared direct wording', () => {
  const source = publicContactActionSourceFiles.map(readProjectFile).join('\n');
  const mobileMenuSource = readProjectFile('src/components/layout/mobile-site-menu.tsx');

  assert.match(source, /Связаться с нами/);
  assert.doesNotMatch(source, /Написать команде/);
  assert.match(mobileMenuSource, /<MobileMenuGroup label="Разделы"/);
  assert.doesNotMatch(mobileMenuSource, /<MobileMenuGroup label="Найти"/);
  assert.match(mobileMenuSource, /label="Для бизнеса"/);
  assert.doesNotMatch(mobileMenuSource, /Разместить \/ обсудить/);
  assert.doesNotMatch(mobileMenuSource, /contactAction/);
  assert.doesNotMatch(mobileMenuSource, /MobileMenuPrimaryAction/);
  assert.doesNotMatch(mobileMenuSource, /\/contacts\?topic=other#contact-form/);
});

test('business process rows do not duplicate step metadata chips', () => {
  const source = readProjectFile('src/app/(public)/business/page.tsx');
  const sectionStart = source.indexOf('<PublicEyebrow>Процесс</PublicEyebrow>');
  const sectionEnd = source.indexOf('</section>', sectionStart);
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /eyebrow=\{step\.label\}/);
  assert.doesNotMatch(sectionSource, /metaLabel="Этап"/);
  assert.doesNotMatch(sectionSource, /meta=\{/);
  assert.doesNotMatch(sectionSource, /action=\{\{ href: step\.href, label: step\.action \}\}/);
  assert.doesNotMatch(sectionSource, /Сценарий/);
  assert.doesNotMatch(sectionSource, /Первый запуск/);
});

test('business page does not render the bottom application request block', () => {
  const source = readProjectFile('src/app/(public)/business/page.tsx');

  assert.match(source, /function getBusinessContactHref/);
  assert.match(source, /new URLSearchParams\(\{ topic: 'other' \}\)/);
  assert.match(source, /#contact-form/);
  assert.doesNotMatch(source, /BusinessSolutionForm/);
  assert.doesNotMatch(source, /RequestDisclosureTrigger/);
  assert.doesNotMatch(source, /#business-request/);
  assert.doesNotMatch(source, /getApplicationCityOptions/);
  assert.doesNotMatch(source, /arePublicApplicationFormsEnabled/);
  assert.doesNotMatch(source, /getPublicApplicationResult/);
  assert.doesNotMatch(source, /getPublicApplicationUtm/);
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
  assert.match(formSource, /title="Форма обращения"/);
  assert.match(formSource, /Можно написать коротко или заполнить форму/);
  assert.match(formSource, /id="contact-form"/);
  assert.match(formSource, /id="contact-channels"/);
  assert.ok(formSource.indexOf('id="contact-channels"') < formSource.indexOf('id="contact-form"'));
});

test('public visual number indicators do not use leading zeroes', () => {
  const source = [
    'src/app/(public)/about/page.tsx',
    'src/components/public/homepage-client.tsx',
    'src/components/public/platform-ui.tsx',
    'src/components/public/public-related-content-section.tsx'
  ].map(readProjectFile).join('\n');

  assert.match(source, /home-tool-step-index">\{index \+ 1\}/);
  assert.match(source, /home-role-card-nav/);
  assert.doesNotMatch(source, /padStart\(2, '0'\)/);
  assert.doesNotMatch(source, /value: '0[1-9]'/);
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

test('education format cards align consistently inside each grid row', () => {
  const source = readProjectFile('src/components/public/editorial-display-primitives.tsx');
  const matrixStart = source.indexOf('export function ProgramFormatMatrix');
  const matrixEnd = source.indexOf('export function PartnerFormatTable');
  const matrixSource = source.slice(matrixStart, matrixEnd);

  assert.match(matrixSource, /grid items-stretch gap-4/);
  assert.match(matrixSource, /public-card-shell flex h-full min-h-0 flex-col/);
  assert.match(matrixSource, /<div className="mt-4">/);
  assert.match(matrixSource, /<div className="mt-auto flex flex-wrap items-center justify-end gap-3 pt-3">/);
  assert.doesNotMatch(matrixSource, /mt-auto flex flex-wrap items-center justify-end gap-3 border-t/);
  assert.doesNotMatch(matrixSource, /<StatusPill accent>\{item\.status\}<\/StatusPill>/);
  assert.doesNotMatch(matrixSource, /grid items-start gap-4/);
  assert.doesNotMatch(matrixSource, /min-h-\[24rem\]/);
  assert.doesNotMatch(matrixSource, /md:col-span-2/);
  assert.doesNotMatch(matrixSource, /xl:col-span-3/);
  assert.doesNotMatch(matrixSource, /md:min-h-\[/);
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
  const source = readProjectFile('src/components/public/public-filters.tsx');
  const toolbarStart = source.indexOf("if (resolvedVariant === 'toolbar')");
  const toolbarEnd = source.indexOf("if (resolvedVariant === 'sidebar')");
  const toolbarSource = source.slice(toolbarStart, toolbarEnd);

  assert.match(source, /const showToolbarStatus = hasActiveFilters \|\| isPending/);
  assert.match(toolbarSource, /showToolbarStatus \?/);
  assert.match(toolbarSource, /activeSummaryLabel\}: \{activeFilters\.length\}\./);
  assert.doesNotMatch(toolbarSource, /\{description\}/);
  assert.doesNotMatch(toolbarSource, /\{contextSummary\}/);
});

test('supplier sidebar filters keep only the compact filters heading', () => {
  const supplierSource = readProjectFile('src/app/(public)/suppliers/page.tsx');
  const filterStart = supplierSource.indexOf('<PublicFilters');
  const filterEnd = supplierSource.indexOf('variant="sidebar"');
  const supplierFilterSource = supplierSource.slice(filterStart, filterEnd);
  const filterComponentSource = readProjectFile('src/components/public/public-filters.tsx');

  assert.match(supplierFilterSource, /title="Фильтры"/);
  assert.doesNotMatch(supplierFilterSource, /title="Фильтр каталога"/);
  assert.doesNotMatch(supplierFilterSource, /contextItems=/);
  assert.doesNotMatch(supplierFilterSource, /Отберите компании по направлению/);
  assert.match(filterComponentSource, /const shouldShowFilterIntro = !\(isDirectoryTone && resolvedVariant === 'sidebar'\)/);
  assert.doesNotMatch(filterComponentSource, /absolute inset-x-0 top-0 h-px bg-\[linear-gradient\(90deg,var\(--accent\),transparent_68%\)\]/);
});

test('supplier hero does not repeat the find-supplier jump link', () => {
  const source = readProjectFile('src/app/(public)/suppliers/page.tsx');
  const heroStart = source.indexOf('<EditorialPublicPage');
  const heroEnd = source.indexOf('/>');
  const heroSource = source.slice(heroStart, heroEnd);

  assert.match(heroSource, /primaryLink=\{\{ label: 'Добавить компанию', href: supplierContactHref \}\}/);
  assert.doesNotMatch(heroSource, /Найти поставщика/);
  assert.doesNotMatch(heroSource, /href: '#suppliers-list'/);
});

test('supplier page removes the inline application request block', () => {
  const source = readProjectFile('src/app/(public)/suppliers/page.tsx');

  assert.match(source, /const supplierContactHref = '\/contacts\?topic=supplier#contact-form'/);
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
  const source = readProjectFile('src/lib/public/content.ts');
  const supplierStart = source.indexOf('export async function getPublishedSuppliers');
  const supplierEnd = source.indexOf('export async function getPublishedPartners');
  const supplierSource = source.slice(supplierStart, supplierEnd);

  assert.match(supplierSource, /statusLabel: supplier\.isVerified \? 'Проверен' : 'Контакт для уточнения'/);
  assert.doesNotMatch(supplierSource, /value: 'Проверен BARSYNERGY'/);
});

test('supplier directory rows use compact logo marks without repeated profile action', () => {
  const listRowSource = readProjectFile('src/components/ui/editorial-list-row.tsx');
  const contentSectionSource = readProjectFile('src/components/public/published-content-section.tsx');
  const directoryRowStart = listRowSource.indexOf('const directoryContent = (');
  const directoryRowEnd = listRowSource.indexOf('if (href) {', directoryRowStart);
  const directoryRowSource = listRowSource.slice(directoryRowStart, directoryRowEnd);
  const buildListMediaStart = contentSectionSource.indexOf('function buildListMedia');
  const mediaStart = contentSectionSource.indexOf("if (rowVariant === 'directory')", buildListMediaStart);
  const mediaEnd = contentSectionSource.indexOf('\n  if (item.imageUrl)', mediaStart);
  const directoryMediaSource = contentSectionSource.slice(mediaStart, mediaEnd);

  assert.match(directoryRowSource, /href && variant !== 'directory'/);
  assert.doesNotMatch(directoryRowSource, /lg:grid-cols-\[minmax\(0,1fr\)_minmax\(13\.5rem,0\.28fr\)\]/);
  assert.doesNotMatch(directoryRowSource, /justify-center/);
  assert.match(directoryMediaSource, /aria-label=\{item\.imageUrl \? undefined : `\$\{directoryFallbackKind\(item\)\} без логотипа`\}/);
  assert.match(directoryMediaSource, /titleInitials\(item\.subtitle \?\? item\.title\)/);
  assert.doesNotMatch(directoryMediaSource, />Без логотипа</);
  assert.doesNotMatch(directoryMediaSource, /\{item\.statusLabel \? \(/);
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

  assert.match(sectionSource, /Подбор эксперта/);
  assert.match(sectionSource, /consulting-expert-list border-y border-\[var\(--line\)\]/);
  assert.match(sectionSource, /md:grid-cols-\[minmax\(11rem,0\.58fr\)_minmax\(0,1fr\)\]/);
  assert.match(sectionSource, /<Button className="rounded-\[var\(--radius-md\)\]" href=\{consultingContactHref\} size="lg">/);
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

test('consulting direction rows do not repeat per-row task buttons', () => {
  const source = readProjectFile('src/app/(public)/consulting/page.tsx');
  const sectionStart = source.indexOf('<PublicEyebrow>Направления</PublicEyebrow>');
  const sectionEnd = source.indexOf('</section>', sectionStart);
  const sectionSource = source.slice(sectionStart, sectionEnd);

  assert.match(sectionSource, /consultingDirectionOptions\.map/);
  assert.match(sectionSource, /presentation="row"/);
  assert.doesNotMatch(sectionSource, /action=\{\{ href: getConsultingContactHref\(\{ consultingDirection: option\.value \}\), label: 'Описать задачу' \}\}/);
});

test('consulting page routes requests to the shared contact form', () => {
  const consultingSource = readProjectFile('src/app/(public)/consulting/page.tsx');
  const contactFormSource = readProjectFile('src/components/public/contact-application-form.tsx');
  const contactPageSource = readProjectFile('src/app/(public)/contacts/page.tsx');
  const contactActionsSource = readProjectFile('src/app/(public)/contacts/actions.ts');

  assert.match(consultingSource, /new URLSearchParams\(\{ topic: 'consulting' \}\)/);
  assert.match(consultingSource, /return `\/contacts\?\$\{params\.toString\(\)\}#contact-form`/);
  assert.doesNotMatch(consultingSource, /ConsultingRequestForm/);
  assert.doesNotMatch(consultingSource, /RequestDisclosureTrigger/);
  assert.doesNotMatch(consultingSource, /#consulting-request/);
  assert.doesNotMatch(consultingSource, /getApplicationCityOptions/);
  assert.doesNotMatch(consultingSource, /arePublicApplicationFormsEnabled/);
  assert.doesNotMatch(consultingSource, /getPublicApplicationResult/);
  assert.doesNotMatch(consultingSource, /getPublicApplicationUtm/);

  assert.match(contactFormSource, /value: 'consulting'/);
  assert.match(contactFormSource, /Опишите задачу для консультации/);
  assert.match(contactFormSource, /Направление консультации/);
  assert.match(contactPageSource, /consulting: 'consulting'/);
  assert.match(contactPageSource, /'consulting-request': 'consulting'/);
  assert.match(contactActionsSource, /consulting: 'Консалтинг'/);
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

  assert.match(listSource, /emptyActions=\{\[\]\}/);
  assert.doesNotMatch(listSource, /emptyActions=\{\[\s*\{/);
});
