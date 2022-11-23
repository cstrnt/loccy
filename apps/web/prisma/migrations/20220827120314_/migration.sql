/*
  Warnings:

  - You are about to drop the column `keys` on the `ProjectBranch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectBranch" DROP COLUMN "keys";

-- CreateTable
CREATE TABLE "Key" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "params" JSONB NOT NULL,
    "branchName" TEXT,
    "branchProjectId" TEXT,

    CONSTRAINT "Key_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Key" ADD CONSTRAINT "Key_branchName_branchProjectId_fkey" FOREIGN KEY ("branchName", "branchProjectId") REFERENCES "ProjectBranch"("name", "projectId") ON DELETE SET NULL ON UPDATE CASCADE;
