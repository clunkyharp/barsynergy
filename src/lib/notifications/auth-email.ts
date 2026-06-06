import nodemailer from 'nodemailer';
import { getEnv } from '@/lib/validation/env';

export async function sendPasswordResetEmail({
  to,
  resetUrl
}: {
  to: string;
  resetUrl: string;
}) {
  const env = getEnv();

  if (!env.SMTP_HOST) return;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER && env.SMTP_PASSWORD
      ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
      : undefined
  });

  const from = env.SMTP_FROM ?? 'BARSYNERGY <noreply@barsynergy.ru>';

  await transporter.sendMail({
    from,
    to,
    subject: 'Восстановление пароля BARSYNERGY',
    text: [
      'Вы запросили сброс пароля для входа в BARSYNERGY.',
      '',
      'Перейдите по ссылке для установки нового пароля:',
      resetUrl,
      '',
      'Ссылка действует 1 час.',
      'Если вы не запрашивали сброс — проигнорируйте это письмо.'
    ].join('\n'),
    html: `
      <p>Вы запросили сброс пароля для входа в <strong>BARSYNERGY</strong>.</p>
      <p style="margin:24px 0">
        <a href="${resetUrl}" style="background:#ffd02f;color:#1c1c1e;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Сбросить пароль
        </a>
      </p>
      <p style="color:#888;font-size:13px">Ссылка действует 1 час. Если вы не запрашивали сброс — проигнорируйте это письмо.</p>
    `
  });
}
