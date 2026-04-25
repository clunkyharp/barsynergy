export type UserRole = 'user' | 'moderator' | 'admin';

export function canAccessAdmin(role?: UserRole | null) {
  return role === 'admin' || role === 'moderator';
}

export function canManageUsers(role?: UserRole | null) {
  return role === 'admin';
}
