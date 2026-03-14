/*
  Warnings:

  - You are about to drop the column `cvUrl` on the `CandidateProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CandidateProfile" DROP COLUMN "cvUrl",
ADD COLUMN     "cvPath" TEXT;
