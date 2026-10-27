import { business } from "../data/business";
import { known, site } from "../data/site";
import { localizePath, type Locale } from "../lib/i18n";

export default function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const hu = locale === "hu";
  const href = (path: string) => localizePath(locale, path);
  const legalName = known(site.fullName);
  // Resources link only to pages with real content (no "coming soon" links); [PROOF] pages join as they are published.
  const columns = [
    { title: hu ? "Szolgáltatások" : "Services", links: [
      { href: href("/#training"), text: hu ? "Csapattréning" : "Team training" },
      { href: href("/#workshop"), text: "Workshop" },
      { href: href("/#programme"), text: hu ? "Program" : "Programme" },
      { href: href("/#sprint"), text: hu ? "Folyamat-sprint" : "Process Sprint" },
    ] },
    { title: hu ? "Anyagok" : "Resources", links: [
      { href: href("/scorecard"), text: hu ? "Ingyenes Folyamat-pontozó" : "Free scorecard" },
      ...(site.sampleReportPublished ? [{ href: href("/scorecard/sample"), text: hu ? "Mintajelentés" : "Sample report" }] : []),
    ] },
    { title: hu ? "Cég" : "Company", links: [
      { href: href("/#about"), text: hu ? "Rólam" : "About" },
      { href: href("/#contact"), text: hu ? "Kapcsolat" : "Contact" },
      { href: href("/impressum"), text: hu ? "Impresszum" : "Impressum" },
      { href: href("/privacy"), text: hu ? "Adatkezelés" : "Privacy" },
      { href: href("/cookies"), text: hu ? "Sütik" : "Cookies" },
    ] },
  ];
  return (
    <footer className="gm-footer gm-shell">
      <div className="gm-footer-top"><div><a className="gm-wordmark" href={href("/#home")}>grismont<span>.</span></a><p>{hu ? "Folyamatfejlesztés. Tréning. Automatizálás. AI." : "Process improvement. Training. Automation. AI."}<br />{hu ? "Minden lépésnek oka van." : "With a reason for every step."}</p></div>
        <div className="gm-footer-cols">{columns.map(col => (
          <nav key={col.title} aria-label={col.title}><span className="gm-label">{col.title}</span>{col.links.map(link => <a key={link.href} href={link.href}>{link.text}</a>)}</nav>
        ))}</div>
      </div>
      <div className="gm-footer-bottom"><span>© 2026 {legalName ? `${legalName} egyéni vállalkozó · ` : ""}Grismont · <a href={`mailto:${business.email}`}>{business.email}</a></span><a href={href("/#home")}>{hu ? "Vissza az elejére ↑" : "Back to the top ↑"}</a></div>
    </footer>
  );
}
