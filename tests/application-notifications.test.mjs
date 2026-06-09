import assert from 'node:assert/strict';
import test from 'node:test';

const { dispatchApplicationCreatedNotification } = await import('../src/lib/notifications/application-notification-dispatch.ts');
const {
  buildAdminApplicationTelegramMessage,
  hasSmtpNotificationConfig,
  hasTelegramAdminNotificationConfig
} = await import('../src/lib/notifications/application-notification-format.ts');
const { buildApplicationNotificationJobs } = await import('../src/lib/notifications/application-notification-outbox.ts');

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
      cityName: 'Махачкала'
    },
    'https://barsynergy.example'
  );

  assert.match(message, /Отклик на вакансию/);
  assert.match(message, /Отклик: Старший бармен/);
  assert.match(message, /\/admin\/applications\/app-1/);
  assert.doesNotMatch(message, /Махачкала/);
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

test('application notification outbox creates only configured channel jobs', () => {
  const input = {
    applicationId: 'app-3',
    applicationTypeLabel: 'Заявка',
    subject: 'Новая заявка',
    userEmail: 'user@example.test'
  };

  const jobs = buildApplicationNotificationJobs(input, {
    SMTP_HOST: 'smtp.example.test',
    SMTP_PORT: 587,
    SMTP_FROM: 'hello@example.test',
    ADMIN_NOTIFICATION_EMAIL: 'admin@example.test',
    TELEGRAM_BOT_TOKEN: 'token',
    TELEGRAM_ADMIN_CHAT_ID: 'chat'
  });

  assert.deepEqual(
    jobs.map((job) => job.channel).sort(),
    ['ADMIN_EMAIL', 'ADMIN_TELEGRAM', 'USER_EMAIL'].sort()
  );

  assert.deepEqual(
    buildApplicationNotificationJobs({ ...input, userEmail: undefined }, {
      SMTP_HOST: 'smtp.example.test',
      SMTP_PORT: 587,
      SMTP_FROM: 'hello@example.test',
      ADMIN_NOTIFICATION_EMAIL: undefined,
      TELEGRAM_BOT_TOKEN: undefined,
      TELEGRAM_ADMIN_CHAT_ID: undefined
    }),
    []
  );
});
