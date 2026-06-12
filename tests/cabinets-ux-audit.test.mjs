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

  assert.match(profileResponsesSource, /getConversationStatusFilter\(statusGroup\)/);
  assert.match(profileInquiriesSource, /getUserInquiries\(user\.id, statusGroup, sort, page, PAGE_SIZE\)/);
  assert.match(businessRequestsSource, /getBusinessRequestsPage\(businessAccount\.id, statusGroup, skip, PAGE_SIZE\)/);
  assert.match(businessResponsesSource, /getBusinessResponses\(businessAccount\.id, statusGroup\)/);
  assert.match(profileQueriesSource, /status: getConversationStatusFilter\(statusGroup\)/);
  assert.match(businessQueriesSource, /status: getConversationStatusFilter\(statusGroup/);
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
  const profileSettingsSource = readProjectFile('src/app/profile/settings/page.tsx');
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
  const settingsSource = readProjectFile('src/app/profile/settings/page.tsx');
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
  const settingsSource = readProjectFile('src/app/profile/settings/page.tsx');
  const formSource = readProjectFile('src/components/profile/profile-section-form.tsx');
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
  assert.doesNotMatch(settingsSource, /<form action=\{update/);
  assert.doesNotMatch(settingsSource, /<form action=\{changePassword\}/);

  assert.match(formSource, /useActionState/);
  assert.match(formSource, /DRAFT_TTL_MS = 24 \* 60 \* 60 \* 1000/);
  assert.match(formSource, /DRAFT_KEY_PREFIX = 'profile-draft-'/);
  assert.match(formSource, /window\.localStorage/);
  assert.match(formSource, /InlineAlert/);
  assert.match(formSource, /Сохранено/);
  assert.match(formSource, /removeItem\(draftKey\)/);

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
  assert.match(businessSource, /title: 'Локальный контекст'/);
  assert.match(businessSource, /title: 'Аккуратная карточка'/);

  assert.doesNotMatch(aboutSource, /единый сайт/);
  assert.match(aboutSource, /редакция постепенно приводит разделы к одному понятному формату/);
});
