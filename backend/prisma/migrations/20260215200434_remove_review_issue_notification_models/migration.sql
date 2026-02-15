/*
  Warnings:

  - You are about to drop the `Issue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_repoId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_repoId_fkey";

-- DropTable
DROP TABLE "Issue";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Review";

-- DropEnum
DROP TYPE "NotificationType";
