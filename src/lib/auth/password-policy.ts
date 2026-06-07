import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 200;

export function passwordSchema() {
  return z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH);
}
