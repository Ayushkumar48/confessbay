ALTER TABLE "colleges" ADD COLUMN "country" text;--> statement-breakpoint
CREATE INDEX "idx_college_domain" ON "colleges" USING btree ("domain");
