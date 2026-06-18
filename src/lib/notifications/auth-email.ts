import nodemailer from 'nodemailer';
import { getEnv } from '@/lib/validation/env';
import { brandButtonHtml, mutedTextHtml } from '@/lib/notifications/email-theme';

export async function sendVerificationEmail({
  to,
  verificationUrl
}: {
  to: string;
  verificationUrl: string;
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
    subject: 'Подтвердите email — BARSYNERGY',
    text: [
      'Спасибо за регистрацию в BARSYNERGY.',
      '',
      'Перейдите по ссылке для подтверждения email:',
      verificationUrl,
      '',
      'Ссылка действует 24 часа.',
      'Если вы не регистрировались — проигнорируйте это письмо.'
    ].join('\n'),
    html: `
      <p>Спасибо за регистрацию в <strong>BARSYNERGY</strong>.</p>
      <p style="margin:24px 0">
        ${brandButtonHtml(verificationUrl, 'Подтвердить email')}
      </p>
      <p>${mutedTextHtml('Ссылка действует 24 часа. Если вы не регистрировались — проигнорируйте это письмо.')}</p>
    `
  });
}

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
        ${brandButtonHtml(resetUrl, 'Сбросить пароль')}
      </p>
      <p>${mutedTextHtml('Ссылка действует 1 час. Если вы не запрашивали сброс — проигнорируйте это письмо.')}</p>
    `
  });
}
