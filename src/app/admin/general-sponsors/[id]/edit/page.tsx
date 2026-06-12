import { notFound } from 'next/navigation';
import { updateGeneralSponsor, updateGeneralSponsorStatus } from '@/app/admin/general-sponsors/actions';
import { GeneralSponsorForm } from '@/app/admin/general-sponsors/general-sponsor-form';
import { AdminActionAlert, AdminContentVisibilityPanel } from '@/components/admin/content-admin-controls';
import { Button } from '@/components/ui/button';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { getActiveCities, getGeneralSponsorById } from '@/lib/admin/admin-queries';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export const dynamic = 'force-dynamic';

const ADMIN_GENERAL_SPONSORS_PATH = '/admin/general-sponsors';

type AdminGeneralSponsorEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<AdminContentSearchParams>;
};

export default async function AdminGeneralSponsorEditPage({ params, searchParams }: AdminGeneralSponsorEditPageProps) {
  await requireAdminSectionAccess('generalSponsors');

  const { id } = await params;
  const currentPath = `${ADMIN_GENERAL_SPONSORS_PATH}/${id}/edit`;
  const query = (await searchParams) ?? {};
  const [sponsor, cities] = await Promise.all([
    getGeneralSponsorById(id),
    getActiveCities()
  ]);

  if (!sponsor) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Генспонсоры</p>
          <h1 className="mt-2 text-3xl font-semibold">{sponsor.name}</h1>
        </div>
        <Button href={ADMIN_GENERAL_SPONSORS_PATH} variant="ghost">
          Назад к списку
        </Button>
      </header>

      <AdminActionAlert params={query} />

      <AdminContentVisibilityPanel
        currentPath={currentPath}
        idName="sponsorId"
        idValue={sponsor.id}
        publicHref="/general-sponsors"
        status={sponsor.status}
        updateStatusAction={updateGeneralSponsorStatus}
      />

      <GeneralSponsorForm
        action={updateGeneralSponsor}
        cities={cities}
        redirectTo={currentPath}
        sponsor={sponsor}
        submitLabel="Сохранить спонсора"
      />
    </div>
  );
}
