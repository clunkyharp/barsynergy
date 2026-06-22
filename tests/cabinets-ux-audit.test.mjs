import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('profile overview does not duplicate sidebar avatar or navigation actions', () => {
  const source = readProjectFile('src/app/profile/page.tsx');

  assert.doesNotMatch(source, /size-16 place-items-center/, 'overview header must not duplicate the sidebar avatar');
  assert.doesNotMatch(source, /import \{[^}]*FileText[^}]*\} from 'lucide-react'/);
  assert.doesNotMatch(source, /import \{[^}]*Heart[^}]*\} from 'lucide-react'/);
  assert.doesNotMatch(source, /import \{[^}]*Search[^}]*\} from 'lucide-react'/);
  assert.doesNotMatch(source, /href="\/profile\/responses" size="sm" variant="secondary"/);
  assert.doesNotMatch(source, /href="\/profile\/saved-vacancies" size="sm" variant="secondary"/);
  assert.match(source, /ProfileProgressRing percent=\{completeness\.percent\}/);
  assert.match(source, /getProfileDashboardStats\(currentUser\.id\)/);
  assert.match(source, /Активные отклики/);
  assert.match(source, /Непрочитанные/);
  assert.match(source, /Сохранённые вакансии/);
});

test('profile response pages do not repeat the known response type chip', () => {
  const listSource = readProjectFile('src/app/profile/responses/page.tsx');
  const detailSource = readProjectFile('src/app/profile/responses/[applicationId]/page.tsx');

  assert.doesNotMatch(listSource, /<MetaChip[\s\S]*applicationTypeLabels\[response\.type\]/);
  assert.doesNotMatch(detailSource, /<MetaChip[\s\S]*applicationTypeLabels\[application\.type\]/);
  assert.match(listSource, /StatusBadge/);
  assert.match(detailSource, /StatusBadge/);
});

test('business cabinet overview links profile editing to settings instead of rendering the full form', () => {
  const overviewSource = readProjectFile('src/app/(business-workspace)/business/cabinet/page.tsx');
  const settingsSource = readProjectFile('src/app/(business-workspace)/business/cabinet/settings/page.tsx');
  const profileActionSource = readProjectFile('src/lib/business/profile-actions.ts');
  const sidebarSource = readProjectFile('src/components/layout/business-sidebar.tsx');

  assert.match(overviewSource, /BusinessProfileSummary/);
  assert.doesNotMatch(overviewSource, /BusinessProfileSheet/);
  assert.doesNotMatch(overviewSource, /updateBusinessProfile/);
  assert.match(overviewSource, /href: '\/business\/cabinet\/settings'/);
  assert.match(overviewSource, /\/business\/cabinet\/requests#new-request/);
  assert.match(settingsSource, /BusinessProfileSheet/);
  assert.match(settingsSource, /updateBusinessProfile/);
  assert.match(profileActionSource, /BUSINESS_SETTINGS_PATH = '\/business\/cabinet\/settings'/);
  assert.match(profileActionSource, /_prevState: ActionResult \| null/);
  assert.doesNotMatch(profileActionSource, /redirectWithBusinessResult/);
  assert.match(sidebarSource, /\/business\/cabinet\/settings/);
  assert.match(sidebarSource, /Настройки/);
});

test('business next-action profile check has done state and seven-day auto-hide rule', () => {
  const pageSource = readProjectFile('src/app/(business-workspace)/business/cabinet/page.tsx');
  const componentSource = readProjectFile('src/components/business/business-cabinet.tsx');

  assert.match(pageSource, /PROFILE_READY_ACTION_GRACE_MS = 7 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(pageSource, /profileReadyActionVisible/);
  assert.match(pageSource, /Date\.now\(\) - businessAccount\.updatedAt\.getTime\(\) <= PROFILE_READY_ACTION_GRACE_MS/);
  assert.match(pageSource, /\.\.\.\(profileReadyActionVisible/);
  assert.match(pageSource, /status: missingProfileFields\.length > 0 \? 'нужно' : 'готово'/);
  assert.match(componentSource, /item\.status === 'готово'/);
  assert.match(componentSource, /CheckCircle2/);
});

test('business dashboard uses panel primitive for local dashboard surfaces', () => {
  const pageSource = readProjectFile('src/app/(business-workspace)/business/cabinet/page.tsx');
  const componentSource = readProjectFile('src/components/business/business-cabinet.tsx');

  assert.match(pageSource, /import \{ Panel \} from '@\/components\/ui\/panel'/);
  assert.match(pageSource, /<Panel[^>]*padding="md"[^>]*tone="elevated"[^>]*>/);
  assert.match(pageSource, /<Panel className="grid gap-3 md:grid-cols-4/);
  assert.match(pageSource, /<Panel className="text-sm leading-6 text-\[var\(--muted\)\]" padding="md" tone="elevated">/);
  assert.doesNotMatch(pageSource, /rounded-\[var\(--radius-lg\)\] border border-\[var\(--line\)\] bg-\[var\(--surface-elevated\)\]/);
  assert.match(componentSource, /import \{ Eyebrow \} from '@\/components\/ui\/eyebrow'/);
  assert.match(componentSource, /<Eyebrow>Профиль компании<\/Eyebrow>/);
  assert.match(componentSource, /<Eyebrow>Реестр заявок<\/Eyebrow>/);
});

test('business request creation has a stable anchor target', () => {
  const requestsSource = readProjectFile('src/app/(business-workspace)/business/cabinet/requests/page.tsx');

  assert.match(requestsSource, /id="new-request"/);
  assert.match(requestsSource, /BusinessRequestForm/);
});

test('profile progress ring has an accessible label', () => {
  const source = readProjectFile('src/components/profile/profile-progress-ring.tsx');

  assert.match(source, /aria-label=\{`Профиль заполнен на \$\{percent\}%`\}/);
  assert.match(source, /role="img"/);
});

test('profile skills use tag input with user-generated skill source', () => {
  const schemaSource = readProjectFile('prisma/schema.prisma');
  const selectorSource = readProjectFile('src/components/profile/skills-selector.tsx');
  const actionSource = readProjectFile('src/lib/profile/skills-actions.ts');

  assert.match(schemaSource, /enum SkillSource/);
  assert.match(schemaSource, /ADMIN\s+@map\("admin"\)/);
  assert.match(schemaSource, /USER_GENERATED\s+@map\("user_generated"\)/);
  assert.match(schemaSource, /source\s+SkillSource\s+@default\(ADMIN\)/);

  assert.match(selectorSource, /name="skillNames"/);
  assert.match(selectorSource, /MAX_SKILLS = 20/);
  assert.match(selectorSource, /MAX_SKILL_LENGTH = 40/);
  assert.match(selectorSource, /function addSkill/);
  assert.match(selectorSource, /disabled=\{!hasChanges\}/);
  assert.doesNotMatch(selectorSource, /CheckboxField/);
  assert.doesNotMatch(selectorSource, /<input[\s\S]*type="text"/);
  assert.match(selectorSource, /<Input/);

  assert.match(actionSource, /SkillSource/);
  assert.match(actionSource, /getArray\(formData, 'skillNames'\)/);
  assert.match(actionSource, /source: SkillSource\.USER_GENERATED/);
  assert.match(actionSource, /MAX_SKILLS = 20/);
});

test('conversation lists use active closed archive tabs instead of enum status dropdowns', () => {
  const tabsSource = readProjectFile('src/components/messaging/conversation-list-tabs.tsx');
  const statusGroupSource = readProjectFile('src/lib/messaging/conversation-status-groups.ts');
  const profileResponsesSource = readProjectFile('src/app/profile/responses/page.tsx');
  const profileInquiriesSource = readProjectFile('src/app/profile/inquiries/page.tsx');
  const businessRequestsSource = readProjectFile('src/app/(business-workspace)/business/cabinet/requests/page.tsx');
  const businessResponsesSource = readProjectFile('src/app/(business-workspace)/business/cabinet/responses/page.tsx');
  const profileQueriesSource = readProjectFile('src/modules/profile/queries.ts');
  const businessQueriesSource = readProjectFile('src/modules/business/queries.ts');

  assert.match(tabsSource, /SegmentedControl/);
  assert.match(tabsSource, /router\.replace/);
  assert.match(tabsSource, /params\.delete\('page'\)/);
  assert.match(tabsSource, /Активные/);
  assert.match(tabsSource, /Закрытые/);
  assert.match(tabsSource, /Архив/);

  assert.match(statusGroupSource, /ConversationStatusGroup = 'active' \| 'closed' \| 'archive'/);
  assert.match(statusGroupSource, /getConversationStatusFilter/);
  assert.match(statusGroupSource, /ApplicationStatus\.REJECTED/);
  assert.match(statusGroupSource, /ApplicationStatus\.COMPLETED/);
  assert.match(statusGroupSource, /ApplicationStatus\.ARCHIVED/);

  for (const source of [profileResponsesSource, profileInquiriesSource, businessRequestsSource, businessResponsesSource]) {
    assert.match(source, /ConversationListTabs/);
    assert.match(source, /parseConversationStatusGroup/);
    assert.doesNotMatch(source, /name="status"/);
    assert.doesNotMatch(source, /Все статусы/);
    assert.doesNotMatch(source, /Применить/);
  }

  assert.match(profileQueriesSource, /listUserResponses/);
  assert.match(profileInquiriesSource, /getUserInquiries\(user\.id, statusGroup, sort, page, PAGE_SIZE\)/);
  assert.match(businessRequestsSource, /getBusinessRequestsPage\(businessAccount\.id, statusGroup, skip, PAGE_SIZE\)/);
  assert.match(businessResponsesSource, /getBusinessResponses\(businessAccount\.id, statusGroup\)/);
  assert.match(profileQueriesSource, /status: getConversationStatusFilter\(statusGroup\)/);
  assert.match(businessQueriesSource, /status: getConversationStatusFilter\(statusGroup/);
});

test('conversation lists promote unread items and profile response empty copy is not alarming', () => {
  const sortSource = readProjectFile('src/lib/messaging/sort-conversations-by-unread.ts');
  const profileResponsesSource = readProjectFile('src/app/profile/responses/page.tsx');
  const profileInquiriesSource = readProjectFile('src/app/profile/inquiries/page.tsx');
  const businessResponsesSource = readProjectFile('src/app/(business-workspace)/business/cabinet/responses/page.tsx');

  assert.match(sortSource, /sortConversationsByUnread/);
  assert.match(sortSource, /Number\(b\.unreadCount > 0\) - Number\(a\.unreadCount > 0\)/);
  assert.match(sortSource, /return a\.index - b\.index/);

  for (const source of [profileResponsesSource, profileInquiriesSource, businessResponsesSource]) {
    assert.match(source, /sortConversationsByUnread/);
    assert.match(source, /getUnreadMessageCounts/);
  }

  assert.match(profileResponsesSource, /sortedResponses\.map/);
  assert.match(profileInquiriesSource, /sortedInquiries\.map/);
  assert.match(businessResponsesSource, /sortedResponses\.map/);
  assert.match(profileResponsesSource, /Отклики на вакансии появятся здесь после отправки из аккаунта/);
  assert.doesNotMatch(profileResponsesSource, /отправленные без входа/);
});

test('admin skills page exposes moderation view for user generated skills', () => {
  const pageSource = readProjectFile('src/app/admin/skills/page.tsx');
  const actionsSource = readProjectFile('src/app/admin/skills/actions.ts');
  const queriesSource = readProjectFile('src/lib/admin/admin-queries.ts');

  assert.match(queriesSource, /SkillSource/);
  assert.match(pageSource, /sourceFilter === 'user-generated'/);
  assert.match(pageSource, /source: SkillSource\.USER_GENERATED/);
  assert.match(pageSource, /На модерации/);
  assert.match(pageSource, /href="\?source=user-generated"/);
  assert.match(pageSource, /Пользовательский/);
  assert.match(pageSource, /Админский/);
  assert.match(actionsSource, /SkillSource\.ADMIN/);
});

test('password policy uses min 10 and HIBP checks on password-setting actions', () => {
  const policySource = readProjectFile('src/lib/auth/password-policy-constants.ts');
  const hibpSource = readProjectFile('src/lib/security/hibp.ts');
  const profileSettingsSource = readProjectFile('src/app/profile/settings/security/page.tsx');
  const registerFormSource = readProjectFile('src/components/public/register-user-form.tsx');
  const resetFormSource = readProjectFile('src/app/auth/password-reset/_components/password-reset-forms.tsx');
  const activatePageSource = readProjectFile('src/app/auth/activate/page.tsx');
  const profileActionSource = readProjectFile('src/lib/profile/password-actions.ts');
  const registerActionSource = readProjectFile('src/app/auth/register/actions.ts');
  const resetActionSource = readProjectFile('src/app/auth/password-reset/actions.ts');
  const activationActionSource = readProjectFile('src/app/auth/business-activation/actions.ts');

  assert.match(policySource, /PASSWORD_MIN_LENGTH = 10/);
  assert.match(policySource, /PASSWORD_HINT = 'Минимум 10 символов/);

  assert.match(hibpSource, /api\.pwnedpasswords\.com\/range/);
  assert.match(hibpSource, /createHash\('sha1'\)/);
  assert.match(hibpSource, /slice\(0, 5\)/);
  assert.match(hibpSource, /'Add-Padding': 'true'/);
  assert.match(hibpSource, /CompromisedPasswordError/);

  for (const source of [profileSettingsSource, registerFormSource, resetFormSource, activatePageSource]) {
    assert.match(source, /PASSWORD_MIN_LENGTH/);
    assert.match(source, /PASSWORD_HINT/);
    assert.doesNotMatch(source, /Минимум 6 символов|Минимум 8 символов/);
    assert.doesNotMatch(source, /minLength=\{6\}|minLength=\{8\}/);
  }

  for (const source of [profileActionSource, registerActionSource, resetActionSource, activationActionSource]) {
    assert.match(source, /assertPasswordNotCompromised/);
  }

  assert.match(profileActionSource, /CompromisedPasswordError/);
  assert.match(registerActionSource, /compromised-password/);
  assert.match(resetActionSource, /compromised-password/);
  assert.match(activationActionSource, /compromised-password/);
});

test('profile avatar upload uses client cropper before server action upload', () => {
  const settingsSource = readProjectFile('src/app/profile/settings/profile/page.tsx');
  const cropperSource = readProjectFile('src/components/profile/avatar-cropper.tsx');
  const avatarActionSource = readProjectFile('src/lib/profile/avatar-actions.ts');

  assert.match(settingsSource, /AvatarCropper currentAvatarUrl=\{avatarUrl\}/);
  assert.doesNotMatch(settingsSource, /FileUpload accept="image\/\*"/);

  assert.match(cropperSource, /const AVATAR_SIZE = 512/);
  assert.match(cropperSource, /const AVATAR_QUALITY = 0\.9/);
  assert.match(cropperSource, /canvas\.toBlob/);
  assert.match(cropperSource, /'image\/jpeg'/);
  assert.match(cropperSource, /new File\(\[blob\], 'avatar-512\.jpg'/);
  assert.match(cropperSource, /new DataTransfer\(\)/);
  assert.match(cropperSource, /name="avatar"/);
  assert.match(cropperSource, /role="dialog"/);
  assert.match(cropperSource, /rounded-full/);

  assert.match(avatarActionSource, /formData\.get\('avatar'\)/);
  assert.doesNotMatch(avatarActionSource, /avatar-cropper/);
});

test('profile settings forms save inline without redirecting away from drafts', () => {
  const profilePageSource = readProjectFile('src/app/profile/settings/profile/page.tsx');
  const careerPageSource = readProjectFile('src/app/profile/settings/career/page.tsx');
  const securityPageSource = readProjectFile('src/app/profile/settings/security/page.tsx');
  const settingsSource = profilePageSource + careerPageSource + securityPageSource;
  const layoutSource = readProjectFile('src/app/profile/settings/layout.tsx');
  const navTabsSource = readProjectFile('src/components/profile/settings-nav-tabs.tsx');
  const formSource = readProjectFile('src/components/profile/profile-section-form.tsx');
  const sectionSource = readProjectFile('src/components/profile/profile-settings-section.tsx');
  const disclosureSource = readProjectFile('src/components/ui/disclosure-panel.tsx');
  const actionSources = [
    readProjectFile('src/lib/profile/basic-profile-actions.ts'),
    readProjectFile('src/lib/profile/job-search-actions.ts'),
    readProjectFile('src/lib/profile/work-experience-actions.ts'),
    readProjectFile('src/lib/profile/skills-actions.ts'),
    readProjectFile('src/lib/profile/avatar-actions.ts'),
    readProjectFile('src/lib/profile/password-actions.ts')
  ];

  assert.match(settingsSource, /ProfileSectionForm/);
  assert.match(settingsSource, /sectionId="main"/);
  assert.match(settingsSource, /sectionId="search"/);
  assert.match(settingsSource, /sectionId="skills"/);
  assert.match(settingsSource, /sectionId="experience"/);
  assert.match(settingsSource, /sectionId="avatar"/);
  assert.match(settingsSource, /sectionId="password"/);
  assert.match(settingsSource, /ProfileSettingsSection/);
  assert.match(settingsSource, /id="avatar" title="Аватар"/);
  assert.match(settingsSource, /id="password"[\s\S]*?Смена пароля/);
  assert.doesNotMatch(settingsSource, /<Panel className="max-w-2xl scroll-mt-6"/);
  assert.doesNotMatch(settingsSource, /<form action=\{update/);
  assert.doesNotMatch(settingsSource, /<form action=\{changePassword\}/);

  assert.match(sectionSource, /DisclosurePanel/);
  assert.match(sectionSource, /STORAGE_KEY = 'profile-section-open'/);
  assert.match(sectionSource, /OPEN_SECTION_EVENT = 'profile-settings-open-section'/);
  assert.match(sectionSource, /window\.localStorage/);
  assert.match(sectionSource, /writeOpenSection\(id, nextOpen\)/);
  assert.match(sectionSource, /requestProfileSettingsSectionOpen/);
  assert.match(sectionSource, /window\.location\.hash === `#\$\{id\}`/);
  assert.match(sectionSource, /window\.addEventListener\('hashchange', openFromHash\)/);
  assert.match(sectionSource, /window\.addEventListener\(OPEN_SECTION_EVENT, openFromEvent\)/);
  assert.match(disclosureSource, /<details/);
  assert.match(disclosureSource, /<summary/);
  assert.match(disclosureSource, /Открыть/);
  assert.match(disclosureSource, /Свернуть/);

  assert.match(layoutSource, /SettingsNavTabs/);
  assert.match(navTabsSource, /\/profile\/settings\/profile/);
  assert.match(navTabsSource, /\/profile\/settings\/career/);
  assert.match(navTabsSource, /\/profile\/settings\/notifications/);
  assert.match(navTabsSource, /\/profile\/settings\/security/);

  assert.match(formSource, /useActionState/);
  assert.match(formSource, /FieldSuccess/);
  assert.match(formSource, /DRAFT_TTL_MS = 24 \* 60 \* 60 \* 1000/);
  assert.match(formSource, /DRAFT_KEY_PREFIX = 'profile-draft-'/);
  assert.match(formSource, /window\.localStorage/);
  assert.match(formSource, /InlineAlert/);
  assert.match(formSource, /Сохранено/);
  assert.match(formSource, /removeItem\(draftKey\)/);
  assert.match(formSource, /result\?\.type === 'error'/);
  assert.match(formSource, /requestProfileSettingsSectionOpen\(sectionId\)/);

  for (const source of actionSources) {
    assert.match(source, /_prevState: ProfileActionResult/);
    assert.match(source, /Promise<ProfileActionResult>/);
    assert.match(source, /return result;/);
    assert.doesNotMatch(source, /new URL\(SETTINGS_PATH/);
    assert.doesNotMatch(source, /url\.searchParams\.set\(result\.type/);
    assert.doesNotMatch(source, /redirect\(`\$\{url\.pathname\}\$\{url\.search\}`\)/);
  }
});

test('public business and about pages avoid unsupported anti-proof stats', () => {
  const businessSource = readProjectFile('src/app/(public)/business/page.tsx');
  const aboutSource = readProjectFile('src/app/(public)/about/page.tsx');

  for (const source of [businessSource, aboutSource]) {
    assert.doesNotMatch(source, /100%|1 точка входа|одна точка входа/);
    assert.doesNotMatch(source, /сч[её]тчики/);
  }

  assert.doesNotMatch(businessSource, /title: 'Фокус на СКФО'/);
  assert.doesNotMatch(businessSource, /title: 'Без случайных карточек'/);
  assert.doesNotMatch(businessSource, /вручную сверяет/);
  assert.doesNotMatch(businessSource, /title: 'Локальный контекст'/);

  assert.doesNotMatch(aboutSource, /единый сайт/);
  assert.match(aboutSource, /редакция постепенно приводит\s+разделы к одному понятному формату/);
});

test('S3 cabinet action controls meet touch and hidden-profile UX requirements', () => {
  const profileSource = readProjectFile('src/app/profile/page.tsx');
  const businessSource = readProjectFile('src/app/(business-workspace)/business/cabinet/page.tsx');
  const homepageSource = readProjectFile('src/components/public/homepage-client.tsx');
  const alertSource = readProjectFile('src/components/profile/profile-visibility-alert.tsx');
  const jobSearchActionSource = readProjectFile('src/lib/profile/job-search-actions.ts');

  assert.doesNotMatch(profileSource, /href="\/profile\/settings" size="sm"/);
  assert.match(profileSource, /href="\/profile\/settings\/career" size="md" variant="primary"/);
  assert.match(profileSource, /href="\/profile\/settings\/career" size="md" variant="secondary"/);
  assert.match(profileSource, /flex flex-col gap-4 md:flex-row md:items-center/);
  assert.match(profileSource, /ProfileVisibilityAlert action=\{openProfileVisibilityAction\}/);

  assert.match(alertSource, /useActionState/);
  assert.match(alertSource, /Открыть профиль/);
  assert.match(alertSource, /size="md"/);
  assert.match(alertSource, /grid gap-3 sm:grid-cols-\[minmax\(0,1fr\)_auto\]/);

  assert.match(jobSearchActionSource, /openProfileVisibilityAction/);
  assert.match(jobSearchActionSource, /assertSameOriginServerAction/);
  assert.match(jobSearchActionSource, /userId: user\.id/);
  assert.match(jobSearchActionSource, /jobSearchStatus: \{ not: JobSearchStatus\.NOT_LOOKING \}/);
  assert.match(jobSearchActionSource, /data: \{ isPublic: true \}/);

  assert.doesNotMatch(businessSource, /Создать заявку[\s\S]{0,120}size="sm"/);
  assert.match(businessSource, /href="\/business\/cabinet\/requests#new-request" size="md" variant="primary"/);

  assert.match(homepageSource, /className="min-h-11 px-2 text-sm tracking-normal" href="\/search" variant="link"/);
});

test('S4 public copy removes generic phrasing and duplicate live-card framing', () => {
  const heroSource = readProjectFile('src/components/public/homepage-hero.tsx');
  const homepageSource = readProjectFile('src/components/public/homepage-client.tsx');
  const businessSource = readProjectFile('src/app/(public)/business/page.tsx');
  const loginSource = readProjectFile('src/app/auth/login/page.tsx');
  const registerSource = readProjectFile('src/app/auth/register/page.tsx');
  const profileSource = readProjectFile('src/app/profile/page.tsx');
  const contactFormSource = readProjectFile('src/components/public/contact-application-form.tsx');
  const businessFormSource = readProjectFile('src/components/public/business-solution-form.tsx');

  assert.match(heroSource, /BARSYNERGY \/ Кофейная индустрия СКФО/);
  assert.match(heroSource, /Люди, события, вакансии, поставщики, обучение и материалы/);
  assert.doesNotMatch(heroSource, /Платформа для кофейных баров СКФО|всё в одном месте|Открыть путь к заявкам/);

  assert.match(homepageSource, /Что нового/);
  assert.match(homepageSource, /Разделы для работы/);
  assert.doesNotMatch(homepageSource, /Свежие карточки|Живые карточки из вакансий/);
  assert.doesNotMatch(homepageSource, /Свежее на платформе/);
  assert.doesNotMatch(homepageSource, /всё в одном месте/);

  assert.match(businessSource, /Разместить заведение в каталоге/);
  assert.doesNotMatch(businessSource, /Видимость в профильной среде/);

  assert.match(loginSource, /Войдите как специалист или представитель компании/);
  assert.match(registerSource, /заявками, каталогом и журналом/);
  assert.doesNotMatch(registerSource, /Я владею заведением или представляю бренд/);

  assert.match(profileSource, /Добавьте ещё:/);
  assert.match(profileSource, /Профиль заполнен на \$\{completeness\.percent\}%/);
  assert.doesNotMatch(profileSource, /Не хватает:|Заполненный профиль помогает/);

  assert.match(contactFormSource, /title="Опишите задачу — ответим на ваш контакт"/);
  assert.match(contactFormSource, /note="Отвечаем в течение рабочего дня\."/);
  assert.doesNotMatch(contactFormSource, /title="Напишите нам"|После отправки ответим/);

  assert.match(businessFormSource, /Укажите данные, по которым команда сможет связаться с вами/);
  assert.match(businessFormSource, /Данные для карточки/);
  assert.doesNotMatch(businessFormSource, /В форме не собираем оплату|Что написать/);
});

test('contact form topic labels and detail hints live in constants', () => {
  const formSource = readProjectFile('src/components/public/contact-application-form.tsx');
  const constantsSource = readProjectFile('src/components/public/contact-application-form-constants.ts');

  assert.match(constantsSource, /contactMessageLabels/);
  assert.match(constantsSource, /contactTopicDetailTitles/);
  assert.match(constantsSource, /contactTopicDetailHints/);
  assert.match(constantsSource, /contactTopicDetailValues/);
  assert.match(constantsSource, /getContactMessageLabel/);
  assert.match(constantsSource, /shouldShowContactTopicDetails/);
  assert.match(constantsSource, /getContactTopicDetailsTitle/);
  assert.match(constantsSource, /getContactTopicDetailsHint/);

  assert.match(formSource, /getContactMessageLabel\(topic\)/);
  assert.match(formSource, /shouldShowContactTopicDetails\(topic\)/);
  assert.match(formSource, /getContactTopicDetailsTitle\(topic\)/);
  assert.match(formSource, /getContactTopicDetailsHint\(topic\)/);
  assert.doesNotMatch(formSource, /topic === 'vacancy-placement'[\s\S]{0,700}\? 'Описание вакансии'/);
  assert.doesNotMatch(formSource, /\]\.includes\(topic\)/);
});

test('S4 measurement contract exposes provider-neutral UX hooks', () => {
  const measurementSource = readProjectFile('docs/ux-audit-measurement.md');
  const profileFormSource = readProjectFile('src/components/profile/profile-section-form.tsx');
  const profilePageSource = readProjectFile('src/app/profile/page.tsx');
  const supplierFormSource = readProjectFile('src/components/public/supplier-application-form.tsx');

  assert.match(measurementSource, /profile_settings_first_save/);
  assert.match(measurementSource, /profile_completion_viewed/);
  assert.match(measurementSource, /supplier_application_started/);
  assert.match(measurementSource, /supplier_application_submitted/);
  assert.match(measurementSource, /T до первого save = profile_settings_first_save_completed\.timestamp - profile_settings_first_save_started\.timestamp/);
  assert.match(measurementSource, /% заполненных профилей = count\(profile_completion_viewed where data-ux-value = 100\) \/ count\(profile_completion_viewed\) \* 100/);
  assert.match(measurementSource, /% drop при заявке поставщику = \(supplier_application_started - supplier_application_submitted\) \/ supplier_application_started \* 100/);
  assert.match(measurementSource, /No analytics provider is wired/);

  assert.match(profileFormSource, /data-ux-event="profile_settings_first_save"/);
  assert.match(profileFormSource, /data-ux-section=\{sectionId\}/);
  assert.match(profileFormSource, /data-ux-result=\{result\?\.type \?\? 'idle'\}/);

  assert.match(profilePageSource, /data-ux-metric="profile_completion_viewed"/);
  assert.match(profilePageSource, /data-ux-value=\{completeness\.percent\}/);

  assert.match(supplierFormSource, /data-ux-event="supplier_application_started"/);
  assert.match(supplierFormSource, /data-ux-success-event=\{result\?\.type === 'success' \? 'supplier_application_submitted' : undefined\}/);
  assert.match(supplierFormSource, /data-ux-result=\{result\?\.type \?\? 'idle'\}/);
});

test('notification settings distinguish missing subscription from browser-denied permission', () => {
  const source = readProjectFile('src/components/profile/notification-settings.tsx');

  assert.match(source, /notificationPermission/);
  assert.match(source, /Notification\.permission/);
  assert.match(source, /Notification\.requestPermission\(\)/);
  assert.match(source, /notificationsBlocked = notificationPermission === 'denied'/);
  assert.match(source, /Браузер заблокировал уведомления для сайта/);
  assert.match(source, /Разрешение заблокировано/);
  assert.match(source, /disabled=\{notificationsBlocked\}/);
  assert.match(source, /Что будет доступно после разрешения/);
  assert.match(source, /Настройки тем можно менять после того, как браузер снова разрешит уведомления/);
});

test('profile KPI tiles use AppLink and homepage fresh block has a distinct angle', () => {
  const profileSource = readProjectFile('src/app/profile/page.tsx');
  const homepageSource = readProjectFile('src/components/public/homepage-client.tsx');

  assert.match(profileSource, /import \{ AppLink \} from '@\/components\/ui\/app-link'/);
  assert.match(profileSource, /<AppLink[\s\S]*href=\{item\.href\}/);
  assert.doesNotMatch(profileSource, /<a[\s\S]{0,200}dashboardStats\.activeResponseCount/);

  assert.match(homepageSource, /Актуальное/);
  assert.match(homepageSource, /Разделы для работы/);
  assert.match(homepageSource, /fallbackMeta="Другие материалы"/);
  assert.doesNotMatch(homepageSource, /Свежее на платформе/);
});

test('homepage hero gradient uses stylesheet class instead of inline background', () => {
  const heroSource = readProjectFile('src/components/public/homepage-hero.tsx');
  const publicCssSource = readProjectFile('src/app/styles/public.css');

  assert.match(heroSource, /className="home-hero-gradient absolute inset-0 z-\[1\]"/);
  assert.doesNotMatch(heroSource, /style=\{\{[\s\S]*background:/);
  assert.match(publicCssSource, /\.home-hero-gradient/);
  assert.match(publicCssSource, /radial-gradient\(circle at 50% 42%/);
});
