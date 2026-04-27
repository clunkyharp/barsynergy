import { UserRole } from '@prisma/client';

export const adminSections = [
  'dashboard',
  'articles',
  'events',
  'courses',
  'vacancies',
  'suppliers',
  'partners',
  'applications',
  'users',
  'categories',
  'cities',
  'tags'
] as const;

export type AdminSection = (typeof adminSections)[number];

const adminSectionRoles = {
  dashboard: [UserRole.ADMIN, UserRole.MODERATOR],
  articles: [UserRole.ADMIN, UserRole.MODERATOR],
  events: [UserRole.ADMIN, UserRole.MODERATOR],
  courses: [UserRole.ADMIN, UserRole.MODERATOR],
  vacancies: [UserRole.ADMIN, UserRole.MODERATOR],
  suppliers: [UserRole.ADMIN, UserRole.MODERATOR],
  partners: [UserRole.ADMIN, UserRole.MODERATOR],
  applications: [UserRole.ADMIN, UserRole.MODERATOR],
  users: [UserRole.ADMIN],
  categories: [UserRole.ADMIN],
  cities: [UserRole.ADMIN],
  tags: [UserRole.ADMIN]
} satisfies Record<AdminSection, readonly UserRole[]>;

export function canAccessAdmin(role?: UserRole | null) {
  return adminSections.some((section) => canAccessAdminSection(role, section));
}

export function canAccessAdminSection(role: UserRole | null | undefined, section: AdminSection) {
  const allowedRoles: readonly UserRole[] = adminSectionRoles[section];
  return role ? allowedRoles.includes(role) : false;
}

export function canManageUsers(role?: UserRole | null) {
  return canAccessAdminSection(role, 'users');
}
