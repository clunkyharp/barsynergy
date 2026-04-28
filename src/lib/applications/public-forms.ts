import type { AppEnv } from '@/lib/validation/env';

export function arePublicApplicationFormsEnabled(
  env: Pick<AppEnv, 'NODE_ENV' | 'APPLICATION_FORMS_ENABLED'>
) {
  return env.APPLICATION_FORMS_ENABLED ?? env.NODE_ENV !== 'production';
}
