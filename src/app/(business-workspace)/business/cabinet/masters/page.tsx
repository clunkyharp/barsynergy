import type { Metadata } from 'next';
import { AdminActionAlert } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { AppLink } from '@/components/ui/app-link';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { contentStatusBadgeVariants, contentStatusLabels } from '@/lib/admin/content-utils';
import { getBusinessMastersPage } from '@/modules/business/queries';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';

type PageProps = {
  searchParams?: Promise<AdminContentSearchParams>;
};

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Карточки мастеров',
  description: 'Управление карточками мастеров вашей компании.'
});

const entityTypeLabels: Record<string, string> = {
  INDIVIDUAL: 'Частный специалист',
  BUSINESS: 'Компания'
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

export default async function BusinessMastersPage({ searchParams }: PageProps) {
  const { businessAccount } = await requireBusinessAccountAccess();
  const params = (await searchParams) ?? {};
  const { masters } = await getBusinessMastersPage(businessAccount.id);

  return (
    <div className="space-y-8">
      <PageHeader title="Карточки мастеров" />

      <AdminActionAlert params={params} />

      <div className="flex items-center justify-end gap-3">
        <Button href="/business/cabinet/masters/create">Добавить карточку</Button>
      </div>

      {masters.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
          <p className="text-[var(--muted)]">У вас пока нет карточек мастеров.</p>
          <Button className="mt-4" href="/business/cabinet/masters/create" variant="primary">
            Создать первую
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {masters.map((master) => (
            <article
              className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] p-5 transition-colors hover:border-[var(--accent)]"
              key={master.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <AppLink
                    className="text-lg font-semibold text-[var(--text)] no-underline hover:text-[var(--accent)]"
                    href={`/business/cabinet/masters/${master.id}`}
                  >
                    {master.title}
                  </AppLink>
                  <p className="text-sm text-[var(--muted)]">{entityTypeLabels[master.entityType]}</p>
                  {master.summary ? (
                    <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">{master.summary}</p>
                  ) : null}
                  <p className="text-xs text-[var(--muted)]">
                    {master.city?.name ? `${master.city.name} · ` : ''}
                    {master.publishedAt ? `Опубликовано ${dateFormatter.format(master.publishedAt)} · ` : ''}
                    Обновлено {dateFormatter.format(master.updatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-start gap-2">
                  <StatusBadge variant={contentStatusBadgeVariants[master.status]}>
                    {contentStatusLabels[master.status]}
                  </StatusBadge>
                  {master.isVerified ? (
                    <StatusBadge variant="success">Проверен</StatusBadge>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
