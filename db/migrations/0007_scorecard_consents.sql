ALTER TYPE "public"."email_kind" ADD VALUE 'followup_2';--> statement-breakpoint
ALTER TYPE "public"."email_kind" ADD VALUE 'followup_5';--> statement-breakpoint
ALTER TYPE "public"."email_kind" ADD VALUE 'followup_9';--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "company_size" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "industry" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "reminder_consent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "follow_up_consent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "unsubscribed_at" timestamp with time zone;--> statement-breakpoint
-- Earlier sign-ups agreed to reminders as part of the single intake consent.
UPDATE "submissions" SET "reminder_consent_at" = "consent_at" WHERE "reminder_consent_at" IS NULL;
