CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"interest" text,
	"locale" text DEFAULT 'en' NOT NULL,
	"consent_at" timestamp with time zone NOT NULL,
	"ip_hash" text,
	"notify_status" "email_status" DEFAULT 'pending' NOT NULL,
	"notify_attempts" integer DEFAULT 0 NOT NULL,
	"notify_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
