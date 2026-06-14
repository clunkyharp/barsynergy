import nodemailer from 'nodemailer';
import { getEnv } from '@/lib/validation/env';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createNewsletterTransport() {
  const env = getEnv();

  if (!env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER && env.SMTP_PASSWORD
      ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
      : undefined
  });
}

export async function sendNewsletterConfirmEmail({
  to,
  confirmUrl
}: {
  to: string;
  confirmUrl: string;
}) {
  const transporter = createNewsletterTransport();
  if (!transporter) return;

  const env = getEnv();
  const from = env.SMTP_FROM ?? 'BARSYNERGY <noreply@barsynergy.ru>';
  const safeConfirmUrl = escapeHtml(confirmUrl);

  await transporter.sendMail({
    from,
    to,
    subject: 'Подтвердите подписку BARSYNERGY',
    text: [
      'Вы оставили email для еженедельного дайджеста BARSYNERGY.',
      '',
      'Подтвердите подписку по ссылке:',
      confirmUrl,
      '',
      'Если вы не оставляли email — проигнорируйте это письмо.'
    ].join('\n'),
    html: `
      <p>Вы оставили email для еженедельного дайджеста <strong>BARSYNERGY</strong>.</p>
      <p style="margin:24px 0">
        <a href="${safeConfirmUrl}" style="background:#ffd02f;color:#1c1c1e;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Подтвердить подписку
        </a>
      </p>
      <p style="color:#888;font-size:13px">Если вы не оставляли email — проигнорируйте это письмо.</p>
    `
  });
}
