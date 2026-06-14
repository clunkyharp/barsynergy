import type { Metadata } from 'next';
import { updateBusinessProfile } from '@/lib/business/profile-actions';
import { BusinessProfileSheet } from '@/components/business/business-cabinet';
import { PageHeader } from '@/components/ui/page-header';
import { requireBusinessAccountAccess } from '@/lib/auth/require-business-account';
import { buildPrivatePageMetadata } from '@/lib/public/metadata';
import { getActiveCities } from '@/modules/business/queries';

export const metadata: Metadata = buildPrivatePageMetadata({
  title: 'Настройки компании',
  description: 'Редактирование профиля компании в закрытом кабинете BARSYNERGY.'
});

export default async function BusinessSettingsPage() {
  const { businessAccount } = await requireBusinessAccountAccess();
  const cities = await getActiveCities();

  return (
    <div className="space-y-8">
      <PageHeader title="Настройки компании" />
      <BusinessProfileSheet account={businessAccount} action={updateBusinessProfile} cities={cities} />
    </div>
  );
}
