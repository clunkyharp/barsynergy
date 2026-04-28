import assert from 'node:assert/strict';
import test from 'node:test';

const {
  buildAdminApplicationTelegramMessage,
  hasSmtpNotificationConfig,
  hasTelegramAdminNotificationConfig
} = await import('../src/lib/notifications/application-notification-format.ts');

test('notification config helpers detect configured transports', () => {
  assert.equal(
    hasSmtpNotificationConfig({
      SMTP_HOST: 'smtp.example.test',
      SMTP_PORT: 587,
      SMTP_FROM: 'hello@example.test'
    }),
    true
  );
  assert.equal(
    hasSmtpNotificationConfig({
      SMTP_HOST: 'smtp.example.test',
      SMTP_PORT: undefined,
      SMTP_FROM: 'hello@example.test'
    }),
    false
  );

  assert.equal(
    hasTelegramAdminNotificationConfig({
      TELEGRAM_BOT_TOKEN: 'token',
      TELEGRAM_ADMIN_CHAT_ID: 'chat'
    }),
    true
  );
  assert.equal(
    hasTelegramAdminNotificationConfig({
      TELEGRAM_BOT_TOKEN: 'token',
      TELEGRAM_ADMIN_CHAT_ID: undefined
    }),
    false
  );
});

test('admin telegram message contains only summary fields and admin link', () => {
  const message = buildAdminApplicationTelegramMessage(
    {
      applicationId: 'app-1',
      applicationTypeLabel: 'Отклик на вакансию',
      subject: 'Отклик: Старший бармен',
      cityName: 'Пятигорск'
    },
    'https://barsynergy.example'
  );

  assert.match(message, /Отклик на вакансию/);
  assert.match(message, /Отклик: Старший бармен/);
  assert.match(message, /Пятигорск/);
  assert.match(message, /\/admin\/applications\/app-1/);
  assert.doesNotMatch(message, /@/);
});
