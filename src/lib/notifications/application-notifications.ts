import nodemailer from 'nodemailer';
import {
  buildAdminApplicationTelegramMessage,
  hasSmtpNotificationConfig,
  hasTelegramAdminNotificationConfig
} from '@/lib/notifications/application-notification-format';
import { getEnv, type AppEnv } from '@/lib/validation/env';

type ApplicationNotificationInput = {
  applicationId: string;
  applicationTypeLabel: string;
  subject: string;
  cityName?: string;
  userName?: string;
  userEmail?: string;
};

let smtpTransporter: nodemailer.Transporter | null = null;

function getSmtpTransporter(env: AppEnv) {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER && env.SMTP_PASSWORD ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined
    });
  }

  return smtpTransporter;
}

async function sendAdminTelegramNotification(env: AppEnv, input: ApplicationNotificationInput) {
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_ADMIN_CHAT_ID,
      text: buildAdminApplicationTelegramMessage(input, env.APP_URL),
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    throw new Error(`telegram notification failed with status ${response.status}`);
  }
}

async function sendUserConfirmationEmail(env: AppEnv, input: ApplicationNotificationInput) {
  const transporter = getSmtpTransporter(env);
  const greeting = input.userName ? `Здравствуйте, ${input.userName}.` : 'Здравствуйте.';

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: input.userEmail,
    subject: 'BARSYNERGY: заявка получена',
    text: [
      greeting,
      '',
      'Мы получили вашу заявку на сайте BARSYNERGY.',
      `Тип: ${input.applicationTypeLabel}.`,
      `Тема: ${input.subject}.`,
      '',
      'Команда обработает обращение вручную и свяжется с вами при необходимости.',
      '',
      'Это автоматическое подтверждение получения заявки.'
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
