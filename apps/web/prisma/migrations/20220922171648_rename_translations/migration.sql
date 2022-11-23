/*
  Warnings:

  - You are about to drop the column `content` on the `Locale` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Locale" DROP COLUMN "content";

-- CreateTable
CREATE TABLE "Translation" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "localeName" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("key","localeName","branchId")
);

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_branchName_projectId_fkey" FOREIGN KEY ("branchName", "projectId") REFERENCES "ProjectBranch"("name", "projectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Translation" ADD CONSTRAINT "Translation_localeName_branchId_fkey" FOREIGN KEY ("localeName", "branchId") REFERENCES "Locale"("name", "branchId") ON DELETE RESTRICT ON UPDATE CASCADE;
