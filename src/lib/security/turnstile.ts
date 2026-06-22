export class TurnstileError extends Error {
  constructor() {
    super('captcha failed');
    this.name = 'TurnstileError';
  }
}

export async function assertTurnstilePassed(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!secretKey) {
    // Captcha is only truly disabled when neither key is set (local/dev).
    // If a public site key is configured but the server secret is missing,
    // the widget renders for users yet verification is impossible — fail
    // closed instead of silently letting every submission through.
    if (siteKey) {
      throw new TurnstileError();
    }
    return;
  }

  if (!token) {
    throw new TurnstileError();
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success !== true) {
      throw new TurnstileError();
    }
  } catch {
    throw new TurnstileError();
  }
}
