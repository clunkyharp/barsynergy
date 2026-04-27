import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/current-user';
import { type AdminSection, canAccessAdminSection } from '@/lib/auth/permissions';

export async function requireAdminSectionAccess(section: AdminSection) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (!canAccessAdminSection(user.role, section)) {
    redirect('/admin');
  }

  return user;
}
