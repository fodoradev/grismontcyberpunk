import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';
import { getBusiness } from '../../data/business';
import { localizePath } from '../../lib/i18n';
import { getLocale } from '../../lib/i18n-server';

// Content: docs/content-plan/06-legal-impressum-en-hu.md (Ektv. 4. §). Facts come from data/business.ts.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === 'hu'
    ? { title: 'Impresszum', description: 'A Grismont szolgáltatói adatai és elérhetőségei.' }
    : { title: 'Impressum', description: 'Provider details and contact information for Grismont.' };
}

type Row = [label: string, value: string | undefined];
const Details = ({ rows }: { rows: Row[] }) => <dl className="legal-details">{rows.filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;

export default async function ImpressumPage() {
  const locale = await getLocale();
  const hu = locale === 'hu';
  const b = getBusiness(locale);
  // Optional rows (postal address, phone, EU VAT, adult training, VAT) stay hidden until they have a value.
  const vat = b.vat === 'aam' ? (hu ? 'Alanyi adómentes (AAM)' : 'Exempt from VAT under the Hungarian small business exemption (AAM)') : undefined;
  const provider: Row[] = hu ? [
    ['Szolgáltató neve', b.legalName], ['Üzleti név', b.brand], ['Székhely', b.address], ['Levelezési cím', b.postalAddress],
    ['E-mail', b.email], ['Telefon', b.phone], ['Egyéni vállalkozói nyilvántartási szám', b.registration], ['Adószám', b.taxNumber],
    ['Közösségi adószám', b.euVatNumber], ['Nyilvántartó hatóság', b.registeringAuthority], ['Kamarai tagság', b.chamber],
    ['Felnőttképzési nyilvántartási szám', b.adultTrainingRegistration], ['ÁFA', vat],
  ] : [
    ['Provider', b.legalName], ['Trading name', b.brand], ['Registered address', b.address], ['Postal address', b.postalAddress],
    ['Email', b.email], ['Phone', b.phone], ['Sole trader registration number', b.registration], ['Hungarian tax number', b.taxNumber],
    ['EU VAT number', b.euVatNumber], ['Registering authority', b.registeringAuthority], ['Chamber membership', b.chamber],
    ['Adult training registration number', b.adultTrainingRegistration], ['VAT', vat],
  ];
  const hosting: Row[] = hu
    ? [['Név', b.hosting.name], ['Székhely', b.hosting.address], ['E-mail', b.hosting.email], ['Weboldal', b.hosting.website]]
    : [['Name', b.hosting.name], ['Address', b.hosting.address], ['Email', b.hosting.email], ['Website', b.hosting.website]];
  return (
    <LegalPage locale={locale} eyebrow={hu ? 'Alapvető adatok' : 'The essentials'} title={hu ? 'Impresszum.' : 'Impressum.'} intro={hu ? 'Ki áll a Grismont mögött, és hogyan léphetsz kapcsolatba vele.' : 'Who is behind Grismont, and how to get in touch.'}
      updated={hu ? `Utolsó módosítás: ${b.lastUpdated}` : `Last updated: ${b.lastUpdated}`}>
      <section>
        <h2>{hu ? 'A szolgáltató adatai' : 'Provider details'}</h2>
        <Details rows={provider} />
      </section>
      <section>
        <h2>{hu ? 'Tárhelyszolgáltató' : 'Hosting provider'}</h2>
        <Details rows={hosting} />
      </section>
      <section>
        <h2>{hu ? 'Kapcsolódó dokumentumok' : 'Related documents'}</h2>
        <ul>
          <li><a href={localizePath(locale, '/privacy')}>{hu ? 'Adatkezelési tájékoztató' : 'Privacy notice'}</a></li>
          <li><a href={localizePath(locale, '/cookies')}>{hu ? 'Süti tájékoztató' : 'Cookie notice'}</a></li>
        </ul>
      </section>
    </LegalPage>
  );
}
