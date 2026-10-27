"use server";

import { after } from "next/server";
import { getLocale } from "../i18n-server";
import { ipHash } from "../request";
import { notifyOwnerOfContact } from "./notify";
import { ContactRateLimitedError, saveContactMessage } from "./store";
import { getContactSchema } from "./validation";

export type ContactState = { ok?: boolean; errors?: Record<string, string>; message?: string; values?: Record<string, string> };

export async function sendContactMessage(_: ContactState, formData: FormData): Promise<ContactState> {
  const locale = await getLocale();
  const hu = locale === "hu";
  const raw = Object.fromEntries([...formData].filter(([k, v]) => !k.startsWith("$") && typeof v === "string")) as Record<string, string>;
  const parsed = getContactSchema(locale).safeParse({ ...raw, interest: raw.interest || undefined });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    // Honeypot hit: give a bot nothing useful.
    if (errors.website) return { message: hu ? "Valami nem sikerült. Kérlek, próbáld újra." : "Something went wrong. Please try again." };
    return { errors, values: raw };
  }
  let id: string;
  try {
    id = await saveContactMessage(parsed.data, await ipHash(), locale);
  } catch (err) {
    if (err instanceof ContactRateLimitedError) return { message: hu ? "Erről a hálózatról túl sok üzenet érkezett. Kérlek, próbáld újra egy óra múlva, vagy írj e-mailt." : "Too many messages from your network. Please try again in an hour, or send an email.", values: raw };
    console.error("[contact] save failed", err);
    return { message: hu ? "Most nem sikerült elküldeni az üzenetet. Kérlek, próbáld újra, vagy írj e-mailt." : "Your message couldn't be sent just now. Please try again, or send an email.", values: raw };
  }
  // The owner email goes out after the response; the daily job retries it if this fails.
  after(() => notifyOwnerOfContact(id));
  return { ok: true };
}
