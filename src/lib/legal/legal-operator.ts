import { getEnv, type AppEnv } from '@/lib/validation/env';

export type LegalOperatorType = 'legal_entity' | 'individual_entrepreneur';

export type LegalOperatorProfile = {
  type: LegalOperatorType;
  typeLabel: string;
  name: string;
  email: string | null;
  address: string | null;
  taxId: string | null;
  registrationId: string | null;
  registrationLabel: 'ОГРН' | 'ОГРНИП';
  isConfiguredForPublicForms: boolean;
};

export function getLegalOperatorProfile(env: AppEnv = getEnv()): LegalOperatorProfile {
  const type = env.LEGAL_OPERATOR_TYPE;
  const registrationLabel = type === 'individual_entrepreneur' ? 'ОГРНИП' : 'ОГРН';

  return {
    type,
    typeLabel: type === 'individual_entrepreneur' ? 'Индивидуальный предприниматель' : 'Юридическое лицо',
    name: env.LEGAL_OPERATOR_NAME?.trim() || 'Реквизиты будут добавлены после утверждения владельцем',
    email: env.LEGAL_OPERATOR_EMAIL?.trim() || null,
    address: env.LEGAL_OPERATOR_ADDRESS?.trim() || null,
    taxId: env.LEGAL_OPERATOR_TAX_ID?.trim() || null,
    registrationId: env.LEGAL_OPERATOR_REGISTRATION_ID?.trim() || null,
    registrationLabel,
    isConfiguredForPublicForms: Boolean(
      env.LEGAL_OPERATOR_NAME?.trim() &&
        env.LEGAL_OPERATOR_EMAIL?.trim() &&
        env.LEGAL_OPERATOR_ADDRESS?.trim() &&
        env.LEGAL_OPERATOR_TAX_ID?.trim() &&
        env.LEGAL_OPERATOR_REGISTRATION_ID?.trim()
    )
  };
}
