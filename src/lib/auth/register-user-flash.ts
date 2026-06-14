export const REGISTER_USER_FLASH_COOKIE = 'barsynergy_register_user_flash';

export type RegisterUserFlash = {
  fullName?: string;
  email?: string;
};

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

type CookieWriter = {
  set(name: string, value: string, options: { httpOnly: boolean; maxAge: number; path: string; sameSite: 'lax'; secure: boolean }): void;
};

function cleanFlashValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 255) : undefined;
}

export function getRegisterUserFlash(cookieStore: CookieReader): RegisterUserFlash | null {
  const raw = cookieStore.get(REGISTER_USER_FLASH_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Partial<Record<keyof RegisterUserFlash, unknown>>;
    return {
      fullName: typeof parsed.fullName === 'string' ? cleanFlashValue(parsed.fullName) : undefined,
      email: typeof parsed.email === 'string' ? cleanFlashValue(parsed.email) : undefined
    };
  } catch {
    return null;
  }
}

export function setRegisterUserFlashCookie(cookieStore: CookieWriter, flash: RegisterUserFlash) {
  const payload = {
    fullName: cleanFlashValue(flash.fullName),
    email: cleanFlashValue(flash.email)
  };

  cookieStore.set(REGISTER_USER_FLASH_COOKIE, Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url'), {
    httpOnly: true,
    maxAge: 10 * 60,
    path: '/auth/register/user',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
}
