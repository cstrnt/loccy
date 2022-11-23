/*
  Warnings:

  - Added the required column `index` to the `LocaleKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LocaleKey" ADD COLUMN     "index" INTEGER NOT NULL;
