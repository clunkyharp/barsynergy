-- Link supplier catalog entries to business cabinet owners when a trusted source exists.
ALTER TABLE "Supplier" ADD COLUMN "businessAccountId" TEXT;

CREATE INDEX "Supplier_businessAccountId_idx" ON "Supplier"("businessAccountId");

ALTER TABLE "Supplier"
  ADD CONSTRAINT "Supplier_businessAccountId_fkey"
  FOREIGN KEY ("businessAccountId") REFERENCES "BusinessAccount"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
