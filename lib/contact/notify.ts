import { business } from "../../data/business";
import { deliverEmail } from "../email/send";
import { contactNotifyEmail } from "../email/templates";
import { claimContactNotification, markContactNotification, purgeExpiredContactMessages, unsentContactMessages } from "./store";

/** Forwards a contact message to the owner. Safe to call repeatedly: a sent message is never sent again. */
export async function notifyOwnerOfContact(id: string): Promise<"sent" | "skipped" | "failed"> {
  const row = await claimContactNotification(id);
  if (!row) return "skipped";
  try {
    await deliverEmail({ to: process.env.OWNER_NOTIFY_EMAIL || business.email, replyTo: row.email, ...contactNotifyEmail(row) }, `contact-${row.id}`);
    await markContactNotification(row.id, { ok: true });
    return "sent";
  } catch (err) {
    console.error(`[contact] notification for ${row.id} failed`, err);
    await markContactNotification(row.id, { ok: false, error: String(err) });
    return "failed";
  }
}

/** Daily job: retry failed notifications and apply retention. */
export async function runContactDaily() {
  let retried = 0;
  for (const { id } of await unsentContactMessages()) if (await notifyOwnerOfContact(id) === "sent") retried++;
  return { contactRetried: retried, contactPurged: await purgeExpiredContactMessages() };
}
