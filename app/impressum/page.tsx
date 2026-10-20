import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';
import { getBusiness } from '../../data/business';
import { getLocale } from '../../lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === 'hu'
    ? { title: 'Impresszum', description: 'A Grismont vállalkozási adatai és elérhetőségei.' }
    : { title: 'Impressum', description: 'Business identification and contact details for Grismont.' };
}

export default async function ImpressumPage() {
  const locale = await getLocale();
  const business = getBusiness(locale);
  if (locale === 'hu') {
    return (
      <LegalPage locale={locale} eyebrow="Alapvető adatok" title="Impresszum." intro="Ki áll a Grismont mögött, és hogyan léphetsz kapcsolatba vele.">
        <p className="legal-notice">Előzetes tervezet. Az alábbi vállalkozási adatokat a nyilvános indulás előtt ki kell egészíteni, és ellenőrizni kell a vállalkozás működési országában érvényes követelmények szerint.</p>
        <section>
          <h2>A weboldal üzemeltetője</h2>
          <dl className="legal-details">
            <div><dt>Kereskedelmi név</dt><dd>{business.brand}</dd></div>
            <div><dt>Teljes hivatalos név</dt><dd>{business.legalName}</dd></div>
            <div><dt>Jogi forma</dt><dd>{business.legalForm}</dd></div>
            <div><dt>A vállalkozás országa</dt><dd>{business.country}</dd></div>
            <div><dt>A vállalkozás címe</dt><dd>{business.address}</dd></div>
            <div><dt>Kapcsolattartási e-mail-cím</dt><dd>{business.email}</dd></div>
            <div><dt>Nyilvántartási adatok</dt><dd>{business.registration}</dd></div>
            <div><dt>Adószám vagy közösségi adószám</dt><dd>{business.taxNumber}</dd></div>
          </dl>
        </section>
        <section>
          <h2>A vállalkozásról</h2>
          <p>A Grismont folyamatos fejlesztéssel, működésfejlesztéssel és automatizálással foglalkozik. Attila a vállalkozás mögött álló személy keresztneve; ez nem helyettesíti az üzemeltető fent feltüntetendő teljes hivatalos nevét.</p>
          <p>Az adott országban előírt azonosítási követelményeket, köztük az esetlegesen szükséges nyilvántartási vagy szakmai adatokat, az üzemeltető adatainak rendelkezésre állása után kell tisztázni.</p>
        </section>
      </LegalPage>
    );
  }
  return (
    <LegalPage locale={locale} eyebrow="The essentials" title="Impressum." intro="Who is behind Grismont, and how to get in touch.">
      <p className="legal-notice">Draft for preview. The business identification details below must be completed and checked for the business country before public launch.</p>
      <section>
        <h2>Website operator</h2>
        <dl className="legal-details">
          <div><dt>Trading name</dt><dd>{business.brand}</dd></div>
          <div><dt>Full legal name</dt><dd>{business.legalName}</dd></div>
          <div><dt>Legal form</dt><dd>{business.legalForm}</dd></div>
          <div><dt>Business country</dt><dd>{business.country}</dd></div>
          <div><dt>Business address</dt><dd>{business.address}</dd></div>
          <div><dt>Contact email</dt><dd>{business.email}</dd></div>
          <div><dt>Registration details</dt><dd>{business.registration}</dd></div>
          <div><dt>Tax or VAT identification</dt><dd>{business.taxNumber}</dd></div>
        </dl>
      </section>
      <section>
        <h2>About the business</h2>
        <p>Grismont works on continuous improvement, operations, and automation. Attila is the first name of the person behind the business; it is not a substitute for the full legal operator name above.</p>
        <p>Country-specific identification requirements, including any register or professional information that applies, will be confirmed once the operator details are available.</p>
      </section>
    </LegalPage>
  );
}
