-- Add businessAccountId to Vacancy model
ALTER TABLE "Vacancy" ADD COLUMN IF NOT EXISTS "businessAccountId" TEXT;

-- Add index
CREATE INDEX IF NOT EXISTS "Vacancy_businessAccountId_idx" ON "Vacancy"("businessAccountId");

-- Add foreign key
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_businessAccountId_fkey" 
  FOREIGN KEY ("businessAccountId") REFERENCES "BusinessAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
