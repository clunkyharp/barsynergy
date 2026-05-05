import { createGeneralSponsor } from '@/app/admin/general-sponsors/actions';
import { GeneralSponsorForm } from '@/app/admin/general-sponsors/general-sponsor-form';
import { Button } from '@/components/ui/button';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_GENERAL_SPONSORS_PATH = '/admin/general-sponsors';

export default async function AdminGeneralSponsorCreatePage() {
  await requireAdminSectionAccess('generalSponsors');

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true }
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Админка / Генспонсоры / Создание</p>
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
