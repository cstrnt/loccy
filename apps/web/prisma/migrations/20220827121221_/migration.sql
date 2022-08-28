/*
  Warnings:

  - You are about to drop the `Key` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Key" DROP CONSTRAINT "Key_branchName_branchProjectId_fkey";

-- DropTable
DROP TABLE "Key";

-- CreateTable
CREATE TABLE "LocaleKey" (
    "name" TEXT NOT NULL,
    "description" TEXT,
    "params" JSONB NOT NULL,
    "branchName" TEXT NOT NULL,
    "branchProjectId" TEXT NOT NULL,

    CONSTRAINT "LocaleKey_pkey" PRIMARY KEY ("name","branchName","branchProjectId")
);

-- AddForeignKey
ALTER TABLE "LocaleKey" ADD CONSTRAINT "LocaleKey_branchName_branchProjectId_fkey" FOREIGN KEY ("branchName", "branchProjectId") REFERENCES "ProjectBranch"("name", "projectId") ON DELETE RESTRICT ON UPDATE CASCADE;
