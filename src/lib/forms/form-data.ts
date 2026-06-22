/**
 * Generic FormData helpers — no domain coupling.
 * Safe to import from any layer (admin, public, auth, profile, notifications).
 */

export function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getArray(formData: FormData, key: string): string[] {
  const raw = formData.getAll(key);
  return raw.filter((v): v is string => typeof v === 'string' && v.length > 0);
}

export function nullableString(value?: string) {
  return value && value.length > 0 ? value : null;
}
