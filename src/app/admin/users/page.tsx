import { ApplicationType, BusinessAccountStatus, UserStatus } from '@/modules/admin/queries';
import { accessFilterValues, listAdminBusinessUsers, type AccessFilter } from '@/modules/admin/users/queries';
import { updateBusinessUserAccess } from '@/app/admin/users/actions';
import { AdminActionAlert, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { AdminPageIntro } from '@/components/admin/admin-page-intro';
import { Button } from '@/components/ui/button';
import { ConfirmSubmitButton } from '@/components/ui/confirm-submit-button';
import { Card } from '@/components/ui/card';
import {
  AdminActionMenu,
  AdminActionMenuButton,
  AdminActionMenuContent,
  AdminActionMenuLink,
  AdminActionMenuTrigger,
  AdminActionRow
} from '@/components/ui/admin-table';
import { ContextualEmptyState } from '@/components/ui/empty-state';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { AdminStatusChip, type StatusBadgeVariant } from '@/components/ui/status-badge';
import { AdminFilterBar } from '@/components/admin/content-admin-controls';
import { applicationStatusLabels } from '@/lib/admin/application-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { firstParam, getAdminCurrentPath, type AdminContentSearchParams } from '@/lib/admin/content-utils';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const ADMIN_USERS_PATH = '/admin/users';

const accessFilterLabels: Record<AccessFilter, string> = {
  all: 'Все',
  pending: 'Ожидают',
  active: 'Активные',
  blocked: 'Заблокированные'
};

const userStatusLabels: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Активен',
  [UserStatus.BLOCKED]: 'Заблокирован',
  [UserStatus.PENDING]: 'Ожидает'
};

const businessStatusLabels: Record<BusinessAccountStatus, string> = {
  [BusinessAccountStatus.PENDING]: 'Ожидает',
  [BusinessAccountStatus.ACTIVE]: 'Активен',
  [BusinessAccountStatus.BLOCKED]: 'Заблокирован',
  [BusinessAccountStatus.ARCHIVED]: 'Архив'
};

const userStatusVariants: Record<UserStatus, StatusBadgeVariant> = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.BLOCKED]: 'danger',
  [UserStatus.PENDING]: 'pending'
};

const businessStatusVariants: Record<BusinessAccountStatus, StatusBadgeVariant> = {
  [BusinessAccountStatus.PENDING]: 'pending',
  [BusinessAccountStatus.ACTIVE]: 'success',
  [BusinessAccountStatus.BLOCKED]: 'danger',
  [BusinessAccountStatus.ARCHIVED]: 'neutral'
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

type AdminUsersPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

function getAccessFilter(params: AdminContentSearchParams): AccessFilter {
  const value = firstParam(params.access);
  return accessFilterValues.includes(value as AccessFilter) ? (value as AccessFilter) : 'all';
}

function businessAccessFilterHref(params: AdminContentSearchParams, access: AccessFilter) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (key === 'success' || key === 'error' || key === 'access') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) {
          query.append(key, item);
        }
      });
      return;
    }

    if (value) {
      query.set(key, value);
    }
  });

  if (access !== 'all') {
    query.set('access', access);
  }

  const queryString = query.toString();
  return queryString ? `${ADMIN_USERS_PATH}?${queryString}` : ADMIN_USERS_PATH;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdminSectionAccess('users');

  const params = (await searchParams) ?? {};
  const accessFilter = getAccessFilter(params);
  const searchQuery = firstParam(params.q)?.trim() ?? '';
  const currentPath = getAdminCurrentPath(ADMIN_USERS_PATH, params);
  const { users } = await listAdminBusinessUsers({ accessFilter, searchQuery });

  return (
    <div className="space-y-8">
      <AdminPageIntro
        description="Управление бизнес-кабинетами: активные доступы, подготовка ожидающих заявок и блокировка проблемных аккаунтов."
        eyebrow="Админка / Бизнес-доступы"
        title="Бизнес-доступы"
      />
      <AdminActionAlert params={params} />
      <AdminFilterBar action={ADMIN_USERS_PATH}>
        <FormField htmlFor="admin-users-search" label="Поиск">
          <Input id="admin-users-search" name="q" defaultValue={searchQuery} placeholder="Поиск по email или названию компании" />
        </FormField>
        <AdminActionRow className="justify-start">
          <Button type="submit" variant="secondary">Найти</Button>
          <Button href={ADMIN_USERS_PATH} variant="ghost">Сбросить</Button>
        </AdminActionRow>
      </AdminFilterBar>
      <section className="rounded-[var(--radius-md)] border border-[var(--line)] border-l-[3px] border-l-[var(--admin-structure-accent)] bg-[var(--surface)] p-4">
        <div className="grid gap-1 border-b border-[var(--line)] pb-3">
          <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--admin-label)]">Фильтр доступов</h2>
          <p className="text-xs leading-5 text-[var(--muted)]">Отбор меняет только список ниже. Доступы и заявки не изменяются.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {accessFilterValues.map((filter) => (
            <Button
              aria-current={accessFilter === filter ? 'page' : undefined}
              className={cn('min-h-9 px-3 py-1.5 text-xs', accessFilter === filter && 'border-[var(--admin-nav-active-border)] bg-[var(--admin-nav-active-bg)] text-[var(--admin-nav-active-text)]')}
              href={businessAccessFilterHref(params, filter)}
              key={filter}
              variant={accessFilter === filter ? 'secondary' : 'ghost'}
            >
              {accessFilterLabels[filter]}
            </Button>
          ))}
        </div>
      </section>
      <section className="grid gap-4">
        {users.length > 0 ? (
          users.map((user) => {
            const account = user.businessAccount;
            const relatedApplication = account?.applications[0] ?? null;
            const isPendingAccess = user.status === UserStatus.PENDING || account?.status === BusinessAccountStatus.PENDING;
            const isActiveAccess = user.status === UserStatus.ACTIVE && account?.status === BusinessAccountStatus.ACTIVE;
            const isBlockedAccess = user.status === UserStatus.BLOCKED || account?.status === BusinessAccountStatus.BLOCKED;
            const accessSummary = isActiveAccess
              ? 'Доступ открыт. Бизнес может работать в кабинете.'
              : isPendingAccess
                ? 'Ожидает подготовки или активации доступа.'
                : isBlockedAccess
                  ? 'Доступ закрыт. Кабинет недоступен для владельца.'
                  : 'Требует проверки состояния доступа.';

            return (
              <Card className="border-l-[3px] border-l-[var(--admin-structure-accent)] p-5" id={`business-access-${user.id}`} key={user.id}>
                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{account?.companyName ?? user.email}</h2>
                      <AdminStatusChip variant={userStatusVariants[user.status]}>Аккаунт: {userStatusLabels[user.status]}</AdminStatusChip>
                      {account ? <AdminStatusChip variant={businessStatusVariants[account.status]}>Доступ: {businessStatusLabels[account.status]}</AdminStatusChip> : null}
                    </div>
                    <dl className="mt-4 grid gap-2 text-sm text-[var(--muted)] md:grid-cols-2">
                      <div>
                        <dt>Email</dt>
                        <dd className="font-medium text-[var(--text)]">{user.email}</dd>
                      </div>
                      <div>
                        <dt>Город</dt>
                        <dd className="font-medium text-[var(--text)]">{account?.city?.name ?? 'Не указан'}</dd>
                      </div>
                      <div>
                        <dt>Контактное лицо</dt>
                        <dd className="font-medium text-[var(--text)]">{account?.contactPerson ?? 'Не указано'}</dd>
                      </div>
                      <div>
                        <dt>Контакты</dt>
                        <dd className="font-medium text-[var(--text)]">
                          {[account?.phone, account?.telegram].filter(Boolean).join(' / ') || 'Не указаны'}
                        </dd>
                      </div>
                      <div>
                        <dt>Создан</dt>
                        <dd className="font-medium text-[var(--text)]">{dateFormatter.format(user.createdAt)}</dd>
                      </div>
                      <div>
                        <dt>Связанная заявка</dt>
                        <dd className="font-medium text-[var(--text)]">
                          {relatedApplication ? applicationStatusLabels[relatedApplication.status] : 'Не найдена'}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-4 max-w-2xl rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2 text-sm leading-6 text-[var(--muted)]">
                      {accessSummary}
                    </p>
                    {isPendingAccess && relatedApplication ? (
                      <div className="mt-4 max-w-2xl rounded-[var(--radius-md)] border border-[var(--border-default)] p-4 text-sm leading-6">
                        <p className="font-medium text-[var(--text)]">Следующий шаг: подготовить доступ через связанную бизнес-заявку.</p>
                        <p className="mt-1 text-[var(--muted)]">
                          Связанная заявка: {applicationStatusLabels[relatedApplication.status]}.
                        </p>
                        <Button className="mt-3" href={`/admin/applications/${relatedApplication.id}`} size="sm" variant="secondary">
                          Открыть заявку
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  <AdminActionRow className="items-stretch justify-start lg:grid lg:justify-stretch">
                    {isActiveAccess ? (
                      <Button
                        className="w-full"
                        disabled
                        title="В админке нет режима входа от имени владельца. Кабинет доступен самому бизнес-пользователю."
                        type="button"
                        variant="secondary"
                      >
                        Открыть кабинет
                      </Button>
                    ) : null}
                    {isPendingAccess ? (
                      <Button
                        className="w-full"
                        href={relatedApplication ? `/admin/applications/${relatedApplication.id}` : `/admin/applications?type=${ApplicationType.BUSINESS_ACCOUNT_REQUEST}`}
                        variant="secondary"
                      >
                        {relatedApplication ? 'Подготовить доступ' : 'Найти заявку'}
                      </Button>
                    ) : null}
                    {isBlockedAccess ? (
                      <form action={updateBusinessUserAccess}>
                        <HiddenRedirect value={currentPath} />
                        <input name="userId" type="hidden" value={user.id} />
                        <input name="status" type="hidden" value="active" />
                        <ConfirmSubmitButton
                          className="w-full"
                          confirmActionLabel="Разблокировать"
                          confirmText="Владелец сможет войти в бизнес-кабинет."
                          confirmTitle="Разблокировать бизнес-доступ?"
                          type="submit"
                          variant="secondary"
                        >
                          Разблокировать
                        </ConfirmSubmitButton>
                      </form>
                    ) : null}
                    {!isBlockedAccess ? (
                      <AdminActionMenu className="justify-self-start lg:justify-self-stretch">
                        <AdminActionMenuTrigger className="w-full" />
                        <AdminActionMenuContent>
                          {relatedApplication ? (
                            <AdminActionMenuLink href={`/admin/applications/${relatedApplication.id}`}>
                              Открыть заявку
                            </AdminActionMenuLink>
                          ) : null}
                          <form action={updateBusinessUserAccess}>
                            <HiddenRedirect value={currentPath} />
                            <input name="userId" type="hidden" value={user.id} />
                            <input name="status" type="hidden" value="blocked" />
                            <AdminActionMenuButton
                              confirmActionLabel="Заблокировать"
                              confirmText="Владелец больше не сможет войти в бизнес-кабинет."
                              confirmTitle="Заблокировать бизнес-доступ?"
                              tone="danger"
                            >
                              Заблокировать
                            </AdminActionMenuButton>
                          </form>
                        </AdminActionMenuContent>
                      </AdminActionMenu>
                    ) : null}
                  </AdminActionRow>
                </div>
              </Card>
            );
          })
        ) : (
          <ContextualEmptyState context="Доступы" title="Бизнес-доступов пока нет" description="После одобрения бизнес-заявки здесь появится аккаунт компании." />
        )}
      </section>
    </div>
  );
}
