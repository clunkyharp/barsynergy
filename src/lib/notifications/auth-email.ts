import nodemailer from 'nodemailer';
import { getEnv } from '@/lib/validation/env';
import { brandButtonHtml, mutedTextHtml } from '@/lib/notifications/email-theme';

export async function sendBusinessWelcomeEmail({
  to,
  companyName,
  setPasswordUrl
}: {
  to: string;
  companyName: string;
  setPasswordUrl: string;
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
  const safeUrl = setPasswordUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const safeName = companyName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  await transporter.sendMail({
    from,
    to,
    subject: `Добро пожаловать в BARSYNERGY — ${companyName}`,
    text: [
      `Бизнес-кабинет для «${companyName}» активирован.`,
      '',
      'Установите пароль для следующих входов:',
      setPasswordUrl,
      '',
      'Ссылка действует 7 дней.',
      'Сейчас вы уже вошли в кабинет — пароль можно установить в удобное время.'
    ].join('\n'),
    html: `
      <p>Бизнес-кабинет для <strong>${safeName}</strong> активирован.</p>
      <p style="margin:8px 0 20px;color:#888;font-size:14px">Установите пароль, чтобы входить в кабинет в следующий раз.</p>
      <p style="margin:24px 0">
        <a href="${safeUrl}" style="background:#ffd02f;color:#1c1c1e;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
          Установить пароль
        </a>
      </p>
      <p style="color:#aaa;font-size:12px">Ссылка действует 7 дней. Если вы не регистрировались — проигнорируйте это письмо.</p>
    `
  });
}

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
