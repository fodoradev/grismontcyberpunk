CREATE TYPE "public"."email_kind" AS ENUM('report', 'reminder', 'owner_notify');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('in_progress', 'superseded', 'completed');--> statement-breakpoint
CREATE TABLE "email_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"kind" "email_kind" NOT NULL,
	"status" "email_status" DEFAULT 'pending' NOT NULL,
	"provider_id" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_log_once" UNIQUE("submission_id","kind")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"submission_id" uuid PRIMARY KEY NOT NULL,
	"report_token" text NOT NULL,
	"content_version" text NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reports_report_token_unique" UNIQUE("report_token")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_token" text NOT NULL,
	"status" "submission_status" DEFAULT 'in_progress' NOT NULL,
	"first_name" text NOT NULL,
	"email" text NOT NULL,
	"company_size" text NOT NULL,
	"industry" text NOT NULL,
	"company_name" text,
	"role" text,
	"consent_at" timestamp with time zone NOT NULL,
	"ip_hash" text,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"current_step" integer DEFAULT 0 NOT NULL,
	"reminder_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "submissions_resume_token_unique" UNIQUE("resume_token")
);
--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;