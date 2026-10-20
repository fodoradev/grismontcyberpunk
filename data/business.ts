import type { Locale } from "../lib/i18n";

/** Replace these draft details with the owner's verified publication details. */
export const business = {
  brand: 'Grismont',
  firstName: 'Attila',
  legalName: '[To be provided]',
  legalForm: '[To be provided]',
  country: '[To be provided]',
  address: '[To be provided]',
  email: 'hello@grismont.hu',
  registration: '[To be provided, if applicable]',
  taxNumber: '[To be provided, if applicable]',
  hostingProvider: '[To be confirmed before publication]',
  databaseProvider: '[Neon, EU region (Frankfurt), to be confirmed before publication]',
  emailProvider: '[Resend, to be confirmed before publication]',
  hostingLocation: '[To be confirmed before publication]',
  logRetention: '[To be confirmed before publication]',
  supervisoryAuthority: '[To be confirmed for the business country]',
} as const;

export function getBusiness(locale: Locale) {
  if (locale === "en") return business;
  return {
    ...business,
    legalName: "[Még megadandó]", legalForm: "[Még megadandó]", country: "[Még megadandó]", address: "[Még megadandó]",
    registration: "[Még megadandó, ha alkalmazandó]", taxNumber: "[Még megadandó, ha alkalmazandó]",
    hostingProvider: "[A közzététel előtt megerősítendő]", databaseProvider: "[Neon, EU-régió (Frankfurt); a közzététel előtt megerősítendő]",
    emailProvider: "[Resend; a közzététel előtt megerősítendő]", hostingLocation: "[A közzététel előtt megerősítendő]",
    logRetention: "[A közzététel előtt megerősítendő]", supervisoryAuthority: "[A vállalkozás országa alapján meghatározandó]",
  };
}
