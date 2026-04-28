import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import type { PublicContentSearchParams } from '@/lib/public/content';

export const PERSONAL_DATA_CONSENT_TEXT =
  'Согласие на обработку персональных данных для обработки заявки через BARSYNERGY.';
export const VACANCY_RESPONSE_CONSENT_TEXT =
  'Согласие на обработку персональных данных и передачу отклика работодателю по выбранной вакансии после проверки BARSYNERGY.';

export type PublicApplicationResult = {
  type: 'success' | 'error';
  message: string;
};

export type PublicApplicationUtm = {
  source?: string;
  medium?: string;
  campaign?: string;
};

export const baseContactSchema = z.object({
  email: z.string().trim().email().max(180).optional(),
  phone: z.string().trim().max(80).optional(),
  telegram: z.string().trim().max(80).optional()
});

export const utmSchema = z.object({
  utmSource: z.string().trim().max(160).optional(),
  utmMedium: z.string().trim().max(160).optional(),
  utmCampaign: z.string().trim().max(160).optional()
});

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function stripPublicApplicationResultParams(params: PublicContentSearchParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([key]) => key !== 'applicationSuccess' && key !== 'applicationError')
  );
}

export function getPublicApplicationResult(params: PublicContentSearchParams): PublicApplicationResult | undefined {
  const error = firstParam(params.applicationError);

  if (error) {
    return { type: 'error', message: error };
  }

  const success = firstParam(params.applicationSuccess);
  return success ? { type: 'success', message: success } : undefined;
}

export function getPublicApplicationUtm(params: PublicContentSearchParams): PublicApplicationUtm {
  return {
    source: firstParam(params.utm_source),
    medium: firstParam(params.utm_medium),
    campaign: firstParam(params.utm_campaign)
  };
}

export function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function nullableString(value?: string) {
  return value && value.length > 0 ? value : null;
}

export function getPublicApplicationResultPath(
  basePath: string,
  result: PublicApplicationResult,
  hash = 'applications'
) {
  const url = new URL(basePath, 'http://localhost');
  url.searchParams.set(result.type === 'success' ? 'applicationSuccess' : 'applicationError', result.message);
  url.hash = hash;
  return `${url.pathname}${url.search}${url.hash}`;
}

export function formatPublicApplicationActionError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('contact is required')) {
      return 'Укажите хотя бы один контакт: email, телефон или Telegram.';
    }

    if (error.message.includes('city is invalid')) {
      return 'Выбранный город недоступен.';
    }

    if (error.message.includes('vacancy is invalid')) {
      return 'Выбранная вакансия недоступна для отклика.';
    }

    if (error.message.includes('application forms are disabled')) {
      return 'Формы заявок временно закрыты.';
    }

    if (error.message.includes('application rate limit exceeded')) {
      return 'Слишком много отправок за короткое время. Повторите попытку позже.';
    }

    if (error.message.includes('unsupported private resume file')) {
      return 'Резюме можно загрузить только в PDF, DOC, DOCX, RTF или ODT.';
    }

    if (error.message.includes('private resume file is too large')) {
      return 'Файл резюме превышает допустимый размер.';
    }
  }

  if (error instanceof z.ZodError) {
    return 'Проверьте обязательные поля и согласие на обработку данных.';
  }

  return 'Не удалось отправить заявку. Проверьте данные и повторите попытку.';
}

export async function assertActiveCity(cityId?: string) {
  if (!cityId) {
    return null;
  }

  const city = await prisma.city.findFirst({
    where: { id: cityId, isActive: true },
    select: { id: true, name: true }
  });

  if (!city) {
    throw new Error('city is invalid');
  }

  return city;
}
