import { z } from 'zod';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/auth/password-policy-constants';

export { PASSWORD_HINT, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/auth/password-policy-constants';

export function passwordSchema() {
  return z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH);
}
