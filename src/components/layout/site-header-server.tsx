import { getCurrentUser } from '@/lib/auth/current-user';
import { SiteHeader } from '@/components/layout/site-header';
import { getProfileAvatarUrl } from '@/lib/profile/avatar-url';

export async function SiteHeaderServer({ logoutAction }: { logoutAction?: () => Promise<void> }) {
  const user = await getCurrentUser();

  const headerUser = user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
          displayName: user.profile?.fullName ?? null,
          avatarUrl: getProfileAvatarUrl(user.profile?.avatarFile)
        }
      : null;

  return <SiteHeader logoutAction={logoutAction} user={headerUser} />;
}
