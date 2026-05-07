import nodemailer from 'nodemailer';
import {
  buildAdminApplicationTelegramMessage,
  hasSmtpNotificationConfig,
  hasTelegramAdminNotificationConfig
} from '@/lib/notifications/application-notification-format';
import type { ApplicationNotificationInput } from '@/lib/notifications/application-notification-dispatch';
import { getEnv, type AppEnv } from '@/lib/validation/env';

const TELEGRAM_NOTIFICATION_TIMEOUT_MS = 10_000;
const SMTP_CONNECTION_TIMEOUT_MS = 10_000;
const SMTP_GREETING_TIMEOUT_MS = 10_000;
const SMTP_SOCKET_TIMEOUT_MS = 30_000;

let smtpTransporter: nodemailer.Transporter | null = null;

function getSmtpTransporter(env: AppEnv) {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      connectionTimeout: SMTP_CONNECTION_TIMEOUT_MS,
      greetingTimeout: SMTP_GREETING_TIMEOUT_MS,
      socketTimeout: SMTP_SOCKET_TIMEOUT_MS,
      auth: env.SMTP_USER && env.SMTP_PASSWORD ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined
    });
  }

  return smtpTransporter;
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout)
  };
}

async function sendAdminTelegramNotification(env: AppEnv, input: ApplicationNotificationInput) {
  const timeout = createTimeoutSignal(TELEGRAM_NOTIFICATION_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: timeout.signal,
      body: JSON.stringify({
        chat_id: env.TELEGRAM_ADMIN_CHAT_ID,
        text: buildAdminApplicationTelegramMessage(input, env.APP_URL),
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      throw new Error(`telegram notification failed with status ${response.status}`);
    }
  } finally {
    timeout.clear();
  }
}

async function sendUserConfirmationEmail(env: AppEnv, input: ApplicationNotificationInput) {
  const transporter = getSmtpTransporter(env);
  const greeting = input.userName ? `Здравствуйте, ${input.userName}.` : 'Здравствуйте.';

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: input.userEmail,
    subject: 'BARSYNERGY: мы получили вашу заявку',
    text: [
      greeting,
      '',
      'Мы получили вашу заявку на BARSYNERGY.',
      `Тип: ${input.applicationTypeLabel}.`,
      `Тема: ${input.subject}.`,
      '',
      'Если понадобятся уточнения, команда свяжется с вами отдельно.',
      '',
      'Это автоматическое письмо-подтверждение.'
    ].join('\n')
  });
}

export async function notifyOnApplicationCreated(input: ApplicationNotificationInput) {
  const env = getEnv();
  const tasks: Promise<void>[] = [];

  if (hasTelegramAdminNotificationConfig(env)) {
    tasks.push(sendAdminTelegramNotification(env, input));
  }

  if (input.userEmail && hasSmtpNotificationConfig(env)) {
    tasks.push(sendUserConfirmationEmail(env, input));
  }

  if (tasks.length === 0) {
    return;
  }

  const results = await Promise.allSettled(tasks);

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Application notification failed.', result.reason);
    }
  }
}
