-- Add optional external registration link for public event CTAs.
ALTER TABLE "Event" ADD COLUMN "registrationUrl" TEXT;
