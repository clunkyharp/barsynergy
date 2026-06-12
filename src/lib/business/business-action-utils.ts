import { redirect } from 'next/navigation';
import { z, ZodError } from 'zod';
import { hasErrorMessage, resolveServerActionError } from '@/lib/actions/server-action-errors';

export function formatZodFieldErrors(error: unknown, fieldLabels: Record<string, string>, fallback: string): string {
  if (!(error instanceof ZodError)) return fallback;
  const fields = new Set<string>();
  for (const issue of error.issues) {
    const path = issue.path.find((segment) => typeof segment === 'string') as string | undefined;
    if (path && fieldLabels[path]) fields.add(fieldLabels[path]);
  }
  if (fields.size === 0) return fallback;
  return `Заполните обязательные поля: ${Array.from(fields).join(', ')}.`;
}

export const businessProfileSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  contactPerson: z.string().trim().min(2).max(120),
  cityId: z.string().trim().optional(),
  phone: z.string().trim().max(80).optional(),
  telegram: z.string().trim().max(80).optional(),
  websiteUrl: z.string().trim().url().max(240).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional()
});

function businessResultPath(path: string, result: { type: 'success' | 'error'; message: string }) {
  const url = new URL(path, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  return `${url.pathname}${url.search}`;
}

export function redirectWithBusinessResult(path: string, result: { type: 'success' | 'error'; message: string }): never {
  redirect(businessResultPath(path, result));
}

export function resolveBusinessActionError(
  action: string,
  error: unknown,
  messages: {
    zod: string;
    fallback: string;
    city?: string;
    draft?: string;
    application?: string;
  }
) {
  return resolveServerActionError({
    action,
    error,
    zodMessage: messages.zod,
    known: [
      ...(messages.city
        ? [
            {
              matches: (candidate: Error) => hasErrorMessage(candidate, 'city is invalid'),
              message: messages.city
            }
          ]
        : []),
      ...(messages.draft
        ? [
            {
              matches: (candidate: Error) => hasErrorMessage(candidate, 'draft is invalid'),
              message: messages.draft
            }
          ]
        : []),
      ...(messages.application
        ? [
            {
              matches: (candidate: Error) => hasErrorMessage(candidate, 'application is invalid'),
              message: messages.application
            },
            {
              matches: (candidate: Error) => hasErrorMessage(candidate, 'draft type cannot be changed'),
              message: messages.application
            }
          ]
        : [])
    ],
    fallbackMessage: messages.fallback
  });
}
