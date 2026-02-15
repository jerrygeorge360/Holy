/*
  Warnings:

  - You are about to drop the column `bountyAmount` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `prNumber` on the `Issue` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Issue_prNumber_idx";

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "bountyAmount",
DROP COLUMN "prNumber";

-- CreateTable
CREATE TABLE "Bounty" (
    "id" UUID NOT NULL,
    "repoId" UUID NOT NULL,
    "issueNumber" INTEGER,
    "prNumber" INTEGER,
    "amount" TEXT NOT NULL,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bounty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bounty_repoId_idx" ON "Bounty"("repoId");

-- CreateIndex
CREATE INDEX "Bounty_prNumber_idx" ON "Bounty"("prNumber");

-- CreateIndex
CREATE INDEX "Bounty_issueNumber_idx" ON "Bounty"("issueNumber");

-- AddForeignKey
ALTER TABLE "Bounty" ADD CONSTRAINT "Bounty_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
