import { NextResponse } from 'next/server';
import { uploadPublicContentImageFromFormData } from '@/lib/admin/content-utils';
import { getCurrentUser } from '@/lib/auth/current-user';
import { canAccessAdminSection } from '@/lib/auth/permissions';
import { prisma } from '@/lib/db/prisma';
import { getClientIpFromHeaders } from '@/lib/security/request-identity';
import { isSameOriginBrowserRequest } from '@/lib/security/same-origin';
import { consumeThrottleWindowAtomically, getPersistentThrottleKeyHash } from '@/lib/security/throttle-window';
import { getEnv } from '@/lib/validation/env';

const ADMIN_UPLOAD_THROTTLE_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_UPLOAD_USER_MAX_ATTEMPTS = 30;
const ADMIN_UPLOAD_IP_MAX_ATTEMPTS = 60;

class AdminUploadRateLimitError extends Error {
  constructor() {
    super('admin upload rate limit exceeded');
  }
}

async function assertAdminContentImageUploadAllowed(input: { userId: string; headers: Headers }) {
  const now = new Date();
  const windowBoundary = new Date(now.getTime() - ADMIN_UPLOAD_THROTTLE_WINDOW_MS);
  const clientIp = getClientIpFromHeaders(input.headers);
  const scopes = [
    {
      scope: 'adminContentImageUploadUser',
      identifier: input.userId,
      maxAttempts: ADMIN_UPLOAD_USER_MAX_ATTEMPTS
    },
    {
      scope: 'adminContentImageUploadIp',
      identifier: clientIp,
      maxAttempts: ADMIN_UPLOAD_IP_MAX_ATTEMPTS
    }
  ];

  await prisma.$transaction(async (tx) => {
    for (const scope of scopes) {
      const slot = await consumeThrottleWindowAtomically(tx, {
        table: 'authAttempt',
        keyHash: getPersistentThrottleKeyHash(scope),
        maxAttempts: scope.maxAttempts,
        now,
        windowBoundary
      });

      if (!slot) {
        throw new AdminUploadRateLimitError();
      }
    }
  });
}

export async function POST(request: Request) {
  if (!isSameOriginBrowserRequest(request, getEnv().APP_URL)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!canAccessAdminSection(user.role, 'dashboard')) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  try {
    await assertAdminContentImageUploadAllowed({ userId: user.id, headers: request.headers });
  } catch (error) {
    if (error instanceof AdminUploadRateLimitError) {
      return NextResponse.json({ error: 'Too many upload attempts. Try again later.' }, { status: 429 });
    }

    return NextResponse.json({ error: 'Upload guard failed.' }, { status: 500 });
  }

  const formData = await request.formData();
  if (!(formData.get('file') instanceof File)) {
    return NextResponse.json({ error: 'File is required.' }, { status: 400 });
  }

  try {
    const upload = await uploadPublicContentImageFromFormData(formData, 'file', user.id);

    if (!upload) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }

    return NextResponse.json(upload);
  } catch {
    return NextResponse.json({ error: 'Upload failed. Check file type and size.' }, { status: 400 });
  }
}
