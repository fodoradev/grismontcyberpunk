import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { and, eq, sql } from "drizzle-orm";
import { getDb, schema } from "../../db";

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
  attachments?: { filename: string; content: Buffer }[];
};

/** Sends through Resend. Without RESEND_API_KEY (local dev) the email is written to .outbox/ instead. */
export async function deliverEmail(email: Email, idempotencyKey: string): Promise<string> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production" && !process.env.EMAIL_OUTBOX_DIR) throw new Error("RESEND_API_KEY is not set");
    const dir = process.env.EMAIL_OUTBOX_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), ".outbox");
    const base = path.join(dir, idempotencyKey.replace(/[^a-z0-9-]/gi, "_"));
    await mkdir(dir, { recursive: true });
    await writeFile(`${base}.html`, `<!-- to: ${email.to} | subject: ${email.subject} -->\n${email.html}`);
    for (const a of email.attachments ?? []) await writeFile(`${base}-${a.filename}`, a.content);
    return `outbox:${idempotencyKey}`;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Grismont <hello@grismont.hu>",
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      ...(email.headers ? { headers: email.headers } : {}),
      attachments: email.attachments?.map(a => ({ filename: a.filename, content: a.content.toString("base64") })),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return ((await res.json()) as { id: string }).id;
}

type Kind = (typeof schema.emailKind.enumValues)[number];
export const MAX_ATTEMPTS = 3;

/**
 * Sends an email of `kind` for a submission at most once. The email_log row is claimed atomically, so concurrent
 * calls (submit + cron retry) can't both send; failures stay retryable until MAX_ATTEMPTS.
 */
export async function sendOnce(submissionId: string, kind: Kind, build: () => Promise<Email>): Promise<"sent" | "skipped" | "failed"> {
  const db = getDb();
  const { emailLog } = schema;
  await db.insert(emailLog).values({ submissionId, kind }).onConflictDoNothing();
  const [claimed] = await db.update(emailLog)
    .set({ attempts: sql`${emailLog.attempts} + 1`, status: "pending", updatedAt: new Date() })
    .where(and(
      eq(emailLog.submissionId, submissionId), eq(emailLog.kind, kind),
      sql`${emailLog.status} <> 'sent' and ${emailLog.attempts} < ${MAX_ATTEMPTS}`,
      // A pending row with attempts > 0 is in flight unless it has been stuck for 10 minutes.
      sql`(${emailLog.status} = 'failed' or ${emailLog.attempts} = 0 or ${emailLog.updatedAt} < now() - interval '10 minutes')`,
    ))
    .returning();
  if (!claimed) return "skipped";
  try {
    const providerId = await deliverEmail(await build(), `${kind}-${submissionId}`);
    await db.update(emailLog).set({ status: "sent", providerId, lastError: null, updatedAt: new Date() }).where(eq(emailLog.id, claimed.id));
    return "sent";
  } catch (err) {
    console.error(`[email] ${kind} for ${submissionId} failed`, err);
    await db.update(emailLog).set({ status: "failed", lastError: String(err).slice(0, 500), updatedAt: new Date() }).where(eq(emailLog.id, claimed.id));
    return "failed";
  }
}
