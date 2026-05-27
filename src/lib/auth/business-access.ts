import { ApplicationType } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getEnv } from '@/lib/validation/env';
import { createSessionToken, getSessionCookieOptions, hashSessionToken } from '@/lib/auth/session';
import { parseApplicationPayload } from '@/lib/applications/application-payloads';
export {
  isBusinessAccessInviteActivationEligible,
  isBusinessAccessInvitePreparationStatusAllowed,
  shouldInvalidateBusinessAccessInvitesOnStatusChange
} from '@/lib/auth/business-access-lifecycle';

export const BUSINESS_ACCESS_PREVIEW_COOKIE_NAME = 'barsynergy_business_access_preview';
export const BUSINESS_ACCESS_ACTIVATION_COOKIE_NAME = 'barsynergy_business_access_activation';
const BUSINESS_ACCESS_INVITE_TTL_HOURS = 72;

export function createBusinessAccessInviteToken() {
  return createSessionToken();
}

export function hashBusinessAccessInviteToken(token: string) {
  return hashSessionToken(token);
}

export function getBusinessAccessInviteExpiresAt() {
  return new Date(Date.now() + BUSINESS_ACCESS_INVITE_TTL_HOURS * 60 * 60 * 1000);
}

export function buildBusinessAccessActivationUrl(token: string) {
  return new URL(`/auth/activate/consume?token=${encodeURIComponent(token)}`, getEnv().APP_URL).toString();
}

export function getBusinessAccessPreviewCookieOptions() {
  return {
    ...getSessionCookieOptions(),
    maxAge: 60 * 10,
    path: '/admin/applications'
  };
}

export function getBusinessAccessActivationCookieOptions() {
  return {
    ...getSessionCookieOptions(),
    maxAge: 60 * 10,
    path: '/auth/activate'
  };
}

export function parseBusinessAccessRequestPayload(payload: unknown, fallbackContactPerson?: string | null) {
  const parsed = parseApplicationPayload(ApplicationType.BUSINESS_ACCOUNT_REQUEST, payload);

  return {
    companyName: parsed.companyName,
    contactPerson: parsed.contactPerson?.trim() || fallbackContactPerson?.trim() || parsed.companyName,
    websiteUrl: parsed.websiteUrl?.trim() || null,
    description: parsed.description?.trim() || null
  };
}

export async function findActiveBusinessAccessInvite(token: string) {
  return prisma.businessAccessInvite.findFirst({
    where: {
      tokenHash: hashBusinessAccessInviteToken(token),
      usedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    select: {
      id: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          status: true
        }
      },
      application: {
        select: {
          id: true,
          type: true,
          status: true,
          payload: true,
          name: true,
          businessAccount: {
            select: {
              id: true,
              companyName: true,
              status: true
            }
          }
        }
      }
    }
  });
}
