CREATE TYPE "public"."auth_provider_type_enum" AS ENUM('google');--> statement-breakpoint
CREATE TYPE "public"."chat_message_type_enum" AS ENUM('text', 'image', 'file', 'video', 'audio');--> statement-breakpoint
CREATE TYPE "public"."confession_category_enum" AS ENUM('Crush', 'Love Story', 'Heartbreak', 'Situationship', 'Funny Incident', 'Embarrassing Moment', 'College Gossip', 'Classroom Drama', 'Hostel Life', 'Events and Fests', 'Canteen Chronicles', 'Campus Crush', 'Friendship Issues', 'Mental Health', 'Loneliness', 'Academic Stress', 'College Issues', 'Opinion', 'Advice', 'Secret', 'Apology', 'Personal Growth', 'Spicy Confession', 'Other');--> statement-breakpoint
CREATE TYPE "public"."friendship_status_enum" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."gender_enum" AS ENUM('Male', 'Female', 'Others', 'Prefer not to say');--> statement-breakpoint
CREATE TYPE "public"."notification_type_enum" AS ENUM('Like', 'Reply', 'Friend Request', 'Report');--> statement-breakpoint
CREATE TYPE "public"."report_status_enum" AS ENUM('Pending', 'Reviewed', 'Removed');--> statement-breakpoint
CREATE TYPE "public"."visibility_enum" AS ENUM('College', 'Friends', 'Public');--> statement-breakpoint
CREATE TYPE "public"."zodiac_sign_enum" AS ENUM('Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces');--> statement-breakpoint
CREATE TABLE "blocked_users" (
	"id" text PRIMARY KEY NOT NULL,
	"blocked_by" text NOT NULL,
	"blocked_user" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"conversation_id" text NOT NULL,
	"message" text NOT NULL,
	"iv" text NOT NULL,
	"auth_tag" text NOT NULL,
	"chat_message_type" "chat_message_type_enum" DEFAULT 'text' NOT NULL,
	"media_url" text,
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "college_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"verification_code" text,
	"verified" boolean DEFAULT false,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "colleges" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"city" text,
	"state" text,
	CONSTRAINT "colleges_name_unique" UNIQUE("name"),
	CONSTRAINT "colleges_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "confession_pictures" (
	"id" text PRIMARY KEY NOT NULL,
	"confession_id" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "confessions" (
	"id" text PRIMARY KEY NOT NULL,
	"confessed_from" text NOT NULL,
	"confessed_to" text,
	"message" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"is_anonymous" boolean DEFAULT false,
	"category" "confession_category_enum" DEFAULT 'Other' NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"visibility" "visibility_enum" DEFAULT 'Public' NOT NULL,
	"replies_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id1" text NOT NULL,
	"user_id2" text NOT NULL,
	"last_message" text,
	"last_message_at" timestamp with time zone,
	"unread_count_user1" integer DEFAULT 0 NOT NULL,
	"unread_count_user2" integer DEFAULT 0 NOT NULL,
	"is_archived_user1" boolean DEFAULT false NOT NULL,
	"is_archived_user2" boolean DEFAULT false NOT NULL,
	"is_muted_user1" boolean DEFAULT false NOT NULL,
	"is_muted_user2" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "conversation_id_order" CHECK (user_id1 < user_id2)
);
--> statement-breakpoint
CREATE TABLE "followers" (
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "followers_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE "friends" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id1" text NOT NULL,
	"user_id2" text NOT NULL,
	"requested_by" text,
	"status" "friendship_status_enum" DEFAULT 'pending' NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_id_order" CHECK (user_id1 < user_id2)
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"confession_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type_enum" NOT NULL,
	"entity_id" text,
	"message" text,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "replies" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"confession_id" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"reported_by" text NOT NULL,
	"confession_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" "report_status_enum" DEFAULT 'Pending',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text,
	"gender" "gender_enum" NOT NULL,
	"auth_provider" "auth_provider_type_enum",
	"auth_provider_id" text,
	"date_of_birth" date,
	"avatar" text NOT NULL,
	"college_id" text,
	"college_email" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"zodiac_sign" "zodiac_sign_enum",
	"open_to_relationships" boolean DEFAULT false,
	"total_confessions" integer DEFAULT 0 NOT NULL,
	"city" text,
	"bio" text,
	"anonymous" boolean DEFAULT false NOT NULL,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "user_auth_provider_id_unique" UNIQUE("auth_provider_id"),
	CONSTRAINT "user_college_email_unique" UNIQUE("college_email"),
	CONSTRAINT "password_or_auth_provider" CHECK (auth_provider IS NOT NULL OR password IS NOT NULL)
);
--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocked_by_user_id_fk" FOREIGN KEY ("blocked_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocked_user_user_id_fk" FOREIGN KEY ("blocked_user") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "college_verification" ADD CONSTRAINT "college_verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "confession_pictures" ADD CONSTRAINT "confession_pictures_confession_id_confessions_id_fk" FOREIGN KEY ("confession_id") REFERENCES "public"."confessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "confessions" ADD CONSTRAINT "confessions_confessed_from_user_id_fk" FOREIGN KEY ("confessed_from") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "confessions" ADD CONSTRAINT "confessions_confessed_to_user_id_fk" FOREIGN KEY ("confessed_to") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id1_user_id_fk" FOREIGN KEY ("user_id1") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id2_user_id_fk" FOREIGN KEY ("user_id2") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_following_id_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id1_user_id_fk" FOREIGN KEY ("user_id1") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_user_id2_user_id_fk" FOREIGN KEY ("user_id2") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friends" ADD CONSTRAINT "friends_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_confession_id_confessions_id_fk" FOREIGN KEY ("confession_id") REFERENCES "public"."confessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replies" ADD CONSTRAINT "replies_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replies" ADD CONSTRAINT "replies_confession_id_confessions_id_fk" FOREIGN KEY ("confession_id") REFERENCES "public"."confessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_by_user_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_confession_id_confessions_id_fk" FOREIGN KEY ("confession_id") REFERENCES "public"."confessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chats_conversation" ON "chats" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_chats_sender" ON "chats" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_chats_receiver" ON "chats" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "idx_chats_created_at" ON "chats" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_chats_readat" ON "chats" USING btree ("read_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_conversation_pair" ON "conversations" USING btree ("user_id1","user_id2");--> statement-breakpoint
CREATE INDEX "idx_conversation_updated" ON "conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_friendship" ON "friends" USING btree ("user_id1","user_id2");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_like" ON "likes" USING btree ("user_id","confession_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_report" ON "reports" USING btree ("reported_by","confession_id");

-- Function: increment on INSERT
CREATE OR REPLACE FUNCTION increment_confession_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "user"
  SET total_confessions = total_confessions + 1
  WHERE id = NEW.confessed_from;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: decrement on DELETE
CREATE OR REPLACE FUNCTION decrement_confession_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "user"
  SET total_confessions = total_confessions - 1
  WHERE id = OLD.confessed_from;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for INSERT
CREATE TRIGGER confession_insert_trigger
AFTER INSERT ON confessions
FOR EACH ROW
EXECUTE FUNCTION increment_confession_count();

-- Trigger for DELETE
CREATE TRIGGER confession_delete_trigger
AFTER DELETE ON confessions
FOR EACH ROW
EXECUTE FUNCTION decrement_confession_count();
