import { createGeneralSponsor } from '@/app/admin/general-sponsors/actions';
import { GeneralSponsorForm } from '@/app/admin/general-sponsors/general-sponsor-form';
import { Button } from '@/components/ui/button';
import { getActiveCities } from '@/lib/admin/admin-queries';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';

export const dynamic = 'force-dynamic';

const ADMIN_GENERAL_SPONSORS_PATH = '/admin/general-sponsors';

export default async function AdminGeneralSponsorCreatePage() {
  await requireAdminSectionAccess('generalSponsors');

  const cities = await getActiveCities();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">Админка / Генспонсоры / Создание</p>
          <h1 className="mt-2 text-3xl font-semibold">Новый генеральный спонсор</h1>
        </div>
        <Button href={ADMIN_GENERAL_SPONSORS_PATH} variant="secondary">
          Назад к списку
        </Button>
      </header>

      <GeneralSponsorForm
        action={createGeneralSponsor}
        cities={cities}
        redirectTo={ADMIN_GENERAL_SPONSORS_PATH}
        submitLabel="Создать спонсора"
      />
    </div>
  );
}
