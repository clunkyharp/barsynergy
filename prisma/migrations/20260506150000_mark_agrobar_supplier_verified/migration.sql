UPDATE "Supplier"
SET
    "isVerified" = true,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'agrobar-gelabo';
