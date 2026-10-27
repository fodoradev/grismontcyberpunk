import type { Locale } from "../lib/i18n";
import { offers } from "./offers";
import { known, site } from "./site";

/**
 * Operator and processor details for the Impressum (06-legal-impressum-en-hu.md) and the privacy notice.
 * Unresolved values keep their FILL / CHECK placeholder marker: legal pages show "[To be provided]" for required
 * rows and hide optional ones, and `npm run check:launch` fails until all are replaced.
 */
export const business = {
  brand: "Grismont",
  firstName: "Attila",
  email: "hello@grismont.hu",
  /** Székhely: postcode, town, street, number. */
  address: "{{FILL: registered address}}",
  postalAddress: "{{FILL: postal address, only if different}}",
  phone: "{{FILL: phone, optional}}",
  /** Egyéni vállalkozói nyilvántartási szám (8 digits). */
  registration: "{{FILL: sole trader registration number}}",
  taxNumber: "{{FILL: tax number xxxxxxxx-x-xx}}",
  euVatNumber: "{{FILL: EU VAT number HUxxxxxxxx, only if you have one}}",
  // {{CHECK: exact name of the registering authority on the registration certificate}}
  registeringAuthority: { hu: "Belügyminisztérium, Egyéni Vállalkozók Nyilvántartása", en: "Ministry of Interior, Register of Sole Traders (Hungary)" },
  chamber: "{{FILL: chamber membership, e.g. Budapesti Kereskedelmi és Iparkamara}}",
  hosting: { name: "{{FILL: hosting provider name}}", address: "{{FILL: hosting provider address}}", email: "{{FILL: hosting provider email}}", website: "{{FILL: hosting provider website}}" },
  hostingLocation: "{{FILL: hosting and processing locations}}",
  databaseProvider: "{{CHECK: Neon, EU region (Frankfurt)}}",
  emailProvider: "{{CHECK: Resend}}",
  logRetention: "{{FILL: hosting log retention}}",
  // {{CHECK: current NAIH address before publishing}}
  supervisoryAuthority: {
    hu: "Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH), 1055 Budapest, Falk Miksa utca 9–11., ugyfelszolgalat@naih.hu, www.naih.hu",
    en: "Hungarian National Authority for Data Protection and Freedom of Information (NAIH), 1055 Budapest, Falk Miksa utca 9–11., ugyfelszolgalat@naih.hu, www.naih.hu",
  },
  /** Impressum "last updated", YYYY-MM-DD. */
  lastUpdated: "{{FILL: YYYY-MM-DD}}",
} as const;

const missing = { en: "[To be provided]", hu: "[Még megadandó]" };
const unconfirmed = { en: "[to be confirmed]", hu: "[megerősítendő]" };

/** Display strings for legal pages: every unresolved value becomes a visible "to be provided" marker. */
export function getBusiness(locale: Locale) {
  // A CHECK marker is shown as its text plus "[to be confirmed]"; a FILL marker as "[To be provided]".
  const show = (value: string) => known(value) ?? (/^\{\{CHECK: (.+)\}\}$/.exec(value)?.[1]?.concat(` ${unconfirmed[locale]}`)) ?? missing[locale];
  const name = known(site.fullName);
  return {
    brand: business.brand, firstName: business.firstName, email: business.email,
    legalName: name ? `${name} ${locale === "hu" ? "egyéni vállalkozó" : "(egyéni vállalkozó, sole trader)"}` : missing[locale],
    address: show(business.address),
    registration: show(business.registration),
    taxNumber: show(business.taxNumber),
    registeringAuthority: business.registeringAuthority[locale],
    chamber: show(business.chamber),
    hostingProvider: show(business.hosting.name),
    hosting: { name: show(business.hosting.name), address: show(business.hosting.address), email: show(business.hosting.email), website: show(business.hosting.website) },
    hostingLocation: show(business.hostingLocation),
    databaseProvider: show(business.databaseProvider),
    emailProvider: show(business.emailProvider),
    logRetention: show(business.logRetention),
    supervisoryAuthority: business.supervisoryAuthority[locale],
    lastUpdated: show(business.lastUpdated),
    // Optional rows: undefined means "hide the row".
    postalAddress: known(business.postalAddress),
    phone: known(business.phone),
    euVatNumber: known(business.euVatNumber),
    adultTrainingRegistration: known(site.adultTrainingRegistration),
    vat: known(offers.vat),
  };
}
