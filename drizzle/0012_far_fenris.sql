ALTER TABLE "chats" RENAME COLUMN "is_deleted" TO "is_deleted_by_sender";--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "delivered_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "colleges" ALTER COLUMN "country" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "is_deleted_by_receiver" boolean DEFAULT false NOT NULL;