/*
  Warnings:

  - Added the required column `content` to the `Locale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Locale" ADD COLUMN     "content" JSONB NOT NULL;
