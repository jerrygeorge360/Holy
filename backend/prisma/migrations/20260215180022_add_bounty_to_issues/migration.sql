-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "bountyAmount" TEXT,
ADD COLUMN     "prNumber" INTEGER;

-- CreateIndex
CREATE INDEX "Issue_prNumber_idx" ON "Issue"("prNumber");
