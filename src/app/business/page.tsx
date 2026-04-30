import { ApplicationStatus } from '@prisma/client';
import { updateBusinessProfile } from '@/app/business/actions';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import { ActionRow } from '@/components/ui/action-row';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';
import { PageHeader } from '@/components/ui/page-header';
import { Select } from '@/components/ui/select';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { applicationStatusLabels } from '@/lib/admin/application-utils';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { prisma } from '@/lib/db/prisma';

type BusinessDashboardPageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function BusinessDashboardPage({ searchParams }: BusinessDashboardPageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const params = (await searchParams) ?? {};
  const [cities, requestCount, activeRequestCount, latestApplications] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.application.count({ where: { businessAccountId: businessAccount.id } }),
    prisma.application.count({
      where: {
        businessAccountId: businessAccount.id,
        status: {
          notIn: [ApplicationStatus.DRAFT, ApplicationStatus.ARCHIVED]
        }
      }
    }),
    prisma.application.findMany({
      where: { businessAccountId: businessAccount.id },
      orderBy: [{ updatedAt: 'desc' }],
      take: 3,
      select: { id: true, subject: true, status: true, businessNotes: true, updatedAt: true }
    })
  ]);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Компания" title={businessAccount.companyName} />
      <AdminActionAlert params={params} />
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Panel className="overflow-hidden p-0" tone="elevated">
          <div className="border-b border-black/10 px-5 py-5 md:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Компания</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">Профиль компании</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Заполненный профиль помогает быстрее отправлять новые заявки и не повторять одни и те же данные.
            </p>
          </div>
          <div className="p-5 md:p-6">
            <form action={updateBusinessProfile} className="mt-5 grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField htmlFor="companyName" label="Компания">
                  <Input id="companyName" name="companyName" required maxLength={160} defaultValue={businessAccount.companyName} />
                </FormField>
                <FormField htmlFor="contactPerson" label="Контактное лицо">
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    required
                    maxLength={120}
                    defaultValue={businessAccount.contactPerson ?? ''}
                  />
                </FormField>
                <FormField htmlFor="cityId" label="Город">
                  <Select id="cityId" name="cityId" defaultValue={businessAccount.cityId ?? ''}>
                    <option value="">Не выбран</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField htmlFor="phone" label="Телефон">
                  <Input id="phone" name="phone" maxLength={80} defaultValue={businessAccount.phone ?? ''} />
                </FormField>
                <FormField htmlFor="telegram" label="Telegram">
                  <Input id="telegram" name="telegram" maxLength={80} defaultValue={businessAccount.telegram ?? ''} />
                </FormField>
                <FormField htmlFor="websiteUrl" label="Сайт">
                  <Input id="websiteUrl" name="websiteUrl" type="url" maxLength={240} defaultValue={businessAccount.websiteUrl ?? ''} />
                </FormField>
              </div>
              <FormField htmlFor="description" label="Описание">
                <Textarea
                  id="description"
                  name="description"
                  className="min-h-40"
                  maxLength={1000}
                  rows={5}
                  defaultValue={businessAccount.description ?? ''}
                />
              </FormField>
              <ActionRow className="border-t-0 pt-0">
                <Button className="rounded-full" type="submit">Сохранить профиль</Button>
              </ActionRow>
            </form>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel padding="md" tone="elevated">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Статус</p>
            <h2 className="mt-3 text-xl font-semibold">Текущий доступ</h2>
            <div className="mt-4 flex items-center gap-3">
              <StatusBadge variant="success">Активен</StatusBadge>
              <span className="text-sm text-[var(--muted)]">Компания может создавать и отслеживать заявки.</span>
            </div>
          </Panel>
          <Panel padding="md" tone="elevated">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Заявки</p>
            <h2 className="mt-3 text-xl font-semibold">По вашей компании</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
              <StatCard label="Всего заявок" value={requestCount} />
              <StatCard label="В работе" value={activeRequestCount} />
            </div>
            <Button className="mt-5 w-full rounded-full" href="/business/requests" variant="secondary">
              Открыть заявки
            </Button>
          </Panel>
          <Panel padding="md" tone="elevated">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Последние обновления</p>
            <div className="mt-4 grid gap-3">
              {latestApplications.length > 0 ? (
                latestApplications.map((application) => (
                  <Panel key={application.id} padding="sm">
                    <p className="text-sm font-semibold">{application.subject ?? 'Заявка без названия'}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">Статус: {applicationStatusLabels[application.status]}</p>
                    {application.businessNotes ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{application.businessNotes}</p>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Комментариев для бизнеса пока нет.</p>
                    )}
                  </Panel>
                ))
              ) : (
                <Panel className="text-sm leading-6 text-[var(--muted)]" padding="sm">
                  Пока нет обновлений. Когда появится первая заявка, здесь будет история изменений и комментарии.
                </Panel>
              )}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
