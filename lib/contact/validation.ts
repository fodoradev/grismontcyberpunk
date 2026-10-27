import { z } from "zod";
import { CONTACT_INTERESTS } from "../../db/schema";
import type { Locale } from "../i18n";

export function getContactSchema(locale: Locale) {
  const hu = locale === "hu";
  return z.object({
    name: z.string().trim().min(1, hu ? "Kérlek, add meg a neved." : "Please tell me your name.").max(100, hu ? "A név legfeljebb 100 karakter lehet." : "Please keep your name under 100 characters."),
    email: z.string().trim().toLowerCase().max(254).pipe(z.email(hu ? "Kérlek, adj meg egy érvényes e-mail-címet." : "Please enter a valid email address.")),
    message: z.string().transform(v => v.replace(/\u0000/g, "")).pipe(z.string().trim().min(1, hu ? "Írd meg röviden, mi tart túl sokáig." : "Tell me briefly what takes too long.").max(3000, hu ? "Az üzenet legfeljebb 3000 karakter lehet." : "Please keep the message under 3,000 characters.")),
    interest: z.enum(CONTACT_INTERESTS).optional(),
    consent: z.literal("on", hu ? "Kérlek, erősítsd meg, hogy elolvastad az adatkezelési tájékoztatót." : "Please confirm you've read the privacy notice."),
    // Honeypot: real people never see or fill this field.
    website: z.string().max(0).optional(),
  });
}
export type ContactInput = z.infer<ReturnType<typeof getContactSchema>>;
