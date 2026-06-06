export type ProcessQueueOptions<TRecord extends { id: string; attempts: number; nextAttemptAt: Date }> = {
  findPending: (now: Date, limit: number) => Promise<TRecord[]>;
  send: (record: TRecord) => Promise<void>;
  onSuccess: (record: TRecord, attempts: number) => Promise<void>;
  onFailure: (record: TRecord, attempts: number, error: unknown, now: Date) => Promise<void>;
  maxAttempts?: number;
  retryBaseDelayMs?: number;
  retryMaxDelayMs?: number;
  limit?: number;
  logger?: Pick<Console, 'error'>;
};

export function getNextAttemptAt(attempts: number, now: Date, retryBaseDelayMs: number, retryMaxDelayMs: number) {
  const delay = Math.min(retryBaseDelayMs * 2 ** Math.max(0, attempts - 1), retryMaxDelayMs);
  return new Date(now.getTime() + delay);
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 1000);
  return String(error).slice(0, 1000);
}

export async function processNotificationQueue<TRecord extends { id: string; attempts: number; nextAttemptAt: Date }>(
  options: ProcessQueueOptions<TRecord>
): Promise<number> {
  const now = new Date();
  const maxAttempts = options.maxAttempts ?? 5;
  const limit = options.limit ?? 20;
  const logger = options.logger ?? console;

  const records = await options.findPending(now, limit);

  for (const record of records) {
    const attempts = record.attempts + 1;

    try {
      await options.send(record);
      await options.onSuccess(record, attempts);
    } catch (error) {
      const finalFailure = attempts >= maxAttempts;
      logger.error('Notification attempt failed.', error);
      await options.onFailure(record, attempts, error, now);

      if (finalFailure) {
        logger.error('Notification max attempts reached for record.', record.id);
      }
    }
  }

  return records.length;
}
