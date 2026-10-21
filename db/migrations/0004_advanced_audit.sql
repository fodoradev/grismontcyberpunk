CREATE TYPE "public"."advanced_audit_status" AS ENUM('in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "advanced_audit_reports" (
	"submission_id" uuid PRIMARY KEY NOT NULL,
	"report_token" text NOT NULL,
	"content_version" text NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "advanced_audit_reports_report_token_unique" UNIQUE("report_token"),
	CONSTRAINT "advanced_audit_report_token_format" CHECK ("advanced_audit_reports"."report_token" ~ '^[A-Za-z0-9_-]{22}$'),
	CONSTRAINT "advanced_audit_report_content_version_nonempty" CHECK (length(trim("advanced_audit_reports"."content_version")) > 0),
	CONSTRAINT "advanced_audit_report_result_object" CHECK (jsonb_typeof("advanced_audit_reports"."result") = 'object')
);
--> statement-breakpoint
CREATE TABLE "advanced_audit_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_token" text NOT NULL,
	"content_version" text NOT NULL,
	"status" "advanced_audit_status" DEFAULT 'in_progress' NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "advanced_audit_submissions_resume_token_unique" UNIQUE("resume_token"),
	CONSTRAINT "advanced_audit_resume_token_format" CHECK ("advanced_audit_submissions"."resume_token" ~ '^[A-Za-z0-9_-]{22}$'),
	CONSTRAINT "advanced_audit_content_version_nonempty" CHECK (length(trim("advanced_audit_submissions"."content_version")) > 0),
	CONSTRAINT "advanced_audit_answers_object" CHECK (jsonb_typeof("advanced_audit_submissions"."answers") = 'object'),
	CONSTRAINT "advanced_audit_submission_completion_state" CHECK (("advanced_audit_submissions"."status" = 'in_progress' AND "advanced_audit_submissions"."completed_at" IS NULL) OR ("advanced_audit_submissions"."status" = 'completed' AND "advanced_audit_submissions"."completed_at" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "advanced_audit_reports" ADD CONSTRAINT "advanced_audit_reports_submission_id_advanced_audit_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."advanced_audit_submissions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE FUNCTION reject_advanced_audit_report_update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
	RAISE EXCEPTION 'advanced audit reports are immutable';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER advanced_audit_reports_immutable BEFORE UPDATE ON "advanced_audit_reports"
FOR EACH ROW EXECUTE FUNCTION reject_advanced_audit_report_update();
