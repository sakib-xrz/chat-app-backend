/*
  Warnings:

  - You are about to drop the `chat_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_room_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_rooms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `typing_status` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_room_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_room_users" DROP CONSTRAINT "chat_room_users_room_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_room_users" DROP CONSTRAINT "chat_room_users_user_id_fkey";

-- DropForeignKey
ALTER TABLE "message_status" DROP CONSTRAINT "message_status_message_id_fkey";

-- DropForeignKey
ALTER TABLE "message_status" DROP CONSTRAINT "message_status_user_id_fkey";

-- DropForeignKey
ALTER TABLE "typing_status" DROP CONSTRAINT "typing_status_room_id_fkey";

-- DropForeignKey
ALTER TABLE "typing_status" DROP CONSTRAINT "typing_status_user_id_fkey";

-- DropTable
DROP TABLE "chat_messages";

-- DropTable
DROP TABLE "chat_room_users";

-- DropTable
DROP TABLE "chat_rooms";

-- DropTable
DROP TABLE "message_status";

-- DropTable
DROP TABLE "typing_status";

-- DropEnum
DROP TYPE "ChatType";

-- DropEnum
DROP TYPE "MessageStatusType";

-- DropEnum
DROP TYPE "MessageType";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "threads" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "file_url" TEXT,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread_user" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thread_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "thread_user_thread_id_user_id_key" ON "thread_user"("thread_id", "user_id");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_user" ADD CONSTRAINT "thread_user_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_user" ADD CONSTRAINT "thread_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
