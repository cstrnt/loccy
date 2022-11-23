-- AlterTable
ALTER TABLE "LocaleKey" ALTER COLUMN "namespace" SET DEFAULT 'common';

-- AlterTable
ALTER TABLE "Translation" ALTER COLUMN "namespace" SET DEFAULT 'common';

UPDATE "LocaleKey" SET "namespace" = 'common' WHERE "namespace" IS NULL;
UPDATE "Translation" SET "namespace" = 'common' WHERE "namespace" IS NULL;