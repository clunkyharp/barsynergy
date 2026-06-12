import { createHash } from 'node:crypto';

const HIBP_RANGE_URL = 'https://api.pwnedpasswords.com/range';
const HIBP_TIMEOUT_MS = 2500;

export class CompromisedPasswordError extends Error {
  constructor() {
    super('password has appeared in a breach');
  }
}

export async function isPwnedPassword(password: string) {
  const hash = createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HIBP_TIMEOUT_MS);

  try {
    const response = await fetch(`${HIBP_RANGE_URL}/${prefix}`, {
      headers: {
        'Add-Padding': 'true',
        'User-Agent': 'BARSYNERGY password policy'
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return false;
    }

    const body = await response.text();

    return body.split(/\r?\n/).some((line) => {
      const [candidateSuffix, count] = line.trim().split(':');
      return candidateSuffix === suffix && Number(count) > 0;
    });
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function assertPasswordNotCompromised(password: string) {
  if (await isPwnedPassword(password)) {
    throw new CompromisedPasswordError();
  }
}
