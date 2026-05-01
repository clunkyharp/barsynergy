import assert from 'node:assert/strict';
import test from 'node:test';

const { dispatchApplicationCreatedNotification } = await import('../src/lib/notifications/application-notification-dispatch.ts');
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

test('dispatchApplicationCreatedNotification does not block caller and logs unexpected setup failures', async () => {
  const input = {
    applicationId: 'app-2',
    applicationTypeLabel: 'Отклик',
    subject: 'Отклик: Бармен'
  };

  let notifyStarted = false;
  let resolveNotify;
  const silentLoggerCalls = [];

  dispatchApplicationCreatedNotification(input, {
    notify: () => {
      notifyStarted = true;

      return new Promise((resolve) => {
        resolveNotify = resolve;
      });
    },
    logger: {
      error: (...args) => silentLoggerCalls.push(args)
    }
  });

  assert.equal(notifyStarted, true);
  assert.equal(silentLoggerCalls.length, 0);

  resolveNotify();
  await Promise.resolve();

  const loggedErrors = [];
  dispatchApplicationCreatedNotification(input, {
    notify: async () => {
      throw new Error('boom');
    },
    logger: {
      error: (...args) => loggedErrors.push(args)
    }
  });

  await Promise.resolve();
  await Promise.resolve();

  assert.equal(loggedErrors.length, 1);
  assert.equal(loggedErrors[0][0], 'Application notification dispatch failed.');
  assert.match(String(loggedErrors[0][1]), /boom/);
});
