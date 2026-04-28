import { BusinessAccountStatus, UserRole, UserStatus } from '@prisma/client';
import { updateBusinessUserAccess } from '@/app/admin/users/actions';
import { AdminActionAlert, HiddenRedirect } from '@/components/admin/content-admin-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';

const ADMIN_USERS_PATH = '/admin/users';

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

type AdminUsersPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdminSectionAccess('users');

  const params = (await searchParams) ?? {};
  const currentPath = ADMIN_USERS_PATH;
  const users = await prisma.user.findMany({
    where: { role: UserRole.BUSINESS },
    orderBy: [{ createdAt: 'desc' }],
    take: 50,
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
      businessAccount: {
        select: {
          companyName: true,
          status: true,
          contactPerson: true,
          phone: true,
          telegram: true,
          city: { select: { name: true } }
        }
      }
    }
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Админка</p>
        <h1 className="mt-2 text-3xl font-semibold">Бизнес-доступы</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Здесь администратор подтверждает или блокирует первый бизнес-кабинет. Обычные профили пользователей пока не входят в этот срез.
        </p>
      </header>
      <AdminActionAlert params={params} />
      <section className="grid gap-4">
        {users.length > 0 ? (
          users.map((user) => {
            const account = user.businessAccount;

            return (
              <Card className="p-5" key={user.id}>
                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{account?.companyName ?? user.email}</h2>
                      <Badge variant={user.status === UserStatus.ACTIVE ? 'success' : user.status === UserStatus.BLOCKED ? 'danger' : 'warning'}>
                        {userStatusLabels[user.status]}
                      </Badge>
                      {account ? <Badge>{businessStatusLabels[account.status]}</Badge> : null}
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
                    </dl>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    <form action={updateBusinessUserAccess}>
                      <HiddenRedirect value={currentPath} />
                      <input name="userId" type="hidden" value={user.id} />
                      <input name="status" type="hidden" value="active" />
                      <Button className="w-full" type="submit" disabled={user.status === UserStatus.ACTIVE}>
                        Открыть доступ
                      </Button>
                    </form>
                    <form action={updateBusinessUserAccess}>
                      <HiddenRedirect value={currentPath} />
                      <input name="userId" type="hidden" value={user.id} />
                      <input name="status" type="hidden" value="blocked" />
                      <Button className="w-full" type="submit" variant="secondary" disabled={user.status === UserStatus.BLOCKED}>
                        Заблокировать
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-6 text-sm text-[var(--muted)]">Заявок на бизнес-доступ пока нет.</Card>
        )}
      </section>
    </div>
  );
}
