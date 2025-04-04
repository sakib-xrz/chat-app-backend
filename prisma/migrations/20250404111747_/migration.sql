/*
  Warnings:

  - A unique constraint covering the columns `[room_id,user_id]` on the table `chat_room_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `chat_messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageStatusType" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE');

-- DropForeignKey
ALTER TABLE "chat_room_users" DROP CONSTRAINT "chat_room_users_room_id_fkey";

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "edited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "file_url" TEXT,
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "chat_room_users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_online" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_seen" TIMESTAMP(3),
ADD COLUMN     "socket_id" TEXT;

-- CreateTable
CREATE TABLE "message_status" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "MessageStatusType" NOT NULL DEFAULT 'SENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typing_status" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_typing" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "typing_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_status_message_id_user_id_key" ON "message_status"("message_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "typing_status_room_id_user_id_key" ON "typing_status"("room_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_users_room_id_user_id_key" ON "chat_room_users"("room_id", "user_id");

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_status" ADD CONSTRAINT "message_status_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_status" ADD CONSTRAINT "message_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_users" ADD CONSTRAINT "chat_room_users_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_status" ADD CONSTRAINT "typing_status_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typing_status" ADD CONSTRAINT "typing_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
