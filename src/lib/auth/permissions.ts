import { UserRole } from '@prisma/client';

export function canAccessAdmin(role?: UserRole | null) {
  return role === UserRole.ADMIN || role === UserRole.MODERATOR;
}

export function canManageUsers(role?: UserRole | null) {
  return role === UserRole.ADMIN;
}
