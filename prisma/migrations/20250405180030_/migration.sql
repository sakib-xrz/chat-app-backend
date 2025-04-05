/*
  Warnings:

  - Made the column `last_seen` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "last_seen" SET NOT NULL,
ALTER COLUMN "last_seen" SET DEFAULT CURRENT_TIMESTAMP;
