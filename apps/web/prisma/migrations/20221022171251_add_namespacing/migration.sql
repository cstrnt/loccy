/*
  Warnings:

  - The primary key for the `LocaleKey` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Translation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `namespace` on table `LocaleKey` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `namespace` to the `Translation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LocaleKey" DROP CONSTRAINT "LocaleKey_pkey",
ALTER COLUMN "namespace" SET NOT NULL,
ADD CONSTRAINT "LocaleKey_pkey" PRIMARY KEY ("name", "branchName", "branchProjectId", "namespace");

-- AlterTable
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_pkey",
ADD COLUMN     "namespace" TEXT NOT NULL,
ADD CONSTRAINT "Translation_pkey" PRIMARY KEY ("key", "localeName", "branchId", "namespace");
