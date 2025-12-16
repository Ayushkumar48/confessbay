ALTER TABLE "chats" RENAME COLUMN "is_deleted_by_sender" TO "is_deleted";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "is_deleted_by_receiver";