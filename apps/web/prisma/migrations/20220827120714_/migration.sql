/*
  Warnings:

  - The primary key for the `Key` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Key` table. All the data in the column will be lost.
  - Made the column `branchName` on table `Key` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchProjectId` on table `Key` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Key" DROP CONSTRAINT "Key_branchName_branchProjectId_fkey";

-- AlterTable
ALTER TABLE "Key" DROP CONSTRAINT "Key_pkey",
DROP COLUMN "id",
ALTER COLUMN "branchName" SET NOT NULL,
ALTER COLUMN "branchProjectId" SET NOT NULL,
ADD CONSTRAINT "Key_pkey" PRIMARY KEY ("name", "branchName", "branchProjectId");

-- AddForeignKey
ALTER TABLE "Key" ADD CONSTRAINT "Key_branchName_branchProjectId_fkey" FOREIGN KEY ("branchName", "branchProjectId") REFERENCES "ProjectBranch"("name", "projectId") ON DELETE RESTRICT ON UPDATE CASCADE;
