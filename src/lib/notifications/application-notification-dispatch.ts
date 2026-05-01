export type ApplicationNotificationInput = {
  applicationId: string;
  applicationTypeLabel: string;
  subject: string;
  cityName?: string;
  userName?: string;
  userEmail?: string;
};

type ApplicationNotificationDispatchDeps = {
  logger?: Pick<Console, 'error'>;
  notify: (input: ApplicationNotificationInput) => Promise<void>;
};

export function dispatchApplicationCreatedNotification(
  input: ApplicationNotificationInput,
  deps: ApplicationNotificationDispatchDeps
) {
  const logger = deps.logger ?? console;

  void deps.notify(input).catch((error: unknown) => {
    logger.error('Application notification dispatch failed.', error);
  });
}
