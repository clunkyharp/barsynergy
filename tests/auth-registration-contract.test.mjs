import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import test from 'node:test';

const repoRoot = process.cwd();

function readProjectFile(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

test('login page delegates CTAs to LoginForm component', () => {
  const formSource = readProjectFile('src/app/auth/login/_components/login-form.tsx');

  assert.match(formSource, /href="\/auth\/register\/user"/);
  assert.match(formSource, /Зарегистрироваться как участник/);
  assert.match(formSource, /href="\/auth\/register\/business"/);
  assert.match(formSource, /Запросить бизнес-доступ/);
  assert.doesNotMatch(formSource, /role="tablist"/);
  assert.doesNotMatch(formSource, /Я специалист/);
  assert.doesNotMatch(formSource, /Я представляю компанию/);
  assert.doesNotMatch(formSource, /name="role"/);
  assert.doesNotMatch(formSource, /Подать заявку на подключение/);
});

test('register user page renders registration form with required fields', () => {
  const pageSource = readProjectFile('src/app/auth/register/user/page.tsx');
  const formSource = readProjectFile('src/components/public/register-user-form.tsx');

  assert.match(pageSource, /Регистрация участника/);
  assert.match(pageSource, /Для специалистов бара/);
  assert.match(pageSource, /import \{ RegisterUserForm \}/);
  assert.match(pageSource, /buildPrivatePageMetadata/);
  assert.match(formSource, /account-check/);
  assert.match(formSource, /rate-limited/);
  assert.match(formSource, /failed/);
  assert.match(formSource, /invalid/);
});

test('register user form has fullName, email, password and consent', () => {
  const formSource = readProjectFile('src/components/public/register-user-form.tsx');

  assert.match(formSource, /fullName/);
  assert.match(formSource, /email/);
  assert.match(formSource, /password/);
  assert.match(formSource, /ConsentField/);
  assert.match(formSource, /PasswordPairValidation/);
  assert.match(formSource, /id="new-password"/);
  assert.match(formSource, /id="confirm-password"/);
  assert.match(formSource, /useActionState/);
  assert.match(formSource, /Зарегистрироваться/);
  assert.match(formSource, /data-public-validation="true"/);
  assert.match(formSource, /noValidate/);
});

test('register business page uses BusinessRequestForm without participant promises', () => {
  const pageSource = readProjectFile('src/app/auth/register/business/page.tsx');

  assert.match(pageSource, /Заявка на бизнес-доступ/);
  assert.match(pageSource, /import \{ BusinessRequestForm \}/);
  assert.match(pageSource, /Для заведений, брендов, поставщиков/);
  assert.doesNotMatch(pageSource, /Я работаю в баре/);
  assert.doesNotMatch(pageSource, /RegisterRequestForm/);
});

test('business request form no longer uses role selection', () => {
  const formSource = readProjectFile('src/components/public/business-request-form.tsx');

  assert.doesNotMatch(formSource, /RegisterRole/);
  assert.doesNotMatch(formSource, /participant/);
  assert.doesNotMatch(formSource, /name="role"/);
  assert.doesNotMatch(formSource, /Я работаю в баре/);
  assert.match(formSource, /BusinessRequestForm/);
  assert.match(formSource, /action: \(formData: FormData\) => void/);
});

test('register user action creates PENDING user with verification and handles duplicate email', () => {
  const actionsSource = readProjectFile('src/app/auth/register/actions.ts');

  assert.match(actionsSource, /status: UserStatus\.PENDING/);
  assert.match(actionsSource, /role: UserRole\.USER/);
  assert.match(actionsSource, /sendUserVerificationEmail/);
  assert.match(actionsSource, /Prisma\.PrismaClientKnownRequestError/);
  assert.match(actionsSource, /error\.code === 'P2002'/);
  assert.match(actionsSource, /account-check/);
  assert.match(actionsSource, /authResultPath\('\/auth\/register\/user'/);
});

test('business register action handles forms-disabled, invalid, duplicate and rate-limit', () => {
  const actionsSource = readProjectFile('src/app/auth/register/actions.ts');

  assert.match(actionsSource, /arePublicApplicationFormsEnabled/);
  assert.match(actionsSource, /redirectWithAuthResult\('\/auth\/register\/business',.*'disabled'/);
  assert.match(actionsSource, /businessRequestSchema\.safeParse/);
  assert.match(actionsSource, /redirectWithAuthResult\('\/auth\/register\/business',.*'invalid'/);
  assert.match(actionsSource, /AuthRateLimitError/);
  assert.match(actionsSource, /AuthRateLimitError \? 'rate-limited'/);
  assert.match(actionsSource, /if \(existingUser\) return null;/);
  assert.match(actionsSource, /code: 'already-registered'/);
  assert.doesNotMatch(actionsSource, /business-request-duplicate/);
  assert.match(actionsSource, /outcome\.status === 'duplicate'/);
});

test('login page shows duplicate business request message', () => {
  const pageSource = readProjectFile('src/app/auth/login/page.tsx');

  assert.match(pageSource, /business-request-created/);
  assert.doesNotMatch(pageSource, /business-request-duplicate/);
  assert.doesNotMatch(pageSource, /Заявка по этому email уже получена/);
});

test('activate page guards with invalid-invite, blocked-user and mismatch error states', () => {
  const pageSource = readProjectFile('src/app/auth/activate/page.tsx');

  assert.match(pageSource, /errorMessages/);
  assert.match(pageSource, /invalid: 'Ссылка активации недействительна или уже использована\.'/);
  assert.match(pageSource, /mismatch: 'Пароль и подтверждение должны совпадать\.'/);
  assert.match(pageSource, /blocked: 'Доступ временно заблокирован/);
  assert.match(pageSource, /failed: 'Не удалось завершить активацию/);
  assert.match(pageSource, /activateBusinessAccessAction/);
  assert.match(pageSource, /PasswordPairValidation/);
  assert.match(pageSource, /id="new-password"/);
  assert.match(pageSource, /id="confirm-password"/);
  assert.match(pageSource, /findActiveBusinessAccessInvite/);
  assert.match(pageSource, /BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME/);
  assert.match(pageSource, /parseBusinessAccessRequestPayload/);
});

test('all new-password forms share password pair validation helper', () => {
  const resetComponentSource = readProjectFile('src/app/auth/password-reset/_components/password-reset-forms.tsx');
  const profileSource = readProjectFile('src/app/profile/settings/security/page.tsx');
  const helperSource = readProjectFile('src/components/ui/password-pair-validation.tsx');

  assert.match(helperSource, /confirmTouched = false/);
  assert.match(helperSource, /addEventListener\('blur', onConfirmBlur\)/);
  assert.match(helperSource, /addEventListener\('submit', checkMatch, true\)/);
  assert.match(resetComponentSource, /PasswordPairValidation/);
  assert.match(profileSource, /PasswordPairValidation passwordName="newPassword"/);
  assert.match(profileSource, /autoComplete="current-password"/);
  assert.match(profileSource, /autoComplete="new-password"/);
});

test('activate consume route validates token and sets or clears cookie', () => {
  const routeSource = readProjectFile('src/app/auth/activate/consume/route.ts');

  assert.match(routeSource, /findActiveBusinessAccessInvite/);
  assert.match(routeSource, /BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME/);
  assert.match(routeSource, /getBusinessAccessActivationCookieOptions/);
  assert.match(routeSource, /invalid/);
  assert.match(routeSource, /\/\^\[A-Za-z0-9_-\]\{20,200\}\$\/\.test/);
  assert.match(routeSource, /response\.cookies\.set\(BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME, token/);
  assert.match(routeSource, /invalidResponse\.cookies\.set\(BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME, '',[\s\S]*maxAge: 0/);
});

test('no PENDING user can reach /profile without valid activation flow', () => {
  const currentUserSource = readProjectFile('src/lib/auth/current-user.ts');
  const registerActionSource = readProjectFile('src/app/auth/register/actions.ts');

  assert.match(currentUserSource, /session\.user\.status !== UserStatus\.ACTIVE/);
  assert.match(registerActionSource, /status: UserStatus\.PENDING/);
  assert.match(registerActionSource, /sendUserVerificationEmail/);
});

test('auth route files exist for all expected public auth paths', () => {
  const loginPage = readProjectFile('src/app/auth/login/page.tsx');
  const registerPage = readProjectFile('src/app/auth/register/page.tsx');
  const registerBusinessPage = readProjectFile('src/app/auth/register/business/page.tsx');
  const registerUserPage = readProjectFile('src/app/auth/register/user/page.tsx');
  const activatePage = readProjectFile('src/app/auth/activate/page.tsx');
  const verifyEmailPage = readProjectFile('src/app/auth/verify-email/page.tsx');

  assert.match(loginPage, /LoginForm/);
  assert.match(registerPage, /Выберите свою роль/);
  assert.match(registerBusinessPage, /Заявка на бизнес-доступ/);
  assert.match(registerUserPage, /Регистрация участника/);
  assert.match(activatePage, /Завершить подключение/);
  assert.match(verifyEmailPage, /@\/lib\/auth\/email-verification/);
  assert.match(verifyEmailPage, /\/auth\/login\?success=verified/);
  assert.match(verifyEmailPage, /Подтверждение email/);
});

test('header shows login link for guest and account menu for authenticated user', () => {
  const headerSource = readProjectFile('src/components/layout/site-header.tsx');

  assert.match(headerSource, /Войти/);
  assert.match(headerSource, /href="\/auth\/login"/);
  assert.match(headerSource, /Регистрация/);
  assert.match(headerSource, /href="\/auth\/register\/user"/);
  assert.match(headerSource, /AccountMenu/);
  assert.match(headerSource, /\{user \?/);
  assert.match(headerSource, /<AccountMenu logoutAction=\{logoutAction!\} user=\{user\}/);

  assert.doesNotMatch(headerSource, /const navItems = \[/);
  assert.match(headerSource, /import[\s\S]*guestNavItems[\s\S]*from[\s\S]*site-header-types/);
  const typesSource = readProjectFile('src/components/layout/site-header-types.ts');
  assert.match(typesSource, /export const guestNavItems/);
});

test('site-header-server passes serialized user to SiteHeader', () => {
  const serverSource = readProjectFile('src/components/layout/site-header-server.tsx');

  assert.match(serverSource, /getCurrentUser/);
  assert.match(serverSource, /import \{ SiteHeader \}/);
  assert.match(serverSource, /headerUser/);
  assert.match(serverSource, /displayName/);
});

test('mobile-site-menu shows auth block when user is authenticated', () => {
  const mobileSource = readProjectFile('src/components/layout/mobile-site-menu.tsx');

  assert.match(mobileSource, /user\?:/);
  assert.match(mobileSource, /profileHref\(role: string\)/);
  assert.match(mobileSource, /Кабинет/);
  assert.match(mobileSource, /Регистрация/);
  assert.match(mobileSource, /href="\/auth\/register\/user"/);
  assert.match(mobileSource, /if \(role === 'BUSINESS'\) return '\/business\/cabinet'/);
  assert.match(mobileSource, /if \(role === 'ADMIN' \|\| role === 'MODERATOR'\) return '\/admin'/);
  assert.doesNotMatch(mobileSource, /logoutAction/);
});

test('account-menu has role-based menu items for USER role', () => {
  const menuSource = readProjectFile('src/components/layout/account-menu.tsx');

  assert.match(menuSource, /Профиль/);
  assert.match(menuSource, /Мои отклики/);
  assert.match(menuSource, /Выйти/);
  assert.match(menuSource, /logoutAction/);
  assert.match(menuSource, /DropdownMenu/);
  assert.match(menuSource, /role="menuitem"/);
  assert.match(menuSource, /BUSINESS/);
  assert.match(menuSource, /Кабинет компании/);
  assert.match(menuSource, /Админ-панель/);
});

test('root layout uses SiteHeaderServer', () => {
  const layoutSource = readProjectFile('src/app/layout.tsx');

  assert.match(layoutSource, /SiteHeaderServer/);
  assert.doesNotMatch(layoutSource, /import \{ SiteHeader \}/);
});
