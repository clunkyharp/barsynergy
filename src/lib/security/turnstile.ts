export class TurnstileError extends Error {
  constructor() {
    super('captcha failed');
    this.name = 'TurnstileError';
  }
}

export async function assertTurnstilePassed(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return;

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
