ALTER TABLE "chats" DROP CONSTRAINT "chats_replied_to_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "message" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "iv" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "auth_tag" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_replied_to_chats_id_fk" FOREIGN KEY ("replied_to") REFERENCES "public"."chats"("id") ON DELETE set null ON UPDATE no action;