-- Track email dispatch separately from web-push so both channels can process the same outbox record.
ALTER TABLE "ContentNotificationOutbox" ADD COLUMN "emailSentAt" TIMESTAMP(3);
