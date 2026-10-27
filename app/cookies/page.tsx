import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';
import { localizePath } from '../../lib/i18n';
import { getLocale } from '../../lib/i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === 'hu'
    ? { title: 'Sütik', description: 'Tájékoztató a Grismont jelenlegi weboldalának sütihasználatáról és a böngészőben tárolt adatokról.' }
    : { title: 'Cookies', description: 'Cookie and browser-storage information for the current Grismont website.' };
}

export default async function CookiesPage() {
  const locale = await getLocale();
  if (locale === 'hu') {
    return (
      <LegalPage locale={locale} eyebrow="Apró részletek, érthetően" title="Sütik." intro="A weboldal jelenleg szinte semmit nem tárol a böngésződben.">
        <p className="legal-notice">Előzetes tervezet. Ez a tájékoztató az alkalmazás kódjában megvalósított működést írja le. Az indulás előtt ellenőrizni kell, hogy az éles tárhelykörnyezet használ-e további sütiket vagy más adattárolási megoldásokat.</p>
        <section>
          <h2>A weboldal sütihasználata</h2>
          <p>A Grismont jelenlegi alkalmazása nem helyez el sütiket, és nem használja a böngésző helyi vagy munkamenet-tárolóját. Nincs benne analitika, hirdetés, beágyazott időpontfoglaló vagy látogatói fiók.</p>
          <p>Az oldal animációi, a szakaszok megjelenése, a lenyíló tartalmak és a gombok fényhatása csak addig működnek a memóriában, amíg az oldal nyitva van. Nem mentenek látogatói profilt vagy beállítást a böngészőbe.</p>
          <p>A Folyamat-pontozó és a részletes audit sem használ sütiket vagy böngészőtárhelyet. A kitöltés állapotát a szerveren tároljuk, és a böngésző címsorában látható privát linkhez kötjük, így ugyanazzal a linkkel folytathatod. A tárolt adatokat az <a href={localizePath(locale, '/privacy#scorecard')}>adatkezelési tájékoztató</a> ismerteti.</p>
        </section>
        <section>
          <h2>A tárhely infrastruktúrája</h2>
          <p>Az éles tárhelyszolgáltató használhat az infrastruktúra működéséhez szükséges sütiket, például biztonsági célból vagy a forgalom irányításához. A végleges tárhelyszolgáltató még nincs megerősítve, ezért az esetleges sütik neve, célja, élettartama és szolgáltatója sem ismert. Ha vannak ilyen sütik, ellenőrizni kell őket, és itt fel kell sorolni.</p>
        </section>
        <section>
          <h2>Hozzájárulás és későbbi változások</h2>
          <p>Az oldal jelenleg nem használ olyan opcionális követést vagy adattárolást, amelyet el kellene fogadnod vagy elutasítanod, ezért nem jelenik meg sütisáv. A később bevezetendő választható sütiket vagy hasonló technológiákat a bevezetésük előtt megvizsgáljuk az alkalmazandó szabályok szerint, és kialakítjuk a szükséges kezelési lehetőségeket.</p>
          <p>A sütiket a böngésződ beállításaiban ellenőrizheted és törölheted. Általános információt az <a href="https://europa.eu/youreurope/business/growing/digitalising/online-privacy/index_hu.htm">Európai Unió weboldalak sütihasználatáról szóló útmutatójában</a> találsz.</p>
        </section>
      </LegalPage>
    );
  }
  return (
    <LegalPage locale={locale} eyebrow="Small details, clearly explained" title="Cookies." intro="The current website keeps browser storage simple.">
      <p className="legal-notice">Draft for preview. This describes the application code. The production hosting environment must be checked before launch for any additional cookies or storage.</p>
      <section>
        <h2>Cookies used by this website</h2>
        <p>The current Grismont application does not set cookies or use local storage or session storage. It has no analytics, advertising, embedded booking tools, or visitor accounts.</p>
        <p>The page animation, section entrances, expandable content, and button shimmer work in memory while the page is open. They do not save a visitor profile or a preference in browser storage.</p>
        <p>The Discovery Scorecard and Advanced Audit do not use cookies or browser storage. Your progress is saved on our server and linked to the private address in your browser bar, which is why you can resume on any device with the same link. What the assessments store is described in the <a href={localizePath(locale, '/privacy#scorecard')}>privacy notice</a>.</p>
      </section>
      <section>
        <h2>Hosting infrastructure</h2>
        <p>A production hosting provider may introduce infrastructure cookies, for example for security or traffic routing. The production host has not yet been confirmed, so its cookie names, purposes, durations, and providers are not yet available. These must be audited and listed here if present.</p>
      </section>
      <section>
        <h2>Consent and future changes</h2>
        <p>This application currently has no optional tracking or storage for a visitor to accept or reject, so it does not show a cookie consent banner. Any future optional cookies or similar technologies will be assessed against the applicable rules and controlled before they are introduced.</p>
        <p>You can inspect or remove cookies using your browser settings. For general information, see the <a href="https://europa.eu/youreurope/business/growing/digitalising/online-privacy/index_en.htm">European Union guidance on website cookies</a>.</p>
      </section>
    </LegalPage>
  );
}
