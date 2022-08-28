/*
  Warnings:

  - Changed the type of `keys` on the `ProjectBranch` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ProjectBranch" DROP COLUMN "keys",
ADD COLUMN     "keys" JSONB NOT NULL;
