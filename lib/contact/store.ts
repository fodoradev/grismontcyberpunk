import { and, eq, gt, lt, sql } from "drizzle-orm";
import { getDb, schema } from "../../db";
import { MAX_ATTEMPTS } from "../email/send";
import type { Locale } from "../i18n";
import type { ContactInput } from "./validation";

const { contactMessages } = schema;
const messagesPerIpPerHour = () => Number(process.env.CONTACT_MESSAGES_PER_HOUR) || 5;
export class ContactRateLimitedError extends Error {}

export async function saveContactMessage(input: ContactInput, ipHash: string | null, locale: Locale): Promise<string> {
  const db = getDb();
  if (ipHash) {
    const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(contactMessages)
      .where(and(eq(contactMessages.ipHash, ipHash), gt(contactMessages.createdAt, sql`now() - interval '1 hour'`)));
    if (n >= messagesPerIpPerHour()) throw new ContactRateLimitedError();
  }
  const [row] = await db.insert(contactMessages).values({
    name: input.name, email: input.email, message: input.message, interest: input.interest ?? null, locale, consentAt: new Date(), ipHash,
  }).returning({ id: contactMessages.id });
  return row.id;
}

/** Claims a message for notification (same rules as sendOnce): unsent, under the attempt limit, not in flight. */
export async function claimContactNotification(id: string) {
  const [row] = await getDb().update(contactMessages)
    .set({ notifyAttempts: sql`${contactMessages.notifyAttempts} + 1`, notifyStatus: "pending", updatedAt: new Date() })
    .where(and(
      eq(contactMessages.id, id),
      sql`${contactMessages.notifyStatus} <> 'sent' and ${contactMessages.notifyAttempts} < ${MAX_ATTEMPTS}`,
      sql`(${contactMessages.notifyStatus} = 'failed' or ${contactMessages.notifyAttempts} = 0 or ${contactMessages.updatedAt} < now() - interval '10 minutes')`,
    ))
    .returning();
  return row;
}

export async function markContactNotification(id: string, result: { ok: true } | { ok: false; error: string }) {
  await getDb().update(contactMessages)
    .set(result.ok ? { notifyStatus: "sent", notifyError: null, updatedAt: new Date() } : { notifyStatus: "failed", notifyError: result.error.slice(0, 500), updatedAt: new Date() })
    .where(eq(contactMessages.id, id));
}

export async function unsentContactMessages() {
  return getDb().select({ id: contactMessages.id }).from(contactMessages)
    .where(and(sql`${contactMessages.notifyStatus} <> 'sent'`, lt(contactMessages.notifyAttempts, MAX_ATTEMPTS)));
}

/** Retention: contact messages are deleted 12 months after they arrive. */
export async function purgeExpiredContactMessages(): Promise<number> {
  const deleted = await getDb().delete(contactMessages).where(lt(contactMessages.createdAt, sql`now() - interval '12 months'`)).returning({ id: contactMessages.id });
  return deleted.length;
}
