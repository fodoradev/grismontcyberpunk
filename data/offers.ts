/**
 * Prices and offer terms, rendered on the home page from this one file (01-positioning-offer-pricing.md §3).
 * Unresolved values keep their placeholder marker; `known()` hides the line until it is replaced.
 */
import type { Locale } from "../lib/i18n";
import { known } from "./site";

export type OfferId = "training" | "workshop" | "programme" | "sprint";

export const offers = {
  /** Launch prices apply to the first `launchPartners` companies. */
  launchPartners: 5,
  /** e.g. 4 → "4 of 5 places left". */
  launchPlacesLeft: "{{FILL: places left of 5}}" as string | number,
  /** Workshop guarantee: minimum monthly hours saved, e.g. 10. */
  guaranteeHours: "{{DECIDE: guarantee threshold, e.g. 10}}" as string | number,
  /** "net" → "+ ÁFA" / "+ VAT"; "aam" → subjective VAT exemption wording. */
  vat: "{{DECIDE: net or aam}}" as string,
  prices: {
    training: { regular: 490_000, launch: 320_000, from: false },
    workshop: { regular: 190_000, launch: 120_000, from: false },
    programme: { regular: 1_390_000, launch: 890_000, from: true },
    sprint: { regular: 990_000, launch: 690_000, from: true },
  } satisfies Record<OfferId, { regular: number; launch: number; from: boolean }>,
};

export const formatFt = (amount: number) => `${amount.toLocaleString("hu-HU").replace(/\s/g, " ")} Ft`;

export function vatNote(locale: Locale): string | undefined {
  const vat = known(offers.vat);
  if (vat === "net") return locale === "hu" ? "+ ÁFA" : "+ VAT";
  if (vat === "aam") return locale === "hu" ? "Alanyi adómentes (AAM)" : "VAT exempt (AAM)";
  return undefined;
}
