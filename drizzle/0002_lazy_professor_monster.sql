DROP INDEX "idx_conversation_updated";--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "last_message_id" text;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_last_message_id_chats_id_fk" FOREIGN KEY ("last_message_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "last_message";--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "last_message_at";