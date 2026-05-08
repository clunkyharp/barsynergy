type NotificationEnvLike = {
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_FROM?: string;
  ADMIN_NOTIFICATION_EMAIL?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_ADMIN_CHAT_ID?: string;
};

type ApplicationNotificationInput = {
  applicationId: string;
  applicationTypeLabel: string;
  subject: string;
  cityName?: string;
  userName?: string;
  userEmail?: string;
};

export function hasSmtpNotificationConfig(env: NotificationEnvLike) {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_FROM);
}

export function hasAdminEmailNotificationConfig(env: NotificationEnvLike) {
  return hasSmtpNotificationConfig(env) && Boolean(env.ADMIN_NOTIFICATION_EMAIL);
}

export function hasTelegramAdminNotificationConfig(env: NotificationEnvLike) {
  return Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_ADMIN_CHAT_ID);
}

function buildAdminApplicationNotificationLines(input: ApplicationNotificationInput, appUrl: string) {
  const lines = [
    'Новая заявка BARSYNERGY',
    `Тип: ${input.applicationTypeLabel}`,
    `Тема: ${input.subject}`,
    input.userName ? `Имя: ${input.userName}` : null,
    input.userEmail ? `Email: ${input.userEmail}` : null,
    input.cityName ? `Город: ${input.cityName}` : null,
    `Карточка: ${appUrl}/admin/applications/${input.applicationId}`
  ].filter(Boolean);

  return lines;
}

export function buildAdminApplicationTelegramMessage(input: ApplicationNotificationInput, appUrl: string) {
  const lines = buildAdminApplicationNotificationLines(input, appUrl);

  return lines.join('\n');
}

export function buildAdminApplicationEmailText(input: ApplicationNotificationInput, appUrl: string) {
  const lines = buildAdminApplicationNotificationLines(input, appUrl);

  return lines.join('\n');
}
