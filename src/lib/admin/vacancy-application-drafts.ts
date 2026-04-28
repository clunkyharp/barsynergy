import { ApplicationType, ContentStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { isVacancyPosition } from '../vacancies/positions.ts';

type VacancySubmissionApplication = {
  type: ApplicationType;
  vacancyId: string | null;
  cityId: string | null;
  message: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  telegram: string | null;
  consentAcceptedAt: Date | null;
  payload: Prisma.JsonValue | null;
};

function payloadString(payload: Prisma.JsonValue | null, key: string) {
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    return undefined;
  }

  const value = payload[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function getContactMode(application: VacancySubmissionApplication) {
  const contacts = [
    application.name ? `Контакт: ${application.name}` : null,
    application.email ? `Email: ${application.email}` : null,
    application.phone ? `Телефон: ${application.phone}` : null,
    application.telegram ? `Telegram: ${application.telegram}` : null
  ].filter(Boolean);

  return contacts.length > 0 ? contacts.join(' / ') : null;
}

export function getVacancyDraftFieldsFromApplication(application: VacancySubmissionApplication) {
  if (application.type !== ApplicationType.VACANCY_SUBMISSION) {
    throw new Error('vacancy draft requires vacancy submission application');
  }

  if (application.vacancyId) {
    throw new Error('vacancy draft already exists for application');
  }

  if (!application.consentAcceptedAt) {
    throw new Error('vacancy draft requires consent');
  }

  const companyName = payloadString(application.payload, 'companyName');
  const position = payloadString(application.payload, 'position');
  const shortDescription = payloadString(application.payload, 'shortDescription');
  const description = application.message?.trim() || shortDescription;

  if (!companyName || !position || !isVacancyPosition(position) || !shortDescription || !description) {
    throw new Error('vacancy draft requires complete vacancy payload');
  }

  return {
    title: position,
    summary: shortDescription,
    description,
    status: ContentStatus.DRAFT,
    cityId: application.cityId,
    categoryId: null,
    companyName,
    position,
    employmentType: payloadString(application.payload, 'employmentType') ?? null,
    salaryLabel: payloadString(application.payload, 'salaryLabel') ?? null,
    experienceLabel: payloadString(application.payload, 'experienceLabel') ?? null,
    contactMode: getContactMode(application)
  };
}

export function appendApplicationInternalNote(existingNote: string | null, note: string) {
  return [existingNote?.trim(), note].filter(Boolean).join('\n\n');
}
