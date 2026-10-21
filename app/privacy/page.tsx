import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';
import { getBusiness } from '../../data/business';
import { getLocale } from '../../lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === 'hu'
    ? { title: 'Adatkezelés', description: 'Hogyan kezeli a Grismont jelenlegi weboldala a látogatók adatait.' }
    : { title: 'Privacy', description: 'How the current Grismont website handles visitor information.' };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const business = getBusiness(locale);
  if (locale === 'hu') {
    return (
      <LegalPage locale={locale} eyebrow="Az adataidról" title="Adatkezelés." intro="Érthető tájékoztató arról, hogyan kezeli a weboldal jelenlegi változata a látogatók adatait.">
        <p className="legal-notice">Előzetes tervezet. Az üzemeltető adatai és a tárhely adatkezelési gyakorlata még megerősítésre várnak. Ez a tájékoztató a jelenlegi, korlátozott funkciójú weboldalt írja le; az éles indulás előtt ki kell egészíteni.</p>
        <section>
          <h2>Ki felel az adatkezelésért?</h2>
          <p>A weboldal üzemeltetője és leendő adatkezelője: {business.legalName}, kereskedelmi neve: {business.brand}. A vállalkozás címe: {business.address}. Adatvédelmi kapcsolattartási cím: {business.email}.</p>
        </section>
        <section>
          <h2>Milyen adatokat gyűjt a weboldal?</h2>
          <p>A weboldal böngészése nem hoz létre fiókot vagy látogatói profilt. Nincs analitika, beágyazott időpontfoglaló vagy hirdetési nyomkövető, a betűkészletek pedig a weboldallal együtt töltődnek be, külső betűkészlet-szolgáltatás igénybevétele nélkül. Személyes adatokat csak a lent ismertetett folyamatfelmérő tárol.</p>
          <p>Egy weboldal betöltése ugyanakkor technikai adatok továbbításával jár a tárhely infrastruktúrája felé. Az éles tárhelyszolgáltatótól függően a hozzáférési vagy biztonsági naplók tartalmazhatják az IP-címet, a kérés időpontját, a kért oldalt, a böngésző adatait és a hibák részleteit. A tárhelyszolgáltató és a tényleges naplózási beállítások kiválasztása, illetve ellenőrzése még nem történt meg.</p>
          <dl className="legal-details">
            <div><dt>Tárhelyszolgáltató</dt><dd>{business.hostingProvider}</dd></div>
            <div><dt>A tárhely és az adatfeldolgozás helye</dt><dd>{business.hostingLocation}</dd></div>
            <div><dt>A naplóadatok megőrzési ideje</dt><dd>{business.logRetention}</dd></div>
            <div><dt>A tárhelynaplók célja és jogalapja</dt><dd>[Az éles tárhelyszolgáltató és az alkalmazandó jog alapján tisztázandó]</dd></div>
          </dl>
          <p>Az indulás előtt tisztázni kell a tárhelyszolgáltató által igénybe vett további adatfeldolgozókat, az érintett joghatóságon kívülre történő adattovábbításokat és az ezekhez szükséges garanciákat is.</p>
        </section>
        <section id="scorecard">
          <h2>A folyamatfelmérő</h2>
          <p>Ha elkezded a folyamatfelmérőt, tároljuk az első oldalon megadott adataidat (keresztnév, e-mail-cím, cégméret, a munkád jellege, valamint ha megadod, a cégnév és a munkakör), a válaszaidat, az ezekből készült riportot, a választott nyelvet, a tájékoztató visszaigazolásának időpontját, valamint az IP-címed egyirányú hashértékét, amelyet kizárólag az ismételt jelentkezések korlátozására használunk. A választott nyelvet azért mentjük, hogy a riportot és az emlékeztetőket is ezen a nyelven kapd meg.</p>
          <dl className="legal-details">
            <div><dt>Az adatkezelés céljai</dt><dd>A kitöltés állapotának mentése, hogy később folytathasd; a riport elkészítése és elküldése e-mailben, PDF-ben; legfeljebb három emlékeztető küldése, ha nem fejezed be; továbbá hogy {business.firstName} átnézhesse a riportodat, és felkészülhessen egy beszélgetésre, ha kérsz ilyet.</dd></div>
            <div><dt>Jogalap</dt><dd>A folyamatfelmérő első oldalán megadott hozzájárulásod. Ezt bármikor visszavonhatod az e-mailekben található törlési hivatkozással, amely azonnal törli az adataidat. [A jogalapot az üzemeltetőnek még meg kell erősítenie.]</dd></div>
            <div><dt>E-mailek</dt><dd>Beküldés után azonnal elküldjük a riportot. Ha nem fejezed be a felmérőt, legfeljebb három emlékeztetőt küldünk az utolsó aktivitásod után körülbelül 1, 3 és 5 nappal. Nem kerülsz hírlevél- vagy marketinglistára.</dd></div>
            <div><dt>Megőrzési idő</dt><dd>A befejezetlen kitöltések 30 nap után, a befejezett kitöltések és a riportok 12 hónap után automatikusan törlődnek. A beküldésedről szóló értesítő e-mail egy példánya megmarad az üzemeltető postafiókjában.</dd></div>
            <div><dt>Adatfeldolgozók</dt><dd>Tárhely: {business.hostingProvider}. Adatbázis: {business.databaseProvider}. E-mailek kézbesítése: {business.emailProvider}.</dd></div>
            <div><dt>Automatizált értékelés</dt><dd>A riport előre meghatározott szabályok alapján készül a válaszaidból. A saját felhasználásodra szánt tanácsokat tartalmaz; nem születik rólad joghatással vagy hasonlóan jelentős hatással járó döntés.</dd></div>
          </dl>
          <p>A riportot bárki megnyithatja, aki ismeri a linkjét, ezért csak azzal oszd meg, akivel szeretnéd. A linkek hosszú, véletlenszerű kódot tartalmaznak, és a keresők nem indexelik ezeket az oldalakat.</p>
        </section>
        <section>
          <h2>Kapcsolatfelvétel és későbbi funkciók</h2>
          <p>A folyamatfelmérőn kívül jelenleg nincs kapcsolatfelvételi űrlap vagy integrált időpontfoglaló. A <a href={`mailto:${business.email}`}>{business.email}</a> címen írhatsz nekünk; a vállalkozás az általad elküldött információkat kapja meg. Az e-mailes megkeresések kezelésének jogalapját, címzettjeit és megőrzési idejét az üzemeltetőnek a nyilvános indulás előtt még tisztáznia és dokumentálnia kell.</p>
          <p>Ha analitikát, időpontfoglaló szolgáltatást vagy más funkciót vezetünk be, ezt a tájékoztatót és a sütikről szóló tájékoztatást a funkció bekapcsolása előtt frissítjük a tényleges adatkezelés leírásával.</p>
        </section>
        <section>
          <h2>Az adatkezeléssel kapcsolatos jogaid</h2>
          <p>Ahol a GDPR alkalmazandó, az adatkezeléstől és annak jogalapjától függően jogosult lehetsz hozzáférést kérni a személyes adataidhoz, kérni azok helyesbítését, törlését vagy kezelésük korlátozását, élni az adathordozhatóság jogával, illetve tiltakozni az adatkezelés ellen. Ha az adatkezelés hozzájáruláson alapul, a hozzájárulásodat visszavonhatod. Panasszal fordulhatsz az illetékes felügyeleti hatósághoz is.</p>
          <p>A jogok gyakorlásával kapcsolatos kérelmek elérhetősége: {business.email}. Illetékes felügyeleti hatóság: {business.supervisoryAuthority}.</p>
          <p>Általános információt az <a href="https://europa.eu/youreurope/business/growing/digitalising/securing-website/index_hu.htm">Európai Unió online adatvédelemről szóló útmutatójában</a> találsz.</p>
        </section>
      </LegalPage>
    );
  }
  return (
    <LegalPage locale={locale} eyebrow="Your information" title="Privacy." intro="A clear account of what this version of the website does with visitor information.">
      <p className="legal-notice">Draft for preview. Operator details and hosting practices are still to be confirmed. This notice describes the current minimal website and must be completed for its production deployment.</p>
      <section>
        <h2>Who is responsible</h2>
        <p>The website operator and intended data controller is {business.legalName}, trading as {business.brand}. Business address: {business.address}. Privacy contact: {business.email}.</p>
      </section>
      <section>
        <h2>What the website collects</h2>
        <p>Browsing the website does not create an account or a visitor profile. There is no analytics, embedded booking tool or advertising tracker, and fonts are served with the website rather than fetched from a third-party font service. The only feature that stores personal data is the Discovery Scorecard, described below.</p>
        <p>Loading a website still involves sending technical information to its hosting infrastructure. Depending on the production host, access or security logs may include an IP address, request time, requested page, browser information, and error details. The hosting provider and its actual logging settings have not yet been selected or verified.</p>
        <dl className="legal-details">
          <div><dt>Hosting provider</dt><dd>{business.hostingProvider}</dd></div>
          <div><dt>Hosting and processing locations</dt><dd>{business.hostingLocation}</dd></div>
          <div><dt>Log retention</dt><dd>{business.logRetention}</dd></div>
          <div><dt>Purpose and legal basis for hosting logs</dt><dd>[To be confirmed against the production host and applicable law]</dd></div>
        </dl>
        <p>Any hosting subprocessors, transfers outside the relevant jurisdiction, and applicable transfer safeguards must also be confirmed before launch.</p>
      </section>
      <section id="scorecard">
        <h2>The Discovery Scorecard</h2>
        <p>If you start the scorecard, we store the details you enter on the first page (first name, email address, company size, type of work and, if you choose to give them, company name and role), your answers, the report generated from them, your chosen language, the time you confirmed this notice, and a one-way hash of your IP address used only to limit repeated sign-ups. We save your language so your report and reminders arrive in that language too.</p>
        <dl className="legal-details">
          <div><dt>Purposes</dt><dd>Saving your progress so you can resume; generating your report; emailing the report as a PDF; sending up to three reminders if you don't finish; letting {business.firstName} review your report and prepare the follow-up call you can book.</dd></div>
          <div><dt>Legal basis</dt><dd>Your consent, given on the first page of the scorecard. You can withdraw it at any time with the delete link in every email, which erases your data immediately. [Legal basis to be confirmed by the operator.]</dd></div>
          <div><dt>Emails</dt><dd>Your report is emailed immediately after submission. If you leave the scorecard unfinished, we send up to three reminders around 1, 3 and 5 days after your last activity. There is no newsletter or marketing list.</dd></div>
          <div><dt>Retention</dt><dd>Unfinished scorecards: deleted automatically after 30 days. Completed scorecards and reports: deleted automatically after 12 months. A copy of the notification email about your submission remains in the operator's mailbox.</dd></div>
          <div><dt>Processors</dt><dd>Website hosting: {business.hostingProvider}. Database: {business.databaseProvider}. Email delivery: {business.emailProvider}.</dd></div>
          <div><dt>Automated assessment</dt><dd>Your report is produced by fixed rules applied to your answers. It is advice for you to use, and no decision with legal or similarly significant effect is made about you.</dd></div>
        </dl>
        <p>Anyone with your report link can open the report, so share it only with people you choose. The links are long random codes and the pages are excluded from search engines.</p>
      </section>
      <section>
        <h2>Contact and future features</h2>
        <p>Apart from the scorecard, there is currently no inquiry form or booking integration. You can email <a href={`mailto:${business.email}`}>{business.email}</a>; the business receives the information you choose to send. The operator still needs to confirm and document the legal basis, recipients and retention for email enquiries before public launch.</p>
        <p>If analytics, a booking service, or another feature is introduced, this notice and the cookie information will be updated to describe the actual processing before the feature is enabled.</p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>Where the GDPR applies, you may have rights to access, correct, erase, or restrict use of your personal data, and rights to portability or to object, depending on the processing and its legal basis. Where processing relies on consent, you can withdraw that consent. You may also complain to a competent supervisory authority.</p>
        <p>Contact for rights requests: {business.email}. Relevant supervisory authority: {business.supervisoryAuthority}.</p>
        <p>For general information, see the <a href="https://europa.eu/youreurope/business/growing/digitalising/securing-website/index_en.htm">European Union guidance on online privacy</a>.</p>
      </section>
    </LegalPage>
  );
}
