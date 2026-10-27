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
          <p>A weboldal böngészése nem hoz létre fiókot vagy látogatói profilt. Nincs analitika, beágyazott időpontfoglaló vagy hirdetési nyomkövető, a betűkészletek pedig a weboldallal együtt töltődnek be, külső betűkészlet-szolgáltatás igénybevétele nélkül. A Folyamat-pontozó és a részletes folyamat-audit válaszait a szerveren tároljuk, hogy a kitöltés folytatható és az eredmény letölthető legyen; a kapcsolatfelvételi űrlap az elküldött üzeneteket tárolja.</p>
          <p>Egy weboldal betöltése ugyanakkor technikai adatok továbbításával jár a tárhely infrastruktúrája felé. Az éles tárhelyszolgáltatótól függően a hozzáférési vagy biztonsági naplók tartalmazhatják az IP-címet, a kérés időpontját, a kért oldalt, a böngésző adatait és a hibák részleteit. A tárhelyszolgáltató és a tényleges naplózási beállítások kiválasztása, illetve ellenőrzése még nem történt meg.</p>
          <dl className="legal-details">
            <div><dt>Tárhelyszolgáltató</dt><dd>{business.hostingProvider}</dd></div>
            <div><dt>A tárhely és az adatfeldolgozás helye</dt><dd>{business.hostingLocation}</dd></div>
            <div><dt>A naplóadatok megőrzési ideje</dt><dd>{business.logRetention}</dd></div>
            <div><dt>A tárhelynaplók célja és jogalapja</dt><dd>[Az éles tárhelyszolgáltató és az alkalmazandó jog alapján tisztázandó]</dd></div>
          </dl>
          <p>Az indulás előtt tisztázni kell a tárhelyszolgáltató által igénybe vett további adatfeldolgozókat, az érintett joghatóságon kívülre történő adattovábbításokat és az ezekhez szükséges garanciákat is.</p>
        </section>
        <section id="advanced-audit">
          <h2>Részletes audit</h2>
          <p>Az audit indításakor véletlenszerű privát hivatkozást hozunk létre. E-mail-címet csak akkor tárolunk, ha külön jelölőnégyzettel kéred, hogy elküldjük a folytatási hivatkozást. Tároljuk a megadott e-mail-címet (ha van), a választott nyelvet, a hozzájárulás időpontját, a kérdésekre adott válaszokat, a szabályalapú értékelést és a modell verzióját tároljuk. Az alkalmazás nem rögzít IP-címet az audit válaszaihoz. A szabad szöveges mezőkbe ne írj személyes vagy bizalmas adatot.</p>
          <dl className="legal-details">
            <div><dt>Cél</dt><dd>A válaszok mentése és folytatása, az első válasz mentése után egy e-mail küldése a személyes folytatási hivatkozással, valamint az értékelés és a letölthető PDF/JSON riport elkészítése. Nem küldünk emlékeztetőt vagy marketing e-mailt.</dd></div>
            <div><dt>E-mailek</dt><dd>Ha kérted, a megadott címre egyetlen, a folytatási hivatkozást tartalmazó e-mailt küldünk az első válasz mentése után. Az e-mail-kézbesítést a {business.emailProvider} végzi. A hivatkozás birtokában bárki megnyithatja az auditot.</dd></div>
            <div><dt>Jogalap</dt><dd>Az e-mail elküldéséhez külön, nem kötelező jelölőnégyzettel adott, az első oldalon rögzített hozzájárulás. [A jogalapot az üzemeltetőnek még meg kell erősítenie.]</dd></div>
            <div><dt>Megőrzés</dt><dd>A befejezetlen auditokat 30 nap, a befejezett auditokat és riportokat 12 hónap után automatikusan töröljük.</dd></div>
            <div><dt>Megosztás és értékelés</dt><dd>A privát folytatási és riportlinket bárki használhatja, aki ismeri. A keresők nem indexelik ezeket az oldalakat. Az értékelés előre rögzített szabályokkal történik, és nem jár rád nézve joghatással vagy hasonlóan jelentős hatással járó döntéssel.</dd></div>
          </dl>
          <p>A tárhely- és adatbázis-szolgáltatókat a fenti tárhely-információk ismertetik. Az auditot folytatáshoz őrizd meg a privát hivatkozást; a megőrzési időn belül törlési kérelmet a {business.email} címen is benyújthatsz.</p>
        </section>
        <section id="scorecard">
          <h2>A Folyamat-pontozó</h2>
          <p>Ha elkezded a Folyamat-pontozót, tároljuk az első oldalon megadott keresztnevedet és e-mail-címedet, az utolsó kérdés után opcionálisan megadott adataidat (cégméret, a munka jellege, beosztás, cégnév), a két külön, opcionális hozzájárulásodat (emlékeztetők, követő e-mailek) és azok időpontját, a válaszaidat, az ezekből készült riportot, a választott nyelvet, a tájékoztató visszaigazolásának időpontját, valamint az IP-címed egyirányú hashértékét, amelyet kizárólag az ismételt jelentkezések korlátozására használunk. A választott nyelvet azért mentjük, hogy a riportot és az emlékeztetőket is ezen a nyelven kapd meg.</p>
          <dl className="legal-details">
            <div><dt>Az adatkezelés céljai</dt><dd>A kitöltés állapotának mentése, hogy később folytathasd; a riport elkészítése és elküldése e-mailben, PDF-ben; ha kéred, legfeljebb három emlékeztető küldése, ha nem fejezed be; ha kéred, néhány követő e-mail küldése az eredményeidről; továbbá hogy {business.firstName} átnézhesse a riportodat, és felkészülhessen egy beszélgetésre, ha kérsz ilyet.</dd></div>
            <div><dt>Jogalap</dt><dd>A Folyamat-pontozó első oldalán megadott hozzájárulásod; az emlékeztetőkhöz és a követő e-mailekhez egy-egy külön, nem kötelező jelölőnégyzettel adott hozzájárulásod. A követő e-mailekről mindegyik e-mail aljáról leiratkozhatsz. A hozzájárulásodat bármikor visszavonhatod az e-mailekben található törlési hivatkozással, amely azonnal törli az adataidat. [A jogalapot az üzemeltetőnek még meg kell erősítenie.]</dd></div>
            <div><dt>E-mailek</dt><dd>Beküldés után azonnal elküldjük a riportot. Ha kérted, és nem fejezed be a Folyamat-pontozót, legfeljebb három emlékeztetőt küldünk az utolsó aktivitásod után körülbelül 1, 3 és 5 nappal. Ha az utolsó lépésben kérted, a riport után legfeljebb három követő e-mailt küldünk (körülbelül a 2., 5. és 9. napon), mindegyikben leiratkozási linkkel. Más hírlevél- vagy marketinglistára nem kerülsz.</dd></div>
            <div><dt>Megőrzési idő</dt><dd>A befejezetlen kitöltések 30 nap után, a befejezett kitöltések és a riportok 12 hónap után automatikusan törlődnek. A beküldésedről szóló értesítő e-mail egy példánya megmarad az üzemeltető postafiókjában.</dd></div>
            <div><dt>Adatfeldolgozók</dt><dd>Tárhely: {business.hostingProvider}. Adatbázis: {business.databaseProvider}. E-mailek kézbesítése: {business.emailProvider}.</dd></div>
            <div><dt>Automatizált értékelés</dt><dd>A riport előre meghatározott szabályok alapján készül a válaszaidból. A saját felhasználásodra szánt tanácsokat tartalmaz; nem születik rólad joghatással vagy hasonlóan jelentős hatással járó döntés.</dd></div>
          </dl>
          <p>A riportot bárki megnyithatja, aki ismeri a linkjét, ezért csak azzal oszd meg, akivel szeretnéd. A linkek hosszú, véletlenszerű kódot tartalmaznak, és a keresők nem indexelik ezeket az oldalakat.</p>
        </section>
        <section id="contact">
          <h2>Kapcsolatfelvételi űrlap és e-mail</h2>
          <p>Ha a főoldali űrlapon írsz, tároljuk a nevedet, az e-mail-címedet, az üzenetedet, a választott érdeklődési területet (ha megadod), a nyelvet, a tájékoztató visszaigazolásának időpontját, valamint az IP-címed egyirányú hashértékét, amelyet kizárólag a tömeges beküldések korlátozására használunk. Az üzenetet e-mailben továbbítjuk {business.firstName} részére, hogy válaszolni tudjon. Ha a <a href={`mailto:${business.email}`}>{business.email}</a> címre írsz, a vállalkozás az általad elküldött információkat kapja meg.</p>
          <dl className="legal-details">
            <div><dt>Cél</dt><dd>A megkeresésed megválaszolása és egy esetleges ajánlat előkészítése.</dd></div>
            <div><dt>Jogalap</dt><dd>Szerződéskötést megelőző lépések a kérésedre, illetve jogos érdek a megkeresés megválaszolásához (GDPR 6. cikk (1) b) és f) pont). [A jogalapot az üzemeltetőnek még meg kell erősítenie.]</dd></div>
            <div><dt>Megőrzés</dt><dd>Az űrlapon küldött üzeneteket a beérkezés után 12 hónappal automatikusan töröljük. A továbbított e-mail egy példánya az üzemeltető postafiókjában marad.</dd></div>
            <div><dt>Adatfeldolgozók</dt><dd>Tárhely: {business.hostingProvider}. Adatbázis: {business.databaseProvider}. E-mailek kézbesítése: {business.emailProvider}.</dd></div>
          </dl>
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
        <p>Browsing the website does not create an account or a visitor profile. There is no analytics, embedded booking tool or advertising tracker, and fonts are served with the website rather than fetched from a third-party font service. The Discovery Scorecard and Advanced Audit store answers on the server so progress can be resumed and reports downloaded, and the contact form stores the messages you send.</p>
        <p>Loading a website still involves sending technical information to its hosting infrastructure. Depending on the production host, access or security logs may include an IP address, request time, requested page, browser information, and error details. The hosting provider and its actual logging settings have not yet been selected or verified.</p>
        <dl className="legal-details">
          <div><dt>Hosting provider</dt><dd>{business.hostingProvider}</dd></div>
          <div><dt>Hosting and processing locations</dt><dd>{business.hostingLocation}</dd></div>
          <div><dt>Log retention</dt><dd>{business.logRetention}</dd></div>
          <div><dt>Purpose and legal basis for hosting logs</dt><dd>[To be confirmed against the production host and applicable law]</dd></div>
        </dl>
        <p>Any hosting subprocessors, transfers outside the relevant jurisdiction, and applicable transfer safeguards must also be confirmed before launch.</p>
      </section>
      <section id="advanced-audit">
        <h2>The Advanced Audit</h2>
        <p>When you start, we create a random private link for your audit. We store an email address only if you tick the separate box asking us to email you the resume link. We store that email address (if any), your chosen language, the time you consented, questionnaire answers, rule-based assessment, and model version. The application does not attach an IP address to audit answers. Please keep personal or confidential information out of the free-text fields.</p>
        <dl className="legal-details">
          <div><dt>Purpose</dt><dd>Saving answers so you can resume, sending one email with your personal resume link after your first answer is saved, and generating the assessment and downloadable PDF/JSON report. We do not send reminders or marketing email.</dd></div>
          <div><dt>Emails</dt><dd>If you asked for it, we send one resume-link email to the address you provide after your first answer is saved. {business.emailProvider} delivers it. Anyone with the link can open your audit.</dd></div>
          <div><dt>Legal basis</dt><dd>Your recorded consent to receive the link email, given with a separate optional checkbox on the first page. [Legal basis to be confirmed by the operator.]</dd></div>
          <div><dt>Retention</dt><dd>Unfinished audits are deleted after 30 days. Completed audits and reports are deleted after 12 months.</dd></div>
          <div><dt>Sharing and assessment</dt><dd>Anyone who has your private resume or report link can use it. Search engines are instructed not to index these pages. The assessment applies fixed rules and does not make a decision with legal or similarly significant effect about you.</dd></div>
        </dl>
        <p>Hosting and database providers are listed in the hosting information above. Keep your private link to resume; you can also request deletion within the retention period by contacting {business.email}.</p>
      </section>
      <section id="scorecard">
        <h2>The Discovery Scorecard</h2>
        <p>If you start the scorecard, we store the first name and email address you enter on the first page, the optional details you may give after the last question (company size, type of work, role, company), your two separate optional choices (reminders, follow-up emails) and when you made them, your answers, the report generated from them, your chosen language, the time you confirmed this notice, and a one-way hash of your IP address used only to limit repeated sign-ups. We save your language so your report and reminders arrive in that language too.</p>
        <dl className="legal-details">
          <div><dt>Purposes</dt><dd>Saving your progress so you can resume; generating your report; emailing the report as a PDF; if you ask for them, sending up to three reminders if you don't finish and a few follow-up emails about your results; letting {business.firstName} review your report and prepare the follow-up call you can book.</dd></div>
          <div><dt>Legal basis</dt><dd>Your consent, given on the first page of the scorecard, and your separate consent for reminders and for follow-up emails, each given with its own unticked checkbox. You can unsubscribe from follow-up emails in every one of them. You can withdraw consent at any time with the delete link in every email, which erases your data immediately. [Legal basis to be confirmed by the operator.]</dd></div>
          <div><dt>Emails</dt><dd>Your report is emailed immediately after submission. If you asked for reminders and leave the scorecard unfinished, we send up to three around 1, 3 and 5 days after your last activity. If you asked for follow-up emails in the last step, we send up to three after your report (around days 2, 5 and 9), each with an unsubscribe link. You are not added to any other newsletter or marketing list.</dd></div>
          <div><dt>Retention</dt><dd>Unfinished scorecards: deleted automatically after 30 days. Completed scorecards and reports: deleted automatically after 12 months. A copy of the notification email about your submission remains in the operator's mailbox.</dd></div>
          <div><dt>Processors</dt><dd>Website hosting: {business.hostingProvider}. Database: {business.databaseProvider}. Email delivery: {business.emailProvider}.</dd></div>
          <div><dt>Automated assessment</dt><dd>Your report is produced by fixed rules applied to your answers. It is advice for you to use, and no decision with legal or similarly significant effect is made about you.</dd></div>
        </dl>
        <p>Anyone with your report link can open the report, so share it only with people you choose. The links are long random codes and the pages are excluded from search engines.</p>
      </section>
      <section id="contact">
        <h2>Contact form and email</h2>
        <p>If you write to us through the form on the home page, we store your name, email address, message, the area of interest you chose (if any), your language, the time you confirmed this notice, and a one-way hash of your IP address used only to limit bulk submissions. The message is forwarded by email to {business.firstName} so that your enquiry can be answered. If you email <a href={`mailto:${business.email}`}>{business.email}</a> directly, the business receives the information you choose to send.</p>
        <dl className="legal-details">
          <div><dt>Purpose</dt><dd>Answering your enquiry and preparing a proposal if you ask for one.</dd></div>
          <div><dt>Legal basis</dt><dd>Steps taken at your request before a contract, and legitimate interest in answering your enquiry (GDPR Art. 6(1)(b) and (f)). [Legal basis to be confirmed by the operator.]</dd></div>
          <div><dt>Retention</dt><dd>Messages sent through the form are deleted automatically 12 months after they arrive. A copy of the forwarded email remains in the operator's mailbox.</dd></div>
          <div><dt>Processors</dt><dd>Website hosting: {business.hostingProvider}. Database: {business.databaseProvider}. Email delivery: {business.emailProvider}.</dd></div>
        </dl>
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
