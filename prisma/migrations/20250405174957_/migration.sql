/*
  Warnings:

  - You are about to drop the column `deleted` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `edited` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "deleted",
DROP COLUMN "edited";
