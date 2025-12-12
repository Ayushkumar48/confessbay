ALTER TABLE "chats" DROP CONSTRAINT "chats_receiver_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "idx_chats_receiver";--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "receiver_id";