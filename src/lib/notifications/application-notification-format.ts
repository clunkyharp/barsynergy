type NotificationEnvLike = {
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_FROM?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_ADMIN_CHAT_ID?: string;
};

type ApplicationNotificationInput = {
  applicationId: string;
  applicationTypeLabel: string;
  subject: string;
  cityName?: string;
};

export function hasSmtpNotificationConfig(env: NotificationEnvLike) {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_FROM);
}

export function hasTelegramAdminNotificationConfig(env: NotificationEnvLike) {
  return Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_ADMIN_CHAT_ID);
}

export function buildAdminApplicationTelegramMessage(input: ApplicationNotificationInput, appUrl: string) {
  const lines = [
    'Новая заявка BARSYNERGY',
    `Тип: ${input.applicationTypeLabel}`,
    `Тема: ${input.subject}`,
    input.cityName ? `Город: ${input.cityName}` : null,
    `Карточка: ${appUrl}/admin/applications/${input.applicationId}`
  ].filter(Boolean);

  return lines.join('\n');
}
