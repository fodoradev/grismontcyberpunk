CREATE TABLE "advanced_audit_email_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"status" "email_status" DEFAULT 'pending' NOT NULL,
	"provider_id" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "advanced_audit_email_log_once" UNIQUE("submission_id")
);
--> statement-breakpoint
ALTER TABLE "advanced_audit_submissions" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "advanced_audit_submissions" ADD COLUMN "locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "advanced_audit_submissions" ADD COLUMN "email_consent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "advanced_audit_email_log" ADD CONSTRAINT "advanced_audit_email_log_submission_id_advanced_audit_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."advanced_audit_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advanced_audit_submissions" ADD CONSTRAINT "advanced_audit_email_consent_pair" CHECK (("advanced_audit_submissions"."email" IS NULL AND "advanced_audit_submissions"."email_consent_at" IS NULL) OR ("advanced_audit_submissions"."email" IS NOT NULL AND "advanced_audit_submissions"."email_consent_at" IS NOT NULL));