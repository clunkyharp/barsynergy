import nodemailer from 'nodemailer';
import { ApplicationNotificationChannel } from '@prisma/client';
import { getEnv, type AppEnv } from '@/lib/validation/env';

const SMTP_CONNECTION_TIMEOUT_MS = 10_000;
const SMTP_GREETING_TIMEOUT_MS = 10_000;
const SMTP_SOCKET_TIMEOUT_MS = 30_000;

type MessageEmailPayload = {
  applicationId: string;
  recipientEmail: string;
  recipientName: string | null;
  senderName: string;
  contextLabel: string;
  threadUrl: string;
};

function createSmtpTransporter(env: AppEnv) {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
    socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
    auth: env.SMTP_USER && env.SMTP_PASSWORD
      ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
      : undefined
  });
}

function buildMessageEmailText(
  channel: ApplicationNotificationChannel,
  payload: MessageEmailPayload,
  appUrl: string
): string {
  const greeting = payload.recipientName
    ? `Здравствуйте, ${payload.recipientName}.`
    : 'Здравствуйте.';

  const subject = channel === ApplicationNotificationChannel.BUSINESS_MESSAGE_EMAIL
    ? `${payload.senderName} написал(а) по заявке «${payload.contextLabel}»`
    : `${payload.senderName} ответил(а) на вашу заявку «${payload.contextLabel}»`;

  const threadLink = `${appUrl}${payload.threadUrl}`;

  return [
    greeting,
    '',
    subject,
    '',
    `Перейти к диалогу: ${threadLink}`,
    '',
    'Это автоматическое уведомление BARSYNERGY.'
  ].join('\n');
}

export async function sendMessageEmailNotification(
  channel: ApplicationNotificationChannel,
  payload: MessageEmailPayload
) {
  const env = getEnv();

  if (!env.SMTP_HOST || !env.SMTP_FROM) return;

  const transporter = createSmtpTransporter(env);

  const subject = channel === ApplicationNotificationChannel.BUSINESS_MESSAGE_EMAIL
    ? `BARSYNERGY: новое сообщение — ${payload.contextLabel}`
    : `BARSYNERGY: ответ на вашу заявку — ${payload.contextLabel}`;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: payload.recipientEmail,
    subject,
    text: buildMessageEmailText(channel, payload, env.APP_URL)
  });
}
