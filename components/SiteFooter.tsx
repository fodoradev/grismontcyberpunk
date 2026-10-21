import { business } from "../data/business";
import { getComingSoonPages } from "../data/coming-soon";
import { localizePath, type Locale } from "../lib/i18n";

export default function SiteFooter({ locale = "en" }: { locale?: Locale }) {
  const hu = locale === "hu";
  const href = (path: string) => localizePath(locale, path);
  return (
    <footer className="gm-footer gm-shell">
      <div className="gm-footer-top"><div><a className="gm-wordmark" href={href("/#home")}>grismont<span>.</span></a><p>{hu ? "Folyamatfejlesztés. Automatizálás. AI." : "Process improvement. Automation. AI."}<br />{hu ? "Kíváncsisággal, és minden lépésnek megvan az oka." : "With curiosity, and a reason for every step."}</p></div>
        <nav className="gm-footer-links" aria-label={hu ? "Lábléc navigáció" : "Footer navigation"}>
          <a href={href("/#services")}>{hu ? "Szolgáltatások" : "The work"}</a><a href={href("/#method")}>{hu ? "Így dolgozom" : "The approach"}</a><a href={href("/#about")}>{hu ? "Rólam" : "About Attila"}</a><a href={href("/advanced-audit")}>{hu ? "Részletes audit" : "Advanced audit"}</a><a href={`mailto:${business.email}`}>{hu ? "Írj Attilának ↗" : "Email Attila ↗"}</a><a href={href("/impressum")}>{hu ? "Impresszum" : "Impressum"}</a><a href={href("/privacy")}>{hu ? "Adatkezelés" : "Privacy"}</a><a href={href("/cookies")}>{hu ? "Sütik" : "Cookies"}</a>
        </nav>
      </div>
      <nav className="gm-footer-upcoming" aria-label={hu ? "Hamarosan" : "Coming soon"}><span className="gm-label">{hu ? "Hamarosan" : "Coming soon"}</span><div>{Object.values(getComingSoonPages(locale)).map(page => <a href={href(page.href)} key={page.href}>{page.label}</a>)}</div></nav>
      <div className="gm-footer-bottom"><a href={`mailto:${business.email}`}>{business.email}</a><span>{hu ? "Egy kis tisztánlátás sokat számít." : "A little clarity goes a long way."}</span><a href={href("/#home")}>{hu ? "Vissza az elejére ↑" : "Back to the top ↑"}</a></div>
    </footer>
  );
}
