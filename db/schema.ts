import { integer, jsonb, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import type { Answers, ReportModel } from "../lib/scorecard/types";
import type { Locale } from "../lib/i18n";

export const submissionStatus = pgEnum("submission_status", ["in_progress", "superseded", "completed"]);
export const emailKind = pgEnum("email_kind", ["report", "reminder", "reminder_1", "reminder_3", "reminder_5", "owner_notify"]);
export const emailStatus = pgEnum("email_status", ["pending", "sent", "failed"]);

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  resumeToken: text("resume_token").notNull().unique(),
  status: submissionStatus("status").notNull().default("in_progress"),
  firstName: text("first_name").notNull(),
  email: text("email").notNull(),
  locale: text("locale").$type<Locale>().notNull().default("en"),
  companySize: text("company_size").notNull(),
  industry: text("industry").notNull(),
  companyName: text("company_name"),
  role: text("role"),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  ipHash: text("ip_hash"),
  answers: jsonb("answers").$type<Answers>().notNull().default({}),
  reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const reports = pgTable("reports", {
  submissionId: uuid("submission_id").primaryKey().references(() => submissions.id, { onDelete: "cascade" }),
  reportToken: text("report_token").notNull().unique(),
  contentVersion: text("content_version").notNull(),
  result: jsonb("result").$type<ReportModel>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const emailLog = pgTable("email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  kind: emailKind("kind").notNull(),
  status: emailStatus("status").notNull().default("pending"),
  providerId: text("provider_id"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [unique("email_log_once").on(t.submissionId, t.kind)]);

export type Submission = typeof submissions.$inferSelect;
