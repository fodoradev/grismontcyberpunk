import { check, integer, jsonb, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { Answers, ReportModel } from "../lib/scorecard/types";
import type { AdvancedAuditAnswers, AdvancedAuditReport } from "../lib/advanced-audit/types";
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

export const advancedAuditStatus = pgEnum("advanced_audit_status", ["in_progress", "completed"]);

export const advancedAuditSubmissions = pgTable("advanced_audit_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  resumeToken: text("resume_token").notNull().unique(),
  contentVersion: text("content_version").notNull(),
  email: text("email"),
  locale: text("locale").$type<Locale>().notNull().default("en"),
  emailConsentAt: timestamp("email_consent_at", { withTimezone: true }),
  status: advancedAuditStatus("status").notNull().default("in_progress"),
  answers: jsonb("answers").$type<AdvancedAuditAnswers>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, t => [
  check("advanced_audit_resume_token_format", sql`${t.resumeToken} ~ '^[A-Za-z0-9_-]{22}$'`),
  check("advanced_audit_content_version_nonempty", sql`length(trim(${t.contentVersion})) > 0`),
  check("advanced_audit_answers_object", sql`jsonb_typeof(${t.answers}) = 'object'`),
  check("advanced_audit_submission_completion_state", sql`(${t.status} = 'in_progress' AND ${t.completedAt} IS NULL) OR (${t.status} = 'completed' AND ${t.completedAt} IS NOT NULL)`),
  check("advanced_audit_email_consent_pair", sql`(${t.email} IS NULL AND ${t.emailConsentAt} IS NULL) OR (${t.email} IS NOT NULL AND ${t.emailConsentAt} IS NOT NULL)`),
]);

export const advancedAuditReports = pgTable("advanced_audit_reports", {
  submissionId: uuid("submission_id").primaryKey().references(() => advancedAuditSubmissions.id, { onDelete: "cascade" }),
  reportToken: text("report_token").notNull().unique(),
  contentVersion: text("content_version").notNull(),
  result: jsonb("result").$type<AdvancedAuditReport>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [
  check("advanced_audit_report_token_format", sql`${t.reportToken} ~ '^[A-Za-z0-9_-]{22}$'`),
  check("advanced_audit_report_content_version_nonempty", sql`length(trim(${t.contentVersion})) > 0`),
  check("advanced_audit_report_result_object", sql`jsonb_typeof(${t.result}) = 'object'`),
]);

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

export const advancedAuditEmailLog = pgTable("advanced_audit_email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").notNull().references(() => advancedAuditSubmissions.id, { onDelete: "cascade" }),
  status: emailStatus("status").notNull().default("pending"),
  providerId: text("provider_id"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, t => [unique("advanced_audit_email_log_once").on(t.submissionId)]);

export type Submission = typeof submissions.$inferSelect;
